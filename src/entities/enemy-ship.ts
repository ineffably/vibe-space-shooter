import { Sprite, Texture } from 'pixi.js';
import { Entity } from './entity';
import { StateMachine } from '../states/state-machine';
import type { State } from '../states/state-machine';
import { AssetLoader } from '../library/asset-loader';
import { Projectile, ProjectileType } from './projectile';
import { ExplosionManager, ExplosionType } from '../library/explosion-manager';
import { SoundManager, SoundType } from '../library/sound-manager';

/**
 * Enum for enemy types
 */
export enum EnemyType {
  TYPE_1 = 'enemyRed1',
  TYPE_2 = 'enemyRed2',
  TYPE_3 = 'enemyRed3',
}

/**
 * Enum for enemy states
 */
enum EnemyState {
  IDLE = 'idle',
  MOVING = 'moving',
  SHOOTING = 'shooting',
  DAMAGED = 'damaged',
  DESTROYED = 'destroyed',
}

/**
 * Enemy idle state
 */
class EnemyIdleState implements State {
  public readonly name = EnemyState.IDLE;
  
  public enter(owner: StateMachine): void {
    // Nothing to do
  }
  
  public update(owner: StateMachine, deltaTime: number): void {
    // Transition to moving after a short delay
    setTimeout(() => {
      owner.setState(EnemyState.MOVING);
    }, 500);
  }
  
  public exit(owner: StateMachine): void {
    // Nothing to do
  }
}

/**
 * Enemy moving state
 */
class EnemyMovingState implements State {
  public readonly name = EnemyState.MOVING;
  
  public enter(owner: StateMachine): void {
    // Nothing to do
  }
  
  public update(owner: StateMachine, deltaTime: number): void {
    const enemy = owner.getOwner() as EnemyShip;
    enemy.move(deltaTime);
  }
  
  public exit(owner: StateMachine): void {
    // Nothing to do
  }
}

/**
 * Enemy shooting state
 */
class EnemyShootingState implements State {
  public readonly name = EnemyState.SHOOTING;
  private shootingTimer = 0;
  private readonly shootingTime = 0.3; // Time for shooting animation
  
  public enter(owner: StateMachine): void {
    this.shootingTimer = 0;
  }
  
  public update(owner: StateMachine, deltaTime: number): void {
    this.shootingTimer += deltaTime;
    
    // After shooting animation time, transition back to moving
    if (this.shootingTimer >= this.shootingTime) {
      owner.setState(EnemyState.MOVING);
    }
  }
  
  public exit(owner: StateMachine): void {
    // Nothing to do
  }
}

/**
 * Enemy damaged state
 */
class EnemyDamagedState implements State {
  public readonly name = EnemyState.DAMAGED;
  private damagedTimer = 0;
  private readonly damagedTime = 0.2; // Time for damaged animation
  
  public enter(owner: StateMachine): void {
    this.damagedTimer = 0;
    
    // Flash or indicate damage
    const enemy = owner.getOwner() as EnemyShip;
    enemy.setDamagedVisual(true);
  }
  
  public update(owner: StateMachine, deltaTime: number): void {
    this.damagedTimer += deltaTime;
    
    // After damaged animation time, transition back to moving
    if (this.damagedTimer >= this.damagedTime) {
      const enemy = owner.getOwner() as EnemyShip;
      if (enemy.isDestroyed()) {
        owner.setState(EnemyState.DESTROYED);
      } else {
        owner.setState(EnemyState.MOVING);
        enemy.setDamagedVisual(false);
      }
    }
  }
  
  public exit(owner: StateMachine): void {
    // Nothing to do
  }
}

/**
 * Enemy destroyed state
 */
class EnemyDestroyedState implements State {
  public readonly name = EnemyState.DESTROYED;
  private destroyedTimer = 0;
  private readonly destroyedTime = 0.5; // Time for destroyed animation
  
  public enter(owner: StateMachine): void {
    this.destroyedTimer = 0;
    
    // Get the enemy
    const enemy = owner.getOwner() as EnemyShip;
    
    // Play explosion animation
    ExplosionManager.getInstance().createExplosion(
      ExplosionType.SONIC,
      enemy.getX(),
      enemy.getY(),
      enemy.getContainer().parent || enemy.getContainer()
    );
    
    // Hide the enemy sprite
    enemy.setActive(false);
    
    // Log for debugging
    console.log(`Enemy ${enemy.getType()} destroyed with explosion animation!`);
  }
  
  public update(owner: StateMachine, deltaTime: number): void {
    this.destroyedTimer += deltaTime;
    
    // After destroyed animation time, enemy stays destroyed
    if (this.destroyedTimer >= this.destroyedTime) {
      // Nothing to do, enemy is already inactive
    }
  }
  
  public exit(owner: StateMachine): void {
    // Nothing to do
  }
}

/**
 * Enemy ship class
 */
export class EnemyShip extends Entity {
  /**
   * Type of enemy
   */
  private type: EnemyType;
  
  /**
   * Health points
   */
  private health: number = 100;
  
