import Phaser from 'phaser';

import { GAME_HEIGHT, GAME_WIDTH } from '../config/constants';
import { ChargingStation, STATION_HEIGHT } from '../entities/objects/ChargingStation';
import { HAZARD_HEIGHT, LiveWireHazard } from '../entities/objects/LiveWireHazard';
import { Player } from '../entities/player/Player';
import type { DisplayState } from '../systems/MobileDisplayController';
import { MobileDisplayController } from '../systems/MobileDisplayController';
import { HazardSystem } from '../systems/HazardSystem';
import { InputController } from '../systems/InputController';
import { ObjectiveSystem } from '../systems/ObjectiveSystem';
import { CompletionOverlay } from '../ui/CompletionOverlay';
import { MobilePlayOverlay } from '../ui/MobilePlayOverlay';

const VERSION_LABEL = 'Little Bolt v0.3.0';

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
  { x: 740, y: 452 }, // right platform — the objective's destination
];

/** Extra invisible world space below the floor, so a fall-through has room to register. */
const WORLD_FALL_MARGIN = 200;
/** Y position past which Little Bolt is considered fallen and gets reset. */
const FALL_RESET_Y = GAME_HEIGHT + 80;

/** The charging station sits centered on top of the rightmost (final) platform. */
const STATION_PLATFORM = PLATFORMS[2];
const STATION_X = STATION_PLATFORM.x;
const STATION_Y = STATION_PLATFORM.y - PLATFORM_HEIGHT / 2 - STATION_HEIGHT / 2;

/**
 * The live wire sits flush on the floor in the open gap between the second and
 * third platforms (x 400–560 and 660–820) — clear of the spawn area, clear of
 * the station, and short enough to clear with the standard jump from either side.
 */
const HAZARD_X = 600;
const HAZARD_Y = FLOOR_Y - FLOOR_HEIGHT / 2 - HAZARD_HEIGHT / 2;

/** How long the player is invulnerable/frozen after touching the live wire. */
const HAZARD_RECOVERY_DURATION_MS = 500;
const HAZARD_SHAKE_DURATION_MS = 150;
const HAZARD_SHAKE_INTENSITY = 0.006;
const HAZARD_FLASH_DURATION_MS = 150;
const HAZARD_FLICKER_STEP_MS = 60;
const HAZARD_FLICKER_REPEATS = 3;

export class MainScene extends Phaser.Scene {
  private player!: Player;
  private station!: ChargingStation;
  private hazard!: LiveWireHazard;
  private inputController!: InputController;
  private objectiveSystem!: ObjectiveSystem;
  private hazardSystem!: HazardSystem;
  private displayController?: MobileDisplayController;
  private overlay?: MobilePlayOverlay;
  private completionOverlay?: CompletionOverlay;
  private hazardRecoveryTimer?: Phaser.Time.TimerEvent;

  /** True once gameplay is allowed to run: immediately on desktop, after the play tap on touch devices. */
  private hasStarted = true;
  /** True while physics/input are suspended, for any reason (orientation, objective, hazard recovery). */
  private isSuspended = false;
  /** Tracks the touch-device portrait-orientation condition independently of the other suspension reasons. */
  private isPortraitBlocked = false;
  private objectiveCompleted = false;
  private hazardRecoveryActive = false;

  public constructor() {
    super('MainScene');
  }

  public create(): void {
    this.hasStarted = true;
    this.isSuspended = false;
    this.isPortraitBlocked = false;
    this.objectiveCompleted = false;
    this.hazardRecoveryActive = false;
    this.hazardRecoveryTimer = undefined;

    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT + WORLD_FALL_MARGIN);
    this.physics.world.setBoundsCollision(true, true, true, false);

    this.createBackground();
    const surfaces = this.createPlayground();

    this.player = new Player(this);
    this.physics.add.collider(this.player, surfaces);

    this.hazard = new LiveWireHazard(this, HAZARD_X, HAZARD_Y);
    this.station = new ChargingStation(this, STATION_X, STATION_Y);

    this.inputController = new InputController(this);

    this.createVersionLabel();

    const container = document.getElementById('game');
    this.setupObjective(container);
    this.setupHazard();
    this.setupMobileDisplay(container);

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

  /** Wires the objective label, the player/station overlap trigger, and the completion overlay. */
  private setupObjective(container: HTMLElement | null): void {
    this.objectiveSystem = new ObjectiveSystem({
      scene: this,
      player: this.player,
      station: this.station,
      onComplete: () => this.handleObjectiveComplete(),
    });

    try {
      if (!container) {
        throw new Error('Game container element (#game) was not found.');
      }
      this.completionOverlay = new CompletionOverlay({
        container,
        onPlayAgain: () => this.handlePlayAgain(),
      });
    } catch (error) {
      console.error('Little Bolt: completion overlay setup failed.', error);
      this.completionOverlay = undefined;
    }
  }

