import { Container, Sprite, Text } from 'pixi.js';
import { Scene } from './scene';
import { InputManager } from '../core/input-manager';
import { PlayerShip } from '../entities/player-ship';
import { EnemyShip, EnemyType } from '../entities/enemy-ship';
import { AssetLoader } from '../library/asset-loader';
import { StarBackground } from '../library/star-background';
import { SoundManager, SoundType } from '../library/sound-manager';
import { PowerUp, PowerUpType } from '../entities/power-up';

/**
 * Main gameplay scene
 */
export class GameScene extends Scene {
  /**
   * Static background sprite (for base background color)
   */
  private backgroundSprite: Sprite | null = null;
  
  /**
   * Star background
   */
  private starBackground: StarBackground | null = null;
  
  /**
   * Player ship
   */
  private player: PlayerShip | null = null;
  
  /**
   * Enemy ships
   */
  private enemies: EnemyShip[] = [];
  
  /**
   * Enemy spawn timer
   */
  private enemySpawnTimer: number = 0;
  
  /**
   * Enemy spawn interval in seconds
   */
  private enemySpawnInterval: number = 3;
  
  /**
   * Min spawn interval
   */
  private minSpawnInterval: number = 1.5;
  
  /**
   * Spawn interval decrease rate
   */
  private spawnIntervalDecreaseRate: number = 0.01;
  
  /**
   * Game time in seconds
   */
  private gameTime: number = 0;
  
  /**
   * Score
   */
  private score: number = 0;
  
  /**
   * Input manager
   */
  private inputManager: InputManager;
  
  /**
   * Screen dimensions
   */
  private screenWidth: number = 500;
  private screenHeight: number = 800;
  
  /**
   * UI container
   */
  private uiContainer: Container = new Container();
  
  /**
   * Score text
   */
  private scoreText: Text | null = null;
  
  /**
   * Lives text
   */
  private livesText: Text | null = null;
  
  /**
   * Game over UI elements
   */
  private gameOverContainer: Container = new Container();
  
  /**
   * Game over text
   */
  private gameOverText: Text | null = null;
  
  /**
   * Final score text
   */
  private finalScoreText: Text | null = null;
  
  /**
   * Restart text
   */
  private restartText: Text | null = null;
  
  /**
   * Whether the game is over
   */
  private isGameOver: boolean = false;
  
  /**
   * Update listeners for animations
   */
  private updateListeners: ((deltaTime: number) => void)[] = [];
  
  /**
   * Power-ups in the scene
   */
  private powerUps: PowerUp[] = [];
  
  /**
   * Constructor
   */
  constructor() {
    super();
    
    this.inputManager = InputManager.getInstance();
  }
  
  /**
   * Initialize the scene
   */
  public init(): void {
    // Set master volume to 50% (0.35 instead of default 0.7)
    SoundManager.getInstance().setVolume(0.35);
    
    // Create static background for base color
    this.backgroundSprite = new Sprite(AssetLoader.getInstance().getTexture('black'));
    this.backgroundSprite.width = this.screenWidth;
    this.backgroundSprite.height = this.screenHeight;
    this.container.addChild(this.backgroundSprite);
    
    // Create scrolling star background
    this.starBackground = new StarBackground(this.screenWidth, this.screenHeight);
    this.container.addChild(this.starBackground.getContainer());
    
    // Initialize game entities
    this.initializeEntities();
    
    // Initialize UI
    this.initializeUI();
    
    // Initialize game over UI
    this.initializeGameOverUI();
    
    // Add UI containers to the scene
    this.container.addChild(this.uiContainer);
    this.container.addChild(this.gameOverContainer);
    
    // Hide game over UI initially
    this.gameOverContainer.visible = false;
  }
  
