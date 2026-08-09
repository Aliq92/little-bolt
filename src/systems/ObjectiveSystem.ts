import Phaser from 'phaser';

import type { ChargingStation } from '../entities/objects/ChargingStation';
import type { Player } from '../entities/player/Player';

export interface ObjectiveSystemOptions {
  scene: Phaser.Scene;
  player: Player;
  station: ChargingStation;
  onComplete: () => void;
}

const OBJECTIVE_TEXT = 'Objective: Reach the charging station.';
const LABEL_COLOR = '#9fd8e6';
const LABEL_DEPTH = 500;

/**
 * Owns the objective HUD label and the player-vs-station overlap trigger.
 * Fires onComplete exactly once per scene lifetime — MainScene decides what
 * "complete" means for physics, input, and UI.
 */
export class ObjectiveSystem {
  private readonly label: Phaser.GameObjects.Text;
  private readonly overlap: Phaser.Physics.Arcade.Collider;
  private readonly onComplete: () => void;
  private completed = false;

  public constructor(options: ObjectiveSystemOptions) {
    this.onComplete = options.onComplete;
    this.label = this.createLabel(options.scene);
    this.overlap = options.scene.physics.add.overlap(
      options.player,
      options.station,
      () => this.handleOverlap(),
      undefined,
      options.scene,
    );
  }

  public isCompleted(): boolean {
    return this.completed;
  }

  public destroy(): void {
    this.overlap.destroy();
    this.label.destroy();
  }

  private createLabel(scene: Phaser.Scene): Phaser.GameObjects.Text {
    const { width } = scene.cameras.main;
    return scene.add
      .text(width / 2, 14, OBJECTIVE_TEXT, {
        color: LABEL_COLOR,
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSize: '15px',
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(LABEL_DEPTH);
  }

  private handleOverlap(): void {
    if (this.completed) {
      return;
    }
    this.completed = true;
    this.onComplete();
  }
}
