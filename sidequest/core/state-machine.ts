/**
 * Interface for a state in the state machine
 * T is the type of entity that owns this state
 */
export interface State<T> {
  /**
   * Name of the state
   */
  name: string;
  
  /**
   * Called when entering the state
   * @param owner The state machine that owns this state
   */
  enter(owner: StateMachine<T>): void;
  
  /**
   * Called when updating the state
   * @param owner The state machine that owns this state
   * @param deltaTime The time since the last update
   */
  update(owner: StateMachine<T>, deltaTime: number): void;
  
  /**
   * Called when exiting the state
   * @param owner The state machine that owns this state
   */
  exit(owner: StateMachine<T>): void;
}

/**
 * State machine class for managing entity behaviors
 * T is the type of entity that owns this state machine
 */
export class StateMachine<T> {
  /**
   * Current state
   */
  private currentState: State<T> | null = null;
  
  /**
   * States in the state machine
   */
  private states: Map<string, State<T>> = new Map();
  
  /**
   * Owner of the state machine
   */
  private owner: T;
  
  /**
   * Constructor for the state machine
   * @param owner The object that owns this state machine
   */
  constructor(owner: T) {
    this.owner = owner;
  }
  
  /**
   * Add a state to the state machine
   * @param state The state to add
   */
  public addState(state: State<T>): void {
    this.states.set(state.name, state);
  }
  
  /**
   * Set the current state
   * @param stateName The name of the state to set
   */
  public setState(stateName: string): void {
    if (!this.states.has(stateName)) {
      console.warn(`State '${stateName}' not found in state machine`);
      return;
    }
    
    // Exit the current state if there is one
    if (this.currentState) {
      this.currentState.exit(this);
    }
    
    // Set the new state
    this.currentState = this.states.get(stateName) as State<T>;
    
    // Enter the new state
    this.currentState.enter(this);
  }
  
  /**
   * Update the current state
   * @param deltaTime The time since the last update
   */
  public update(deltaTime: number): void {
    if (this.currentState) {
      this.currentState.update(this, deltaTime);
    }
  }
  
  /**
   * Get the current state
   * @returns The current state
   */
  public getCurrentState(): State<T> | null {
    return this.currentState;
  }
  
  /**
   * Get the current state name
   * @returns The current state name or null if no state is set
   */
  public getCurrentStateName(): string | null {
    return this.currentState ? this.currentState.name : null;
  }
  
  /**
   * Get the owner of the state machine
   * @returns The owner
   */
  public getOwner(): T {
    return this.owner;
  }
} 