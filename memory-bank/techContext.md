# Technical Context

## Technologies Used

### Core Technologies
- **TypeScript**: Type-safe programming language that compiles to JavaScript
- **Pixi.js v8.9**: 2D rendering engine for creating interactive graphics
- **Vite**: Fast, modern build tool and development server

### Development Tools
- **ESLint**: Static code analysis tool for identifying problematic patterns
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
├── src/                   # Source code
│   ├── core/              # Core game engine components
│   ├── entities/          # Game entities (player, enemies, projectiles)
│   ├── states/            # State machine implementation
│   ├── library/           # Utility functions and helper classes
│   │   └── asset-loader.ts # Asset loading system with spritesheet parsing
│   ├── scenes/            # Game scenes (menu, game, game over)
│   ├── ui/                # User interface components
│   └── main.ts            # Entry point
├── memory-bank/           # Project documentation
├── index.html             # HTML entry point
├── package.json           # Project configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration
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