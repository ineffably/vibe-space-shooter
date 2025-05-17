import { Container, Sprite, Texture } from 'pixi.js';
import { StateMachine } from '../core/state-machine';
import type { State } from '../core/state-machine';

/**
 * Vector2 interface for 2D positions and dimensions
 */
export interface Vector2 {
  x: number;
  y: number;
}

/**
 * Base entity class for all game objects
 */
export abstract class Entity<T extends Entity<T>> {
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
  protected stateMachine: StateMachine<T>;
  
  /**
   * Position
   */
  protected position: Vector2;
  
  /**
   * Dimensions
   */
  protected dimensions: Vector2;
  
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
    this.position = { x, y };
    this.dimensions = { x: 0, y: 0 };
    
    // Create a container for this entity
    this.container = new Container();
    this.container.position.set(x, y);
    
    // Create a state machine for this entity
    // We need to cast 'this' to T because TypeScript doesn't know that
    // 'this' is of type T at compile time
    this.stateMachine = new StateMachine<T>(this as unknown as T);
    
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
    
    // Update dimensions
    this.dimensions = { 
      x: this.sprite.width,
      y: this.sprite.height
    };
  }
  
  /**
   * Update the entity
   * @param deltaTime The time since the last update
   */
  public update(deltaTime: number): void {
    // Always update the state machine, even if inactive
    this.stateMachine.update(deltaTime);
    
    // Specific entity updates when active would go here in derived classes
  }
  
  /**
   * Get the container for this entity
   */
  public getContainer(): Container {
    return this.container;
  }
  
  /**
   * Get the position
   */
  public getPosition(): Vector2 {
    return { ...this.position };
  }
  
  /**
   * Get the x position
   */
  public getX(): number {
    return this.position.x;
  }
  
  /**
   * Get the y position
   */
  public getY(): number {
    return this.position.y;
  }
  
  /**
   * Set the position
   * @param x X position
   * @param y Y position
   */
  public setPosition(x: number, y: number): void {
    this.position.x = x;
    this.position.y = y;
    this.container.position.set(x, y);
  }
  
  /**
   * Get the dimensions
   */
  public getDimensions(): Vector2 {
    return { ...this.dimensions };
  }
  
  /**
   * Get the width
   */
  public getWidth(): number {
    return this.dimensions.x;
  }
  
  /**
   * Get the height
   */
  public getHeight(): number {
    return this.dimensions.y;
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
   * Check collision with another entity using simple circle collision
   * @param other The other entity to check collision with
   * @param radius Optional collision radius, defaults to average of width and height
   * @returns Whether the entities are colliding
   */
  public isCollidingWith(other: Entity<any>, radius?: number): boolean {
    const dx = this.position.x - other.position.x;
    const dy = this.position.y - other.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const thisRadius = radius || (this.dimensions.x + this.dimensions.y) / 4;
    const otherRadius = radius || (other.dimensions.x + other.dimensions.y) / 4;
    
    return distance < (thisRadius + otherRadius);
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