import Phaser from 'phaser';

export interface PlayerInputState {
  left: boolean;
  right: boolean;
  jumpPressed: boolean;
}

const MOVE_BUTTON_RADIUS = 42; // ~84px logical diameter
const JUMP_BUTTON_RADIUS = 46; // ~92px logical diameter

const CONTROL_MARGIN_X = 64;
const CONTROL_MARGIN_Y = 56;
const MOVE_BUTTON_GAP_X = 116;

const BUTTON_FILL_COLOR = 0x1c2333;
const BUTTON_STROKE_COLOR = 0x22e2f5;
const BUTTON_ALPHA_IDLE = 0.22;
const BUTTON_ALPHA_ACTIVE = 0.5;
const BUTTON_STROKE_ALPHA_IDLE = 0.5;
const BUTTON_STROKE_ALPHA_ACTIVE = 1;
const BUTTON_STROKE_WIDTH = 2;
const BUTTON_PRESSED_SCALE = 1.08;
const BUTTON_LABEL_COLOR = '#e8fbff';
const BUTTON_DEPTH = 1000;

type ButtonId = 'left' | 'right' | 'jump';

interface TouchButton {
  circle: Phaser.GameObjects.Arc;
  label: Phaser.GameObjects.Text;
  radius: number;
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
  private enabled = true;

  private readonly handleBlur = (): void => this.clearAllInput();
  private readonly handleVisibilityChange = (): void => {
    if (document.hidden) {
      this.clearAllInput();
    }
  };
  private readonly handleScaleResize = (): void => this.repositionControls();

  public constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupKeyboard();
    this.setupTouchControls();
    this.setupFocusHandling();
  }

  public getState(): PlayerInputState {
    if (!this.enabled) {
      return { left: false, right: false, jumpPressed: false };
    }

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

  /** Disabling clears all held input and returns buttons to their idle appearance. */
  public setEnabled(enabled: boolean): void {
    if (this.enabled === enabled) {
      return;
    }
    this.enabled = enabled;
    if (!enabled) {
      this.clearAllInput();
    }
  }

  public clearAllInput(): void {
    for (const button of [this.touchLeft, this.touchRight, this.touchJump]) {
      this.setButtonIdle(button);
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

  /** Repositions existing touch buttons in place; never recreates them. */
  public repositionControls(): void {
    const { width, height } = this.scene.cameras.main;

    const leftX = CONTROL_MARGIN_X + MOVE_BUTTON_RADIUS;
    const moveY = height - CONTROL_MARGIN_Y - MOVE_BUTTON_RADIUS;
    const rightX = leftX + MOVE_BUTTON_GAP_X;
    const jumpX = width - CONTROL_MARGIN_X - JUMP_BUTTON_RADIUS;
    const jumpY = height - CONTROL_MARGIN_Y - JUMP_BUTTON_RADIUS;

    this.positionButton(this.touchLeft, leftX, moveY);
    this.positionButton(this.touchRight, rightX, moveY);
    this.positionButton(this.touchJump, jumpX, jumpY);
  }

  public destroy(): void {
    this.scene.game.events.off(Phaser.Core.Events.BLUR, this.handleBlur);
    this.scene.input.off(Phaser.Input.Events.GAME_OUT, this.handleBlur);
    this.scene.scale.off(Phaser.Scale.Events.RESIZE, this.handleScaleResize);
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
    this.touchLeft = this.createButton('left', MOVE_BUTTON_RADIUS, '←');
    this.touchRight = this.createButton('right', MOVE_BUTTON_RADIUS, '→');
    this.touchJump = this.createButton('jump', JUMP_BUTTON_RADIUS, '↑');

    this.repositionControls();
    this.scene.scale.on(Phaser.Scale.Events.RESIZE, this.handleScaleResize);
  }

  private createButton(id: ButtonId, radius: number, symbol: string): TouchButton {
    const circle = this.scene.add.circle(0, 0, radius, BUTTON_FILL_COLOR, BUTTON_ALPHA_IDLE);
    circle.setStrokeStyle(BUTTON_STROKE_WIDTH, BUTTON_STROKE_COLOR, BUTTON_STROKE_ALPHA_IDLE);
    circle.setScrollFactor(0);
    circle.setDepth(BUTTON_DEPTH);
    circle.setName(`touch-${id}`);
    // Phaser normalizes hit-test coordinates by the object's display origin before
    // testing, so a circular hit area must be centered at (radius, radius), not (0, 0).
    circle.setInteractive(new Phaser.Geom.Circle(radius, radius, radius), Phaser.Geom.Circle.Contains);

    const label = this.scene.add
      .text(0, 0, symbol, {
        color: BUTTON_LABEL_COLOR,
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSize: '28px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(BUTTON_DEPTH + 1);

    const button: TouchButton = { circle, label, radius, pressed: false };

    const press = (): void => {
      if (!this.enabled) {
        return;
      }
      button.pressed = true;
      circle.setFillStyle(BUTTON_FILL_COLOR, BUTTON_ALPHA_ACTIVE);
      circle.setStrokeStyle(BUTTON_STROKE_WIDTH, BUTTON_STROKE_COLOR, BUTTON_STROKE_ALPHA_ACTIVE);
      circle.setScale(BUTTON_PRESSED_SCALE);
    };

    const release = (): void => this.setButtonIdle(button);

    circle.on(Phaser.Input.Events.POINTER_DOWN, press);
    circle.on(Phaser.Input.Events.POINTER_UP, release);
    circle.on(Phaser.Input.Events.POINTER_OUT, release);
    circle.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, release);

    return button;
  }

  private positionButton(button: TouchButton | undefined, x: number, y: number): void {
    if (!button) {
      return;
    }
    button.circle.setPosition(x, y);
    button.label.setPosition(x, y);
  }

  private setButtonIdle(button: TouchButton | undefined): void {
    if (!button) {
      return;
    }
    button.pressed = false;
    button.circle.setFillStyle(BUTTON_FILL_COLOR, BUTTON_ALPHA_IDLE);
    button.circle.setStrokeStyle(BUTTON_STROKE_WIDTH, BUTTON_STROKE_COLOR, BUTTON_STROKE_ALPHA_IDLE);
    button.circle.setScale(1);
  }

  private setupFocusHandling(): void {
    this.scene.game.events.on(Phaser.Core.Events.BLUR, this.handleBlur);
    this.scene.input.on(Phaser.Input.Events.GAME_OUT, this.handleBlur);
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }
}
