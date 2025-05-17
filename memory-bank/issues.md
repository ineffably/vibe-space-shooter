# Issues Tracker

This document tracks bugs, issues, and feature requests for the Pixi Space Shooter game. Each issue has a unique ID, status, and detailed information to help with tracking and resolution.

## Issue Structure

- **ID**: ISSUE-[number] (sequential number)
- **Status**: OPEN, IN PROGRESS, RESOLVED, or WONTFIX
- **Type**: Bug, Enhancement, Feature
- **Priority**: High, Medium, Low
- **Created**: Date when issue was reported
- **Updated**: Date when issue was last updated
- **Description**: Detailed explanation of the issue
- **Reproduction Steps**: Steps to reproduce the issue (if applicable)
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Possible Causes**: Any known or suspected causes
- **Proposed Solution**: Ideas for how to fix the issue
- **Related Code**: Relevant code files or components
- **Notes**: Additional information, updates, or context

## Active Issues

### ISSUE-001

- **ID**: ISSUE-001
- **Status**: RESOLVED
- **Type**: Bug
- **Priority**: High
- **Created**: 2023-07-22
- **Updated**: 2023-07-23
- **Description**: Player ship respawn time is almost instant instead of the expected delay
- **Reproduction Steps**:
  1. Start the game
  2. Allow an enemy to destroy the player ship
  3. Observe that the player respawns almost immediately
- **Expected Behavior**: Player ship should remain gone for 2 seconds before respawning with the flashing invulnerability effect
- **Actual Behavior**: Player ship respawned almost instantly after being destroyed
- **Possible Causes**:
  - The state machine may not be handling the destroyed state timing correctly
  - Delta time calculations may be incorrect in the destroyed state
  - The respawn timer logic may have an issue
  - The transition from destroyed to invulnerable state may be bypassing the delay
- **Proposed Solution**: 
  - Verify that the PlayerDestroyedState is properly tracking time
  - Ensure entity update methods are called even when the entity is inactive
  - Add logging to track the destroy timer progression
  - Check if the time scale interpretation is correct
- **Related Code**: 
  - src/entities/player-ship.ts (PlayerDestroyedState class)
  - src/entities/entity.ts (update method)
  - src/scenes/game-scene.ts (collision handling)
- **Notes**: We've implemented the respawn mechanism with a consistent 2-second delay and invulnerability period with visual flashing
- **Fix Implemented**: 
  - Modified the Entity.update method to always update the state machine, even when the entity is inactive
  - Updated the PlayerShip.update method to use super.update() to avoid duplicate state machine updates
  - Found and fixed a critical time scale misunderstanding: in PIXI.js, deltaTime values are in frames (at ~1 per frame at 60fps) rather than actual seconds
  - Updated all timer values to use frame-based counting (120 frames = 2 seconds at 60fps)
  - Implemented consistent time units across all state timers (respawn, invulnerability, flash intervals, damage)
  - Fixed by changing PlayerDestroyedState timing from 2 (seconds) to 120 (frames) and similarly updating related timers 

### ISSUE-002

- **ID**: ISSUE-002
- **Status**: RESOLVED
- **Type**: Bug
- **Priority**: High
- **Created**: 2023-07-23
- **Updated**: 2023-07-23
- **Description**: Sound system not working properly in the game
- **Reproduction Steps**:
  1. Start the game
  2. Observe that sound effects are not playing or playing inconsistently
- **Expected Behavior**: All sound effects should play reliably when triggered
- **Actual Behavior**: Sound effects were inconsistent or silent
- **Possible Causes**:
  - HTML5 Audio API limitations
  - Browser restrictions on audio playback
  - Issues with audio element cloning
  - Potential race conditions in sound loading
- **Related Code**: 
  - src/library/sound-manager.ts
  - src/library/asset-loader.ts
- **Fix Implemented**: 
  - Replaced HTML5 Audio API with Howler.js sound library
  - Implemented improved sound manager with better error handling
  - Added volume control per sound type
  - Simplified sound loading and management
  - Removed console logging to reduce noise
  - Added proper sound stopping and control capabilities
  - Created more robust sound preloading 