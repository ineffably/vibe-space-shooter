import { Entity } from './entity';
import { StateMachine } from '../states/state-machine';
import type { State } from '../states/state-machine';
import { InputManager } from '../core/input-manager';
import { Projectile, ProjectilePool, ProjectileType } from './projectile';
import { AssetLoader } from '../library/asset-loader';
import { ExplosionManager, ExplosionType } from '../library/explosion-manager';
import { SoundManager, SoundType } from '../library/sound-manager';
import { Container, Sprite, Texture } from 'pixi.js';

/**
 * Player states
 */
enum PlayerState {
  IDLE = 'idle',
  MOVING = 'moving',
  SHOOTING = 'shooting',
  DAMAGED = 'damaged',
  DESTROYED = 'destroyed',
  INVULNERABLE = 'invulnerable',
}

/**
 * Player idle state
 */
class PlayerIdleState implements State {
  public readonly name = PlayerState.IDLE;

  public enter(_owner: StateMachine): void {
  }

  public update(owner: StateMachine, _deltaTime: number): void {
    const player = owner.getOwner() as PlayerShip;
    const inputManager = InputManager.getInstance();

    // Transition to moving state if movement keys are pressed
    if (
      inputManager.isArrowUpPressed() ||
      inputManager.isArrowDownPressed() ||
      inputManager.isArrowLeftPressed() ||
      inputManager.isArrowRightPressed()
    ) {
      owner.setState(PlayerState.MOVING);
      return;
    }

    // Transition to shooting state if space is pressed
    if (inputManager.isSpacePressed()) {
      owner.setState(PlayerState.SHOOTING);
      return;
    }
  }

  public exit(_owner: StateMachine): void {
  }
}

/**
 * Player moving state
 */
class PlayerMovingState implements State {
  public readonly name = PlayerState.MOVING;

  public enter(_owner: StateMachine): void {
  }

  public update(owner: StateMachine, deltaTime: number): void {
    const player = owner.getOwner() as PlayerShip;
    const inputManager = InputManager.getInstance();

    // Calculate movement direction
    let dx = 0;
    let dy = 0;

    if (inputManager.isArrowUpPressed()) {
      dy -= player.speed * deltaTime;
    }
    if (inputManager.isArrowDownPressed()) {
      dy += player.speed * deltaTime;
    }
    if (inputManager.isArrowLeftPressed()) {
      dx -= player.speed * deltaTime;
    }
    if (inputManager.isArrowRightPressed()) {
      dx += player.speed * deltaTime;
    }

    // Move the player
    if (dx !== 0 || dy !== 0) {
      player.move(dx, dy);
    } else {
      // Transition back to idle state if no movement keys are pressed
      owner.setState(PlayerState.IDLE);
      return;
    }

    // Transition to shooting state if space is pressed
    if (inputManager.isSpacePressed()) {
      owner.setState(PlayerState.SHOOTING);
      return;
    }
  }

  public exit(_owner: StateMachine): void {
  }
}

/**
 * Player shooting state
 */
class PlayerShootingState implements State {
  public readonly name = PlayerState.SHOOTING;
  private shootTimer = 0;

  public enter(owner: StateMachine): void {
    const player = owner.getOwner() as PlayerShip;
    player.shoot();
    this.shootTimer = 0;
  }

  public update(owner: StateMachine, deltaTime: number): void {
    const player = owner.getOwner() as PlayerShip;
    const inputManager = InputManager.getInstance();

    // Update shoot timer
    this.shootTimer += deltaTime;

    // Calculate movement direction
    let dx = 0;
    let dy = 0;

    if (inputManager.isArrowUpPressed()) {
      dy -= player.speed * deltaTime;
    }
    if (inputManager.isArrowDownPressed()) {
      dy += player.speed * deltaTime;
    }
    if (inputManager.isArrowLeftPressed()) {
      dx -= player.speed * deltaTime;
    }
    if (inputManager.isArrowRightPressed()) {
      dx += player.speed * deltaTime;
    }

    // Move the player
    if (dx !== 0 || dy !== 0) {
      player.move(dx, dy);
    }

    // If space is still pressed and enough time has passed, shoot again
    if (inputManager.isSpacePressed() && this.shootTimer >= player.shootCooldown) {
      player.shoot();
      this.shootTimer = 0;
    } else if (!inputManager.isSpacePressed()) {
      // Transition to moving state if movement keys are pressed, otherwise idle
      if (dx !== 0 || dy !== 0) {
        owner.setState(PlayerState.MOVING);
      } else {
        owner.setState(PlayerState.IDLE);
      }
    }
  }

