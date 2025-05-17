import { Container, Sprite, Texture, AnimatedSprite } from 'pixi.js';
import { AssetLoader } from './asset-loader';
import { SoundManager, SoundType } from './sound-manager';

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
    // Determine the base name for the textures based on type
    const baseName = type === ExplosionType.PIXEL ? 'pixelExplosion' : 'sonicExplosion';
    
    // Create array of textures for the animation frames
    const frames: Texture[] = [];
    const assetLoader = AssetLoader.getInstance();
    
    // Get available textures for debugging
    console.log(`Available textures: ${assetLoader.listTextures().filter(name => name.includes(baseName)).join(', ')}`);
    
    // Load frames sequentially (00 to 08)
    for (let i = 0; i <= 8; i++) {
      const frameNumber = i.toString().padStart(2, '0');
      const textureName = `${baseName}${frameNumber}`;
      const texture = assetLoader.getTexture(textureName);
      
      // Log each texture as we find it
      console.log(`Frame ${i}: ${textureName} - ${texture !== assetLoader.getTexture('WHITE') ? 'Found' : 'MISSING'}`);
      
      frames.push(texture);
    }
    
    // Create the animated sprite
    const explosion = new AnimatedSprite(frames);
    
    // Configure the animated sprite
    explosion.loop = false;
    explosion.animationSpeed = 0.2; // Adjust for desired speed (0.5 = 30fps)
    explosion.anchor.set(0.5);
    explosion.position.set(x, y);
    explosion.scale.set(scale);
    
    // When the animation completes, remove the sprite
    explosion.onComplete = () => {
      if (explosion.parent) {
        explosion.parent.removeChild(explosion);
      }
      if (onComplete) {
        onComplete();
      }
      console.log(`${type} explosion animation complete at (${x}, ${y})`);
    };
    
    // Add to parent
    parent.addChild(explosion);
    
    // Start playing the animation
    explosion.play();
    
    // Get screen height (default to 800 if we can't determine it)
    const screenHeight = 800;
    
    // Play sound only if the explosion is within or near the screen bounds
    if (y > -100 && y < screenHeight + 100) {
      // Play the appropriate explosion sound
      if (type === ExplosionType.PIXEL) {
        SoundManager.getInstance().play(SoundType.EXPLOSION_SMALL);
      } else {
        SoundManager.getInstance().play(SoundType.EXPLOSION_LARGE);
      }
    }
    
    console.log(`Created ${type} explosion at (${x}, ${y}) with ${frames.length} frames`);
  }
} 