import Phaser from 'phaser';

export const HAZARD_TEXTURE_KEY = 'little-bolt-live-wire';
export const HAZARD_WIDTH = 34;
export const HAZARD_HEIGHT = 10;

const CABLE_COLOR = 0x1c2333;
const CABLE_STROKE_COLOR = 0x4b5875;
const EXPOSED_WIRE_COLOR = 0xf4c430;

const SPARK_COLOR = 0x22e2f5;
const SPARK_RADIUS = 2.5;
const SPARK_FLICKER_DURATION_MS = 140;
const SPARK_STAGGER_MS = 110;

const PULSE_COLOR = 0x22e2f5;
const PULSE_ALPHA_MIN = 0.06;
const PULSE_ALPHA_MAX = 0.22;
const PULSE_DURATION_MS = 750;

interface SparkOffset {
  dx: number;
  dy: number;
}

const SPARK_OFFSETS: SparkOffset[] = [
  { dx: -12, dy: -6 },
  { dx: 4, dy: -8 },
  { dx: 14, dy: -5 },
];

/**
 * Draws the damaged cable onto a reusable generated texture. Follows the same
 * pattern as Player's generatePlayerTexture — safe to call more than once, the
 * texture is only generated the first time.
 */
export function generateLiveWireTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(HAZARD_TEXTURE_KEY)) {
    return;
  }

  const graphics = scene.add.graphics();

  // Cable body
  graphics.fillStyle(CABLE_COLOR, 1);
  graphics.fillRoundedRect(0, 2, HAZARD_WIDTH, HAZARD_HEIGHT - 4, 5);
  graphics.lineStyle(2, CABLE_STROKE_COLOR, 1);
  graphics.strokeRoundedRect(0, 2, HAZARD_WIDTH, HAZARD_HEIGHT - 4, 5);

  // Frayed, exposed section baring the wire in the middle
  const midX = HAZARD_WIDTH / 2;
  graphics.fillStyle(EXPOSED_WIRE_COLOR, 1);
  graphics.fillTriangle(midX - 12, 2, midX - 2, 2, midX - 6, HAZARD_HEIGHT - 2);
  graphics.fillTriangle(midX + 2, 2, midX + 12, 2, midX + 7, HAZARD_HEIGHT - 2);

  graphics.generateTexture(HAZARD_TEXTURE_KEY, HAZARD_WIDTH, HAZARD_HEIGHT);
  graphics.destroy();
}

/**
 * A static, non-moving hazard marker with flickering cyan spark dots and a
 * subtle pulsing halo for visual identity. Contact detection is driven entirely
 * by HazardSystem's Arcade Physics overlap against the player — this class
 * owns only its own visuals.
 */
export class LiveWireHazard extends Phaser.Physics.Arcade.Sprite {
  private readonly pulse: Phaser.GameObjects.Ellipse;
  private readonly pulseTween: Phaser.Tweens.Tween;
  private readonly sparks: Phaser.GameObjects.Arc[];
  private readonly sparkTweens: Phaser.Tweens.Tween[];

  public constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, HAZARD_TEXTURE_KEY);

    this.pulse = scene.add.ellipse(x, y, HAZARD_WIDTH + 24, HAZARD_HEIGHT + 18, PULSE_COLOR, PULSE_ALPHA_MAX);

    this.sparks = SPARK_OFFSETS.map((offset) =>
      scene.add.circle(x + offset.dx, y + offset.dy, SPARK_RADIUS, SPARK_COLOR, 1),
    );

    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    this.pulseTween = scene.tweens.add({
      targets: this.pulse,
      scale: { from: 1, to: 1.2 },
      alpha: { from: PULSE_ALPHA_MAX, to: PULSE_ALPHA_MIN },
      duration: PULSE_DURATION_MS,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    this.sparkTweens = this.sparks.map((spark, index) =>
      scene.tweens.add({
        targets: spark,
        alpha: { from: 1, to: 0.1 },
        duration: SPARK_FLICKER_DURATION_MS,
        delay: index * SPARK_STAGGER_MS,
        ease: 'Linear',
        yoyo: true,
        repeat: -1,
      }),
    );
  }

  public destroy(fromScene?: boolean): void {
    this.pulseTween.stop();
    this.pulse.destroy();
    for (const tween of this.sparkTweens) {
      tween.stop();
    }
    for (const spark of this.sparks) {
      spark.destroy();
    }
    super.destroy(fromScene);
  }
}
