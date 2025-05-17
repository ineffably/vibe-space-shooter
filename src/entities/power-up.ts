import { Entity } from './entity';
import { StateMachine } from '../states/state-machine';
import type { State } from '../states/state-machine';
import { AssetLoader } from '../library/asset-loader';
import { SoundManager, SoundType } from '../library/sound-manager';

/**
 * Types of power-ups available in the game
 */
export enum PowerUpType {
  SHIELD = 'shield',
  // Future power-ups can be added here
}

/**
 * Power-up states
 */
enum PowerUpState {
  ACTIVE = 'active',
  COLLECTED = 'collected',
  INACTIVE = 'inactive',
}

/**
 * Active state for power-ups - falling down the screen
 */
class PowerUpActiveState implements State {
  public readonly name = PowerUpState.ACTIVE;
  
  public enter(_owner: StateMachine): void {
    // Nothing to do on enter
  }
  
  public update(owner: StateMachine, deltaTime: number): void {
    const powerUp = owner.getOwner() as PowerUp;
    
    // Move down the screen
    powerUp.move(deltaTime);
    
    // Check if off-screen
    if (powerUp.getY() > powerUp.getScreenHeight() + 50) {
      powerUp.setActive(false);
    }
  }
  
  public exit(_owner: StateMachine): void {
    // Nothing to do on exit
  }
}

/**
 * Collected state for power-ups
 */
class PowerUpCollectedState implements State {
  public readonly name = PowerUpState.COLLECTED;
  private collectionTimer = 0;
  private readonly collectionTime = 30; // 0.5 seconds at 60fps
  
  public enter(_owner: StateMachine): void {
    this.collectionTimer = 0;
    
    // Play collection sound - we'll use UI select for now
    SoundManager.getInstance().play(SoundType.UI_SELECT);
  }
  
  public update(owner: StateMachine, deltaTime: number): void {
    this.collectionTimer += deltaTime;
    
    // After collection animation time, set to inactive
    if (this.collectionTimer >= this.collectionTime) {
      const powerUp = owner.getOwner() as PowerUp;
      powerUp.setActive(false);
      owner.setState(PowerUpState.INACTIVE);
    }
  }
  
  public exit(_owner: StateMachine): void {
    // Nothing to do on exit
  }
}

/**
 * Inactive state for power-ups
 */
class PowerUpInactiveState implements State {
  public readonly name = PowerUpState.INACTIVE;
  
  public enter(owner: StateMachine): void {
    const powerUp = owner.getOwner() as PowerUp;
    powerUp.setActive(false);
  }
  
  public update(_owner: StateMachine, _deltaTime: number): void {
    // Nothing to do in inactive state
  }
  
  public exit(_owner: StateMachine): void {
    // Nothing to do on exit
  }
}

/**
 * Power-up entity class
 */
export class PowerUp extends Entity {
  private type: PowerUpType;
  private speed: number;
  private screenHeight: number;
  
  /**
   * Constructor
   * @param x Initial x position
   * @param y Initial y position
   * @param type Type of power-up
   * @param fallSpeed Speed at which power-up falls
   * @param screenHeight Screen height for boundary checking
   */
  constructor(
    x: number, 
    y: number, 
    type: PowerUpType,
    fallSpeed: number,
    screenHeight: number
  ) {
    super(x, y);
    
    this.type = type;
    this.speed = fallSpeed;
    this.screenHeight = screenHeight;
    
    // Set the appropriate texture based on the power-up type
    switch (type) {
      case PowerUpType.SHIELD:
        this.setSprite(AssetLoader.getInstance().getTexture('powerupBlue_shield'));
        break;
      default:
        // Default texture if type is not recognized
        this.setSprite(AssetLoader.getInstance().getTexture('powerupBlue_shield'));
        break;
    }
    
    // Scale the power-up for better visibility
    if (this.sprite) {
      this.sprite.scale.set(0.6);
    }
    
    // Set initial state to active
    this.stateMachine.setState(PowerUpState.ACTIVE);
  }
  
  /**
   * Initialize states for the state machine
   */
  protected initializeStates(): void {
    this.stateMachine.addState(new PowerUpActiveState());
    this.stateMachine.addState(new PowerUpCollectedState());
    this.stateMachine.addState(new PowerUpInactiveState());
  }
  
  /**
   * Move the power-up down the screen
   * @param deltaTime Time since last update
   */
  public move(deltaTime: number): void {
    const dy = this.speed * deltaTime;
    this.y += dy;
    this.container.position.y = this.y;
  }
  
  /**
   * Called when the power-up is collected by the player
   */
  public onCollected(): void {
    this.stateMachine.setState(PowerUpState.COLLECTED);
    
    console.log(`Power-up of type ${this.type} collected!`);
  }
  
  /**
   * Get the type of power-up
   */
  public getType(): PowerUpType {
    return this.type;
  }
  
  /**
   * Get the screen height
   */
  public getScreenHeight(): number {
    return this.screenHeight;
  }
  
  /**
   * Set the movement speed
   * @param speed New movement speed
   */
  public setSpeed(speed: number): void {
    this.speed = speed;
  }
} 