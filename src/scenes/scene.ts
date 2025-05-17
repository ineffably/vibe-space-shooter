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
   * Constructor
   */
  constructor() {
    this.container = new Container();
  }
  
  /**
   * Initialize the scene
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
   * Activate the scene
   */
  public activate(): void {
    this.active = true;
    this.container.visible = true;
  }
  
  /**
   * Deactivate the scene
   */
  public deactivate(): void {
    this.active = false;
    this.container.visible = false;
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