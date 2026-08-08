import Phaser from 'phaser';

import { BootScene } from '../scenes/BootScene';
import { MainScene } from '../scenes/MainScene';
import { GAME_HEIGHT, GAME_WIDTH, WORLD_GRAVITY_Y } from './constants';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#101827',
  scene: [BootScene, MainScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: WORLD_GRAVITY_Y },
      debug: false,
    },
  },
  input: {
    // Left/right + jump must be pressable simultaneously by separate touch fingers.
    activePointers: 3,
  },
};
