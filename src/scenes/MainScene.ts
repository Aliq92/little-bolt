import Phaser from 'phaser';

import { GAME_HEIGHT, GAME_WIDTH } from '../config/constants';
import { Player } from '../entities/player/Player';
import { InputController } from '../systems/InputController';

const VERSION_LABEL = 'Little Bolt v0.1.0';

const BACKGROUND_COLOR = 0x101827;
const FLOOR_COLOR = 0x2b3346;
const PLATFORM_COLOR = 0x394463;
const SURFACE_STROKE_COLOR = 0x4b5875;

const FLOOR_HEIGHT = 40;
const FLOOR_Y = GAME_HEIGHT - FLOOR_HEIGHT / 2;

const PLATFORM_WIDTH = 160;
const PLATFORM_HEIGHT = 24;

interface PlatformSpec {
  x: number;
  y: number;
}

/**
 * Heights are tuned so every platform is reachable with the player's jump arc.
 * The left platform sits at x=280 rather than dead-center-left, keeping clear of
 * both the bottom-left touch controls and the spawn point's straight-up jump path.
 */
const PLATFORMS: PlatformSpec[] = [
  { x: 280, y: 432 }, // left-middle, low platform
  { x: 480, y: 352 }, // center, higher platform
  { x: 740, y: 452 }, // right platform
];

/** Extra invisible world space below the floor, so a fall-through has room to register. */
const WORLD_FALL_MARGIN = 200;
/** Y position past which Little Bolt is considered fallen and gets reset. */
const FALL_RESET_Y = GAME_HEIGHT + 80;

export class MainScene extends Phaser.Scene {
  private player!: Player;
  private inputController!: InputController;

  public constructor() {
    super('MainScene');
  }

  public create(): void {
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT + WORLD_FALL_MARGIN);
    this.physics.world.setBoundsCollision(true, true, true, false);

    this.createBackground();
    const surfaces = this.createPlayground();

    this.player = new Player(this);
    this.physics.add.collider(this.player, surfaces);

    this.inputController = new InputController(this);

    this.createVersionLabel();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.handleShutdown, this);
  }

  public update(): void {
    const inputState = this.inputController.getState();
    this.player.applyInput(inputState);

    if (this.player.y > FALL_RESET_Y) {
      this.player.resetToSpawn();
    }
  }

  private createBackground(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, BACKGROUND_COLOR);
  }

  private createPlayground(): Phaser.GameObjects.GameObject[] {
    const surfaces: Phaser.GameObjects.GameObject[] = [];

    const floor = this.add.rectangle(GAME_WIDTH / 2, FLOOR_Y, GAME_WIDTH, FLOOR_HEIGHT, FLOOR_COLOR);
    floor.setStrokeStyle(2, SURFACE_STROKE_COLOR, 1);
    this.physics.add.existing(floor, true);
    surfaces.push(floor);

    for (const spec of PLATFORMS) {
      const platform = this.add.rectangle(spec.x, spec.y, PLATFORM_WIDTH, PLATFORM_HEIGHT, PLATFORM_COLOR);
      platform.setStrokeStyle(2, SURFACE_STROKE_COLOR, 1);
      this.physics.add.existing(platform, true);
      surfaces.push(platform);
    }

    return surfaces;
  }

  private createVersionLabel(): void {
    this.add
      .text(16, 12, VERSION_LABEL, {
        color: '#6b7a99',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSize: '14px',
      })
      .setScrollFactor(0)
      .setDepth(500);
  }

  private handleShutdown(): void {
    this.inputController?.destroy();
  }
}
