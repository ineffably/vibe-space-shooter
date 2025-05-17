import { Container } from 'pixi.js';
import { Scene } from '../scenes/scene';

/**
 * Scene manager for handling different game scenes
 */
export class SceneManager {
  private static instance: SceneManager;
  
  /**
   * Root container for all scenes
   */
  private container: Container;
  
  /**
   * Scenes by name
   */
  private scenes: Map<string, Scene> = new Map();
  
  /**
   * Active scene
   */
  private activeScene: Scene | null = null;
  
  /**
   * Constructor
   */
  private constructor() {
    this.container = new Container();
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): SceneManager {
    if (!SceneManager.instance) {
      SceneManager.instance = new SceneManager();
    }
    return SceneManager.instance;
  }
  
  /**
   * Register a scene
   * @param name Scene name
   * @param scene Scene instance
   */
  public registerScene(name: string, scene: Scene): void {
    if (this.scenes.has(name)) {
      console.warn(`Scene ${name} already registered`);
      return;
    }
    
    this.scenes.set(name, scene);
    this.container.addChild(scene.getContainer());
    scene.deactivate();
  }
  
  /**
   * Switch to a scene
   * @param name Scene name
   */
  public switchToScene(name: string): void {
    if (!this.scenes.has(name)) {
      console.error(`Scene ${name} not found`);
      return;
    }
    
    if (this.activeScene) {
      this.activeScene.deactivate();
    }
    
    this.activeScene = this.scenes.get(name) as Scene;
    this.activeScene.activate();
  }
  
  /**
   * Update the active scene
   * @param deltaTime Time since last update
   */
  public update(deltaTime: number): void {
    if (this.activeScene) {
      this.activeScene.update(deltaTime);
    }
  }
  
  /**
   * Get the scene container
   */
  public getContainer(): Container {
    return this.container;
  }
  
  /**
   * Get a scene by name
   * @param name Scene name
   */
  public getScene(name: string): Scene | undefined {
    return this.scenes.get(name);
  }
  
  /**
   * Get the active scene
   */
  public getActiveScene(): Scene | null {
    return this.activeScene;
  }
  
  /**
   * Resize all scenes
   * @param width New width
   * @param height New height
   */
  public resize(width: number, height: number): void {
    this.scenes.forEach((scene) => {
      scene.resize(width, height);
    });
  }
} 