  /**
   * Movement speed
   */
  private speed: number = 2;
  
  /**
   * Horizontal movement direction (1 = right, -1 = left)
   */
  private horizontalDirection: number = 0;
  
  /**
   * Vertical movement speed
   */
  private verticalSpeed: number = 1;
  
  /**
   * Shooting cooldown in milliseconds
   */
  private shootCooldown: number = 2000;
  
  /**
   * Time since last shot in milliseconds
   */
  private timeSinceLastShot: number = 0;
  
  /**
   * Screen dimensions
   */
  private screenWidth: number = 800;
  private screenHeight: number = 600;
  
  /**
   * Active projectiles fired by this enemy
   */
  private activeProjectiles: Projectile[] = [];
  
  /**
   * Movement phase for horizontal movement
   */
  private movementPhase: number = 0;
  
  /**
   * Movement amplitude for horizontal movement
   */
  private movementAmplitude: number = 50;
  
  /**
   * Movement frequency for horizontal movement
   */
  private movementFrequency: number = 0.8;
  
  /**
   * Initial spawn X position for centered movement
   */
  private spawnX: number = 0;
  
  /**
   * Constructor
   * @param x Initial x position
   * @param y Initial y position
   * @param type Enemy type
   * @param screenWidth Screen width
   * @param screenHeight Screen height
   */
  constructor(x: number, y: number, type: EnemyType, screenWidth: number, screenHeight: number) {
    super(x, y);
    
    this.type = type;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.spawnX = x; // Store initial x position
    
    // Initialize movement properties with more moderate values
    this.movementPhase = Math.random() * Math.PI * 2; // Random starting phase
    this.movementAmplitude = 20 + Math.random() * 30; // Reduced range: 20-50 pixels (was 30-80)
    this.movementFrequency = 0.3 + Math.random() * 0.5; // Reduced range: 0.3-0.8 (was 0.5-1.5)
    
    // Set minimum shoot cooldown to 0.5 seconds (500ms) as per the spec
    // Add some randomness so enemies don't all shoot at the same time
    this.shootCooldown = 500 + Math.random() * 1500; // Between 0.5 and 2 seconds
    
    // Create the sprite
    const texture = AssetLoader.getInstance().getTexture(this.type);
    
    if (texture) {
      this.setSprite(texture);
      
      if (this.sprite) {
        this.sprite.anchor.set(0.5);
        
        // Scale down the sprite to a more appropriate size
        this.sprite.scale.set(0.6);
        
        // Debug console log to see if enemy is created
        console.log(`Enemy ship created: ${this.type} at (${x}, ${y}) with texture dimensions: ${this.sprite.width}x${this.sprite.height}`);
        
        // List available textures for debugging
        console.log('Available textures:', AssetLoader.getInstance().listTextures());
      } else {
        console.error(`Failed to create sprite for enemy type: ${this.type}`);
      }
    } else {
      console.error(`Failed to load texture for enemy type: ${this.type}`);
      console.log('Available textures:', AssetLoader.getInstance().listTextures());
    }
    
    // Set a random horizontal direction
    this.horizontalDirection = Math.random() > 0.5 ? 1 : -1;
  }
  
  /**
   * Initialize the enemy's states
   */
  protected initializeStates(): void {
    // Add states to the state machine
    this.stateMachine.addState(new EnemyIdleState());
    this.stateMachine.addState(new EnemyMovingState());
    this.stateMachine.addState(new EnemyShootingState());
    this.stateMachine.addState(new EnemyDamagedState());
    this.stateMachine.addState(new EnemyDestroyedState());
    
    // Set the initial state
    this.stateMachine.setState(EnemyState.MOVING);
  }
  
  /**
   * Update method called each frame
   * @param deltaTime Time since last update
   */
  public update(deltaTime: number): void {
    super.update(deltaTime);
    
    // Update shooting cooldown
    this.timeSinceLastShot += deltaTime * 16.67; // Convert to milliseconds
    
    // Try to shoot if cooldown is over
    if (this.active && this.timeSinceLastShot >= this.shootCooldown) {
      this.shoot();
      this.timeSinceLastShot = 0;
    }
    
    // Update projectiles
    for (let i = this.activeProjectiles.length - 1; i >= 0; i--) {
      const projectile = this.activeProjectiles[i];
      projectile.update(deltaTime);
      
      // Remove inactive projectiles from our tracking array
      if (!projectile.isActive()) {
        this.activeProjectiles.splice(i, 1);
      }
    }
    
    // Check if enemy is out of screen
    if (this.active && this.y > this.screenHeight + 50) {
      this.setActive(false);
    }
  }
  
