import { Assets, Spritesheet, Texture } from 'pixi.js';

/**
 * Asset types
 */
export enum AssetType {
  SPRITESHEET = 'spritesheet',
  TEXTURE = 'texture',
  SOUND = 'sound',
}

/**
 * Asset loader class for loading game assets
 */
export class AssetLoader {
  private static instance: AssetLoader;
  private loaded = false;
  private loadPromise: Promise<void> | null = null;

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
        // For now, just set loaded to true as we're not loading actual assets yet
        // Later we'll implement proper asset loading
        console.log('Asset loading skipped for now');
        this.loaded = true;
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
      throw new Error('Assets not loaded');
    }
    // For now, return a white texture
    return Texture.WHITE;
  }

  /**
   * Get a spritesheet by name
   * @param name Spritesheet name
   */
  public getSpritesheet(name: string): Spritesheet {
    if (!this.loaded) {
      throw new Error('Assets not loaded');
    }
    throw new Error(`Spritesheet ${name} not found`);
  }

  /**
   * Are assets loaded?
   */
  public isLoaded(): boolean {
    return this.loaded;
  }
} 