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
  private loadingDebug = true;

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
        console.log('Loading assets...');
        
        // Preload sound effects
        console.log('Loading sound effects...');
        await SoundManager.getInstance().preloadSounds();
        
        // Load individual textures
        for (const tex of ASSET_MANIFESTS.textures) {
          try {
            const texture = await Assets.load(tex.url);
            this.textures.set(tex.name, texture);
            console.log(`Loaded texture: ${tex.name}`);
          } catch (e) {
            console.error(`Failed to load texture: ${tex.name}`, e);
            this.textures.set(tex.name, Texture.WHITE);
          }
        }

        // Load spritesheets (with XML definitions)
        for (const sheet of ASSET_MANIFESTS.spritesheets) {
          try {
            console.log(`Loading spritesheet: ${sheet.name}`);
            
            // Load the spritesheet image as a base texture
            const baseTextureAsset = await Assets.load(sheet.imageUrl);
            
            console.log(`Loaded base texture: ${sheet.imageUrl}`, 
              `width: ${baseTextureAsset.width}, height: ${baseTextureAsset.height}`);
            
            // Load the XML file
            const xmlResponse = await fetch(sheet.xmlUrl);
            const xmlText = await xmlResponse.text();
            
            console.log(`Loaded XML: ${sheet.xmlUrl}`);
            
            // Parse the XML to get frame data
            const parser = new DOMParser();
            const xml = parser.parseFromString(xmlText, 'text/xml');
            
            // Process each SubTexture element
            const subtextures = xml.getElementsByTagName('SubTexture');
            console.log(`Found ${subtextures.length} subtextures in spritesheet: ${sheet.name}`);
            
            // For explosion sheets, pre-log the names to help debug
            if (sheet.name.includes('explosion')) {
              console.log('Explosion frame names in XML:');
              for (let i = 0; i < subtextures.length; i++) {
                const name = subtextures[i].getAttribute('name')?.replace('.png', '') || '';
                console.log(`- ${name}`);
              }
            }
            
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
                if (i < 10) {
                  console.log(`Created sonic explosion texture: ${prefixedName}`);
                }
              } else if (sheet.name === 'pixel-explosion') {
                const prefixedName = `spritesheet_pixelExplosion_${name.replace('pixelExplosion', '')}`;
                this.textures.set(prefixedName, texture);
                if (i < 10) {
                  console.log(`Created pixel explosion texture: ${prefixedName}`);
                }
              }
              
              if (this.loadingDebug && (i < 5 || sheet.name.includes('explosion'))) {
                console.log(`Created texture for frame: ${name}`, 
                  `x: ${x}, y: ${y}, w: ${width}, h: ${height}`);
              }
            }
            
            // For explosion sheets, verify we have numbered frames
            if (sheet.name.includes('explosion')) {
              console.log('Checking for explosion animation frames:');
              for (let i = 0; i < 9; i++) {
                const frameNumber = i.toString().padStart(3, '0');
                const pixelName = `spritesheet_pixelExplosion_${frameNumber}`;
                const sonicName = `spritesheet_sonicExplosion_${frameNumber}`;
                
                if (sheet.name.includes('pixel')) {
                  console.log(`- ${pixelName}: ${this.textures.has(pixelName) ? 'Found' : 'MISSING'}`);
                } else if (sheet.name.includes('sonic')) {
                  console.log(`- ${sonicName}: ${this.textures.has(sonicName) ? 'Found' : 'MISSING'}`);
                }
              }
            }
            
            console.log(`Loaded spritesheet: ${sheet.name} with ${subtextures.length} frames`);
            
          } catch (e) {
            console.error(`Failed to load spritesheet: ${sheet.name}`, e);
          }
        }

        this.loaded = true;
        console.log('All assets loaded');
        
        // List just explosion textures for debugging
        const explosionTextures = this.listTextures().filter(name => 
          name.includes('spritesheet_pixelExplosion') || 
          name.includes('spritesheet_sonicExplosion')
        );
        console.log('Explosion textures:', explosionTextures);
        
        resolve();
      } catch (error) {
        console.error('Error loading assets:', error);
        throw error;
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
      console.warn('Assets not loaded, returning placeholder texture');
      return Texture.WHITE;
    }
    
    const texture = this.textures.get(name);
    if (!texture) {
      console.warn(`Texture "${name}" not found, using placeholder. Available textures: ${this.listTextures()}`);
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