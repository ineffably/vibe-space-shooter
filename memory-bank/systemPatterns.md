# System Patterns

## System Architecture

### Game Loop
The game will use Pixi.js's built-in ticker to handle the main game loop, which manages updates to game state and rendering. This provides a consistent frame rate and synchronizes game updates.

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
- Texture caching to optimize memory usage and rendering performance
- Frame-specific texture lookup by name for easy entity sprite assignment

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
   - Create individual textures for each frame with correct rectangle bounds
   - Store textures with appropriate naming for entity access
3. **Player Controls**: Implement responsive ship movement and shooting
4. **Enemy Spawning**: Create enemy spawning system with increasing difficulty
5. **Collision Detection**: Implement accurate collision detection between entities
6. **State Machine**: Create reusable state machine for entity behaviors
7. **UI System**: Display score, lives, and game messages

## Performance Considerations

1. **Sprite Management**: Use sprite batching for better rendering performance
2. **Object Pooling**: Reuse objects to minimize garbage collection
3. **Collision Optimization**: Use spatial partitioning for efficient collision detection
4. **Asset Management**: Proper use of spritesheets to reduce texture switches
5. **Texture Optimization**: Extract and cache individual textures from spritesheets to avoid redundant processing
6. **Positioning Optimization**: Properly anchor sprites to ensure consistent positioning and collision detection 