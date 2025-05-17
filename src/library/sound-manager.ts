import { Howl, Howler } from 'howler';

/**
 * Sound types in the game
 */
export enum SoundType {
  PLAYER_SHOOT = 'playerShoot',
  ENEMY_SHOOT = 'enemyShoot',
  EXPLOSION_SMALL = 'explosionSmall',
  EXPLOSION_LARGE = 'explosionLarge',
  PLAYER_DAMAGE = 'playerDamage',
  GAME_OVER = 'gameOver',
  UI_SELECT = 'uiSelect',
  SHIELD_ACTIVATE = 'shieldActivate'
}

/**
 * Sound configuration interface
 */
interface SoundConfig {
  key: string;
  path: string;
  volume?: number;
  loop?: boolean;
}

/**
 * SoundManager class using Howler.js for robust audio playback
 */
export class SoundManager {
  private static instance: SoundManager;
  private sounds: Map<string, Howl> = new Map();
  private muted: boolean = false;
  private masterVolume: number = 0.7; // Default volume

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    // Configure Howler.js
    Howler.autoUnlock = true;
    Howler.html5PoolSize = 10;
    Howler.volume(this.masterVolume);
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  /**
   * Load a sound file
   * @param config Sound configuration object
   * @returns Promise that resolves when the sound is loaded
   */
  public loadSound(config: SoundConfig): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // Create a Howl instance with original source path
      const sound = new Howl({
        src: [config.path],
        volume: config.volume !== undefined ? config.volume : this.masterVolume,
        loop: config.loop === true ? true : false, // Explicitly set to false unless true is specified
        format: ['ogg'], // Explicitly specify format
        onload: () => {
          resolve();
        },
        onloaderror: (_id, message) => {
          reject(new Error(`Failed to load sound: ${config.key} - ${message}`));
        }
      });

      this.sounds.set(config.key, sound);
    });
  }

  /**
   * Play a sound
   * @param key Sound identifier key
   * @param volume Optional volume override (0.0 to 1.0)
   * @returns Sound ID that can be used to control the specific sound instance
   */
  public play(key: string, volume?: number): number | null {
    if (this.muted) return null;

    const sound = this.sounds.get(key);
    if (!sound) {
      return null;
    }

    // Apply volume override if provided
    if (volume !== undefined) {
      sound.volume(volume);
    }

    // Play and return the sound ID
    return sound.play();
  }

  /**
   * Stop a specific sound instance
   * @param key Sound identifier key
   * @param id Optional sound ID to stop a specific instance
   */
  public stop(key: string, id?: number): void {
    const sound = this.sounds.get(key);
    if (!sound) return;

    if (id !== undefined) {
      sound.stop(id);
    } else {
      sound.stop();
    }
  }

  /**
   * Stop all sounds
   */
  public stopAll(): void {
    this.sounds.forEach(sound => {
      sound.stop();
    });
  }

  /**
   * Set mute state
   * @param muted Whether sounds should be muted
   */
  public setMuted(muted: boolean): void {
    this.muted = muted;
    
    // Apply mute state to all sounds
    Howler.mute(muted);
  }

  /**
   * Set master volume
   * @param volume Volume level (0.0 to 1.0)
   */
  public setVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    
    // Apply volume to all sounds
    Howler.volume(this.masterVolume);
  }

  /**
   * Check if a sound is loaded
   * @param key Sound identifier key
   */
  public hasSound(key: string): boolean {
    return this.sounds.has(key);
  }

  /**
   * Preload all game sounds
   */
  public async preloadSounds(): Promise<void> {
    // Define the sounds to load - all with loop explicitly set to false
    const soundsToLoad: SoundConfig[] = [
      // Player laser sounds - using laserSmall files for player shooting
      { key: SoundType.PLAYER_SHOOT, path: 'assets/audio/laserSmall_002.ogg', volume: 0.5, loop: false },
      
      // Enemy laser sounds - using laserLarge files for enemy shooting
      { key: SoundType.ENEMY_SHOOT, path: 'assets/audio/laserLarge_000.ogg', volume: 0.4, loop: false },
      
      // Small explosion for projectile impacts - using impactMetal
      { key: SoundType.EXPLOSION_SMALL, path: 'assets/audio/impactMetal_003.ogg', volume: 0.6, loop: false },
      
      // Large explosion for ship destruction - using explosionCrunch
      { key: SoundType.EXPLOSION_LARGE, path: 'assets/audio/explosionCrunch_001.ogg', volume: 0.7, loop: false },
      
      // Player damage sound - using forceField
      { key: SoundType.PLAYER_DAMAGE, path: 'assets/audio/forceField_000.ogg', volume: 0.6, loop: false },
      
      // Game over sound - using low frequency explosion
      { key: SoundType.GAME_OVER, path: 'assets/audio/lowFrequency_explosion_000.ogg', volume: 0.8, loop: false },
      
      // UI select sound - using computerNoise
      { key: SoundType.UI_SELECT, path: 'assets/audio/computerNoise_002.ogg', volume: 0.5, loop: false },
      
      // Shield activation sound - using powerUp
      { key: SoundType.SHIELD_ACTIVATE, path: 'assets/audio/powerUp_001.ogg', volume: 0.6, loop: false }
    ];

    try {
      console.log('Starting to load sound assets...');
      
      // Load all sounds in parallel
      const loadPromises = soundsToLoad.map(sound => 
        this.loadSound(sound)
          .then(() => {
            console.log(`Successfully loaded sound: ${sound.key}`);
            return Promise.resolve();
          })
          .catch(error => {
            console.warn(`Failed to load sound: ${sound.key} - ${error.message}`);
            // Continue loading other sounds even if one fails
            return Promise.resolve();
          })
      );

      await Promise.all(loadPromises);
      console.log('All sounds loaded successfully or handled gracefully');
    } catch (error) {
      console.error('Error during sound preloading:', error);
    }
  }
} 