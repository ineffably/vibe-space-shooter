/**
 * Input manager class for handling keyboard input
 */
export class InputManager {
  private static instance: InputManager;

  /**
   * Keys currently pressed
   */
  private keysPressed: Set<string> = new Set();

  /**
   * Constructor
   */
  private constructor() {
    this.setupEventListeners();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): InputManager {
    if (!InputManager.instance) {
      InputManager.instance = new InputManager();
    }
    return InputManager.instance;
  }

  /**
   * Set up event listeners for keyboard input
   */
  private setupEventListeners(): void {
    // Keydown event listener
    window.addEventListener('keydown', (event: KeyboardEvent) => {
      this.keysPressed.add(event.key);
    });

    // Keyup event listener
    window.addEventListener('keyup', (event: KeyboardEvent) => {
      this.keysPressed.delete(event.key);
    });

    // Blur event listener to clear keys when window loses focus
    window.addEventListener('blur', () => {
      this.keysPressed.clear();
    });
  }

  /**
   * Check if a key is pressed
   * @param key The key to check
   */
  public isKeyPressed(key: string): boolean {
    return this.keysPressed.has(key);
  }

  /**
   * Check if arrow up is pressed
   */
  public isArrowUpPressed(): boolean {
    return this.isKeyPressed('ArrowUp');
  }

  /**
   * Check if arrow down is pressed
   */
  public isArrowDownPressed(): boolean {
    return this.isKeyPressed('ArrowDown');
  }

  /**
   * Check if arrow left is pressed
   */
  public isArrowLeftPressed(): boolean {
    return this.isKeyPressed('ArrowLeft');
  }

  /**
   * Check if arrow right is pressed
   */
  public isArrowRightPressed(): boolean {
    return this.isKeyPressed('ArrowRight');
  }

  /**
   * Check if space is pressed
   */
  public isSpacePressed(): boolean {
    return this.isKeyPressed(' ');
  }
} 