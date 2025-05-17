import { Container, Sprite, Texture, Ticker } from 'pixi.js';
import { AssetLoader } from './asset-loader';

/**
 * Explosion types
 */
export enum ExplosionType {
  PIXEL = 'pixel', // For projectile impacts
  SONIC = 'sonic'  // For ship explosions
}

/**
 * Class to create and manage explosion animations
 */
export class ExplosionManager {
  private static instance: ExplosionManager;
  
  /**
   * Private constructor for singleton pattern
   */
  private constructor() {}
  
  /**
   * Get singleton instance
   */
  public static getInstance(): ExplosionManager {
    if (!ExplosionManager.instance) {
      ExplosionManager.instance = new ExplosionManager();
    }
    return ExplosionManager.instance;
  }
  
  /**
   * Create an explosion animation at the specified position
   * @param type Type of explosion (pixel or sonic)
   * @param x X position
   * @param y Y position
   * @param parent Parent container to add the explosion to
   * @param scale Optional scale factor for the explosion
   * @param onComplete Optional callback when animation completes
   */
  public createExplosion(
    type: ExplosionType,
    x: number,
    y: number,
    parent: Container,
    scale: number = 1,
    onComplete?: () => void
  ): void {
    // Get texture prefix based on explosion type
    const texturePrefix = type === ExplosionType.PIXEL 
      ? 'spritesheet_pixelExplosion_'
      : 'spritesheet_sonicExplosion_';

    // Create sprite for the explosion
    const explosionSprite = new Sprite();
    explosionSprite.anchor.set(0.5);
    explosionSprite.position.set(x, y);
    explosionSprite.scale.set(scale);
    
    // Add to parent container
    parent.addChild(explosionSprite);
    
    // Animation frames: typically numbered 000 to 008 (9 frames)
    const frameCount = 9;
    let currentFrame = 0;
    
    // Animation ticker
    const ticker = new Ticker();
    ticker.add(() => {
      // Update frame every few ticks (adjust for speed of animation)
      if (ticker.lastTime % 3 === 0) {
        // Format frame number with leading zeros (000, 001, etc.)
        const frameNumber = currentFrame.toString().padStart(3, '0');
        const textureName = `${texturePrefix}${frameNumber}`;
        
        // Get texture for current frame
        const texture = AssetLoader.getInstance().getTexture(textureName);
        explosionSprite.texture = texture;
        
        // Move to next frame
        currentFrame++;
        
        // If animation complete, clean up
        if (currentFrame >= frameCount) {
          // Stop the ticker
          ticker.stop();
          
          // Remove sprite from parent
          if (explosionSprite.parent) {
            explosionSprite.parent.removeChild(explosionSprite);
          }
          
          // Call completion callback if provided
          if (onComplete) {
            onComplete();
          }
        }
      }
    });
    
    // Start the animation
    ticker.start();
    
    console.log(`Created ${type} explosion at (${x}, ${y})`);
  }
} 