  private handleObjectiveComplete(): void {
    this.objectiveCompleted = true;
    this.recomputeSuspension();
    this.completionOverlay?.show();
  }

  /** Runs from the PLAY AGAIN tap — a clean scene restart resets player, hazard, station, controls, physics, and objective state together. */
  private handlePlayAgain(): void {
    this.completionOverlay?.hide();
    this.scene.restart();
  }

  /** Wires the player/hazard overlap trigger that drives the recovery sequence. */
  private setupHazard(): void {
    this.hazardSystem = new HazardSystem({
      scene: this,
      player: this.player,
      hazard: this.hazard,
      onHit: () => this.handleHazardContact(),
    });
  }

  /** Runs once per hazard contact — HazardSystem guarantees no duplicate calls while recovery is active. */
  private handleHazardContact(): void {
    this.hazardRecoveryActive = true;
    this.recomputeSuspension();

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    this.player.setVelocity(0, 0);
    body.setAcceleration(0, 0);

    this.playHazardFlicker();
    this.cameras.main.shake(HAZARD_SHAKE_DURATION_MS, HAZARD_SHAKE_INTENSITY);
    this.cameras.main.flash(HAZARD_FLASH_DURATION_MS, 34, 226, 245);

    this.hazardRecoveryTimer = this.time.delayedCall(
      HAZARD_RECOVERY_DURATION_MS,
      () => this.endHazardRecovery(),
      undefined,
      this,
    );
  }

  private playHazardFlicker(): void {
    this.tweens.killTweensOf(this.player);
    this.player.setAlpha(1);
    this.tweens.add({
      targets: this.player,
      alpha: { from: 1, to: 0.15 },
      duration: HAZARD_FLICKER_STEP_MS,
      ease: 'Linear',
      yoyo: true,
      repeat: HAZARD_FLICKER_REPEATS,
    });
  }

  /** Fires after the recovery delay — repositions the player, then only resumes if nothing else still requires suspension. */
  private endHazardRecovery(): void {
    this.hazardRecoveryTimer = undefined;

    this.player.resetToSpawn();
    this.tweens.killTweensOf(this.player);
    this.player.setAlpha(1);

    this.hazardSystem.resetGuard();
    this.hazardRecoveryActive = false;
    this.recomputeSuspension();
  }

  /**
   * Sets up the touch-device play flow (start overlay, orientation pause, fullscreen
   * re-entry). Never lets a failure here block normal browser gameplay.
   */
  private setupMobileDisplay(container: HTMLElement | null): void {
    try {
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
        this.recomputeSuspension();
        this.overlay.showStartOverlay();
      }
    } catch (error) {
      console.error('Little Bolt: mobile display setup failed; falling back to normal browser gameplay.', error);
      this.displayController?.destroy();
      this.overlay?.destroy();
      this.displayController = undefined;
      this.overlay = undefined;
      this.isPortraitBlocked = false;
      this.hasStarted = true;
      this.recomputeSuspension();
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
    } else {
      this.recomputeSuspension();
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
    this.isPortraitBlocked = shouldPauseForOrientation;

    // The portrait guard stays authoritative over every other suspension reason: physics/input
    // remain suspended regardless, and the rotate overlay renders above the completion overlay
    // (see .lb-rotate-overlay's z-index) so landscape always reveals a valid completion or
    // recovery state once it's safe to.
    this.recomputeSuspension();

    if (shouldPauseForOrientation) {
      this.overlay?.showRotateOverlay();
    } else {
      this.overlay?.hideRotateOverlay();
    }

    const showReentry = state.isTouchDevice && !state.isFullscreen && !shouldPauseForOrientation;
    if (showReentry) {
      this.overlay?.showFullscreenReentry();
    } else {
      this.overlay?.hideFullscreenReentry();
    }
  }

  /**
   * Single source of truth for every reason gameplay might be suspended: not started yet,
   * blocked by portrait orientation, the objective is complete, or hazard recovery is active.
   * Input/movement are only ever enabled when none of these are true.
   */
  private recomputeSuspension(): void {
    const shouldSuspend =
      !this.hasStarted || this.isPortraitBlocked || this.objectiveCompleted || this.hazardRecoveryActive;
    this.applySuspendedState(shouldSuspend);
  }

  /** Idempotent chokepoint for actually pausing/resuming physics + input. */
  private applySuspendedState(shouldSuspend: boolean): void {
    if (shouldSuspend === this.isSuspended) {
      return;
    }
    this.isSuspended = shouldSuspend;
    if (shouldSuspend) {
      this.physics.world.pause();
      this.inputController.setEnabled(false);
    } else {
      this.physics.world.resume();
      this.inputController.setEnabled(true);
    }
  }

  private handleShutdown(): void {
    this.hazardRecoveryTimer?.remove();
    this.hazardSystem?.destroy();
    this.inputController?.destroy();
    this.displayController?.destroy();
    this.overlay?.destroy();
    this.objectiveSystem?.destroy();
    this.completionOverlay?.destroy();
  }
}