  /**
   * Initialize game entities
   */
  private initializeEntities(): void {
    // Create player ship
    this.player = new PlayerShip(
      this.screenWidth / 2,  // Center x position
      this.screenHeight - 120, // Near bottom of screen, but adjusted for taller layout
      this.screenWidth,
      this.screenHeight
    );
    this.container.addChild(this.player.getContainer());
    
    // Set game over callback
    this.player.setGameOverCallback(() => this.gameOver());
  }
  
  /**
   * Initialize UI elements
   */
  private initializeUI(): void {
    // Create score text
    this.scoreText = new Text('Score: 0', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xFFFFFF,
    });
    this.scoreText.position.set(20, 20);
    this.uiContainer.addChild(this.scoreText);
    
    // Create lives text
    this.livesText = new Text('Lives: 3', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xFFFFFF,
    });
    this.livesText.position.set(20, 50);
    this.uiContainer.addChild(this.livesText);
  }
  
  /**
   * Initialize game over UI elements
   */
  private initializeGameOverUI(): void {
    // Create game over text
    this.gameOverText = new Text('GAME OVER', {
      fontFamily: 'Arial',
      fontSize: 48,
      fontWeight: 'bold',
      fill: 0xFF0000,
    });
    this.gameOverText.anchor.set(0.5);
    this.gameOverText.position.set(this.screenWidth / 2, this.screenHeight / 2 - 60);
    this.gameOverContainer.addChild(this.gameOverText);
    
    // Create final score text
    this.finalScoreText = new Text('Final Score: 0', {
      fontFamily: 'Arial',
      fontSize: 32,
      fill: 0xFFFFFF,
    });
    this.finalScoreText.anchor.set(0.5);
    this.finalScoreText.position.set(this.screenWidth / 2, this.screenHeight / 2);
    this.gameOverContainer.addChild(this.finalScoreText);
    
    // Create restart text
    this.restartText = new Text('Press SPACE to restart', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xFFFFFF,
    });
    this.restartText.anchor.set(0.5);
    this.restartText.position.set(this.screenWidth / 2, this.screenHeight / 2 + 60);
    this.gameOverContainer.addChild(this.restartText);
  }
  
  /**
   * Update the scene
   * @param deltaTime Time since last update
   */
  public update(deltaTime: number): void {
    if (!this.active) return;
    
    // Handle game over state
    if (this.isGameOver) {
      // Check for restart input
      if (this.inputManager.isSpacePressed()) {
        this.restartGame();
      }
      return;
    }
    
    // Update star background
    if (this.starBackground) {
      this.starBackground.update(deltaTime);
    }
    
    // Update game time
    this.gameTime += deltaTime;
    
    // Update entities
    this.updateEntities(deltaTime);
    
    // Handle input
    this.handleInput();
    
    // Check collisions
    this.checkCollisions();
    
    // Spawn enemies
    this.updateEnemySpawning(deltaTime);
    
    // Update UI
    this.updateUI();
    
    // Ensure player is in scene
    this.ensurePlayerInScene();
    
    // Call all update listeners
    for (const listener of this.updateListeners) {
      listener(deltaTime);
    }
    
    // Check for game over
    if (this.player && this.player.getLives() <= 0) {
      this.gameOver();
    }
  }
  
  /**
   * Update game entities
   * @param deltaTime Time since last update
   */
  private updateEntities(deltaTime: number): void {
    // Update player
    if (this.player) {
      this.player.update(deltaTime);
    }
    
    // Update enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      
      // Update enemy
      enemy.update(deltaTime);
      
      // If enemy is off-screen (went past bottom), remove it
      if (enemy.getY() > this.screenHeight + 100) {
        // Only remove if active (we might have inactive enemies waiting to be removed)
        if (enemy.isActive()) {
          enemy.setActive(false);
        }
      }
      
      // Clean up destroyed enemies
      if (!enemy.isActive()) {
        enemy.destroy();
        this.enemies.splice(i, 1);
      }
    }
    
    // Update power-ups
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      
      // Update power-up
      powerUp.update(deltaTime);
      
      // Clean up inactive power-ups
      if (!powerUp.isActive()) {
        powerUp.destroy();
        this.powerUps.splice(i, 1);
      }
    }
    
    // Update animations
    for (const listener of this.updateListeners) {
      listener(deltaTime);
    }
  }
  
  /**
   * Handle player input
   */
  private handleInput(): void {
    // Player input is already handled in the player's state machine
  }
  
  /**
   * Check for collisions between entities
   */
  private checkCollisions(): void {
    if (!this.player || !this.player.isActive()) return;
    
    // Check player projectiles against enemies
    const playerProjectiles = this.player.getActiveProjectiles();
    
    for (let i = 0; i < playerProjectiles.length; i++) {
      const projectile = playerProjectiles[i];
      if (!projectile.isActive()) continue;
      
      // Check against all enemies
      for (let j = 0; j < this.enemies.length; j++) {
        const enemy = this.enemies[j];
        if (!enemy.isActive()) continue;
        
        // Simple circle collision
        const dx = projectile.getX() - enemy.getX();
        const dy = projectile.getY() - enemy.getY();
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If colliding
        if (distance < 30) { // Approximate collision radius
          // Enemy takes damage
          enemy.takeDamage(projectile.getDamage());
          
          // Projectile explodes
          projectile.onCollision();
          
          // If enemy is destroyed, add score
          if (enemy.isDestroyed()) {
            this.score += 100;
            
            // Give score to player
            if (this.player) {
              this.player.addScore(100);
            }
          }
          
          // Continue to next projectile
          break;
        }
      }
    }
    
    // Skip enemy projectile collisions if player is invulnerable or destroyed
    if (this.player.isInvulnerable()) return;
    
    // Check enemy projectiles against player
    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i];
      if (!enemy.isActive()) continue;
      
      const enemyProjectiles = enemy.getActiveProjectiles();
      
      for (let j = 0; j < enemyProjectiles.length; j++) {
        const projectile = enemyProjectiles[j];
        if (!projectile.isActive()) continue;
        
        // Simple circle collision with player
        const dx = projectile.getX() - this.player.getX();
        const dy = projectile.getY() - this.player.getY();
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If colliding
        if (distance < 30) { // Approximate collision radius
          // Player takes damage
          this.player.takeDamage(projectile.getDamage());
          
          // Projectile explodes
          projectile.onCollision();
          
          // Continue to next enemy
          break;
        }
      }
    }
    
    // Check power-ups against player
    for (let i = 0; i < this.powerUps.length; i++) {
      const powerUp = this.powerUps[i];
      if (!powerUp.isActive()) continue;
      
      // Simple circle collision with player
      const dx = powerUp.getX() - this.player.getX();
      const dy = powerUp.getY() - this.player.getY();
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // If colliding
      if (distance < 40) { // Larger collision radius for easier pickup
        // Apply power-up effect
        this.applyPowerUpEffect(powerUp);
        
        // Power-up is collected
        powerUp.onCollected();
      }
    }
  }
  
  /**
   * Apply power-up effect to the player
   * @param powerUp The power-up to apply
   */
  private applyPowerUpEffect(powerUp: PowerUp): void {
    if (!this.player) return;
    
    switch (powerUp.getType()) {
      case PowerUpType.SHIELD:
        // Add shield to player
        this.player.addShield();
        console.log('Player collected shield power-up!');
        break;
      default:
        // Unknown power-up type
        console.warn(`Unknown power-up type: ${powerUp.getType()}`);
        break;
    }
  }
  
  /**
   * Update enemy spawning logic
   * @param deltaTime Time since last update
   */
  private updateEnemySpawning(deltaTime: number): void {
    this.enemySpawnTimer += deltaTime;
    
    // Gradually decrease spawn interval (increase difficulty)
    this.enemySpawnInterval = Math.max(
      this.minSpawnInterval,
      this.enemySpawnInterval - (this.spawnIntervalDecreaseRate * deltaTime)
    );
    
    // Spawn enemy if timer exceeds interval
    if (this.enemySpawnTimer >= this.enemySpawnInterval) {
      this.spawnEnemy();
      this.enemySpawnTimer = 0;
      console.log(`Spawned enemy. Next spawn in ${this.enemySpawnInterval.toFixed(2)} seconds`);
    }
  }
  
  /**
   * Spawn a new enemy
   */
  private spawnEnemy(): void {
    // Check if we already have 10 active enemies (per spec requirement)
    const activeEnemies = this.enemies.filter(enemy => enemy.isActive()).length;
    if (activeEnemies >= 10) {
      console.log(`Maximum enemies (10) already on screen. Skipping spawn.`);
      return;
    }
    
    // Random x position
    const x = Math.random() * (this.screenWidth - 100) + 50;
    
    // Estimate enemy height after scaling (original height * scale factor)
    // Enemy sprites are approx 75px tall with 0.6 scale = ~45px rendered height
    const estimatedEnemyHeight = 45;
    const minVerticalSpacing = estimatedEnemyHeight * 1.5; // At least 1.5x height spacing
    
    // Get positions of all active enemies currently above the screen
    const activeEnemyPositions = this.enemies
      .filter(enemy => enemy.isActive() && enemy.getY() < 0)
      .map(enemy => enemy.getY());
    
    // Start with a random position between -50 and -300 (reduced from -800)
    // This keeps enemies closer to the screen for better gameplay experience
    let y = -50 - Math.random() * 250;
    
    // Check if this position is too close to any existing enemy
    // If so, move it further up to maintain minimum spacing
    let attemptsLeft = 10; // Limit attempts to prevent infinite loops
    while (attemptsLeft > 0) {
      const tooClose = activeEnemyPositions.some(
        enemyY => Math.abs(enemyY - y) < minVerticalSpacing
      );
      
      if (!tooClose) {
        break; // Position is good, no conflicts
      }
      
      // Move further up by the minimum spacing + random offset
      y -= minVerticalSpacing + Math.random() * 50;
      attemptsLeft--;
    }
    
    console.log(`Spawning enemy at y=${y} with vertical spacing of ${minVerticalSpacing}px`);
    
    // Random enemy type
    const enemyTypes = [EnemyType.TYPE_1, EnemyType.TYPE_2, EnemyType.TYPE_3];
    const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    
    // Create enemy
    const enemy = new EnemyShip(
      x,
      y, // Staggered start position above screen
      randomType,
      this.screenWidth,
      this.screenHeight
    );
    
    // Set power-up drop callback
    enemy.setOnPowerUpDroppedCallback((powerUp: PowerUp) => {
      this.addPowerUp(powerUp);
    });
    
    // Vary the vertical speed dramatically
    const verticalSpeed = 0.3 + Math.random() * 1.7; // Between 0.3 and 2.0 speed
    enemy.setVerticalSpeed(verticalSpeed);
    
    // Debug: Log available textures
    console.log('Available textures:', AssetLoader.getInstance().listTextures());
    
    // Add to enemies array
    this.enemies.push(enemy);
    
    // Add to scene
    this.container.addChild(enemy.getContainer());
    
    console.log(`Enemy added to scene. Total active enemies: ${activeEnemies + 1}`);
  }
  
  /**
   * Add a power-up to the scene
   * @param powerUp The power-up to add
   */
  private addPowerUp(powerUp: PowerUp): void {
    // Add to power-ups array
    this.powerUps.push(powerUp);
    
    // Add to scene
    this.container.addChild(powerUp.getContainer());
    
    console.log(`Power-up added to scene. Type: ${powerUp.getType()}`);
  }
  
  /**
   * Update UI elements
   */
  private updateUI(): void {
    if (this.player) {
      // Update score text
      if (this.scoreText) {
        this.scoreText.text = `Score: ${this.player.getScore()}`;
      }
      
      // Update lives text
      if (this.livesText) {
        this.livesText.text = `Lives: ${this.player.getLives()}`;
      }
    }
  }
  
  /**
   * Handle game over
   */
  public gameOver(): void {
    this.isGameOver = true;
    
    // Show game over UI
    this.gameOverContainer.visible = true;
    
    // Update final score
    if (this.finalScoreText && this.player) {
      this.finalScoreText.text = `Final Score: ${this.player.getScore()}`;
    }
    
    console.log('Game Over! Final score:', this.player?.getScore());
  }
  
  /**
   * Restart the game
   */
  private restartGame(): void {
    this.isGameOver = false;
    
    // Play UI select sound
    SoundManager.getInstance().play(SoundType.UI_SELECT);
    
    // Hide game over UI
    this.gameOverContainer.visible = false;
    
    // Reset game time
    this.gameTime = 0;
    
    // Reset enemy spawn timer and interval
    this.enemySpawnTimer = 0;
    this.enemySpawnInterval = 3;
    
    // Re-initialize star background for a fresh start
    if (this.starBackground) {
      // Remove existing star background
      this.container.removeChild(this.starBackground.getContainer());
      
      // Create new star background
      this.starBackground = new StarBackground(this.screenWidth, this.screenHeight);
      
      // Add it back to the container (between background and entities)
      this.container.addChildAt(this.starBackground.getContainer(), 1);
    }
    
    // Clear all enemies
    for (const enemy of this.enemies) {
      enemy.destroy();
    }
    this.enemies = [];
    
    // Clear power-ups
    for (const powerUp of this.powerUps) {
      powerUp.destroy();
    }
    this.powerUps = [];
    
    // Reset player
    if (this.player) {
      // Remove old player
      this.player.destroy();
      
      // Create new player
      this.player = new PlayerShip(
        this.screenWidth / 2,
        this.screenHeight - 120,
        this.screenWidth,
        this.screenHeight
      );
      this.container.addChild(this.player.getContainer());
      
      // Set game over callback
      this.player.setGameOverCallback(() => this.gameOver());
    }
    
    console.log('Game restarted');
  }
  
  /**
   * Ensure player is in the scene (call after respawn)
   * This method can be called during update to ensure the player ship is properly in the scene
   */
  private ensurePlayerInScene(): void {
    if (this.player && this.player.isActive() && !this.player.getContainer().parent) {
      console.log('Re-adding player container to scene after respawn');
      this.container.addChild(this.player.getContainer());
    }
  }
  
  /**
   * Resize the scene
   * @param width New width
   * @param height New height
   */
  public resize(width: number, height: number): void {
    this.screenWidth = width;
    this.screenHeight = height;
    
    if (this.backgroundSprite) {
      this.backgroundSprite.width = width;
      this.backgroundSprite.height = height;
    }
    
    if (this.starBackground) {
      this.starBackground.resize(width, height);
    }
    
    // Update player's screen dimensions
    if (this.player) {
      this.player.setScreenDimensions(width, height);
    }
    
    // Update enemies' screen dimensions
    for (const enemy of this.enemies) {
      enemy.setScreenDimensions(width, height);
    }
    
    // Update game over UI positions
    if (this.gameOverText) {
      this.gameOverText.position.set(width / 2, height / 2 - 60);
    }
    
    if (this.finalScoreText) {
      this.finalScoreText.position.set(width / 2, height / 2);
    }
    
    if (this.restartText) {
      this.restartText.position.set(width / 2, height / 2 + 60);
    }
  }
  
  /**
   * Add an update listener function
   * @param listener Function to call during update
   */
  public addUpdateListener(listener: (deltaTime: number) => void): void {
    this.updateListeners.push(listener);
  }
  
  /**
   * Remove an update listener function
   * @param listener Function to remove
   */
  public removeUpdateListener(listener: (deltaTime: number) => void): void {
    const index = this.updateListeners.indexOf(listener);
    if (index !== -1) {
      this.updateListeners.splice(index, 1);
    }
  }
} 