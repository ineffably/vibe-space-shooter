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