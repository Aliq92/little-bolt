import Phaser from 'phaser';

import { GAME_HEIGHT, GAME_WIDTH } from '../config/constants';
import { Player } from '../entities/player/Player';
import type { DisplayState } from '../systems/MobileDisplayController';
import { MobileDisplayController } from '../systems/MobileDisplayController';
import { InputController } from '../systems/InputController';
import { MobilePlayOverlay } from '../ui/MobilePlayOverlay';

const VERSION_LABEL = 'Little Bolt v0.1.1';

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
  private displayController?: MobileDisplayController;
  private overlay?: MobilePlayOverlay;

  /** True once gameplay is allowed to run: immediately on desktop, after the play tap on touch devices. */
  private hasStarted = true;
  private isPausedForOrientation = false;

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
    this.setupMobileDisplay();

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

  /**
   * Sets up the touch-device play flow (start overlay, orientation pause, fullscreen
   * re-entry). Never lets a failure here block normal browser gameplay.
   */
  private setupMobileDisplay(): void {
    try {
      const container = document.getElementById('game');
      if (!container) {
        throw new Error('Game container element (#game) was not found.');
      }

      this.displayController = new MobileDisplayController({
        container,
        game: this.game,
        onChange: (state) => this.handleDisplayChange(state),
      });
      this.overlay = new MobilePlayOverlay({
        container,
        onPlayFullscreen: () => void this.handleStartTap(),
        onFullscreenReentry: () => void this.handleFullscreenReentry(),
      });

      const initialState = this.displayController.getState();
      if (initialState.isTouchDevice) {
        this.hasStarted = false;
        this.pauseForOrientation();
        this.overlay.showStartOverlay();
      }
    } catch (error) {
      console.error('Little Bolt: mobile display setup failed; falling back to normal browser gameplay.', error);
      this.displayController?.destroy();
      this.overlay?.destroy();
      this.displayController = undefined;
      this.overlay = undefined;
      if (this.isPausedForOrientation) {
        this.resumeFromOrientation();
      }
      this.hasStarted = true;
    }
  }

  /** Runs from the PLAY FULLSCREEN tap's own gesture — fullscreen/orientation lock must happen here. */
  private async handleStartTap(): Promise<void> {
    this.overlay?.hideStartOverlay();

    const fullscreenGranted = await this.displayController?.requestFullscreen();
    if (fullscreenGranted) {
      await this.displayController?.requestLandscapeLock();
    }

    this.hasStarted = true;
    if (this.displayController) {
      this.handleDisplayChange(this.displayController.getState());
    }
  }

  /** Runs from the fullscreen re-entry button's own tap gesture. */
  private async handleFullscreenReentry(): Promise<void> {
    await this.displayController?.requestFullscreen();
  }

  private handleDisplayChange(state: DisplayState): void {
    this.inputController.repositionControls();

    if (!this.hasStarted) {
      return;
    }

    const shouldPauseForOrientation = state.isTouchDevice && state.isPortrait;

    // pauseForOrientation()/resumeFromOrientation() are internally idempotent, so it's
    // safe to call them on every display change — this keeps overlay visibility and
    // pause state in sync even when the game started already paused for the start overlay.
    if (shouldPauseForOrientation) {
      this.pauseForOrientation();
      this.overlay?.showRotateOverlay();
    } else {
      this.overlay?.hideRotateOverlay();
      this.resumeFromOrientation();
    }

    const showReentry = state.isTouchDevice && !state.isFullscreen && !shouldPauseForOrientation;
    if (showReentry) {
      this.overlay?.showFullscreenReentry();
    } else {
      this.overlay?.hideFullscreenReentry();
    }
  }

  private pauseForOrientation(): void {
    if (this.isPausedForOrientation) {
      return;
    }
    this.isPausedForOrientation = true;
    this.physics.world.pause();
    this.inputController.setEnabled(false);
  }

  private resumeFromOrientation(): void {
    if (!this.isPausedForOrientation) {
      return;
    }
    this.isPausedForOrientation = false;
    this.physics.world.resume();
    this.inputController.setEnabled(true);
  }

  private handleShutdown(): void {
    this.inputController?.destroy();
    this.displayController?.destroy();
    this.overlay?.destroy();
  }
}
