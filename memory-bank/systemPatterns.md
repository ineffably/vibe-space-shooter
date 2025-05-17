# System Patterns

## System Architecture

### Game Loop
The game will use Pixi.js's built-in ticker to handle the main game loop, which manages updates to game state and rendering. This provides a consistent frame rate and synchronizes game updates.

### SideQuest Framework
We've created a reusable game framework called SideQuest that has been extracted from the main game code. This framework exists as a sibling to the src directory and provides core functionality for any 2D game:

1. **Core Components**:
   - Game: Main class that initializes the game loop and manages scenes
   - Scene/SceneManager: Classes for organizing game screens and transitions
   - Entity: Base class for all game objects
   - StateMachine: Generic state machine for entity behaviors

2. **Manager Components**:
   - AssetManager: Handles asset loading, caching, and texture management
   - InputManager: Processes keyboard and mouse input

3. **Utility Components**:
   - ObjectPool: System for object recycling to improve performance

The SideQuest framework is designed to be reusable across different projects and provides a solid foundation for building 2D games with Pixi.js.

### Game-Specific Architecture
The game itself uses the SideQuest framework and implements specific game logic for the space shooter:

1. **Game-Specific Components**:
   - Player Ship: Handles player input, movement, shooting, and health
   - Enemy Ships: Manages AI behavior, movement patterns, and shooting
   - Projectiles: Handles projectile movement and collision detection
   - Explosion Manager: Controls explosion animations for different types
   - Star Background: Creates scrolling star effect for depth and motion
   - Sound Manager: Manages audio playback for game events
   - UI Components: Score display, lives counter, and game over screen

### Component Structure
The game will be structured with the following key components:

1. **Game Manager**: Central controller that manages game state, scenes, and core logic
2. **Entity System**: Base classes and interfaces for game entities (ships, projectiles)
3. **State Machine**: Implementation for managing entity behaviors
4. **Collision System**: Handles detection and resolution of collisions between entities
5. **Input Manager**: Processes keyboard input for player controls
6. **UI Manager**: Handles score display, lives, and game messages
7. **Asset Manager**: Loads and manages game assets (sprites, sounds)
   - Includes spritesheet parsing and texture frame extraction
   - Maintains a texture cache for reuse across the application
   - Uses proper Pixi.js v8.9 texture creation approach (new Texture constructor)

## Design Patterns

### State Pattern
- Finite State Machine for entity behaviors
- States will include: Idle, Moving, Attacking, Damaged, Destroyed
- Each state defines entry/exit behaviors and update logic

### Object Pooling
- Reuse objects like projectiles and explosions to improve performance
- Pools pre-allocate objects and recycle them rather than creating/destroying

### Factory Pattern
- Generate enemies with varying attributes and behaviors
- Create projectiles and explosion effects

### Observer Pattern
- Event system for game events (collisions, score changes, game state transitions)
- Components can subscribe to events without tight coupling

### Texture Management
- XML-based spritesheet parsing to extract individual frame textures
- Texture creation using Pixi.js v8.9's Texture constructor with source and frame specification
- Frame-specific texture lookup by name for easy entity sprite assignment
- Entity scale adjustment for better visual proportions

### Movement and Delta Time
- Entity movement tied to frame deltaTime for consistent speed across devices
- Player ship speed calibrated to 3.0 for responsive yet controlled movement
- Movement calculations applied in state machine update methods
- Speed values carefully balanced:
  - Too high (e.g., 300) makes control impossible
  - Too low (e.g., 0.3) makes movement feel sluggish
  - Balanced value (3.0) provides optimal responsiveness

## Component Relationships

```
Game Manager
  ├── Scene Manager
  │     ├── Game Scene
  │     ├── Menu Scene
  │     └── Game Over Scene
  ├── Entity Manager
  │     ├── Player Ship
  │     ├── Enemy Ships
  │     └── Projectiles
  ├── Collision System
  ├── Input Manager
  ├── UI Manager
  └── Asset Manager
        ├── Texture Cache
        └── Spritesheet Parser
```

