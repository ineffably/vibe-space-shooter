import { Container, Sprite, Texture } from 'pixi.js';
import { StateMachine } from '../states/state-machine';

/**
 * Base entity class for all game objects
 */
export abstract class Entity {
  /**
   * The PIXI container for this entity
   */
  protected container: Container;
  
  /**
   * The sprite for this entity
   */
  protected sprite: Sprite | null = null;
  
  /**
   * The state machine for this entity
   */
  protected stateMachine: StateMachine;
  
  /**
   * X position
   */
  protected x: number;
  
  /**
   * Y position
   */
  protected y: number;
  
  /**
   * Width
   */
  protected width: number;
  
  /**
   * Height
   */
  protected height: number;
  
  /**
   * Is the entity active?
   */
  protected active = true;
  
  /**
   * Constructor for Entity
   * @param x Initial x position
   * @param y Initial y position
   */
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.width = 0;
    this.height = 0;
    
    // Create a container for this entity
    this.container = new Container();
    this.container.position.set(x, y);
    
    // Create a state machine for this entity
    this.stateMachine = new StateMachine(this);
    
    // Initialize entity states
    this.initializeStates();
  }
  
  /**
   * Initialize the states for this entity
   */
  protected abstract initializeStates(): void;
  
  /**
   * Set the sprite for this entity
   * @param texture The texture to use for the sprite
   */
  protected setSprite(texture: Texture): void {
    this.sprite = Sprite.from(texture);
    this.sprite.anchor.set(0.5);
    this.container.addChild(this.sprite);
    
    // Update width and height
    this.width = this.sprite.width;
    this.height = this.sprite.height;
  }
  
  /**
   * Update the entity
   * @param deltaTime The time since the last update
   */
  public update(deltaTime: number): void {
    // Always update the state machine regardless of active status
    // This is important for states like "destroyed" which need to run while inactive
    this.stateMachine.update(deltaTime);
    
    // Other entity updates can be skipped if inactive
    if (!this.active) return;
    
    // Specific entity updates when active would go here in derived classes
  }
  
  /**
   * Get the container for this entity
   */
  public getContainer(): Container {
    return this.container;
  }
  
  /**
   * Get the x position
   */
  public getX(): number {
    return this.x;
  }
  
  /**
   * Get the y position
   */
  public getY(): number {
    return this.y;
  }
  
  /**
   * Set the position
   * @param x X position
   * @param y Y position
   */
  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.container.position.set(x, y);
  }
  
  /**
   * Get the width
   */
  public getWidth(): number {
    return this.width;
  }
  
  /**
   * Get the height
   */
  public getHeight(): number {
    return this.height;
  }
  
  /**
   * Is the entity active?
   */
  public isActive(): boolean {
    return this.active;
  }
  
  /**
   * Set the entity active state
   * @param active Active state
   */
  public setActive(active: boolean): void {
    this.active = active;
    this.container.visible = active;
  }
  
  /**
   * Destroy the entity
   */
  public destroy(): void {
    if (this.container.parent) {
      this.container.parent.removeChild(this.container);
    }
    this.container.destroy({ children: true });
    this.active = false;
  }
} 