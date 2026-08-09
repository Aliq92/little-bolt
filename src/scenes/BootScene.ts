import Phaser from 'phaser';

import { generateChargingStationTexture } from '../entities/objects/ChargingStation';
import { generateLiveWireTexture } from '../entities/objects/LiveWireHazard';
import { generatePlayerTexture } from '../entities/player/Player';

export class BootScene extends Phaser.Scene {
  public constructor() {
    super('BootScene');
  }

  public create(): void {
    generatePlayerTexture(this);
    generateChargingStationTexture(this);
    generateLiveWireTexture(this);
    this.scene.start('MainScene');
  }
}