  public exit(_owner: StateMachine): void {
    // Nothing to do
  }
}

/**
 * Player damaged state
 */
class PlayerDamagedState implements State {
  public readonly name = PlayerState.DAMAGED;
  private damageTimer = 0;
  private readonly damageTime = 30; // 0.5 seconds at 60fps (500ms)

  public enter(owner: StateMachine): void {
    const player = owner.getOwner() as PlayerShip;
    // Visual indication of damage (e.g., flashing)
    player.setDamageVisual(true);
    this.damageTimer = 0;
  }

  public update(owner: StateMachine, deltaTime: number): void {
    this.damageTimer += deltaTime;

    // Return to idle state after damage time
    if (this.damageTimer >= this.damageTime) {
      owner.setState(PlayerState.IDLE);
    }
  }

  public exit(_owner: StateMachine): void {
    const player = _owner.getOwner() as PlayerShip;
    // Reset visual indication
    player.setDamageVisual(false);
  }
}

/**
 * Player destroyed state
 */
class PlayerDestroyedState implements State {
  public readonly name = PlayerState.DESTROYED;
  private destroyTimer = 0;
  private destroyTime: number = 120; // 2 seconds at 60fps (2000ms)
  
  // For reference: 60 frames ≈ 1 second at 60fps
  // These values are in frames, not actual seconds (assuming deltaTime ≈ 1 at 60fps)
  private readonly minDestroyTime = 120; // 2 seconds (2000ms)
  private readonly maxDestroyTime = 120; // 2 seconds (2000ms)
  private logFrequency = 0.5;
  private lastLogTime = 0;

  public enter(owner: StateMachine): void {
    const player = owner.getOwner() as PlayerShip;
    
    // We're now using a fixed respawn time of 2 seconds (120 frames at 60fps)
    this.destroyTime = this.minDestroyTime;
    
    // Reset timers
    this.destroyTimer = 0;
    this.lastLogTime = 0;
    
    // Play explosion animation
    ExplosionManager.getInstance().createExplosion(
      ExplosionType.SONIC,
      player.getX(),
      player.getY(),
      player.getContainer().parent || player.getContainer(),
      1.5 // Scale up the explosion a bit
    );
    
    // Hide the player sprite but don't destroy the entity
    // We just make it invisible and inactive
    player.setActive(false);
    player.setVisibility(false);
    
    // Play explosion sound
    SoundManager.getInstance().play(SoundType.EXPLOSION_LARGE);
  }

  public update(owner: StateMachine, deltaTime: number): void {
    // deltaTime is typically "1" per frame at 60fps in Pixi.js ticker
    this.destroyTimer += deltaTime;

    // Trigger respawn after delay (120 frames ≈ 2 seconds at 60fps)
    if (this.destroyTimer >= this.destroyTime) {
      const player = owner.getOwner() as PlayerShip;
      player.onRespawn();
    }
  }

  public exit(_owner: StateMachine): void {
    const player = _owner.getOwner() as PlayerShip;
    player.setActive(true);
    player.setVisibility(true);
  }
}

/**
 * Player invulnerable state (after respawning)
 */
class PlayerInvulnerableState implements State {
  public readonly name = PlayerState.INVULNERABLE;
  private invulnerableTimer = 0;
  private readonly invulnerableDuration = 180; // 3 seconds at 60fps (3000ms)
  private flashTimer = 0;
  private readonly flashInterval = 6; // Flash every 6 frames (~100ms at 60fps)
  private isVisible = true;

  public enter(owner: StateMachine): void {
    const player = owner.getOwner() as PlayerShip;
    this.invulnerableTimer = 0;
    this.flashTimer = 0;
    this.isVisible = true;
    
    // Ensure player is active and visible at the start
    player.setActive(true);
    player.setVisibility(true);
  }

