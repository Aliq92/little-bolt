import Phaser from 'phaser';

export interface PlayerInputState {
  left: boolean;
  right: boolean;
  jumpPressed: boolean;
}

const BUTTON_RADIUS = 32;
const BUTTON_MARGIN_X = 44;
const BUTTON_MARGIN_Y = 48;
const BUTTON_GAP_X = 70;
const BUTTON_FILL_COLOR = 0x1c2333;
const BUTTON_STROKE_COLOR = 0x22e2f5;
const BUTTON_ALPHA_IDLE = 0.28;
const BUTTON_ALPHA_ACTIVE = 0.55;
const BUTTON_LABEL_COLOR = '#e8fbff';
const BUTTON_DEPTH = 1000;

interface TouchButton {
  circle: Phaser.GameObjects.Arc;
  label: Phaser.GameObjects.Text;
  pressed: boolean;
}

/**
 * Combines keyboard and on-screen touch input into a single per-frame state.
 * Jump is edge-triggered here so holding the key/button never repeat-jumps.
 */
export class InputController {
  private readonly scene: Phaser.Scene;

  private keyLeftA?: Phaser.Input.Keyboard.Key;
  private keyLeftArrow?: Phaser.Input.Keyboard.Key;
  private keyRightD?: Phaser.Input.Keyboard.Key;
  private keyRightArrow?: Phaser.Input.Keyboard.Key;
  private keyJumpW?: Phaser.Input.Keyboard.Key;
  private keyJumpUp?: Phaser.Input.Keyboard.Key;
  private keyJumpSpace?: Phaser.Input.Keyboard.Key;

  private touchLeft?: TouchButton;
  private touchRight?: TouchButton;
  private touchJump?: TouchButton;

  private wasJumpHeld = false;

  private readonly handleBlur = (): void => this.clearAllInput();
  private readonly handleVisibilityChange = (): void => {
    if (document.hidden) {
      this.clearAllInput();
    }
  };

  public constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupKeyboard();
    this.setupTouchControls();
    this.setupFocusHandling();
  }

  public getState(): PlayerInputState {
    const left = Boolean(this.keyLeftA?.isDown || this.keyLeftArrow?.isDown || this.touchLeft?.pressed);
    const right = Boolean(this.keyRightD?.isDown || this.keyRightArrow?.isDown || this.touchRight?.pressed);
    const jumpHeld = Boolean(
      this.keyJumpW?.isDown ||
        this.keyJumpUp?.isDown ||
        this.keyJumpSpace?.isDown ||
        this.touchJump?.pressed,
    );

    const jumpPressed = jumpHeld && !this.wasJumpHeld;
    this.wasJumpHeld = jumpHeld;

    return { left, right, jumpPressed };
  }

  public destroy(): void {
    this.scene.game.events.off(Phaser.Core.Events.BLUR, this.handleBlur);
    this.scene.input.off(Phaser.Input.Events.GAME_OUT, this.handleBlur);
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }

    for (const button of [this.touchLeft, this.touchRight, this.touchJump]) {
      button?.circle.destroy();
      button?.label.destroy();
    }
  }

  private setupKeyboard(): void {
    const keyboard = this.scene.input.keyboard;
    if (!keyboard) {
      return;
    }

    const Keys = Phaser.Input.Keyboard.KeyCodes;
    this.keyLeftA = keyboard.addKey(Keys.A);
    this.keyLeftArrow = keyboard.addKey(Keys.LEFT);
    this.keyRightD = keyboard.addKey(Keys.D);
    this.keyRightArrow = keyboard.addKey(Keys.RIGHT);
    this.keyJumpW = keyboard.addKey(Keys.W);
    this.keyJumpUp = keyboard.addKey(Keys.UP);
    this.keyJumpSpace = keyboard.addKey(Keys.SPACE);
  }

  private setupTouchControls(): void {
    const { width, height } = this.scene.cameras.main;

    this.touchLeft = this.createButton(BUTTON_MARGIN_X, height - BUTTON_MARGIN_Y, '←');
    this.touchRight = this.createButton(
      BUTTON_MARGIN_X + BUTTON_GAP_X,
      height - BUTTON_MARGIN_Y,
      '→',
    );
    this.touchJump = this.createButton(width - BUTTON_MARGIN_X, height - BUTTON_MARGIN_Y, '↑');
  }

  private createButton(x: number, y: number, symbol: string): TouchButton {
    const circle = this.scene.add.circle(x, y, BUTTON_RADIUS, BUTTON_FILL_COLOR, BUTTON_ALPHA_IDLE);
    circle.setStrokeStyle(2, BUTTON_STROKE_COLOR, 0.6);
    circle.setScrollFactor(0);
    circle.setDepth(BUTTON_DEPTH);
    // Phaser normalizes hit-test coordinates by the object's display origin before
    // testing, so a circular hit area must be centered at (radius, radius), not (0, 0).
    circle.setInteractive(
      new Phaser.Geom.Circle(BUTTON_RADIUS, BUTTON_RADIUS, BUTTON_RADIUS),
      Phaser.Geom.Circle.Contains,
    );

    const label = this.scene.add
      .text(x, y, symbol, {
        color: BUTTON_LABEL_COLOR,
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSize: '28px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(BUTTON_DEPTH + 1);

    const button: TouchButton = { circle, label, pressed: false };

    const press = (): void => {
      button.pressed = true;
      circle.setFillStyle(BUTTON_FILL_COLOR, BUTTON_ALPHA_ACTIVE);
    };

    const release = (): void => {
      button.pressed = false;
      circle.setFillStyle(BUTTON_FILL_COLOR, BUTTON_ALPHA_IDLE);
    };

    circle.on(Phaser.Input.Events.POINTER_DOWN, press);
    circle.on(Phaser.Input.Events.POINTER_UP, release);
    circle.on(Phaser.Input.Events.POINTER_OUT, release);
    circle.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, release);

    return button;
  }

  private setupFocusHandling(): void {
    this.scene.game.events.on(Phaser.Core.Events.BLUR, this.handleBlur);
    this.scene.input.on(Phaser.Input.Events.GAME_OUT, this.handleBlur);
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  private clearAllInput(): void {
    for (const button of [this.touchLeft, this.touchRight, this.touchJump]) {
      if (!button) {
        continue;
      }
      button.pressed = false;
      button.circle.setFillStyle(BUTTON_FILL_COLOR, BUTTON_ALPHA_IDLE);
    }

    for (const key of [
      this.keyLeftA,
      this.keyLeftArrow,
      this.keyRightD,
      this.keyRightArrow,
      this.keyJumpW,
      this.keyJumpUp,
      this.keyJumpSpace,
    ]) {
      key?.reset();
    }

    this.wasJumpHeld = false;
  }
}
