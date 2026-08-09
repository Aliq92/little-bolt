import Phaser from 'phaser';

import type { LiveWireHazard } from '../entities/objects/LiveWireHazard';
import type { Player } from '../entities/player/Player';

export interface HazardSystemOptions {
  scene: Phaser.Scene;
  player: Player;
  hazard: LiveWireHazard;
  onHit: () => void;
}

/**
 * Owns the player-vs-hazard overlap trigger and a guard against duplicate hit
 * events while a hit is already being handled (e.g. the player still resting
 * on the hazard). MainScene decides what a hit means for physics, input, and
 * the recovery sequence, then calls resetGuard() once recovery has finished
 * so a fresh contact can trigger again.
 */
export class HazardSystem {
  private readonly overlap: Phaser.Physics.Arcade.Collider;
  private readonly onHit: () => void;
  private hitActive = false;

  public constructor(options: HazardSystemOptions) {
    this.onHit = options.onHit;
    this.overlap = options.scene.physics.add.overlap(
      options.player,
      options.hazard,
      () => this.handleOverlap(),
      undefined,
      options.scene,
    );
  }

  /** Call once recovery has finished so a fresh contact can trigger again. */
  public resetGuard(): void {
    this.hitActive = false;
  }

  public destroy(): void {
    this.overlap.destroy();
  }

  private handleOverlap(): void {
    if (this.hitActive) {
      return;
    }
    this.hitActive = true;
    this.onHit();
  }
}
