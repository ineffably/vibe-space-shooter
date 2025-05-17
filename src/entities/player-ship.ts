import { Texture } from 'pixi.js';
import { Entity } from './entity';
import { StateMachine } from '../states/state-machine';
import type { State } from '../states/state-machine';
import { InputManager } from '../core/input-manager';
import { Projectile, ProjectilePool, ProjectileType } from './projectile';
import { AssetLoader } from '../library/asset-loader';
import { ExplosionManager, ExplosionType } from '../library/explosion-manager';

/**
 * Player states
 */
enum PlayerState {
  IDLE = 'idle',
  MOVING = 'moving',
  SHOOTING = 'shooting',
  DAMAGED = 'damaged',
  DESTROYED = 'destroyed',
}

/**
 * Player idle state
 */
class PlayerIdleState implements State {
  public readonly name = PlayerState.IDLE;

  public enter(owner: StateMachine): void {
    console.log('Entering player idle state');
  }

  public update(owner: StateMachine, deltaTime: number): void {
    const player = owner.getOwner() as PlayerShip;
    const inputManager = InputManager.getInstance();

    // Transition to moving state if movement keys are pressed
    if (
      inputManager.isArrowUpPressed() ||
      inputManager.isArrowDownPressed() ||
      inputManager.isArrowLeftPressed() ||
      inputManager.isArrowRightPressed()
    ) {
      console.log('Movement keys detected in idle state, transitioning to moving state');
      owner.setState(PlayerState.MOVING);
      return;
    }

    // Transition to shooting state if space is pressed
    if (inputManager.isSpacePressed()) {
      console.log('Space key detected in idle state, transitioning to shooting state');
      owner.setState(PlayerState.SHOOTING);
      return;
    }
  }

  public exit(owner: StateMachine): void {
    console.log('Exiting player idle state');
  }
}

/**
 * Player moving state
 */
class PlayerMovingState implements State {
  public readonly name = PlayerState.MOVING;

  public enter(owner: StateMachine): void {
    console.log('Entering player moving state');
  }

