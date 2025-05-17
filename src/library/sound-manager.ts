import { Assets } from 'pixi.js';

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
  UI_SELECT = 'uiSelect'
}

/**
 * SoundManager class to load and play sound effects
 */
export class SoundManager {
  private static instance: SoundManager;
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private muted: boolean = false;
  private volume: number = 0.7; // Default volume

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {}

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
   * @param key Sound identifier key
   * @param path Path to the sound file
   * @returns Promise that resolves when the sound is loaded
   */
  public async loadSound(key: string, path: string): Promise<void> {
    try {
      // Create audio element
      const audio = new Audio(path);
      
      // Load the audio
      return new Promise<void>((resolve, reject) => {
        audio.addEventListener('canplaythrough', () => {
          this.sounds.set(key, audio);
          console.log(`Loaded sound: ${key}`);
          resolve();
        }, { once: true });
        
        audio.addEventListener('error', (error) => {
          console.error(`Failed to load sound: ${key}`, error);
          reject(error);
        }, { once: true });
        
        audio.load();
      });
    } catch (error) {
      console.error(`Failed to load sound: ${key}`, error);
      throw error;
    }
  }

  /**
   * Play a sound
   * @param key Sound identifier key
   * @param volume Optional volume override (0.0 to 1.0)
   */
  public play(key: string, volume?: number): void {
    if (this.muted) return;

    const sound = this.sounds.get(key);
    if (!sound) {
      console.warn(`Sound "${key}" not found`);
      return;
    }

    try {
      // Clone the audio element to allow multiple plays
      const soundInstance = sound.cloneNode() as HTMLAudioElement;
      soundInstance.volume = volume ?? this.volume;
      soundInstance.play().catch(error => {
        console.warn(`Error playing sound "${key}":`, error);
      });
    } catch (error) {
      console.warn(`Failed to play sound "${key}":`, error);
    }
  }

  /**
   * Toggle mute
   * @param muted Whether sounds should be muted
   */
  public setMuted(muted: boolean): void {
    this.muted = muted;
  }

  /**
   * Set global volume
   * @param volume Volume level (0.0 to 1.0)
   */
  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
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
    // Define the sounds to load
    const soundsToLoad = [
      { key: SoundType.PLAYER_SHOOT, path: 'assets/audio/laser-player.mp3' },
      { key: SoundType.ENEMY_SHOOT, path: 'assets/audio/laser-enemy.mp3' },
      { key: SoundType.EXPLOSION_SMALL, path: 'assets/audio/explosion-small.mp3' },
      { key: SoundType.EXPLOSION_LARGE, path: 'assets/audio/explosion-large.mp3' },
      { key: SoundType.PLAYER_DAMAGE, path: 'assets/audio/damage.mp3' },
      { key: SoundType.GAME_OVER, path: 'assets/audio/game-over.mp3' },
      { key: SoundType.UI_SELECT, path: 'assets/audio/ui-select.mp3' }
    ];

    try {
      // Load all sounds in parallel
      const loadPromises = soundsToLoad.map(sound => 
        this.loadSound(sound.key, sound.path)
          .catch(error => {
            console.error(`Failed to preload sound: ${sound.key}`, error);
            // Continue loading other sounds even if one fails
            return Promise.resolve();
          })
      );

      await Promise.all(loadPromises);
      console.log('All sounds preloaded');
    } catch (error) {
      console.error('Error preloading sounds:', error);
    }
  }
} 