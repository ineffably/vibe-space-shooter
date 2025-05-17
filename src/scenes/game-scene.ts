import { Container, Sprite, Texture, Text } from 'pixi.js';
import { Scene } from './scene';
import { InputManager } from '../core/input-manager';
import { PlayerShip } from '../entities/player-ship';
import { EnemyShip, EnemyType } from '../entities/enemy-ship';
import { AssetLoader } from '../library/asset-loader';

/**
 * Main gameplay scene
 */
export class GameScene extends Scene {
  /**
   * Background sprite
   */
  private background: Sprite | null = null;
  
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
  private enemySpawnInterval: number = 2;
  
  /**
   * Min spawn interval
   */
  private minSpawnInterval: number = 0.5;
  
  /**
   * Spawn interval decrease rate
   */
  private spawnIntervalDecreaseRate: number = 0.02;
  
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
  private screenWidth: number = 800;
  private screenHeight: number = 600;
  
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
    // Create background (using actual asset)
    this.background = new Sprite(AssetLoader.getInstance().getTexture('black'));
    this.background.width = this.screenWidth;
    this.background.height = this.screenHeight;
    this.container.addChild(this.background);
    
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
      this.screenHeight - 100, // Near bottom of screen
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
      enemy.update(deltaTime);
      
      // Remove inactive enemies
      if (!enemy.isActive()) {
        enemy.destroy();
        this.enemies.splice(i, 1);
      }
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
    if (!this.player) return;
    
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
    
    // Random enemy type
    const enemyTypes = [EnemyType.TYPE_1, EnemyType.TYPE_2, EnemyType.TYPE_3];
    const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    
    console.log(`Attempting to spawn enemy type: ${randomType} at x: ${x}`);
    
    // Create enemy
    const enemy = new EnemyShip(
      x,
      -50, // Start above screen
      randomType,
      this.screenWidth,
      this.screenHeight
    );
    
    // Debug: Log available textures
    console.log('Available textures:', AssetLoader.getInstance().listTextures());
    
    // Add to enemies array
    this.enemies.push(enemy);
    
    // Add to scene
    this.container.addChild(enemy.getContainer());
    
    console.log(`Enemy added to scene. Total active enemies: ${activeEnemies + 1}`);
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
    
    // Hide game over UI
    this.gameOverContainer.visible = false;
    
    // Reset game time
    this.gameTime = 0;
    
    // Reset enemy spawn timer and interval
    this.enemySpawnTimer = 0;
    this.enemySpawnInterval = 2;
    
    // Clear all enemies
    for (const enemy of this.enemies) {
      enemy.destroy();
    }
    this.enemies = [];
    
    // Reset player
    if (this.player) {
      // Remove old player
      this.player.destroy();
      
      // Create new player
      this.player = new PlayerShip(
        this.screenWidth / 2,
        this.screenHeight - 100,
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
   * Resize the scene
   * @param width New width
   * @param height New height
   */
  public resize(width: number, height: number): void {
    this.screenWidth = width;
    this.screenHeight = height;
    
    if (this.background) {
      this.background.width = width;
      this.background.height = height;
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
} 