  public update(owner: StateMachine, deltaTime: number): void {
    const player = owner.getOwner() as PlayerShip;
    const inputManager = InputManager.getInstance();

    // Calculate movement direction
    let dx = 0;
    let dy = 0;

    if (inputManager.isArrowUpPressed()) {
      dy -= player.speed * deltaTime;
      console.log('Up key pressed, moving up', dy);
    }
    if (inputManager.isArrowDownPressed()) {
      dy += player.speed * deltaTime;
      console.log('Down key pressed, moving down', dy);
    }
    if (inputManager.isArrowLeftPressed()) {
      dx -= player.speed * deltaTime;
      console.log('Left key pressed, moving left', dx);
    }
    if (inputManager.isArrowRightPressed()) {
      dx += player.speed * deltaTime;
      console.log('Right key pressed, moving right', dx);
    }

    // Move the player
    if (dx !== 0 || dy !== 0) {
      console.log(`Moving player by dx=${dx}, dy=${dy}`);
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

  public exit(owner: StateMachine): void {
    console.log('Exiting player moving state');
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

  public exit(owner: StateMachine): void {
    // Nothing to do
  }
}

/**
 * Player damaged state
 */
class PlayerDamagedState implements State {
  public readonly name = PlayerState.DAMAGED;
  private damageTimer = 0;
  private readonly damageTime = 0.5; // Time in damaged state

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

  public exit(owner: StateMachine): void {
    const player = owner.getOwner() as PlayerShip;
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
  private readonly destroyTime = 2; // Time until respawn or game over

  public enter(owner: StateMachine): void {
    const player = owner.getOwner() as PlayerShip;
    
    // Play explosion animation
    ExplosionManager.getInstance().createExplosion(
      ExplosionType.SONIC,
      player.getX(),
      player.getY(),
      player.getContainer().parent || player.getContainer(),
      1.5 // Scale up the explosion a bit
    );
    
    // Hide the player sprite
    player.setActive(false);
    this.destroyTimer = 0;
    
    console.log('Player ship destroyed with sonic explosion animation!');
  }

  public update(owner: StateMachine, deltaTime: number): void {
    this.destroyTimer += deltaTime;

    // Trigger respawn or game over after destroy time
    if (this.destroyTimer >= this.destroyTime) {
      const player = owner.getOwner() as PlayerShip;
      player.onRespawn();
    }
  }

  public exit(owner: StateMachine): void {
    const player = owner.getOwner() as PlayerShip;
    player.setActive(true);
  }
}

/**
 * Player ship entity
 */
export class PlayerShip extends Entity {
  /**
   * Player health points
   */
  public health: number = 100;

  /**
   * Maximum health
   */
  public readonly maxHealth: number = 100;

  /**
   * Player speed
   */
  public readonly speed: number = 3.0;

  /**
   * Shoot cooldown in frames
   */
  public readonly shootCooldown: number = 10;

  /**
   * Damage inflicted by projectiles
   */
  public readonly damage: number = 50;

  /**
   * Lives remaining
   */
  private lives: number = 3;

  /**
   * Score
   */
  private score: number = 0;
  
  /**
   * Projectile pool
   */
  private projectilePool: ProjectilePool;

  /**
   * Screen dimensions
   */
  private screenWidth: number;
  private screenHeight: number;

  /**
   * Game over callback
   */
  private gameOverCallback: (() => void) | null = null;

  /**
   * Constructor
   * @param x Initial x position
   * @param y Initial y position
   * @param screenWidth Screen width
   * @param screenHeight Screen height
   */
  constructor(x: number, y: number, screenWidth: number = 800, screenHeight: number = 600) {
    super(x, y);
    
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;

    // Set the sprite using the correct texture from the spritesheet
    const texture = AssetLoader.getInstance().getTexture('playerShip1_blue');
    console.log('Attempting to get playerShip1_blue texture:', texture);
    console.log('Available textures:', AssetLoader.getInstance().listTextures());
    this.setSprite(texture);
    
    if (this.sprite) {
      // Set anchor to center for proper positioning and rotation
      this.sprite.anchor.set(0.5);
      
      // Scale down the sprite to a more appropriate size
      this.sprite.scale.set(0.7);
      
      // Log for debugging
      console.log(`Player ship created with texture: playerShip1_blue, dimensions: ${this.sprite.width}x${this.sprite.height}`);
    } else {
      console.error('Failed to create player ship sprite with texture: playerShip1_blue');
      console.log('Available textures:', AssetLoader.getInstance().listTextures());
    }
    
    // Create projectile pool
    this.projectilePool = new ProjectilePool(
      10, // Initial pool size
      ProjectileType.PLAYER,
      this.damage,
      -10, // Negative velocity for upward movement
      screenWidth,
      screenHeight
    );
  }

  /**
   * Initialize states
   */
  protected initializeStates(): void {
    console.log('Initializing player ship states');
    
    // Add states to the state machine
    this.stateMachine.addState(new PlayerIdleState());
    this.stateMachine.addState(new PlayerMovingState());
    this.stateMachine.addState(new PlayerShootingState());
    this.stateMachine.addState(new PlayerDamagedState());
    this.stateMachine.addState(new PlayerDestroyedState());

    // Set initial state
    this.stateMachine.setState(PlayerState.IDLE);
    console.log('Player initial state set to IDLE');
  }

  /**
   * Update the player
   * @param deltaTime Time since last update
   */
  public update(deltaTime: number): void {
    super.update(deltaTime);

    // Ensure player stays within screen bounds
    this.constrainToScreen();

    // Update projectiles
    this.projectilePool.update(deltaTime);
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
    
    console.log('Player shoots!');
  }

  /**
   * Get active projectiles
   */
  public getActiveProjectiles(): Projectile[] {
    return this.projectilePool.getActiveProjectiles();
  }

  /**
   * Take damage
   * @param amount Damage amount
   */
  public takeDamage(amount: number): void {
    if (this.health <= 0) return;

    this.health -= amount;
    console.log(`Player takes ${amount} damage. Health: ${this.health}`);

    // If health reaches zero, destroy the player
    if (this.health <= 0) {
      this.destroy();
    } else {
      // Otherwise, transition to damaged state
      this.stateMachine.setState(PlayerState.DAMAGED);
    }
  }

  /**
   * Destroy the player
   */
  public destroy(): void {
    this.lives--;
    console.log(`Player destroyed! Lives remaining: ${this.lives}`);

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

      // Reset position
      this.setPosition(this.screenWidth / 2, this.screenHeight / 2); // Placeholder values

      // Transition to idle state
      this.stateMachine.setState(PlayerState.IDLE);

      console.log('Player respawned');
    }
  }

  /**
   * Handle game over
   */
  private gameOver(): void {
    console.log('Game over!');
    
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
    console.log(`Score: ${this.score}`);
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
} 