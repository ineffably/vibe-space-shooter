import { Container } from 'pixi.js';
import type { Scene } from '../scenes/scene';

/**
 * SceneManager class for managing game scenes
 */
export class SceneManager {
  private static instance: SceneManager;
  
  /**
   * Container for all scenes
   */
  private container: Container = new Container();
  
  /**
   * Registered scenes
   */
  private scenes: Map<string, Scene> = new Map();
  
  /**
   * Active scene
   */
  private activeScene: Scene | null = null;
  
  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
  }
  
  /**
   * Get the instance of the scene manager
   */
  public static getInstance(): SceneManager {
    if (!SceneManager.instance) {
      SceneManager.instance = new SceneManager();
    }
    return SceneManager.instance;
  }
  
  /**
   * Get the container for all scenes
   */
  public getContainer(): Container {
    return this.container;
  }
  
  /**
   * Register a scene
   * @param name Name of the scene
   * @param scene Scene to register
   */
  public registerScene(name: string, scene: Scene): void {
    if (this.scenes.has(name)) {
      return;
    }
    
    this.scenes.set(name, scene);
    this.container.addChild(scene.getContainer());
  }
  
  /**
   * Switch to a scene
   * @param name Name of the scene to switch to
   */
  public switchToScene(name: string): void {
    if (!this.scenes.has(name)) {
      return;
    }
    
    // Deactivate current scene
    if (this.activeScene) {
      this.activeScene.deactivate();
    }
    
    // Activate new scene
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
   * Resize all scenes
   * @param width New width
   * @param height New height
   */
  public resize(width: number, height: number): void {
    for (const scene of this.scenes.values()) {
      scene.resize(width, height);
    }
  }
} 