  public update(owner: StateMachine, deltaTime: number): void {
    const player = owner.getOwner() as PlayerShip;
    const inputManager = InputManager.getInstance();
    
    // Update invulnerability timer
    this.invulnerableTimer += deltaTime;

    // Update flash timer and toggle visibility for flashing effect
    this.flashTimer += deltaTime;
    if (this.flashTimer >= this.flashInterval) {
      this.isVisible = !this.isVisible;
      player.setVisibility(this.isVisible);
      this.flashTimer = 0;
    }

    // Handle player movement during invulnerability
    let dx = 0;
    let dy = 0;

    if (inputManager.isArrowUpPressed()) {
      dy -= player.speed * deltaTime;
    }
    if (inputManager.isArrowDownPressed()) {
      dy += player.speed * deltaTime;
    }
    if (inputManager.isArrowLeftPressed()) {
      dx -= player.speed * deltaTime;
    }
    if (inputManager.isArrowRightPressed()) {
      dx += player.speed * deltaTime;
    }

    // Move the player
    if (dx !== 0 || dy !== 0) {
      player.move(dx, dy);
    }

    // Handle shooting
    if (inputManager.isSpacePressed()) {
      player.shoot();
    }

    // End invulnerability after duration expires
    if (this.invulnerableTimer >= this.invulnerableDuration) {
      // Transition to appropriate state based on input
      if (inputManager.isSpacePressed()) {
        owner.setState(PlayerState.SHOOTING);
      } else if (dx !== 0 || dy !== 0) {
        owner.setState(PlayerState.MOVING);
      } else {
        owner.setState(PlayerState.IDLE);
      }
    }
  }

  public exit(_owner: StateMachine): void {
    const player = _owner.getOwner() as PlayerShip;
    player.setVisibility(true);
  }
}

/**
 * Shield strength levels
 */
enum ShieldStrength {
  FULL = 'shield3', // 100%
  MEDIUM = 'shield2', // 66%
  LOW = 'shield1', // 33%
  NONE = 'none', // 0%
}

/**
 * Player ship entity
 */
export class PlayerShip extends Entity {
  /**
   * Health points
   */
  public health: number = 100;
  
  /**
   * Maximum health points
   */
  public readonly maxHealth: number = 100;
  
  /**
   * Movement speed
   */
  public readonly speed: number = 3.0;
  
  /**
   * Shooting cooldown in frames (amount of time that must pass before player can shoot again)
   */
  public readonly shootCooldown: number = 10;
  
  /**
   * Damage dealt by this ship's projectiles
   */
  public readonly damage: number = 50;
  
  /**
   * Number of lives
   */
  private lives: number = 3;
  
  /**
   * Score
   */
  private score: number = 0;
  
  /**
   * Projectile pool for recycling projectiles
   */
  private projectilePool: ProjectilePool;
  
  /**
   * Screen dimensions
   */
  private screenWidth: number;
  private screenHeight: number;
  
  /**
   * Callback when game is over
   */
  private gameOverCallback: (() => void) | null = null;

  /**
   * Shield health (0-100)
   */
  private shieldHealth: number = 0;

  /**
   * Maximum shield health
   */
  private readonly maxShieldHealth: number = 100;

  /**
   * Shield sprite
   */
  private shieldSprite: Sprite | null = null;

  /**
   * Shield container for positioning
   */
  private shieldContainer: Container;
  
  /**
   * Constructor
   * @param x Initial x position
   * @param y Initial y position
   * @param screenWidth Screen width for boundary checks
   * @param screenHeight Screen height for boundary checks
   */
  constructor(x: number, y: number, screenWidth: number = 800, screenHeight: number = 600) {
    super(x, y);
    
    // Store screen dimensions
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    
    // Create projectile pool
    this.projectilePool = new ProjectilePool(
      10, // Initial pool size
      ProjectileType.PLAYER,
      this.damage,
      -10, // Negative velocity for upward movement
      screenWidth,
      screenHeight
    );
    
    // Set the sprite
    this.setSprite(AssetLoader.getInstance().getTexture('playerShip1_blue'));
    
    // Scale the player ship down a bit
    if (this.sprite) {
      this.sprite.scale.set(0.7);
    }

    // Create shield container
    this.shieldContainer = new Container();
    this.container.addChild(this.shieldContainer);
    
    // Set initial state
    this.stateMachine.setState(PlayerState.IDLE);
  }

  /**
   * Initialize states
   */
  protected initializeStates(): void {
    // Add states to the state machine
    this.stateMachine.addState(new PlayerIdleState());
    this.stateMachine.addState(new PlayerMovingState());
    this.stateMachine.addState(new PlayerShootingState());
    this.stateMachine.addState(new PlayerDamagedState());
    this.stateMachine.addState(new PlayerDestroyedState());
    this.stateMachine.addState(new PlayerInvulnerableState());

    // Set initial state
    this.stateMachine.setState(PlayerState.IDLE);
  }

