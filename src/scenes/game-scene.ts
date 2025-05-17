import { Container, Sprite, Texture } from 'pixi.js';
import { Scene } from './scene';
import { InputManager } from '../core/input-manager';
import { PlayerShip } from '../entities/player-ship';

/**
 * Main gameplay scene
 */
export class GameScene extends Scene {
  /**
   * Background sprite
   */
  private background: Sprite | null = null;
  
  /**
   * Player ship
   */
  private player: PlayerShip | null = null;
  
  /**
   * Input manager
   */
  private inputManager: InputManager;
  
  /**
   * Constructor
   */
  constructor() {
    super();
    
    this.inputManager = InputManager.getInstance();
  }
  
  /**
   * Initialize the scene
   */
  public init(): void {
    // Create background (will be replaced with actual asset later)
    this.background = new Sprite(Texture.WHITE);
    this.background.tint = 0x000000;
    this.container.addChild(this.background);
    
    // Initialize game entities
    this.initializeEntities();
  }
  
  /**
   * Initialize game entities
   */
  private initializeEntities(): void {
    // Create player ship
    this.player = new PlayerShip(400, 500); // Center bottom of screen
    this.container.addChild(this.player.getContainer());
  }
  
  /**
   * Update the scene
   * @param deltaTime Time since last update
   */
  public update(deltaTime: number): void {
    if (!this.active) return;
    
    // Update entities
    this.updateEntities(deltaTime);
    
    // Handle input
    this.handleInput();
    
    // Check collisions
    this.checkCollisions();
  }
  
  /**
   * Update game entities
   * @param deltaTime Time since last update
   */
  private updateEntities(deltaTime: number): void {
    // Update player
    if (this.player) {
      this.player.update(deltaTime);
    }
    
    // Later: Update enemies, projectiles, etc.
  }
  
  /**
   * Handle player input
   */
  private handleInput(): void {
    // Player input is already handled in the player's state machine
  }
  
  /**
   * Check for collisions between entities
   */
  private checkCollisions(): void {
    // Check for collisions between projectiles and entities
    // Will be implemented later
  }
  
  /**
   * Resize the scene
   * @param width New width
   * @param height New height
   */
  public resize(width: number, height: number): void {
    if (this.background) {
      this.background.width = width;
      this.background.height = height;
    }
  }
} 