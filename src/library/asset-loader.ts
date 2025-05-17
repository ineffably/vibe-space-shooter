import { Assets, Rectangle, Texture } from 'pixi.js';
import { SoundManager } from './sound-manager';

/**
 * Asset types
 */
export enum AssetType {
  SPRITESHEET = 'spritesheet',
  TEXTURE = 'texture',
  SOUND = 'sound',
}

/**
 * Asset manifests
 */
const ASSET_MANIFESTS = {
  spritesheets: [
    { name: 'space-shooter', imageUrl: 'assets/spritesheet/sheet.png', xmlUrl: 'assets/spritesheet/sheet.xml' },
    { name: 'pixel-explosion', imageUrl: 'assets/spritesheet/spritesheet_pixelExplosion.png', 
      xmlUrl: 'assets/spritesheet/spritesheet_pixelExplosion.xml' },
    { name: 'sonic-explosion', imageUrl: 'assets/spritesheet/spritesheet_sonicExplosion.png', 
      xmlUrl: 'assets/spritesheet/spritesheet_sonicExplosion.xml' }
  ],
  textures: [
    { name: 'black', url: 'assets/backgrounds/black.png' }
  ]
};

/**
 * Asset loader class for loading game assets
 */
export class AssetLoader {
  private static instance: AssetLoader;
  private loaded = false;
  private loadPromise: Promise<void> | null = null;
  private textures: Map<string, Texture> = new Map();

  private constructor() {
    // Private constructor to enforce singleton
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): AssetLoader {
    if (!AssetLoader.instance) {
      AssetLoader.instance = new AssetLoader();
    }
    return AssetLoader.instance;
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
        // Preload sound effects
        await SoundManager.getInstance().preloadSounds();
        
        // Load individual textures
        for (const tex of ASSET_MANIFESTS.textures) {
          try {
            const texture = await Assets.load(tex.url);
            this.textures.set(tex.name, texture);
          } catch (e) {
            this.textures.set(tex.name, Texture.WHITE);
          }
        }

        // Load spritesheets (with XML definitions)
        for (const sheet of ASSET_MANIFESTS.spritesheets) {
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
              
              // Create a texture with the frame information - Pixi.js v8.9 method
              // Create a new texture from the base texture and frame
              const texture = new Texture({
                source: baseTextureAsset.source,
                frame: new Rectangle(x, y, width, height)
              });
              
              // Store the texture with its frame name
              this.textures.set(name, texture);
              
              // Add prefixed name for explosion frames to follow convention in explosion manager
              if (sheet.name === 'sonic-explosion') {
                const prefixedName = `spritesheet_sonicExplosion_${name.replace('sonicExplosion', '')}`;
                this.textures.set(prefixedName, texture);
              } else if (sheet.name === 'pixel-explosion') {
                const prefixedName = `spritesheet_pixelExplosion_${name.replace('pixelExplosion', '')}`;
                this.textures.set(prefixedName, texture);
              }
            }
          } catch (e) {
            // Silently handle error
          }
        }

        this.loaded = true;
        resolve();
      } catch (error) {
        // Silently handle error
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
      return Texture.WHITE;
    }
    
    const texture = this.textures.get(name);
    if (!texture) {
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