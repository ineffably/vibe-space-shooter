import { Container } from 'pixi.js';
import type { Scene } from './scene';

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
    // Nothing to do here
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
      console.warn(`Scene with name '${name}' already exists. Overwriting.`);
    }
    
    this.scenes.set(name, scene);
    this.container.addChild(scene.getContainer());
    
    // Set the scene name to match the registered name
    scene.setName(name);
  }
  
  /**
   * Get a scene by name
   * @param name Name of the scene
   * @returns The scene or null if not found
   */
  public getScene(name: string): Scene | null {
    return this.scenes.get(name) || null;
  }
  
  /**
   * Get the active scene
   * @returns The active scene or null if none is active
   */
  public getActiveScene(): Scene | null {
    return this.activeScene;
  }
  
  /**
   * Switch to a scene
   * @param name Name of the scene to switch to
   * @returns True if successful, false if scene not found
   */
  public switchToScene(name: string): boolean {
    if (!this.scenes.has(name)) {
      console.warn(`Scene '${name}' not found. Cannot switch.`);
      return false;
    }
    
    // Deactivate current scene
    if (this.activeScene) {
      this.activeScene.deactivate();
    }
    
    // Activate new scene
    this.activeScene = this.scenes.get(name) as Scene;
    this.activeScene.activate();
    
    return true;
  }
  
  /**
   * Remove a scene
   * @param name Name of the scene to remove
   * @returns True if successful, false if scene not found
   */
  public removeScene(name: string): boolean {
    const scene = this.scenes.get(name);
    if (!scene) {
      return false;
    }
    
    // If this is the active scene, deactivate it first
    if (this.activeScene === scene) {
      this.activeScene = null;
      scene.deactivate();
    }
    
    // Remove the scene's container from the display list
    this.container.removeChild(scene.getContainer());
    
    // Remove the scene from the map
    this.scenes.delete(name);
    
    return true;
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