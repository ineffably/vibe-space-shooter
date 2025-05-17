import { Container, Graphics, Rectangle } from 'pixi.js';

/**
 * Star properties
 */
interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
  color: number;
}

/**
 * A scrolling star background that creates a parallax effect
 */
export class StarBackground {
  /**
   * Container for stars
   */
  private container: Container;
  
  /**
   * Stars array
   */
  private stars: Star[] = [];
  
  /**
   * Screen dimensions
   */
  private width: number;
  private height: number;
  
  /**
   * Number of stars to create
   */
  private readonly starCount: number;
  
  /**
   * Graphics objects for rendering stars
   */
  private starGraphics: Graphics;
  
  /**
   * Constructor
   * @param width Screen width
   * @param height Screen height
   * @param starCount Number of stars to create
   */
  constructor(width: number, height: number, starCount: number = 150) {
    this.width = width;
    this.height = height;
    this.starCount = starCount;
    
    this.container = new Container();
    this.starGraphics = new Graphics();
    this.container.addChild(this.starGraphics);
    
    this.createStars();
  }
  
  /**
   * Create stars with random properties
   */
  private createStars(): void {
    this.stars = [];
    
    for (let i = 0; i < this.starCount; i++) {
      this.stars.push(this.createStar());
    }
  }
  
  /**
   * Create a single star with random properties
   */
  private createStar(): Star {
    // Determine star layer (foreground, mid-ground, background)
    const layer = Math.random();
    
    let size: number;
    let speed: number;
    let alpha: number;
    
    if (layer < 0.2) {
      // Foreground stars: larger, faster, brighter
      size = 1.5 + Math.random() * 1.5;
      speed = 0.3 + Math.random() * 0.3;
      alpha = 0.8 + Math.random() * 0.2;
    } else if (layer < 0.5) {
      // Mid-ground stars: medium size, medium speed
      size = 0.8 + Math.random() * 1.2;
      speed = 0.15 + Math.random() * 0.15;
      alpha = 0.6 + Math.random() * 0.3;
    } else {
      // Background stars: smaller, slower, dimmer
      size = 0.3 + Math.random() * 0.7;
      speed = 0.05 + Math.random() * 0.1;
      alpha = 0.3 + Math.random() * 0.4;
    }
    
    // Determine star color (mostly white with occasional blue or yellow tint)
    const colorChoice = Math.random();
    let color: number;
    
    if (colorChoice < 0.7) {
      // White
      color = 0xFFFFFF;
    } else if (colorChoice < 0.85) {
      // Blue-ish
      color = 0xCCCCFF;
    } else {
      // Yellow-ish
      color = 0xFFFFCC;
    }
    
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      size,
      speed,
      alpha,
      color
    };
  }
  
  /**
   * Update star positions
   * @param deltaTime Time since last update
   */
  public update(deltaTime: number): void {
    // Clear previous frame
    this.starGraphics.clear();
    
    // Speed multiplier to slow down the stars to half speed
    const speedMultiplier = 0.5;
    
    // Update and draw stars
    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];
      
      // Update position - move downward to simulate forward motion
      // Apply speedMultiplier to slow down movement
      star.y += star.speed * deltaTime * 60 * speedMultiplier;
      
      // If star moves off screen, reset it to the top with new random properties
      if (star.y > this.height) {
        star.y = 0;
        star.x = Math.random() * this.width;
      }
      
      // Draw the star
      this.starGraphics.beginFill(star.color, star.alpha);
      this.starGraphics.drawCircle(star.x, star.y, star.size);
      this.starGraphics.endFill();
    }
  }
  
  /**
   * Resize the background
   * @param width New width
   * @param height New height
   */
  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    
    // Adjust star positions to fit new dimensions
    for (const star of this.stars) {
      if (star.x > width) {
        star.x = Math.random() * width;
      }
      if (star.y > height) {
        star.y = Math.random() * height;
      }
    }
  }
  
  /**
   * Get the container
   */
  public getContainer(): Container {
    return this.container;
  }
} 