import { Container } from 'pixi.js';

/**
 * Base Scene class for different game scenes
 */
export abstract class Scene {
  /**
   * Container for scene contents
   */
  protected container: Container;
  
  /**
   * Is the scene active?
   */
  protected active = false;
  
  /**
   * Scene name for identification
   */
  protected name: string;
  
  /**
   * Constructor
   * @param name Optional scene name
   */
  constructor(name: string = 'scene') {
    this.container = new Container();
    this.name = name;
  }
  
  /**
   * Initialize the scene
   * This is called when the scene is first created
   */
  public abstract init(): void;
  
  /**
   * Update the scene
   * @param deltaTime Time since last update
   */
  public abstract update(deltaTime: number): void;
  
  /**
   * Get the scene container
   */
  public getContainer(): Container {
    return this.container;
  }
  
  /**
   * Get the scene name
   */
  public getName(): string {
    return this.name;
  }
  
  /**
   * Set the scene name
   * @param name The new name
   */
  public setName(name: string): void {
    this.name = name;
  }
  
  /**
   * Activate the scene
   * This is called when the scene becomes the active scene
   */
  public activate(): void {
    this.active = true;
    this.container.visible = true;
    this.onActivate();
  }
  
  /**
   * Hook for custom activation behavior
   * Override this in derived classes
   */
  protected onActivate(): void {
    // Default implementation does nothing
  }
  
  /**
   * Deactivate the scene
   * This is called when the scene is no longer the active scene
   */
  public deactivate(): void {
    this.active = false;
    this.container.visible = false;
    this.onDeactivate();
  }
  
  /**
   * Hook for custom deactivation behavior
   * Override this in derived classes
   */
  protected onDeactivate(): void {
    // Default implementation does nothing
  }
  
  /**
   * Is the scene active?
   */
  public isActive(): boolean {
    return this.active;
  }
  
  /**
   * Resize the scene
   * @param width New width
   * @param height New height
   */
  public abstract resize(width: number, height: number): void;
} 