# Space Shooter

## Summary

This is a simple top down space shooter where the player ship is on the bottom of the screen pointing up and with the stars moving as the background.
The enemy ships start showing up coming into from the the top of the screen. they are sparse at first but increase slightly with frequency over time.
The player's ship should be able to shoot a laser at the enemy ships as they move down towards the bottom of the screen.
The enemy ships have health points and the lasers take away health and when the enemy ships reach zero they explode.
when the enemy ships explode the player gets a number of points which is added to their score. 
The enemy ships can also shoot at the player after they enter the frame or screen. Since they are alway spointing and traveling down, their lasers shoot down. 
When a laser hits an enemy ship, there is an explosion and an explosion sound.
The player has hit points and when the player reaches zero hit points their ship explodes.
When this happens, the player loses a life and then re-spawns after a time. 
The score shows up on the screen in the top left along with how many lives they have left. 
The background is stars and should move in the background if there were stars moving below the player. 
the player starts with 3 lives and when they lose all 3 the game is over. 
When the game is over it shows how long the player lasted and how many points they gained. 
It then allows the player to restart the game. 

## Technology

Building and Hosting
- Use the Vite TS cli to initialize the repo
- This will be hosted on github pages, so an index.html at the root would help with that

Developing
- Use the Vite for the development environemtn with the appropriate typescript template

Language
- Use Typescript as the programming language

Rendering
- pixi 8.9 should be used to render game objects
- The software engineer should be considered an expert at the pixi.js framework
- The documentation is here: https://pixijs.download/release/docs/index.html
- The codebase is here: https://github.com/pixijs/pixijs
- Make sure that you understand the coordinate system that PIXI uses. 
- Make sure you understand the texture orientation when they are loaded

Frameworks
- pixi.js latest: should be v8.9
- please check for eslinting errors
- use the eslint --fix for auto-fixing

## Architecture

- Please create a finite state machine for the actors behaviors so we can extend and re-use the behaviors
- create re-usable parts when there's an oportunity.

## Assets

Assets folder:
/assets/spritesheet/sheet.xml
/assets/spritesheet/sheet.png
/assets/spritesheet/spritesheet_pixelExplosion.xml
/assets/spritesheet/spritesheet_pixelExplosion.png
/assets/spritesheet/spritesheet_sonicExplosion.xml
/assets/spritesheet/spritesheet_sonicExplosion.png

the assets exist in the assets folder and should be loaded using the PIXI asset loader.
The spritesheet has the following textures that should be used as the visible game assets on screen. 
The textures from the sheet.xml assets are assigned as follows:

| Purpose  | Texture |
| ---- |:----:|
| Player Ship      | playerShip1_blue     |
| Enemy 1      | enemyRed1     |
| Enemy 2      | enemyRed2     |
| Enemy 3      | enemyRed3     |
| Player Laser | laserBlue01 |
| Enemy Lasers | laserRed05 |
| Laser explosion | spritesheet_pixelExplosion |
| Ship explosion | spritesheet_sonicExplosion |
| shield power-up | powerupBlue_shield |
| ship full shields | shield1 |
| ship 2/3 shields | shield2 |
| ship 1/3 shields | shield3 |


| Purpose  | Texture |
| ---- |:----:|
| Background Image |  /assets/backgrounds/black.png |

## Player

entity of type Sprite
sprite with texture playerShip1_blue in sheet.xml
The player is the ship they control 
The player ship movement uses the arrow keys for slide left/right and up/down
The player score is persistently shown in the top left along with the number of lives left
the player score starts at zero and increases with each enemy destroyed
When the player is destroyed the Ship explosion should be shown and animated
An explosion sound should play.
the base-line player damage per laser hit is 50

## Enemy 

entity of type Sprite
sprite with texture enemyRed1, enemyRed2, or enemyRed3 at random in sheet.xml
the enemies come into the screen from the top
at most there are 10 enemies on the screen at once
the enemy ships shoot at variables no less than 0.5 seconds apart and can only have 3 active shots at once
the enemy entity texture can be randomized between enemyRed1, enemyRed2, or enemyRed3
they have 100 hitpoints
they take damage applied from the projectile damage property
they shoot their lasers down at regular intervals and randomly move right or left
the show an animated sprite using the explosion spritesheet called spritesheet_sonicExplosion

## Enemy Drops

Enemy drops will be a feature of this game, we will start with them dropping a shield power-up
this will be the first of a few different drops that will enhance the gameplay
so create a robust enemy drop system so that one or more items can spawn when enemies die. 
When the player collides with a power-up an event occurs based on the type of power-up
if the power-up is a sheild for instance, the ship gains shields

shield powerup : powerupBlue_shield.png
when an enemy ship explodes there is a 20% chance it will drop a shield token
an enemy drop will slowly fall about 1/2 the speed of the enemy ship
the shield power-up is identified by this graphic "powerupBlue_shield.png" in the sheet.xml. 

## Player Shields

The player does not start off with shields, a player gains shields by capturing an enemy ship drop that is a shield type drop.
The player shield starts at 100 health each hit takes the shield down by 1/3
once a shield is gone the player's health will be declining instead of the shield once again 
when a player has shields, a shield entity should be attached to the ship 
a graphic that represents the shield strength should be shown these shield strengths corellate with the following graphics;
full strength: shield3.png
2/3 strength shield2.png
1/3 strength: shield1.png 