  /**
   * Move the enemy
   * @param deltaTime Time since last update
   */
  public move(deltaTime: number): void {
    // Move down
    this.y += this.verticalSpeed * deltaTime;
    
    // Horizontal movement with easing
    // Instead of changing direction randomly, use a sine wave pattern
    // This creates a smooth side-to-side motion
    
    // Update movement phase
    this.movementPhase += this.movementFrequency * deltaTime * 0.1;
    
    // Calculate new x position using sine wave
    const centerX = this.spawnX;
    const offsetX = Math.sin(this.movementPhase) * this.movementAmplitude;
    const targetX = centerX + offsetX;
    
    // Calculate the horizontal movement delta
    const deltaX = targetX - this.x;
    
    // Cap the horizontal movement speed to a maximum value
    const maxHorizontalSpeed = 1.0 * deltaTime;
    const cappedDeltaX = Math.sign(deltaX) * Math.min(Math.abs(deltaX), maxHorizontalSpeed);
    
    // Apply the capped movement
    this.x += cappedDeltaX;
    
    // Keep within screen bounds
    if (this.x < 30) {
      this.x = 30;
      // Reverse direction by adjusting phase
      this.movementPhase = Math.PI - this.movementPhase;
    } else if (this.x > this.screenWidth - 30) {
      this.x = this.screenWidth - 30;
      // Reverse direction by adjusting phase
      this.movementPhase = Math.PI - this.movementPhase;
    }
    
    // Update container position
    this.container.position.set(this.x, this.y);
  }
  
  /**
   * Shoot a projectile
   */
  public shoot(): void {
    // Skip shooting if not active
    if (!this.active || !this.sprite) return;

    // Check if we already have the maximum number of active shots (3 per spec)
    if (this.activeProjectiles.length >= 3) {
      console.log(`Enemy ${this.type} already has maximum (3) active shots. Skipping.`);
      return;
    }

    // Calculate projectile spawn position (bottom-center of the ship)
    const projectileX = this.x;
    const projectileY = this.y + (this.sprite.height / 2);
    
    // Create a new projectile
    const projectile = new Projectile(
      ProjectileType.ENEMY,
      projectileX,
      projectileY,
      25, // damage
      5,  // velocityY (positive means down)
      this.screenWidth,
      this.screenHeight
    );
    
    // Fire the projectile
    projectile.fire(projectileX, projectileY);
    
    // Add the projectile to our tracking array
    this.activeProjectiles.push(projectile);
    
    // Add projectile to the scene
    if (this.container.parent) {
      this.container.parent.addChild(projectile.getContainer());
    } else {
      this.container.addChild(projectile.getContainer());
    }
    
    // Only play sound if enemy is close to or within the visible screen area
    // This prevents sounds from off-screen enemies that are far away
    if (this.y > -100) {
      // Play enemy laser sound effect
      SoundManager.getInstance().play(SoundType.ENEMY_SHOOT);
    }
    
    // Debug log
    console.log(`Enemy ${this.type} firing projectile at (${projectileX}, ${projectileY}). Active shots: ${this.activeProjectiles.length}`);
    
    // Switch to shooting state
    this.stateMachine.setState(EnemyState.SHOOTING);
  }
  
  /**
   * Take damage
   * @param amount Damage amount
   */
  public takeDamage(amount: number): void {
    if (this.health <= 0) return;
    
    this.health -= amount;
    
    // Switch to damaged state
    this.stateMachine.setState(EnemyState.DAMAGED);
    
    // Check if destroyed
    if (this.health <= 0) {
      this.stateMachine.setState(EnemyState.DESTROYED);
    }
  }
  
  /**
   * Check if the enemy is destroyed
   */
  public isDestroyed(): boolean {
    return this.health <= 0;
  }
  
  /**
   * Set enemy active state
   */
  public setActive(active: boolean): void {
    super.setActive(active);
    
    // Reset health if reactivating
    if (active) {
      this.health = 100;
      this.stateMachine.setState(EnemyState.MOVING);
    }
  }
  
  /**
   * Get the enemy type
   */
  public getType(): EnemyType {
    return this.type;
  }
  
  /**
   * Set the enemy speed
   */
  public setSpeed(speed: number): void {
    this.speed = speed;
  }
  
  /**
   * Set the vertical speed
   */
  public setVerticalSpeed(speed: number): void {
    this.verticalSpeed = speed;
  }
  
  /**
   * Set the shoot cooldown
   */
  public setShootCooldown(cooldown: number): void {
    this.shootCooldown = cooldown;
  }
  
  /**
   * Set screen dimensions
   * @param width Screen width
   * @param height Screen height
   */
  public setScreenDimensions(width: number, height: number): void {
    this.screenWidth = width;
    this.screenHeight = height;
  }
  
  /**
   * Set the damaged visual state
   * @param damaged Whether to show damage
   */
  public setDamagedVisual(damaged: boolean): void {
    if (this.sprite) {
      this.sprite.tint = damaged ? 0xFF8888 : 0xFFFFFF;
    }
  }
  
  /**
   * Get active projectiles fired by this enemy
   */
  public getActiveProjectiles(): Projectile[] {
    return this.activeProjectiles;
  }
  
  /**
   * Clean up on destroy
   */
  public destroy(): void {
    // Remove all projectiles
    for (const projectile of this.activeProjectiles) {
      projectile.destroy();
    }
    this.activeProjectiles = [];
    
    // Call parent destroy
    super.destroy();
  }
} 