## Critical Implementation Paths

1. **Core Game Loop**: Initialize Pixi.js application and set up the main game loop
2. **Asset Loading**: Load all game assets before starting gameplay
   - Properly parse spritesheets and extract texture frames
   - Create individual textures using new Texture constructor with source and frame
   - Store textures with appropriate naming for entity access
3. **Player Controls**: Implement responsive ship movement and shooting
   - Calibrate movement speed for optimal game feel (3.0 multiplier)
   - Ensure responsive state transitions between idle, moving, and shooting
   - Implement movement constrained to screen boundaries
4. **Enemy Spawning**: Create enemy spawning system with increasing difficulty
   - Enforce maximum 10 enemies on screen
   - Control shooting frequency (minimum 0.5s between shots)
   - Limit active shots per enemy (maximum 3)
5. **Collision Detection**: Implement accurate collision detection between entities
6. **State Machine**: Create reusable state machine for entity behaviors
7. **UI System**: Display score, lives, and game messages

## Performance Considerations

1. **Sprite Management**: Use sprite batching for better rendering performance
2. **Object Pooling**: Reuse objects to minimize garbage collection
3. **Collision Optimization**: Use spatial partitioning for efficient collision detection
4. **Asset Management**: Proper use of spritesheets to reduce texture switches
5. **Texture Optimization**: Create textures properly using Pixi.js v8.9's approach
6. **Positioning Optimization**: Properly anchor sprites to ensure consistent positioning and collision detection
7. **Entity Scaling**: Adjust sprite scales to maintain appropriate visual proportions
8. **Enemy Limitation**: Restrict active enemies to improve performance and gameplay balance
9. **Movement Optimization**: Carefully calibrated movement speeds to ensure game runs consistently across different devices and frame rates 

## Overall Architecture

The game uses a component-based architecture with a central game loop that updates all active systems and entities. The main systems are:

- **Game Class**: Central controller that manages the game loop and scenes
- **Scene System**: Manages different game states (gameplay, game over)
- **Entity System**: Base class for game objects with common functionality
- **State Machine**: Manages entity behaviors through discrete states
- **Rendering System**: Handles drawing entities to the screen using Pixi.js
- **Input System**: Processes player input and converts to game actions
- **Asset System**: Loads and manages game assets (textures, sounds)
- **Sound System**: Manages audio playback for game events
- **Collision System**: Detects and handles collisions between entities
- **Scoring System**: Tracks player progress and achievements
- **Power-Up System**: Manages power-up drops and effects

## Entity Hierarchy

```
Entity (Base Class)
├── PlayerShip
├── EnemyShip
├── Projectile
└── PowerUp
```

All entities share common functionality:
- Position (x, y)
- Container management
- Sprite handling
- Active state
- Update method
- State machine integration

## State Machine Pattern

The game extensively uses the state machine pattern to manage entity behaviors.

### State Interface

```typescript
interface State {
  readonly name: string;
  enter(owner: StateMachine): void;
  update(owner: StateMachine, deltaTime: number): void;
  exit(owner: StateMachine): void;
}
```

### State Machine Implementation

```typescript
class StateMachine {
  private owner: any;
  private states: Map<string, State> = new Map();
  private currentState: State | null = null;
  
  constructor(owner: any) {
    this.owner = owner;
  }
  
  public addState(state: State): void {
    this.states.set(state.name, state);
  }
  
  public setState(stateName: string): void {
    if (this.currentState?.name === stateName) return;
    
    if (this.currentState) {
      this.currentState.exit(this);
    }
    
    const newState = this.states.get(stateName);
    if (!newState) {
      console.error(`State ${stateName} not found`);
      return;
    }
    
    this.currentState = newState;
    this.currentState.enter(this);
  }
  
  public update(deltaTime: number): void {
    if (this.currentState) {
      this.currentState.update(this, deltaTime);
    }
  }
  
  public getOwner(): any {
    return this.owner;
  }
  
  public getCurrentState(): State | null {
    return this.currentState;
  }
}
```

