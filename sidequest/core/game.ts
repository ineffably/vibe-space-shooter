import { Application, Ticker } from 'pixi.js';
import { SceneManager } from './scene-manager';
import { AssetManager } from '../managers/asset-manager';
import { InputManager } from '../managers/input-manager';
import type { AssetManifest } from '../managers/asset-manager';
import type { Scene } from './scene';

/**
 * Game configuration interface
 */
export interface GameConfig {
  width: number;
  height: number;
  backgroundColor: number;
  antialias?: boolean;
  resolution?: number;
  assets?: AssetManifest;
  autoResize?: boolean;
  containerId?: string;
}

/**
 * Main Game class that handles initialization and the game loop
 */
export class Game {
  private app: Application;
  private sceneManager: SceneManager = SceneManager.getInstance();
  private assetManager: AssetManager = AssetManager.getInstance();
  private inputManager: InputManager = InputManager.getInstance();
  private assetsLoaded: boolean = false;
  private config: GameConfig;
  private onAssetsLoaded: (() => void) | null = null;

  /**
   * Constructor
   * @param config Game configuration
   */
  constructor(config: GameConfig) {
    this.config = this.getDefaultConfig(config);
    
    // Create the PIXI application
    this.app = new Application({
      background: this.config.backgroundColor,
      width: this.config.width,
      height: this.config.height,
      antialias: this.config.antialias,
      resolution: this.config.resolution,
    });

    // Set up asset manifest if provided
    if (this.config.assets) {
      this.assetManager.setManifest(this.config.assets);
    }
  }

  /**
   * Get default configuration with user overrides
   * @param config User configuration
   * @returns Merged configuration
   */
  private getDefaultConfig(config: GameConfig): GameConfig {
    return {
      width: config.width || 800,
      height: config.height || 600,
      backgroundColor: config.backgroundColor || 0x000000,
      antialias: config.antialias !== undefined ? config.antialias : true,
      resolution: config.resolution || window.devicePixelRatio || 1,
      assets: config.assets || { spritesheets: [], textures: [], sounds: [] },
      autoResize: config.autoResize !== undefined ? config.autoResize : true,
      containerId: config.containerId || 'game-container',
    };
  }

  /**
   * Initialize the game
   */
  public async init(): Promise<void> {
    // Initialize the PIXI application
    await this.app.init();

    // Add the view to the DOM
    const gameContainer = document.getElementById(this.config.containerId || 'game-container');
    if (gameContainer) {
      gameContainer.appendChild(this.app.canvas);
    } else {
      document.body.appendChild(this.app.canvas);
    }

    // Add the scene manager container to the stage
    this.app.stage.addChild(this.sceneManager.getContainer());

    // Load assets
    await this.loadAssets();

    // Set up the game loop
    this.app.ticker.add(this.update, this);

    // Handle window resizing
    if (this.config.autoResize) {
      window.addEventListener('resize', this.resize.bind(this));
      this.resize();
    }
  }

  /**
   * Set a callback for when assets are loaded
   * @param callback Callback function
   */
  public onAssetLoadComplete(callback: () => void): void {
    if (this.assetsLoaded) {
      callback();
    } else {
      this.onAssetsLoaded = callback;
    }
  }

  /**
   * Load game assets
   */
  private async loadAssets(): Promise<void> {
    try {
      await this.assetManager.loadAssets();
      this.assetsLoaded = true;
      
      if (this.onAssetsLoaded) {
        this.onAssetsLoaded();
        this.onAssetsLoaded = null;
      }
    } catch (error) {
      console.error('Error loading assets:', error);
    }
  }

  /**
   * Register a scene
   * @param name Scene name
   * @param scene Scene instance
   */
  public registerScene(name: string, scene: Scene): void {
    this.sceneManager.registerScene(name, scene);
  }

  /**
   * Switch to a scene
   * @param name Scene name
   */
  public switchToScene(name: string): boolean {
    return this.sceneManager.switchToScene(name);
  }

  /**
   * Get a scene by name
   * @param name Scene name
   */
  public getScene(name: string): Scene | null {
    return this.sceneManager.getScene(name);
  }

  /**
   * Main game loop
   * @param ticker The PIXI ticker
   */
  private update(ticker: Ticker): void {
    if (!this.assetsLoaded) return;

    const deltaTime = ticker.deltaTime;
    
    // Update input manager
    this.inputManager.update();
    
    // Update the scene manager
    this.sceneManager.update(deltaTime);
  }

  /**
   * Handle window resizing
   */
  private resize(): void {
    const gameContainer = document.getElementById(this.config.containerId || 'game-container');
    if (!gameContainer) return;

    // Calculate the scale to fit the window while maintaining aspect ratio
    const containerWidth = gameContainer.clientWidth;
    const containerHeight = gameContainer.clientHeight;
    
    const scaleX = containerWidth / this.config.width;
    const scaleY = containerHeight / this.config.height;
    const scale = Math.min(scaleX, scaleY);
    
    // Calculate centered position
    const newWidth = this.config.width * scale;
    const newHeight = this.config.height * scale;
    
    // Set canvas size with the right scale while maintaining aspect ratio
    this.app.canvas.style.width = `${newWidth}px`;
    this.app.canvas.style.height = `${newHeight}px`;
    
    // Set display style to center the canvas
    this.app.canvas.style.position = 'absolute';
    this.app.canvas.style.left = `${(containerWidth - newWidth) / 2}px`;
    this.app.canvas.style.top = `${(containerHeight - newHeight) / 2}px`;
    
    // Keep internal resolution the same
    this.app.renderer.resize(this.config.width, this.config.height);
    
    // Resize the scenes
    this.sceneManager.resize(this.config.width, this.config.height);
  }
} 