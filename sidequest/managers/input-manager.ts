/**
 * Key state interface
 */
export interface KeyState {
  pressed: boolean;
  justPressed: boolean;
  justReleased: boolean;
}

/**
 * Mouse state interface
 */
export interface MouseState {
  x: number;
  y: number;
  pressed: boolean;
  justPressed: boolean;
  justReleased: boolean;
}

/**
 * Input manager class for handling keyboard and mouse input
 */
export class InputManager {
  private static instance: InputManager;

  /**
   * Key states
   */
  private keyStates: Map<string, KeyState> = new Map();
  
  /**
   * Keys that were just pressed this frame
   */
  private keysJustPressed: Set<string> = new Set();
  
  /**
   * Keys that were just released this frame
   */
  private keysJustReleased: Set<string> = new Set();
  
  /**
   * Mouse state
   */
  private mouseState: MouseState = {
    x: 0,
    y: 0,
    pressed: false,
    justPressed: false,
    justReleased: false
  };
  
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
   * Set up event listeners for keyboard and mouse input
   */
  private setupEventListeners(): void {
    // Keydown event listener
    window.addEventListener('keydown', (event: KeyboardEvent) => {
      // Skip if key is already pressed
      if (this.isKeyPressed(event.key)) {
        return;
      }
      
      // Initialize key state if it doesn't exist
      if (!this.keyStates.has(event.key)) {
        this.keyStates.set(event.key, {
          pressed: false,
          justPressed: false,
          justReleased: false
        });
      }
      
      // Mark key as pressed and just pressed
      const keyState = this.keyStates.get(event.key) as KeyState;
      keyState.pressed = true;
      keyState.justPressed = true;
      this.keysJustPressed.add(event.key);
    });

    // Keyup event listener
    window.addEventListener('keyup', (event: KeyboardEvent) => {
      // Initialize key state if it doesn't exist
      if (!this.keyStates.has(event.key)) {
        this.keyStates.set(event.key, {
          pressed: false,
          justPressed: false,
          justReleased: false
        });
      }
      
      // Mark key as released and just released
      const keyState = this.keyStates.get(event.key) as KeyState;
      keyState.pressed = false;
      keyState.justPressed = false;
      keyState.justReleased = true;
      this.keysJustReleased.add(event.key);
    });

    // Blur event listener to clear keys when window loses focus
    window.addEventListener('blur', () => {
      this.resetAllKeys();
    });
    
    // Mouse move event listener
    window.addEventListener('mousemove', (event: MouseEvent) => {
      this.mouseState.x = event.clientX;
      this.mouseState.y = event.clientY;
    });
    
    // Mouse down event listener
    window.addEventListener('mousedown', (_event: MouseEvent) => {
      this.mouseState.pressed = true;
      this.mouseState.justPressed = true;
    });
    
    // Mouse up event listener
    window.addEventListener('mouseup', (_event: MouseEvent) => {
      this.mouseState.pressed = false;
      this.mouseState.justPressed = false;
      this.mouseState.justReleased = true;
    });
  }
  
  /**
   * Update input state (call this once per frame)
   */
  public update(): void {
    // Clear just pressed and just released flags
    for (const key of this.keysJustPressed) {
      const keyState = this.keyStates.get(key);
      if (keyState) {
        keyState.justPressed = false;
      }
    }
    this.keysJustPressed.clear();
    
    for (const key of this.keysJustReleased) {
      const keyState = this.keyStates.get(key);
      if (keyState) {
        keyState.justReleased = false;
      }
    }
    this.keysJustReleased.clear();
    
    // Clear mouse just pressed and just released flags
    this.mouseState.justPressed = false;
    this.mouseState.justReleased = false;
  }
  
  /**
   * Reset all key states
   */
  private resetAllKeys(): void {
    for (const [key, state] of this.keyStates.entries()) {
      if (state.pressed) {
        state.pressed = false;
        state.justPressed = false;
        state.justReleased = true;
        this.keysJustReleased.add(key);
      }
    }
    
    // Reset mouse state
    if (this.mouseState.pressed) {
      this.mouseState.pressed = false;
      this.mouseState.justPressed = false;
      this.mouseState.justReleased = true;
    }
  }

  /**
   * Check if a key is pressed
   * @param key The key to check
   */
  public isKeyPressed(key: string): boolean {
    const keyState = this.keyStates.get(key);
    return keyState ? keyState.pressed : false;
  }
  
  /**
   * Check if a key was just pressed this frame
   * @param key The key to check
   */
  public isKeyJustPressed(key: string): boolean {
    const keyState = this.keyStates.get(key);
    return keyState ? keyState.justPressed : false;
  }
  
  /**
   * Check if a key was just released this frame
   * @param key The key to check
   */
  public isKeyJustReleased(key: string): boolean {
    const keyState = this.keyStates.get(key);
    return keyState ? keyState.justReleased : false;
  }

  /**
   * Check if the mouse button is pressed
   */
  public isMousePressed(): boolean {
    return this.mouseState.pressed;
  }
  
  /**
   * Check if the mouse button was just pressed this frame
   */
  public isMouseJustPressed(): boolean {
    return this.mouseState.justPressed;
  }
  
  /**
   * Check if the mouse button was just released this frame
   */
  public isMouseJustReleased(): boolean {
    return this.mouseState.justReleased;
  }
  
  /**
   * Get the mouse position
   */
  public getMousePosition(): { x: number, y: number } {
    return { x: this.mouseState.x, y: this.mouseState.y };
  }
  
  // Convenience methods for common keys
  
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
  
  /**
   * Check if enter is pressed
   */
  public isEnterPressed(): boolean {
    return this.isKeyPressed('Enter');
  }
  
  /**
   * Check if escape is pressed
   */
  public isEscapePressed(): boolean {
    return this.isKeyPressed('Escape');
  }
} 