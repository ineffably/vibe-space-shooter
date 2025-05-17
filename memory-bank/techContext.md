# Technical Context

## Technologies Used

### Core Technologies
- **TypeScript**: Type-safe programming language that compiles to JavaScript
- **Pixi.js v8.9**: 2D rendering engine for creating interactive graphics
- **Vite**: Fast, modern build tool and development server
- **ESLint**: Static code analysis tool for identifying problematic patterns
- **Howler.js**: Audio library that provides cross-browser audio support

### Development Tools
- **Git**: Version control system for tracking changes
- **GitHub Pages**: Hosting platform for the deployed game

## Development Setup

### Project Initialization
```bash
# Project will be initialized using Vite TS CLI
npm create vite@latest . --template typescript
npm install
```

### Dependencies
```bash
# Core dependencies
npm install pixi.js@8.9
npm install howler@2.2.3

# Development dependencies
npm install --save-dev eslint typescript
```

### Project Structure
```
pixi-space-shooter/
├── assets/                # Game assets (sprites, audio, etc.)
│   ├── backgrounds/       # Background images
│   ├── spritesheets/      # Sprite sheets for animations
│   │   ├── sheet.png      # Combined image of all sprites
│   │   └── sheet.xml      # XML definition of frame coordinates
│   │   ├── spritesheet_pixelExplosion.png  # Pixel explosion animation
│   │   ├── spritesheet_pixelExplosion.xml  # Pixel explosion frame data
│   │   ├── spritesheet_sonicExplosion.png  # Sonic explosion animation
│   │   └── spritesheet_sonicExplosion.xml  # Sonic explosion frame data
│   └── audio/             # Sound effects and music
├── sidequest/             # Reusable game framework
│   ├── core/              # Core framework components
│   │   ├── game.ts        # Main game class
│   │   ├── scene.ts       # Base scene class
│   │   ├── scene-manager.ts # Scene management
│   │   └── state-machine.ts # State machine implementation
│   ├── entities/          # Base entity system
│   │   └── entity.ts      # Base entity class
│   ├── managers/          # Manager classes
│   │   ├── asset-manager.ts # Asset loading and management
│   │   └── input-manager.ts # Input handling
│   ├── utils/             # Utility classes
│   │   └── object-pool.ts # Object pooling system
│   ├── index.ts           # Framework exports
│   └── README.md          # Framework documentation
├── src/                   # Game-specific source code
│   ├── core/              # Game core components
│   ├── entities/          # Game entities (player, enemies, projectiles)
│   ├── states/            # Entity state implementations
│   ├── library/           # Game-specific utility functions
│   ├── scenes/            # Game scenes (menu, game, game over)
│   ├── ui/                # User interface components
│   └── main.ts            # Entry point
├── memory-bank/           # Project documentation
├── index.html             # HTML entry point
├── package.json           # Project configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration with path aliases
```

## Technical Constraints

### Browser Compatibility
- Target modern browsers with WebGL support
- No explicit support for legacy browsers required

### Performance Targets
- Maintain 60 FPS throughout gameplay
- Optimize for mobile performance when possible
- Minimize memory usage with object pooling

### Code Quality Standards
- Use ESLint for code quality checks
- Fix linting errors with `eslint --fix`
- Maintain TypeScript's strict mode for type safety
- Use consistent naming conventions (slug-format for files)

## Tool Usage Patterns

### Pixi.js Best Practices
- Use PIXI.Container for grouping related visual elements
- Leverage PIXI.Ticker for the game loop
- Use PIXI.Assets for asset loading
- Understand the coordinate system (0,0 at top-left)
- Be mindful of texture orientation when loading
- Use sprite batching when appropriate
- When working with spritesheets:
  - Load the base spritesheet image as a texture
  - Parse the XML definition to extract frame data
  - Create individual textures with appropriate frame rectangles
  - Store textures in a map for lookup by name
  - Use texture.frame to set the visible portion of a texture
  - Ensure proper positioning by setting sprite anchor points

