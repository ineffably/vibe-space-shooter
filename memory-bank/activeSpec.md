# Space Shooter - Current Implementation

## Summary

This is a simple top down space shooter where the player ship is on the bottom of the screen pointing up. The game now features a scrolling star background with a parallax effect that creates the illusion of movement through space, with stars of varying sizes, speeds, and brightness moving from top to bottom.

The enemy ships spawn from the top of the screen with staggered vertical positions (between -50 and -800 pixels) for more interesting entry patterns. They start sparse and increase in frequency over time. Each enemy has a different vertical speed (between 0.3 and 2.0) for unpredictable movement patterns.

The player's ship can shoot lasers at the enemy ships as they move down toward the bottom of the screen.
The enemy ships have 100 health points, and the player's lasers deal 50 damage per hit. When enemy ships reach zero health, they explode with a sonic explosion animation.

When enemy ships explode, the player earns 100 points which are added to their score.
The enemy ships can shoot at the player after they enter the screen. Since they always point and travel downward, their lasers shoot down. Enemy ships have a minimum shooting interval of 0.5 seconds and are limited to 3 active shots per enemy.

When a laser hits an enemy ship or player, a pixel explosion animation plays (sonic explosion animations are used for ship destruction).

The player has 100 hit points and when they reach zero, the ship explodes with a sonic explosion animation.
When this happens, the player loses a life and respawns after a 2-second delay.
The score is displayed in the top left along with the number of lives remaining.

The player starts with 3 lives, and when all lives are lost, the game displays "GAME OVER" with the final score and allows the player to restart by pressing the space key.

Sound effects now accompany all key game actions, including laser shooting (both player and enemy), explosions (both small for projectiles and large for ships), player damage, game over, and UI interactions. These sound effects significantly enhance the gaming experience and provide clear feedback to the player.

## Technology

Building and Hosting
- Using Vite TS for project structure and build
- Configured for GitHub Pages with proper index.html at root

Development
- Using Vite for the development environment with TypeScript template
- ESLint configured for code quality

Language
- Using TypeScript as the programming language

Rendering
- Pixi.js v8.9 for rendering game objects
- Custom texture loading implementation for spritesheets using Pixi.js v8.9's Texture constructor
- Proper texture handling with source and frame specification
- Dynamic star rendering using Pixi.js Graphics objects

Audio
- HTML5 Audio API for sound playback
- Custom SoundManager singleton for centralized audio handling
- Volume control and mute functionality
- Clone-based approach for concurrent sound playback

Frameworks
- Pixi.js v8.9
- ESLint with auto-fixing capability

## Architecture

- Implemented finite state machine for entity behaviors:
  - Player ship has Idle, Moving, Shooting, Damaged, and Destroyed states
  - Projectiles have Active, Exploding, and Inactive states
  - Enemy ships have similar state patterns
- Created reusable components:
  - Base Entity class
  - State Machine implementation
  - Projectile Pooling system
  - Explosion Manager
  - Input Manager
  - Asset Loader
  - Sound Manager
  - Star Background system with parallax effect

## Assets

Successfully loaded and implemented assets from:
- /assets/spritesheet/sheet.xml
- /assets/spritesheet/sheet.png
- /assets/spritesheet/spritesheet_pixelExplosion.xml
- /assets/spritesheet/spritesheet_pixelExplosion.png
- /assets/spritesheet/spritesheet_sonicExplosion.xml
- /assets/spritesheet/spritesheet_sonicExplosion.png
- /assets/audio/laser-player.mp3
- /assets/audio/laser-enemy.mp3 
- /assets/audio/explosion-small.mp3
- /assets/audio/explosion-large.mp3
- /assets/audio/damage.mp3
- /assets/audio/game-over.mp3
- /assets/audio/ui-select.mp3

All assets are loaded using a custom PIXI asset loader implementation and sound loading system.
The following textures are used as visible game assets:

| Purpose  | Texture | Status |
| ---- |:----:| :----: |
| Player Ship | playerShip1_blue | Implemented |
| Enemy 1 | enemyRed1 | Implemented |
| Enemy 2 | enemyRed2 | Implemented |
| Enemy 3 | enemyRed3 | Implemented |
| Player Laser | laserBlue01 | Implemented |
| Enemy Lasers | laserRed05 | Implemented |
| Laser explosion | spritesheet_pixelExplosion | Implemented |
| Ship explosion | spritesheet_sonicExplosion | Implemented |
| Background Image | /assets/backgrounds/black.png | Implemented (base layer) |
| Stars | Dynamically generated | Implemented |

