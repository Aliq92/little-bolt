import Phaser from 'phaser';

import type { PlayerInputState } from '../../systems/InputController';

export const PLAYER_TEXTURE_KEY = 'little-bolt-player';
export const PLAYER_WIDTH = 40;
export const PLAYER_HEIGHT = 52;

// Shifted right of the suggested ~120 to clear the bottom-left touch controls
// (playtesting showed the default spawn overlapped the move buttons), and kept
// clear of the left platform's horizontal span so a straight-up jump from spawn
// never bonks Little Bolt's head on its underside.
export const PLAYER_SPAWN_X = 180;
export const PLAYER_SPAWN_Y = 430;

/** Horizontal move speed in logical px/s. */
const MOVE_SPEED = 220;
/** Upward impulse applied on jump, in logical px/s. */
const JUMP_VELOCITY = -440;

const BODY_COLOR = 0xf4c430;
const OUTLINE_COLOR = 0x1c2333;
const FACE_COLOR = 0x22e2f5;
const LEG_COLOR = 0x2b3346;
const CHEST_MARK_COLOR = 0x22e2f5;

/**
 * Draws Little Bolt onto a reusable generated texture. Safe to call more than
 * once — the texture is only generated the first time.
 */
export function generatePlayerTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(PLAYER_TEXTURE_KEY)) {
    return;
  }

  const graphics = scene.add.graphics();

  const bodyX = 4;
  const bodyY = 4;
  const bodyWidth = PLAYER_WIDTH - 8;
  const bodyHeight = 38;
  const bodyBottom = bodyY + bodyHeight;

  // Legs
  graphics.fillStyle(LEG_COLOR, 1);
  graphics.fillRect(9, bodyBottom, 8, PLAYER_HEIGHT - bodyBottom);
  graphics.fillRect(PLAYER_WIDTH - 17, bodyBottom, 8, PLAYER_HEIGHT - bodyBottom);

  // Body with dark outline
  graphics.fillStyle(BODY_COLOR, 1);
  graphics.fillRoundedRect(bodyX, bodyY, bodyWidth, bodyHeight, 8);
  graphics.lineStyle(3, OUTLINE_COLOR, 1);
  graphics.strokeRoundedRect(bodyX, bodyY, bodyWidth, bodyHeight, 8);

  // Face / eye light, offset toward the default-facing (right) side
  graphics.fillStyle(FACE_COLOR, 1);
  graphics.fillCircle(PLAYER_WIDTH - 14, 18, 5);

  // Small lightning-bolt chest mark
  graphics.fillStyle(CHEST_MARK_COLOR, 1);
  graphics.fillPoints(
    [
      { x: 22, y: 20 },
      { x: 15, y: 30 },
      { x: 19, y: 30 },
      { x: 14, y: 40 },
      { x: 23, y: 27 },
      { x: 18, y: 27 },
    ],
    true,
  );

  graphics.generateTexture(PLAYER_TEXTURE_KEY, PLAYER_WIDTH, PLAYER_HEIGHT);
  graphics.destroy();
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  public constructor(scene: Phaser.Scene) {
    super(scene, PLAYER_SPAWN_X, PLAYER_SPAWN_Y, PLAYER_TEXTURE_KEY);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
  }

  /** Applies one frame of movement/jump input. Jump only fires while grounded. */
  public applyInput(input: PlayerInputState): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (input.left && !input.right) {
      this.setVelocityX(-MOVE_SPEED);
      this.setFlipX(true);
    } else if (input.right && !input.left) {
      this.setVelocityX(MOVE_SPEED);
      this.setFlipX(false);
    } else {
      this.setVelocityX(0);
    }

    if (input.jumpPressed && body.onFloor()) {
      this.setVelocityY(JUMP_VELOCITY);
    }
  }

  public resetToSpawn(): void {
    this.setPosition(PLAYER_SPAWN_X, PLAYER_SPAWN_Y);
    this.setVelocity(0, 0);
  }
}