## Entity States

### Player Ship States

- **Idle**: Default state, waiting for input
- **Moving**: Responding to player movement input
- **Shooting**: Firing a projectile
- **Damaged**: Taking damage, brief visual feedback
- **Destroyed**: Ship explosion and respawn sequence
- **Invulnerable**: Temporary protection after respawning

### Enemy Ship States

- **Idle**: Initial state
- **Moving**: Moving downward with side-to-side motion
- **Shooting**: Firing a projectile
- **Damaged**: Taking damage, visual feedback
- **Destroyed**: Ship explosion and possible power-up drop

### Projectile States

- **Active**: Moving across the screen
- **Exploding**: Playing explosion animation
- **Inactive**: Ready to be reused from pool

### Power-Up States

- **Active**: Falling down the screen, available for collection
- **Collected**: Being collected by the player
- **Inactive**: Ready to be reused or no longer in play

## Game Loop

The game loop follows this sequence:

1. Process input
2. Update game state
   - Update active entities
   - Check for collisions
   - Handle entity state changes
3. Render scene
4. Repeat

## Object Pooling Pattern

Object pooling is used for projectiles to improve performance:

1. Pre-create a pool of objects
2. When an object is needed, get an inactive one from the pool
3. When an object is no longer needed, mark it as inactive
4. Reuse inactive objects instead of creating new ones

This reduces garbage collection overhead and improves performance.

```typescript
class ProjectilePool {
  private pool: Projectile[] = [];
  private poolSize: number;
  private projectileType: ProjectileType;
  private damage: number;
  private velocityY: number;
  private screenWidth: number;
  private screenHeight: number;
  
  constructor(
    poolSize: number,
    projectileType: ProjectileType,
    damage: number,
    velocityY: number,
    screenWidth: number,
    screenHeight: number
  ) {
    this.poolSize = poolSize;
    this.projectileType = projectileType;
    this.damage = damage;
    this.velocityY = velocityY;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    
    // Pre-create projectiles
    this.initializePool();
  }
  
  private initializePool(): void {
    for (let i = 0; i < this.poolSize; i++) {
      this.pool.push(
        new Projectile(
          this.projectileType,
          0,
          0,
          this.damage,
          this.velocityY,
          this.screenWidth,
          this.screenHeight
        )
      );
    }
  }
  
  public getProjectile(): Projectile | null {
    // Find an inactive projectile
    for (const projectile of this.pool) {
      if (!projectile.isActive()) {
        return projectile;
      }
    }
    
    // Expand pool if no inactive projectiles are available
    const newProjectile = new Projectile(
      this.projectileType,
      0,
      0,
      this.damage,
      this.velocityY,
      this.screenWidth,
      this.screenHeight
    );
    this.pool.push(newProjectile);
    
    return newProjectile;
  }
}
```

## Callback Pattern

Callbacks are used to communicate between components without creating tight coupling. For example:

- Enemy ship notifies game scene when destroyed
- Enemy ship notifies game scene when a power-up is dropped
- Projectile notifies owner when hitting a target
- Power-up notifies game scene when collected

Example:
```typescript
// In EnemyShip class
private onDestroyedCallback: (() => void) | null = null;
private onPowerUpDroppedCallback: ((powerUp: PowerUp) => void) | null = null;

public setOnDestroyedCallback(callback: () => void): void {
  this.onDestroyedCallback = callback;
}

public setOnPowerUpDroppedCallback(callback: (powerUp: PowerUp) => void): void {
  this.onPowerUpDroppedCallback = callback;
}

// In the Destroyed state
if (this.onDestroyedCallback) {
  this.onDestroyedCallback();
}

// When dropping a power-up
if (this.onPowerUpDroppedCallback) {
  this.onPowerUpDroppedCallback(powerUp);
}
```

## Singleton Pattern

Singleton pattern is used for manager classes that should have only one instance:

- AssetLoader
- InputManager
- SoundManager
- ExplosionManager

Example:
```typescript
export class AssetLoader {
  private static instance: AssetLoader;
  
  private constructor() {
    // Private constructor to prevent direct instantiation
  }
  
  public static getInstance(): AssetLoader {
    if (!AssetLoader.instance) {
      AssetLoader.instance = new AssetLoader();
    }
    return AssetLoader.instance;
  }
  
  // Rest of the class
}
```

## Component Relationships

### Game Scene and Entities

The GameScene maintains arrays of active entities:
- Player ship
- Enemy ships
- Power-ups

It's responsible for:
- Updating all entities
- Checking collisions
- Spawning new enemies
- Handling power-up collection
- Managing game state

### Player Ship and Projectiles

The PlayerShip manages its own projectiles through a ProjectilePool. When shooting, it:
1. Gets an inactive projectile from the pool
2. Sets its position to the player's position
3. Activates it
4. Adds it to the scene

### Enemy Ships and Projectiles

Similarly, EnemyShips manage their own projectiles. They have a maximum of 3 active projectiles at once, as specified in the requirements.

### Enemy Ships and Power-Ups

When an enemy ship is destroyed, it has a 20% chance to drop a shield power-up. If a power-up is dropped, the enemy ship:
1. Creates a new PowerUp entity at its position
2. Sets the power-up type to SHIELD
3. Calls the onPowerUpDroppedCallback to notify the game scene
4. The game scene adds the power-up to its power-ups array

### Player Ship and Shields

The PlayerShip has a shield system with three visual states:
- Full strength (shield3)
- Medium strength (shield2)
- Low strength (shield1)

When a power-up is collected, the player ship:
1. Activates the shield
2. Sets shield health to 100
3. Updates the shield visual to match the current strength

When damage is taken:
- If the player has a shield, the shield absorbs the damage
- Shield health is reduced by 1/3 of its maximum value
- The shield visual is updated to match the new strength
- If shield health reaches 0, the shield is removed

## Collision Detection

The collision detection system uses simple circle-based collision detection:

```typescript
function checkCollision(entity1: Entity, entity2: Entity, radius1: number, radius2: number): boolean {
  const dx = entity1.getX() - entity2.getX();
  const dy = entity1.getY() - entity2.getY();
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  return distance < radius1 + radius2;
}
```

Different collision radii are used for different entity types:
- Player ship: 30 pixels
- Enemy ships: 30 pixels
- Projectiles: 10 pixels
- Power-ups: 40 pixels (larger for easier collection)

## Power-Up System

The power-up system handles the creation, movement, and collection of power-ups:

1. Enemy ships have a 20% chance to drop a shield power-up when destroyed
2. The power-up falls at the same speed as the enemy ship
3. If the player collides with a power-up, it's collected
4. The power-up activates its effect (adding a shield to the player)
5. The power-up plays a collection animation and sound
6. After collection, the power-up becomes inactive

## Shield System

The shield system protects the player from damage:

1. Player starts with no shield
2. When a shield power-up is collected, shield health is set to full (100)
3. Shield has three visual states based on remaining health:
   - Full (shield3): 100% - 67%
   - Medium (shield2): 66% - 34%
   - Low (shield1): 33% - 1%
4. Each hit reduces shield health by 1/3 of maximum (33.33...)
5. When shield health reaches 0, the shield is removed
6. Visual feedback updates as shield health changes

## Event Flow

The game uses an event-driven flow for many interactions:

1. Player input → Player state changes
2. Collision detection → Damage application
3. Health changes → Visual feedback
4. Enemy destruction → Score update + Possible power-up drop
5. Power-up collection → Shield activation
6. Shield damage → Shield visual update

## Framework and Game Separation

The game is built on a reusable framework called "SideQuest" that provides:

- Game loop management
- Scene management
- Input handling
- Asset loading
- Entity base classes
- State machine implementation
- Sound management

This separation allows the framework to be reused for other games while keeping game-specific code isolated. 