The following sound effects are implemented:

| Purpose  | Sound | Status |
| ---- |:----:| :----: |
| Player Shooting | laser-player.mp3 | Implemented |
| Enemy Shooting | laser-enemy.mp3 | Implemented |
| Projectile Explosion | explosion-small.mp3 | Implemented |
| Ship Explosion | explosion-large.mp3 | Implemented |
| Player Damage | damage.mp3 | Implemented |
| Game Over | game-over.mp3 | Implemented |
| UI Interaction | ui-select.mp3 | Implemented |

## Player

- Entity type: Sprite with playerShip1_blue texture
- Movement: Uses arrow keys for movement in all directions at a speed of 3.0 units (balanced for good control feel)
- Scale: 0.7 of original texture size for better visual proportions
- Constrained to screen boundaries
- Score and lives displayed in top left corner
- Score increases by 100 points per enemy destroyed
- Ship explosion uses sonic explosion animation when destroyed
- Explosion animation plays correctly on destruction
- Base damage per laser hit is 50
- Player has 100 health points
- Player has 3 lives
- Player respawns after 2 seconds when destroyed
- Game over when all lives are lost
- Sound effects for shooting, taking damage, and destruction

## Enemy

- Entity type: Sprite with randomized texture (enemyRed1, enemyRed2, or enemyRed3)
- Scale: 0.6 of original texture size for better visual proportions
- Enemies spawn at staggered positions above the screen (-50 to -800 pixels)
- Maximum of 10 active enemies on screen at once (enforced)
- Shooting frequency limited to minimum 0.5 seconds between shots
- Maximum of 3 active shots per enemy (enforced)
- 100 hit points per enemy
- Take damage based on projectile damage property
- Sonic explosion animation plays correctly on destruction
- Various movement speeds (0.3-2.0) for unpredictable patterns
- Minimum spacing between enemies (1.5x their height) for better distribution
- Sound effects for shooting and destruction

## Background

- Multi-layered star system for parallax effect:
  - Foreground stars: Larger (1.5-3.0px), faster (0.3-0.6), brighter (80-100% opacity)
  - Mid-ground stars: Medium size (0.8-2.0px), medium speed (0.15-0.3), medium brightness (60-90% opacity)
  - Background stars: Smaller (0.3-1.0px), slower (0.05-0.15), dimmer (30-70% opacity)
- Star colors: Primarily white with occasional blue or yellow tints
- Seamless scrolling with stars wrapping around when they reach the bottom
- Stars randomly distributed across the screen
- Dynamic rendering using Pixi.js Graphics objects for performance
- Properly responds to screen resizing
- Resets with game restart

## Sound System

- Centralized SoundManager singleton class
- Pre-loading of all sound assets during game initialization
- Concurrent sound playback using cloned audio elements
- Volume control with default level set to 0.7 (70%)
- Mute functionality for potential future options menu
- Different sound types for various game events:
  - Laser shooting sounds (different for player and enemy)
  - Explosion sounds (different for projectiles and ships)
  - Damage sound when player takes a hit
  - Game over sound when player loses all lives
  - UI sounds for restart action
- Integration with game entity actions for context-appropriate audio

## Features Comparison

| Feature | Planned | Implemented | Notes |
| ---- | :----: | :----: | ---- |
| Player Ship | ✓ | ✓ | Fully implemented with correct texture and behavior |
| Enemy Ships | ✓ | ✓ | Fully implemented with random types and proper limits |
| Player Movement | ✓ | ✓ | Implemented with balanced speed (3.0) for good control |
| Enemy Movement | ✓ | ✓ | Enhanced with staggered spawning and varied speeds |
| Projectile System | ✓ | ✓ | Implemented with object pooling for efficiency |
| Health System | ✓ | ✓ | Implemented for both player and enemies |
| Lives System | ✓ | ✓ | Player starts with 3 lives as specified |
| Scoring System | ✓ | ✓ | Score increases by 100 points per enemy destroyed |
| Explosions | ✓ | ✓ | Both pixel and sonic explosions implemented |
| Game Over | ✓ | ✓ | Shows final score and restart instructions |
| Moving Star Background | ✓ | ✓ | Implemented with parallax effect and varying star properties |
| Sound Effects | ✓ | ✓ | All key sound effects implemented with volume control | 