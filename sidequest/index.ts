// Core
export { Game, type GameConfig } from './core/game';
export { Scene } from './core/scene';
export { SceneManager } from './core/scene-manager';
export { StateMachine, type State } from './core/state-machine';

// Entities
export { Entity, type Vector2 } from './entities/entity';

// Managers
export { AssetManager, type AssetManifest, type SpritesheetConfig, type TextureConfig, type SoundConfig, AssetType } from './managers/asset-manager';
export { InputManager, type KeyState, type MouseState } from './managers/input-manager';

// Utils
export { ObjectPool, type Poolable } from './utils/object-pool'; 