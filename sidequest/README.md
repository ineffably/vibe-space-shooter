# SideQuest: A Lightweight PIXI.js Game Framework

SideQuest is a lightweight, modular framework for building 2D games with PIXI.js. It provides a robust foundation of common game development patterns while remaining flexible and unopinionated.

## Features

- **State Machine**: Powerful state management for entities and game states
- **Scene Management**: Organize your game into scenes with easy transitions
- **Entity System**: Base entity class for game objects with common functionality
- **Input Handling**: Keyboard and mouse input with support for just-pressed/just-released detection
- **Asset Management**: Easy asset loading and access
- **Object Pooling**: Efficient object recycling to reduce garbage collection
- **Responsive Game**: Built-in support for responsive canvases

## Getting Started

### Creating a Game

```typescript
import { Game, Scene } from 'sidequest';

// Define your game configuration
const gameConfig = {
  width: 800,
  height: 600,
  backgroundColor: 0x000000,
  containerId: 'game-container',
  assets: {
    spritesheets: [
      { name: 'player', imageUrl: 'assets/player.png', xmlUrl: 'assets/player.xml' }
    ],
    textures: [
      { name: 'background', url: 'assets/background.png' }
    ],
    sounds: []
  }
};

// Create your game instance
const game = new Game(gameConfig);

// Create a scene
class MainScene extends Scene {
  // Implement your scene logic
  public init(): void {
    // Initialize scene
  }
  
  public update(deltaTime: number): void {
    // Update scene
  }
  
  public resize(width: number, height: number): void {
    // Handle resize
  }
}

// Initialize the game
async function start() {
  await game.init();
  
  // Create and register your scenes
  const mainScene = new MainScene();
  game.registerScene('main', mainScene);
  
  // Switch to the main scene
  game.switchToScene('main');
}

start();
```

### Creating Entities

```typescript
import { Entity, AssetManager } from 'sidequest';

class Player extends Entity<Player> {
  private speed = 5;
  
  protected initializeStates(): void {
    // Set up entity states
  }
  
  public update(deltaTime: number): void {
    super.update(deltaTime);
    
    // Player-specific update logic
  }
  
  public moveLeft(): void {
    this.position.x -= this.speed;
  }
  
  public moveRight(): void {
    this.position.x += this.speed;
  }
}
```

## Core Concepts

### State Machine

The state machine provides a flexible way to manage entity behaviors:

```typescript
// Define states
class IdleState implements State<Player> {
  public readonly name = 'idle';
  
  public enter(owner: StateMachine<Player>): void {
    // State entry logic
  }
  
  public update(owner: StateMachine<Player>, deltaTime: number): void {
    // State update logic
  }
  
  public exit(owner: StateMachine<Player>): void {
    // State exit logic
  }
}

// Use in an entity
class Player extends Entity<Player> {
  protected initializeStates(): void {
    this.stateMachine.addState(new IdleState());
    this.stateMachine.setState('idle');
  }
}
```

### Scene Management

Organize your game into discrete scenes:

```typescript
class GameScene extends Scene {
  private player: Player;
  
  public init(): void {
    this.player = new Player(100, 100);
    this.container.addChild(this.player.getContainer());
  }
  
  public update(deltaTime: number): void {
    this.player.update(deltaTime);
    
    // Other scene logic
  }
}
```

### Object Pooling

Efficiently reuse objects to improve performance:

```typescript
import { ObjectPool, Entity } from 'sidequest';

// Create a pool of projectiles
const projectilePool = new ObjectPool<Projectile>(
  () => new Projectile(), // Factory function
  20,                    // Initial size
  100                    // Maximum size
);

// Get an object from the pool
const projectile = projectilePool.get();

// Return an object to the pool
projectilePool.release(projectile);

// Update all active objects in the pool
projectilePool.update(deltaTime);
```

## Framework Structure

- **core/**: Core framework components (Game, Scene, StateMachine)
- **entities/**: Base entity classes
- **managers/**: Service managers (InputManager, AssetManager)
- **utils/**: Utility classes (ObjectPool)

## License

MIT License 