  /**
   * Update the player
   * @param deltaTime Time since last update
   */
  public update(deltaTime: number): void {
    // Call the base entity update method, which now handles state machine updates
    // regardless of active status
    super.update(deltaTime);
    
    // Only update active components like position constraints and projectiles when active
    if (this.active) {
      // Ensure player stays within screen bounds
      this.constrainToScreen();
  
      // Update projectiles
      this.projectilePool.update(deltaTime);
    }
  }

  /**
   * Move the player
   * @param dx X movement
   * @param dy Y movement
   */
  public move(dx: number, dy: number): void {
    this.setPosition(this.x + dx, this.y + dy);
  }

  /**
   * Set damage visual effect (flashing)
   * @param damaged Whether the player is damaged
   */
  public setDamageVisual(damaged: boolean): void {
    if (this.sprite) {
      this.sprite.alpha = damaged ? 0.5 : 1;
    }
  }

  /**
   * Constrain player to screen bounds
   */
  private constrainToScreen(): void {
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;

    // Constrain x position
    if (this.x < halfWidth) {
      this.x = halfWidth;
    } else if (this.x > this.screenWidth - halfWidth) {
      this.x = this.screenWidth - halfWidth;
    }

    // Constrain y position
    if (this.y < halfHeight) {
      this.y = halfHeight;
    } else if (this.y > this.screenHeight - halfHeight) {
      this.y = this.screenHeight - halfHeight;
    }

    // Update container position
    this.container.position.set(this.x, this.y);
  }

  /**
   * Shoot a projectile
   */
  public shoot(): void {
    // Get a projectile from the pool
    const projectile = this.projectilePool.getProjectile();
    
    // Fire from the top center of the player
    projectile.fire(this.x, this.y - this.height / 2);
    
    // Add projectile container to the scene
    if (this.container.parent && !projectile.getContainer().parent) {
      this.container.parent.addChild(projectile.getContainer());
    }
    
    // Play laser sound effect
    SoundManager.getInstance().play(SoundType.PLAYER_SHOOT);
  }

  /**
   * Get active projectiles
   */
  public getActiveProjectiles(): Projectile[] {
    return this.projectilePool.getActiveProjectiles();
  }

  /**
   * Set sprite visibility
   * @param visible Whether the sprite should be visible
   */
  public setVisibility(visible: boolean): void {
    if (this.sprite) {
      this.sprite.visible = visible;
    }
  }

  /**
   * Check if player is currently invulnerable
   */
  public isInvulnerable(): boolean {
    return this.stateMachine.getCurrentState()?.name === PlayerState.INVULNERABLE;
  }

  /**
   * Take damage
   * @param amount Amount of damage to take
   */
  public takeDamage(amount: number): void {
    // Skip damage if already destroyed or in invulnerable state
    if (this.stateMachine.getCurrentState()?.name === PlayerState.DESTROYED ||
        this.stateMachine.getCurrentState()?.name === PlayerState.INVULNERABLE) {
      return;
    }

    // Play damage sound
    SoundManager.getInstance().play(SoundType.PLAYER_DAMAGE);

    // If we have shields, damage them first
    if (this.shieldHealth > 0) {
      this.shieldHealth -= amount;
      
      // Update shield visual
      this.updateShieldVisual();
      
      console.log(`Player shield took damage! Shield health: ${this.shieldHealth}`);
      
      // If shield depleted, play special effect
      if (this.shieldHealth <= 0) {
        this.shieldHealth = 0;
        this.hideShield();
        // Could add a shield break effect/sound here
      }
      
      // No damage to player if shield absorbed it
      return;
    }
    
    // Reduce health
    this.health -= amount;
    console.log(`Player took damage! Health: ${this.health}`);
    
    // Check if destroyed
    if (this.health <= 0) {
      this.health = 0;
      this.stateMachine.setState(PlayerState.DESTROYED);
    } else {
      this.stateMachine.setState(PlayerState.DAMAGED);
    }
  }

  /**
   * Destroy the player
   */
  public destroy(): void {
    this.lives--;

    // Transition to destroyed state
    this.stateMachine.setState(PlayerState.DESTROYED);

    // If no lives left, trigger game over
    if (this.lives <= 0) {
      this.gameOver();
    }
  }

