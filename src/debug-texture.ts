import { Application, Sprite } from 'pixi.js';
import { AssetLoader } from './library/asset-loader';

/**
 * Create a debug application to test texture loading
 */
async function debugTextures() {
  // Create a PIXI application
  const app = new Application({
    background: '#000000',
    width: 800,
    height: 600,
    antialias: true
  });

  // Initialize the app
  await app.init();

  // Add the view to the DOM
  const gameContainer = document.getElementById('game-container');
  if (gameContainer) {
    gameContainer.appendChild(app.canvas);
  } else {
    console.error('Could not find game-container element');
  }

  // Load assets
  const assetLoader = AssetLoader.getInstance();
  await assetLoader.loadAssets();

  // Log all available textures
  console.log('Available textures:', assetLoader.listTextures());

  // Check if playerShip1_blue is available
  const playerTexture = assetLoader.getTexture('playerShip1_blue');
  console.log('Player texture:', playerTexture);

  if (playerTexture) {
    // Create a sprite with the player texture
    const playerSprite = new Sprite(playerTexture);
    playerSprite.anchor.set(0.5);
    playerSprite.position.set(app.screen.width / 2, app.screen.height / 2);
    app.stage.addChild(playerSprite);
    console.log('Player sprite created and added to stage');
  } else {
    console.error('Player texture not available!');
  }
}

// Run the debug function
debugTextures().catch(error => console.error('Debug error:', error)); 