/**
 * Interface for a state in the state machine
 */
export interface State {
  /**
   * Name of the state
   */
  name: string;
  
  /**
   * Called when entering the state
   * @param owner The object that owns this state
   */
  enter(owner: StateMachine): void;
  
  /**
   * Called when updating the state
   * @param owner The object that owns this state
   * @param deltaTime The time since the last update
   */
  update(owner: StateMachine, deltaTime: number): void;
  
  /**
   * Called when exiting the state
   * @param owner The object that owns this state
   */
  exit(owner: StateMachine): void;
}

/**
 * State machine class for managing entity behaviors
 */
export class StateMachine {
  /**
   * Current state
   */
  private currentState: State | null = null;
  
  /**
   * States in the state machine
   */
  private states: Map<string, State> = new Map();
  
  /**
   * Owner of the state machine
   */
  private owner: unknown;
  
  /**
   * Constructor for the state machine
   * @param owner The object that owns this state machine
   */
  constructor(owner: unknown) {
    this.owner = owner;
  }
  
  /**
   * Add a state to the state machine
   * @param state The state to add
   */
  public addState(state: State): void {
    this.states.set(state.name, state);
  }
  
  /**
   * Set the current state
   * @param stateName The name of the state to set
   */
  public setState(stateName: string): void {
    if (!this.states.has(stateName)) {
      return;
    }
    
    // Exit the current state if there is one
    if (this.currentState) {
      this.currentState.exit(this);
    }
    
    // Set the new state
    this.currentState = this.states.get(stateName) as State;
    
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
  public getCurrentState(): State | null {
    return this.currentState;
  }
  
  /**
   * Get the owner of the state machine
   * @returns The owner
   */
  public getOwner(): unknown {
    return this.owner;
  }
} 