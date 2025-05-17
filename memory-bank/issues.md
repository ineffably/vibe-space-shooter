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
- **Status**: OPEN
- **Type**: Bug
- **Priority**: High
- **Created**: 2023-07-22
- **Updated**: 2023-07-22
- **Description**: Player ship respawn time is almost instant instead of the expected delay
- **Reproduction Steps**:
  1. Start the game
  2. Allow an enemy to destroy the player ship
  3. Observe that the player respawns almost immediately
- **Expected Behavior**: Player ship should remain gone for 2-4 seconds before respawning with the flashing invulnerability effect
- **Actual Behavior**: Player ship respawns almost instantly after being destroyed
- **Possible Causes**:
  - The state machine may not be handling the destroyed state timing correctly
  - Delta time calculations may be incorrect in the destroyed state
  - The respawn timer logic may have an issue
  - The transition from destroyed to invulnerable state may be bypassing the delay
- **Proposed Solution**: 
  - Verify that the PlayerDestroyedState is properly tracking time
  - Ensure entity update methods are called even when the entity is inactive
  - Add logging to track the destroy timer progression
  - Check if the random time generation between 3-6 seconds is working
- **Related Code**: 
  - src/entities/player-ship.ts (PlayerDestroyedState class)
  - src/entities/entity.ts (update method)
  - src/scenes/game-scene.ts (collision handling)
- **Notes**: We've implemented the respawn mechanism with random delay (3-6 seconds) and invulnerability period with visual flashing, but the delay doesn't seem to be working correctly 