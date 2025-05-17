import { Texture } from 'pixi.js';
import { Entity } from './entity';
import { StateMachine } from '../states/state-machine';
import type { State } from '../states/state-machine';
import { InputManager } from '../core/input-manager';

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
    // Nothing to do
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
      owner.setState(PlayerState.MOVING);
      return;
    }

    // Transition to shooting state if space is pressed
    if (inputManager.isSpacePressed()) {
      owner.setState(PlayerState.SHOOTING);
      return;
    }
  }

  public exit(owner: StateMachine): void {
    // Nothing to do
  }
}

/**
 * Player moving state
 */
class PlayerMovingState implements State {
  public readonly name = PlayerState.MOVING;

  public enter(owner: StateMachine): void {
    // Nothing to do
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

  public exit(owner: StateMachine): void {
    // Nothing to do
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
    // Hide the player
    player.setActive(false);
    this.destroyTimer = 0;
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
   * Movement speed
   */
  public readonly speed: number = 5;

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
   * Constructor
   * @param x Initial x position
   * @param y Initial y position
   */
  constructor(x: number, y: number) {
    super(x, y);

    // Set the sprite
    this.setSprite(Texture.WHITE); // Placeholder
    if (this.sprite) {
      this.sprite.width = 40;
      this.sprite.height = 60;
      this.sprite.tint = 0x0000FF; // Blue
    }
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

    // Set initial state
    this.stateMachine.setState(PlayerState.IDLE);
  }

  /**
   * Update the player
   * @param deltaTime Time since last update
   */
  public update(deltaTime: number): void {
    super.update(deltaTime);

    // Ensure player stays within screen bounds
    this.constrainToScreen();
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
    const screenWidth = 800; // Placeholder, should get from game
    const screenHeight = 600; // Placeholder, should get from game
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;

    // Constrain x position
    if (this.x < halfWidth) {
      this.x = halfWidth;
    } else if (this.x > screenWidth - halfWidth) {
      this.x = screenWidth - halfWidth;
    }

    // Constrain y position
    if (this.y < halfHeight) {
      this.y = halfHeight;
    } else if (this.y > screenHeight - halfHeight) {
      this.y = screenHeight - halfHeight;
    }

    // Update container position
    this.container.position.set(this.x, this.y);
  }

  /**
   * Shoot a projectile
   */
  public shoot(): void {
    console.log('Player shoots!');
    // Projectile creation will be implemented later
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
      this.setPosition(400, 500); // Placeholder values

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
    // Game over logic will be implemented later
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
} 