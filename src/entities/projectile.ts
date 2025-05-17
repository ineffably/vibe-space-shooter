import { Entity } from './entity';
import { StateMachine } from '../states/state-machine';
import type { State } from '../states/state-machine';
import { AssetLoader } from '../library/asset-loader';
import { ExplosionManager, ExplosionType } from '../library/explosion-manager';

/**
 * Projectile types
 */
export enum ProjectileType {
  PLAYER = 'player',
  ENEMY = 'enemy',
}

/**
 * Projectile states
 */
enum ProjectileState {
  ACTIVE = 'active',
  EXPLODING = 'exploding',
  INACTIVE = 'inactive',
}

/**
 * Active state for projectiles
 */
class ProjectileActiveState implements State {
  public readonly name = ProjectileState.ACTIVE;

  public enter(owner: StateMachine): void {
    const projectile = owner.getOwner() as Projectile;
    projectile.setActive(true);
  }

  public update(owner: StateMachine, deltaTime: number): void {
    const projectile = owner.getOwner() as Projectile;
    
    // Move the projectile
    projectile.move(deltaTime);
    
    // Check if the projectile is out of bounds
    if (projectile.isOutOfBounds()) {
      owner.setState(ProjectileState.INACTIVE);
    }
  }

  public exit(_owner: StateMachine): void {
    // Nothing to do
  }
}

/**
 * Exploding state for projectiles
 */
class ProjectileExplodingState implements State {
  public readonly name = ProjectileState.EXPLODING;
  private explosionTimer = 0;
  private readonly explosionTime = 0.2; // Time for explosion animation
  
  public enter(owner: StateMachine): void {
    const projectile = owner.getOwner() as Projectile;
    this.explosionTimer = 0;
    
    // Play explosion animation
    ExplosionManager.getInstance().createExplosion(
      ExplosionType.PIXEL,
      projectile.getX(),
      projectile.getY(),
      projectile.getContainer().parent || projectile.getContainer(),
      0.75 // Scale down the explosion a bit
    );
    
    // Hide the projectile sprite while explosion plays
    projectile.setActive(false);
    
    console.log('Projectile exploding with pixel explosion animation!');
  }
  
  public update(owner: StateMachine, deltaTime: number): void {
    this.explosionTimer += deltaTime;
    
    // After explosion time, transition to inactive
    if (this.explosionTimer >= this.explosionTime) {
      owner.setState(ProjectileState.INACTIVE);
    }
  }
  
  public exit(_owner: StateMachine): void {
    // Nothing to do
  }
}

/**
 * Inactive state for projectiles
 */
class ProjectileInactiveState implements State {
  public readonly name = ProjectileState.INACTIVE;
  
  public enter(owner: StateMachine): void {
    const projectile = owner.getOwner() as Projectile;
    projectile.setActive(false);
    projectile.returnToPool();
  }
  
  public update(_owner: StateMachine, _deltaTime: number): void {
    // Nothing to do while inactive
  }
  
  public exit(_owner: StateMachine): void {
    // Nothing to do
  }
}

/**
 * Projectile entity
 */
export class Projectile extends Entity {
  /**
   * Type of projectile (player or enemy)
   */
  private type: ProjectileType;
  
  /**
   * Damage amount
   */
  private damage: number;
  
  /**
   * Velocity in y direction
   */
  private velocityY: number;
  
  /**
   * Screen bounds
   */
  private screenWidth: number;
  private screenHeight: number;
  
  /**
   * Reference to projectile pool for recycling
   */
  private pool: ProjectilePool | null = null;
  
  /**
   * Constructor
   * @param type Projectile type
   * @param x Initial x position
   * @param y Initial y position
   * @param damage Damage amount
   * @param velocityY Velocity in y direction
   * @param screenWidth Screen width
   * @param screenHeight Screen height
   */
  constructor(
    type: ProjectileType,
    x: number,
    y: number,
    damage: number,
    velocityY: number,
    screenWidth: number,
    screenHeight: number
  ) {
    super(x, y);
    
    this.type = type;
    this.damage = damage;
    this.velocityY = velocityY;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    
    // Set sprite based on type
    if (type === ProjectileType.PLAYER) {
      const texture = AssetLoader.getInstance().getTexture('laserBlue01');
      this.setSprite(texture);
    } else {
      const texture = AssetLoader.getInstance().getTexture('laserRed05');
      this.setSprite(texture);
    }
  }
  
  /**
   * Initialize states
   */
  protected initializeStates(): void {
    // Add states to the state machine
    this.stateMachine.addState(new ProjectileActiveState());
    this.stateMachine.addState(new ProjectileExplodingState());
    this.stateMachine.addState(new ProjectileInactiveState());
    
    // Set initial state to inactive
    this.stateMachine.setState(ProjectileState.INACTIVE);
  }
  
