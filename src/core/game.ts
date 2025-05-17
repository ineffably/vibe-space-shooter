import { Application, Ticker } from 'pixi.js';
import { SceneManager } from './scene-manager';
import { GameScene } from '../scenes/game-scene';
import { AssetLoader } from '../library/asset-loader';

/**
 * Main Game class that handles initialization and the game loop
 */
export class Game {
  private app: Application;
  private sceneManager: SceneManager = SceneManager.getInstance();
  private assetLoader: AssetLoader = AssetLoader.getInstance();
  private assetsPending: boolean = true;
  
  // Default game dimensions with vertical orientation
  private readonly gameWidth: number = 500;
  private readonly gameHeight: number = 800;

  constructor() {
    // Create the PIXI application with vertical orientation
    this.app = new Application({
      background: '#000000',
      width: this.gameWidth,
      height: this.gameHeight,
      antialias: true
    });

    // Initialize the app first
    this.app.init().then(() => {
      // Add the view to the DOM
      const gameContainer = document.getElementById('game-container');
      if (gameContainer) {
        gameContainer.appendChild(this.app.canvas);
      }

      // Add the scene manager's container to the stage
      this.app.stage.addChild(this.sceneManager.getContainer());

      // Initialize the game
      this.init();

      // Handle window resizing
      window.addEventListener('resize', this.resize.bind(this));
      this.resize();
    });
  }

  /**
   * Initialize the game
   */
  private async init(): Promise<void> {
    // Load assets
    await this.loadAssets();

    // Create scenes
    this.createScenes();

    // Set up the game loop
    this.app.ticker.add(this.update, this);
  }

  /**
   * Load game assets
   */
  private async loadAssets(): Promise<void> {
    try {
      await this.assetLoader.loadAssets();
      this.assetsPending = false;
    } catch (error) {
      // Silent error handling
    }
  }

  /**
   * Create game scenes
   */
  private createScenes(): void {
    // Create and register the game scene
    const gameScene = new GameScene();
    gameScene.init();
    this.sceneManager.registerScene('game', gameScene);

    // Switch to the game scene
    this.sceneManager.switchToScene('game');
  }

  /**
   * Main game loop
   * @param ticker The PIXI ticker
   */
  private update(ticker: Ticker): void {
    if (this.assetsPending) return;

    const deltaTime = ticker.deltaTime;
    
    // Update the scene manager
    this.sceneManager.update(deltaTime);
  }

  /**
   * Handle window resizing
   */
  private resize(): void {
    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) return;

    // Calculate the scale to fit the window while maintaining aspect ratio
    const containerWidth = gameContainer.clientWidth;
    const containerHeight = gameContainer.clientHeight;
    
    const scaleX = containerWidth / this.gameWidth;
    const scaleY = containerHeight / this.gameHeight;
    const scale = Math.min(scaleX, scaleY);
    
    // Calculate centered position
    const newWidth = this.gameWidth * scale;
    const newHeight = this.gameHeight * scale;
    
    // Set canvas size with the right scale while maintaining aspect ratio
    this.app.canvas.style.width = `${newWidth}px`;
    this.app.canvas.style.height = `${newHeight}px`;
    
    // Keep internal resolution the same
    this.app.renderer.resize(this.gameWidth, this.gameHeight);
    
    // Resize the scenes - pass the actual game dimensions, not the scaled ones
    this.sceneManager.resize(this.gameWidth, this.gameHeight);
  }
} 