### Texture Handling in Pixi.js v8.9
- Rectangle for texture frame: `new Rectangle(x, y, width, height)`
- Creating textured sprites from spritesheet frames:
  - Do NOT use: `new Texture(baseTexture, frameRect)` - Not supported in v8.9
  - Instead: Clone the base texture and set its frame property:
    ```typescript
    const texture = baseTextureAsset.clone();
    texture.frame = new Rectangle(x, y, width, height);
    ```
- Store each extracted texture by name in a cache (Map) for reuse
- Access textures by name rather than reconstructing them each time
- Be aware of sprite anchor points when positioning sprites on screen
- For animated explosions, use the dedicated explosion spritesheets

### TypeScript Usage
- Define interfaces for all major components
- Use type guards when necessary
- Leverage generics for reusable components
- Keep type definitions clean and focused

### ESLint Configuration
- Follow standard ESLint rules
- Use autofix for quick corrections
- Maintain consistent code style 

## Key Technical Components

### Entity System

The entity system is built around a base `Entity` class that provides common functionality:

- Position tracking (x, y)
- Container management (PIXI.Container)
- Sprite management
- Active state management
- Update method for game loop integration
- State machine integration

Specialized entities (PlayerShip, EnemyShip, Projectile, PowerUp) extend this base class and implement their own behaviors.

### State Machine

The state machine pattern is used throughout the game to manage entity behaviors:

- Each entity has a state machine
- States encapsulate specific behaviors (idle, moving, shooting, damaged, destroyed, etc.)
- State transitions trigger appropriate actions
- Update method called each frame

This makes complex entity behaviors easier to understand and modify.

### Asset Management

Assets are loaded using the AssetLoader:

- Singleton pattern for global access
- Preloads all assets before game starts
- Handles spritesheets and extracts individual textures
- Proper XML parsing for spritesheet data
- Fixed texture handling for Pixi.js v8.9

### Sound System

Sound effects are managed through the SoundManager:

- Singleton pattern for centralized sound control
- Preloads all sound effects
- Manages playback with volume control
- Handles multiple concurrent sounds

### Projectile System

Projectiles use an object pooling system for performance:

- Pre-created pool of projectile objects
- Reuse inactive projectiles instead of creating new ones
- Reduces garbage collection overhead
- Each projectile has active, exploding, and inactive states

### Explosion System

The ExplosionManager handles creating and playing explosion animations:

- Creates animated sprites from explosion spritesheets
- Handles different explosion types (pixel, sonic)
- Properly positions explosions at entity locations
- Automatically removes explosions after animation completes

### Power-Up System

The power-up system handles dropping and collecting power-ups:

- EnemyShip has 20% chance to drop a shield power-up when destroyed
- PowerUp entity with active, collected, and inactive states
- Falls at the same speed as enemy ships
- Collision detection with player
- Shield system activated when collected

### Shield System

The shield system protects the player from damage:

- PlayerShip has shield health (100 when full)
- Visual representation using shield1, shield2, shield3 textures
- Shield absorbs damage before player health
- Shield health depletes by 1/3 with each hit
- Visual changes to reflect current shield strength

### Background System

The StarBackground creates a scrolling space effect:

- Generates stars with varying properties
- Multiple layers for parallax effect
- Continuous scrolling from top to bottom
- Dynamically creates and positions stars

### Input System

Input is handled by the InputManager:

- Keyboard event handling
- Key state tracking (pressed, released)
- Direction vector calculation
- Singleton pattern for global access

### Scene System

The game is organized into scenes:

- GameScene for main gameplay
- GameOverScene for game over state
- Each scene manages its own entities and updates

## Development Setup

- Node.js environment
- npm install to install dependencies
- npm run dev to start development server
- npm run build to create production build
- npm run lint to run ESLint
- npm run preview to preview production build

## Dependencies

- pixi.js: 8.9.2 - 2D rendering engine
- howler: 2.2.3 - Audio library

## Development Dependencies

- typescript: 5.4.3 - TypeScript compiler
- vite: 5.2.8 - Build tool
- eslint: 9.0.1 - Linting tool
- @typescript-eslint/eslint-plugin: 7.2.0 - TypeScript ESLint plugin
- @typescript-eslint/parser: 7.2.0 - TypeScript ESLint parser 