  /**
   * Fire the projectile
   * @param x Starting x position
   * @param y Starting y position
   */
  public fire(x: number, y: number): void {
    this.setPosition(x, y);
    this.stateMachine.setState(ProjectileState.ACTIVE);
  }
  
  /**
   * Move the projectile
   * @param deltaTime Time since last update
   */
  public move(deltaTime: number): void {
    this.y += this.velocityY * deltaTime;
    this.container.position.set(this.x, this.y);
  }
  
  /**
   * Check if the projectile is out of screen bounds
   */
  public isOutOfBounds(): boolean {
    return this.y < -50 || this.y > this.screenHeight + 50;
  }
  
  /**
   * Handle collision
   */
  public onCollision(): void {
    this.stateMachine.setState(ProjectileState.EXPLODING);
  }
  
  /**
   * Return the projectile to the pool
   */
  public returnToPool(): void {
    if (this.pool) {
      this.pool.returnProjectile(this);
    }
  }
  
  /**
   * Set the pool reference
   * @param pool The projectile pool
   */
  public setPool(pool: ProjectilePool): void {
    this.pool = pool;
  }
  
  /**
   * Get the damage amount
   */
  public getDamage(): number {
    return this.damage;
  }
  
  /**
   * Get the projectile type
   */
  public getType(): ProjectileType {
    return this.type;
  }
  
  /**
   * Deactivate the projectile
   */
  public deactivate(): void {
    this.stateMachine.setState(ProjectileState.INACTIVE);
  }
}

/**
 * Pool for managing projectiles
 */
export class ProjectilePool {
  /**
   * Currently active projectiles
   */
  private activeProjectiles: Projectile[] = [];
  
  /**
   * Inactive projectiles available for reuse
   */
  private inactiveProjectiles: Projectile[] = [];
  
  /**
   * Constructor
   * @param initialSize Initial pool size
   * @param type Projectile type
   * @param damage Damage amount
   * @param velocityY Velocity in y direction
   * @param screenWidth Screen width
   * @param screenHeight Screen height
   */
  constructor(
    initialSize: number,
    private type: ProjectileType,
    private damage: number,
    private velocityY: number,
    private screenWidth: number,
    private screenHeight: number
  ) {
    // Create initial projectiles
    for (let i = 0; i < initialSize; i++) {
      this.inactiveProjectiles.push(this.createProjectile());
    }
  }
  
  /**
   * Create a new projectile
   */
  private createProjectile(): Projectile {
    const projectile = new Projectile(
      this.type,
      0,
      0,
      this.damage,
      this.velocityY,
      this.screenWidth,
      this.screenHeight
    );
    
    projectile.setPool(this);
    projectile.setActive(false);
    
    return projectile;
  }
  
  /**
   * Get a projectile from the pool
   */
  public getProjectile(): Projectile {
    let projectile: Projectile;
    
    // Reuse an inactive projectile if available, or create a new one
    if (this.inactiveProjectiles.length > 0) {
      projectile = this.inactiveProjectiles.pop()!;
    } else {
      projectile = this.createProjectile();
    }
    
    this.activeProjectiles.push(projectile);
    return projectile;
  }
  
  /**
   * Return a projectile to the pool
   * @param projectile The projectile to return
   */
  public returnProjectile(projectile: Projectile): void {
    // Find and remove from active projectiles
    const index = this.activeProjectiles.indexOf(projectile);
    if (index !== -1) {
      this.activeProjectiles.splice(index, 1);
    }
    
    // Add to inactive projectiles
    if (!this.inactiveProjectiles.includes(projectile)) {
      this.inactiveProjectiles.push(projectile);
    }
  }
  
  /**
   * Update all active projectiles
   * @param deltaTime Time since last update
   */
  public update(deltaTime: number): void {
    // Update all active projectiles
    for (let i = this.activeProjectiles.length - 1; i >= 0; i--) {
      this.activeProjectiles[i].update(deltaTime);
    }
  }
  
  /**
   * Get all active projectiles
   */
  public getActiveProjectiles(): Projectile[] {
    return this.activeProjectiles;
  }
  
  /**
   * Deactivate all active projectiles
   */
  public deactivateAll(): void {
    // Create a copy of the array to avoid modification during iteration
    const projectilesToDeactivate = [...this.activeProjectiles];
    
    // Deactivate each projectile (which will trigger returnToPool)
    for (const projectile of projectilesToDeactivate) {
      projectile.deactivate();
    }
    
    // Clear the active projectiles array (should be empty after deactivation)
    this.activeProjectiles = [];
  }
} 