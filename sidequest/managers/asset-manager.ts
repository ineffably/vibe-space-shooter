import { Assets, Rectangle, Texture } from 'pixi.js';

/**
 * Asset types
 */
export enum AssetType {
  SPRITESHEET = 'spritesheet',
  TEXTURE = 'texture',
  SOUND = 'sound',
}

/**
 * Asset manifest interface
 */
export interface AssetManifest {
  spritesheets: SpritesheetConfig[];
  textures: TextureConfig[];
  sounds: SoundConfig[];
}

/**
 * Spritesheet configuration
 */
export interface SpritesheetConfig {
  name: string;
  imageUrl: string;
  xmlUrl: string;
}

/**
 * Texture configuration
 */
export interface TextureConfig {
  name: string;
  url: string;
}

/**
 * Sound configuration
 */
export interface SoundConfig {
  name: string;
  url: string;
  volume?: number;
  loop?: boolean;
}

/**
 * Asset manager for loading and managing game assets
 */
export class AssetManager {
  private static instance: AssetManager;
  private loaded = false;
  private loadPromise: Promise<void> | null = null;
  private textures: Map<string, Texture> = new Map();
  private manifest: AssetManifest = { spritesheets: [], textures: [], sounds: [] };

  /**
   * Private constructor to enforce singleton
   */
  private constructor() {}

  /**
   * Get the singleton instance
   */
  public static getInstance(): AssetManager {
    if (!AssetManager.instance) {
      AssetManager.instance = new AssetManager();
    }
    return AssetManager.instance;
  }

  /**
   * Set the asset manifest
   * @param manifest Asset manifest
   */
  public setManifest(manifest: AssetManifest): void {
    this.manifest = manifest;
    this.loaded = false;
    this.loadPromise = null;
  }

  /**
   * Load all game assets
   */
  public async loadAssets(): Promise<void> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise<void>(async (resolve) => {
      try {
        // Load individual textures
        for (const tex of this.manifest.textures) {
          try {
            const texture = await Assets.load(tex.url);
            this.textures.set(tex.name, texture);
          } catch (e) {
            console.warn(`Failed to load texture: ${tex.name} (${tex.url})`, e);
            this.textures.set(tex.name, Texture.WHITE);
          }
        }

        // Load spritesheets (with XML definitions)
        for (const sheet of this.manifest.spritesheets) {
          try {
            // Load the spritesheet image as a base texture
            const baseTextureAsset = await Assets.load(sheet.imageUrl);
            
            // Load the XML file
            const xmlResponse = await fetch(sheet.xmlUrl);
            const xmlText = await xmlResponse.text();
            
            // Parse the XML to get frame data
            const parser = new DOMParser();
            const xml = parser.parseFromString(xmlText, 'text/xml');
            
            // Process each SubTexture element
            const subtextures = xml.getElementsByTagName('SubTexture');
            
            for (let i = 0; i < subtextures.length; i++) {
              const subtexture = subtextures[i];
              const name = subtexture.getAttribute('name')?.replace('.png', '') || '';
              const x = parseInt(subtexture.getAttribute('x') || '0', 10);
              const y = parseInt(subtexture.getAttribute('y') || '0', 10);
              const width = parseInt(subtexture.getAttribute('width') || '0', 10);
              const height = parseInt(subtexture.getAttribute('height') || '0', 10);
              
              // Create a texture with the frame information
              const texture = new Texture({
                source: baseTextureAsset.source,
                frame: new Rectangle(x, y, width, height)
              });
              
              // Store the texture with its frame name
              this.textures.set(name, texture);
            }
          } catch (e) {
            console.warn(`Failed to load spritesheet: ${sheet.name}`, e);
          }
        }

        this.loaded = true;
        resolve();
      } catch (error) {
        console.error('Error loading assets:', error);
        resolve(); // Resolve anyway to not block the game
      }
    });

    return this.loadPromise;
  }

  /**
   * Get a texture by name
   * @param name Texture name
   */
  public getTexture(name: string): Texture {
    if (!this.loaded) {
      console.warn('Attempted to get texture before assets are loaded');
      return Texture.WHITE;
    }
    
    const texture = this.textures.get(name);
    if (!texture) {
      console.warn(`Texture '${name}' not found`);
      return Texture.WHITE;
    }
    
    return texture;
  }

  /**
   * Are assets loaded?
   */
  public isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * List all available texture names
   */
  public listTextures(): string[] {
    return Array.from(this.textures.keys());
  }
} 