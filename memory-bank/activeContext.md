# Active Context

## Current Work Focus

We have completed the initial project setup and implemented the core game architecture. The development server is running and we have a blank game screen. We are now ready to start implementing the game entities, starting with the player ship.

## Recent Changes

- Initialized the project using Vite TS template
- Set up the project structure with appropriate directories
- Installed Pixi.js v8.9 and configured ESLint
- Implemented core game components:
  - Game class with main loop
  - Scene management system
  - Input handling system
  - Asset loading structure
  - Base entity class with state machine integration
  - Basic game scene

## Next Steps

1. **Player Ship Implementation**
   - Create the player ship entity
   - Implement player movement using arrow keys
   - Add shooting functionality with space key
   - Create player states (idle, moving, shooting)

2. **Enemy Implementation**
   - Create enemy ship entities
   - Implement enemy movement patterns
   - Add enemy shooting behavior
   - Create enemy spawning system

3. **Projectile System**
   - Implement projectile entities
   - Add collision detection
   - Create visual effects for hits

4. **Game UI and Scoring**
   - Add score display
   - Implement lives system
   - Create game over screen

## Active Decisions

- We have implemented manager classes using the singleton pattern for better organization and access
- The entity system uses a component-based approach with a central container for sprites
- The state machine is used to manage entity behaviors as specified in the requirements
- We are using a scene-based approach to manage different game states (play, menu, game over)
- File naming follows slug-format (kebab-case) for consistency
- Utility functions are placed in a "library" folder instead of "utils" for better scoping

## Learnings and Insights

- Pixi.js v8.9 requires explicit typing for the ticker callback, which differs from previous versions
- The component-based architecture provides good separation of concerns
- Using singletons for managers helps with accessing shared resources across the game
- The state machine approach will make it easier to extend entity behaviors later
- TypeScript's type system helps catch errors early in the development process 