  /**
   * Handle player respawn
   */
  public onRespawn(): void {
    if (this.lives > 0) {
      // Reset health
      this.health = this.maxHealth;

      // Reset position to bottom center
      this.setPosition(this.screenWidth / 2, this.screenHeight - 120);
      
      // Clear any active projectiles to prevent self-hits
      this.clearProjectiles();
      
      // Force the entity back to active state
      this.setActive(true);
      this.setVisibility(true);
      
      // Force the sprite to be visible and attached to container
      if (this.sprite) {
        this.sprite.visible = true;
        if (!this.sprite.parent) {
          this.container.addChild(this.sprite);
        }
      }
      
      // Ensure container is visible and in the parent
      this.container.visible = true;

      // Transition to invulnerable state instead of idle
      try {
        this.stateMachine.setState(PlayerState.INVULNERABLE);
      } catch (error) {
        // Error handling silent
      }
    }
  }

  /**
   * Handle game over
   */
  private gameOver(): void {
    // Play game over sound
    SoundManager.getInstance().play(SoundType.GAME_OVER);
    
    // Call game over callback if set
    if (this.gameOverCallback) {
      this.gameOverCallback();
    }
  }

  /**
   * Set game over callback
   * @param callback Function to call when game is over
   */
  public setGameOverCallback(callback: () => void): void {
    this.gameOverCallback = callback;
  }

  /**
   * Add score
   * @param points Points to add
   */
  public addScore(points: number): void {
    this.score += points;
  }

  /**
   * Get player score
   */
  public getScore(): number {
    return this.score;
  }

  /**
   * Get lives remaining
   */
  public getLives(): number {
    return this.lives;
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
   * Clear all active projectiles
   */
  public clearProjectiles(): void {
    this.projectilePool.deactivateAll();
  }

  /**
   * Add shield to the player
   */
  public addShield(): void {
    // Reset shield health to full
    this.shieldHealth = this.maxShieldHealth;
    
    // Update shield visual
    this.updateShieldVisual();
    
    console.log(`Player gained a shield! Shield health: ${this.shieldHealth}`);
    
    // Play shield activation sound
    SoundManager.getInstance().play(SoundType.SHIELD_ACTIVATE);
  }

  /**
   * Check if player has an active shield
   */
  public hasShield(): boolean {
    return this.shieldHealth > 0;
  }

  /**
   * Get shield health percentage (0-100)
   */
  public getShieldHealthPercentage(): number {
    return (this.shieldHealth / this.maxShieldHealth) * 100;
  }

  /**
   * Update shield visual based on current shield health
   */
  private updateShieldVisual(): void {
    // Remove old shield sprite if it exists
    if (this.shieldSprite && this.shieldSprite.parent) {
      this.shieldSprite.parent.removeChild(this.shieldSprite);
      this.shieldSprite = null;
    }
    
    // If shield is depleted, don't show anything
    if (this.shieldHealth <= 0) {
      this.hideShield();
      return;
    }
    
    // Determine shield strength level based on percentage
    let strengthLevel: ShieldStrength;
    const percentage = this.getShieldHealthPercentage();
    
    if (percentage >= 66) {
      strengthLevel = ShieldStrength.FULL; // > 66%
    } else if (percentage >= 33) {
      strengthLevel = ShieldStrength.MEDIUM; // 33-66%
    } else {
      strengthLevel = ShieldStrength.LOW; // < 33%
    }
    
    // Create shield sprite with appropriate texture
    const texture = AssetLoader.getInstance().getTexture(strengthLevel);
    this.shieldSprite = new Sprite(texture);
    
    // Center the shield on the player
    this.shieldSprite.anchor.set(0.5);
    
    // Scale the shield appropriately
    this.shieldSprite.scale.set(0.7);
    
    // Add to shield container
    this.shieldContainer.addChild(this.shieldSprite);
    
    console.log(`Updated shield visual to ${strengthLevel} (${percentage.toFixed(1)}%)`);
  }

  /**
   * Hide the shield visual
   */
  private hideShield(): void {
    if (this.shieldSprite && this.shieldSprite.parent) {
      this.shieldSprite.parent.removeChild(this.shieldSprite);
      this.shieldSprite = null;
    }
  }
} 