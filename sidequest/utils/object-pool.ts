/**
 * Interface for poolable objects
 */
export interface Poolable {
  /**
   * Check if the object is active
   */
  isActive(): boolean;
  
  /**
   * Set the object active state
   */
  setActive(active: boolean): void;
  
  /**
   * Update the object
   */
  update(deltaTime: number): void;
}

/**
 * Generic object pool for reusing objects
 * T must implement Poolable interface
 */
export class ObjectPool<T extends Poolable> {
  /**
   * Active objects
   */
  private activeObjects: T[] = [];
  
  /**
   * Inactive objects (available for reuse)
   */
  private inactiveObjects: T[] = [];
  
  /**
   * Factory function to create new objects
   */
  private factory: () => T;
  
  /**
   * Maximum pool size (0 = unlimited)
   */
  private maxSize: number;
  
  /**
   * Constructor
   * @param factory Factory function to create new objects
   * @param initialSize Initial number of objects to create
   * @param maxSize Maximum number of objects in the pool (0 = unlimited)
   */
  constructor(factory: () => T, initialSize = 0, maxSize = 0) {
    this.factory = factory;
    this.maxSize = maxSize;
    
    // Create initial objects
    for (let i = 0; i < initialSize; i++) {
      const obj = this.factory();
      obj.setActive(false);
      this.inactiveObjects.push(obj);
    }
  }
  
  /**
   * Get an object from the pool
   * @returns An object from the pool
   */
  public get(): T {
    // If there are inactive objects, use one of those
    if (this.inactiveObjects.length > 0) {
      const obj = this.inactiveObjects.pop() as T;
      obj.setActive(true);
      this.activeObjects.push(obj);
      return obj;
    }
    
    // If we've reached the maximum pool size (and it's not unlimited),
    // reuse the oldest active object
    if (this.maxSize > 0 && this.activeObjects.length >= this.maxSize) {
      const obj = this.activeObjects.shift() as T;
      this.activeObjects.push(obj);
      return obj;
    }
    
    // Otherwise, create a new object
    const obj = this.factory();
    obj.setActive(true);
    this.activeObjects.push(obj);
    return obj;
  }
  
  /**
   * Return an object to the pool
   * @param obj The object to return
   */
  public release(obj: T): void {
    // Find and remove from active objects
    const index = this.activeObjects.indexOf(obj);
    if (index !== -1) {
      this.activeObjects.splice(index, 1);
    }
    
    // Set inactive and add to inactive objects
    obj.setActive(false);
    this.inactiveObjects.push(obj);
  }
  
  /**
   * Update all active objects
   * @param deltaTime Time since last update
   */
  public update(deltaTime: number): void {
    // Update active objects and collect those that have become inactive
    const objectsToRelease: T[] = [];
    
    for (const obj of this.activeObjects) {
      obj.update(deltaTime);
      
      // If the object has become inactive, collect it for release
      if (!obj.isActive()) {
        objectsToRelease.push(obj);
      }
    }
    
    // Release collected objects
    for (const obj of objectsToRelease) {
      this.release(obj);
    }
  }
  
  /**
   * Get all active objects
   * @returns Array of active objects
   */
  public getActiveObjects(): T[] {
    return [...this.activeObjects];
  }
  
  /**
   * Deactivate all objects
   */
  public releaseAll(): void {
    // Move all active objects to inactive
    while (this.activeObjects.length > 0) {
      const obj = this.activeObjects.pop() as T;
      obj.setActive(false);
      this.inactiveObjects.push(obj);
    }
  }
  
  /**
   * Get the number of active objects
   * @returns Number of active objects
   */
  public getActiveCount(): number {
    return this.activeObjects.length;
  }
  
  /**
   * Get the number of inactive objects
   * @returns Number of inactive objects
   */
  public getInactiveCount(): number {
    return this.inactiveObjects.length;
  }
  
  /**
   * Get the total number of objects in the pool
   * @returns Total number of objects
   */
  public getTotalCount(): number {
    return this.activeObjects.length + this.inactiveObjects.length;
  }
} 