import Phaser from 'phaser';

export const STATION_TEXTURE_KEY = 'little-bolt-charging-station';
export const STATION_WIDTH = 44;
export const STATION_HEIGHT = 60;

const HOUSING_COLOR = 0x2b3346;
const HOUSING_STROKE_COLOR = 0x4b5875;
const CONNECTOR_COLOR = 0xf4c430;
const CORE_GLOW_COLOR = 0x22e2f5;
const CORE_COLOR = 0xe8fbff;

const GLOW_HALO_COLOR = 0x22e2f5;
const GLOW_HALO_RADIUS = 26;
const GLOW_HALO_ALPHA_MIN = 0.12;
const GLOW_HALO_ALPHA_MAX = 0.4;
const GLOW_PULSE_DURATION_MS = 900;

/**
 * Draws the charging station onto a reusable generated texture. Follows the same
 * pattern as Player's generatePlayerTexture — safe to call more than once, the
 * texture is only generated the first time.
 */
export function generateChargingStationTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(STATION_TEXTURE_KEY)) {
    return;
  }

  const graphics = scene.add.graphics();

  // Housing
  graphics.fillStyle(HOUSING_COLOR, 1);
  graphics.fillRoundedRect(2, 10, STATION_WIDTH - 4, STATION_HEIGHT - 12, 6);
  graphics.lineStyle(3, HOUSING_STROKE_COLOR, 1);
  graphics.strokeRoundedRect(2, 10, STATION_WIDTH - 4, STATION_HEIGHT - 12, 6);

  // Connector prong on top
  graphics.fillStyle(CONNECTOR_COLOR, 1);
  graphics.fillRoundedRect(STATION_WIDTH / 2 - 4, 0, 8, 14, 2);

  // Glowing core
  graphics.fillStyle(CORE_GLOW_COLOR, 0.9);
  graphics.fillCircle(STATION_WIDTH / 2, STATION_HEIGHT / 2 + 6, 11);
  graphics.fillStyle(CORE_COLOR, 1);
  graphics.fillCircle(STATION_WIDTH / 2, STATION_HEIGHT / 2 + 6, 5);

  graphics.generateTexture(STATION_TEXTURE_KEY, STATION_WIDTH, STATION_HEIGHT);
  graphics.destroy();
}

/**
 * A static, non-moving objective marker with a pulsing glow halo for visual
 * identity. Reachability is driven entirely by ObjectiveSystem's Arcade Physics
 * overlap against the player — this class owns only its own visuals.
 */
export class ChargingStation extends Phaser.Physics.Arcade.Sprite {
  private readonly glow: Phaser.GameObjects.Arc;
  private readonly glowTween: Phaser.Tweens.Tween;

  public constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, STATION_TEXTURE_KEY);

    this.glow = scene.add.circle(x, y, GLOW_HALO_RADIUS, GLOW_HALO_COLOR, GLOW_HALO_ALPHA_MAX);

    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    this.glowTween = scene.tweens.add({
      targets: this.glow,
      scale: { from: 1, to: 1.3 },
      alpha: { from: GLOW_HALO_ALPHA_MAX, to: GLOW_HALO_ALPHA_MIN },
      duration: GLOW_PULSE_DURATION_MS,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  public destroy(fromScene?: boolean): void {
    this.glowTween.stop();
    this.glow.destroy();
    super.destroy(fromScene);
  }
}
