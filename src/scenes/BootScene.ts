import Phaser from 'phaser';

import { generatePlayerTexture } from '../entities/player/Player';

export class BootScene extends Phaser.Scene {
  public constructor() {
    super('BootScene');
  }

  public create(): void {
    generatePlayerTexture(this);
    this.scene.start('MainScene');
  }
}
