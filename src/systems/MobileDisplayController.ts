import Phaser from 'phaser';

export interface DisplayState {
  isTouchDevice: boolean;
  isPortrait: boolean;
  isFullscreen: boolean;
}

export interface MobileDisplayControllerOptions {
  container: HTMLElement;
  game: Phaser.Game;
  onChange: (state: DisplayState) => void;
}

type FullscreenCapableElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

type FullscreenCapableDocument = Document & {
  webkitFullscreenElement?: Element | null;
};

/**
 * Owns every browser-level display concern (touch detection, orientation,
 * fullscreen) so MainScene only has to react to a single DisplayState.
 * All browser APIs used here are optional/rejectable across mobile browsers,
 * so every call is feature-detected and failures are swallowed, never thrown.
 */
export class MobileDisplayController {
  private readonly container: HTMLElement;
  private readonly game: Phaser.Game;
  private readonly onChange: (state: DisplayState) => void;

  private readonly supportsWebkitFullscreen: boolean;
  private destroyed = false;

  private readonly handleDisplayEvent = (): void => this.emitChange();

  public constructor(options: MobileDisplayControllerOptions) {
    this.container = options.container;
    this.game = options.game;
    this.onChange = options.onChange;
    this.supportsWebkitFullscreen =
      typeof (this.container as FullscreenCapableElement).webkitRequestFullscreen === 'function';

    this.attachListeners();
  }

  public static isTouchCapable(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const coarsePointer =
      typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
    const maxTouchPoints = typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0;
    const touchEvents = 'ontouchstart' in window;

    return coarsePointer || maxTouchPoints || touchEvents;
  }

  public getState(): DisplayState {
    return {
      isTouchDevice: MobileDisplayController.isTouchCapable(),
      isPortrait: this.isPortrait(),
      isFullscreen: this.isFullscreen(),
    };
  }

  public isPortrait(): boolean {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      return window.matchMedia('(orientation: portrait)').matches;
    }
    return window.innerHeight >= window.innerWidth;
  }

  public isFullscreen(): boolean {
    const doc = document as FullscreenCapableDocument;
    return Boolean(document.fullscreenElement || doc.webkitFullscreenElement);
  }

  /** Must be called from within a direct user gesture handler. */
  public async requestFullscreen(): Promise<boolean> {
    const el = this.container as FullscreenCapableElement;

    try {
      if (typeof el.requestFullscreen === 'function') {
        await el.requestFullscreen();
        return true;
      }
      if (typeof el.webkitRequestFullscreen === 'function') {
        await el.webkitRequestFullscreen();
        return true;
      }
    } catch (error) {
      console.warn('Little Bolt: fullscreen request was rejected or unsupported.', error);
    }

    return false;
  }

  /** Best-effort only; many mobile browsers reject this outside a user gesture or fullscreen. */
  public async requestLandscapeLock(): Promise<boolean> {
    try {
      const orientation = typeof screen !== 'undefined' ? screen.orientation : undefined;
      if (orientation && typeof orientation.lock === 'function') {
        await orientation.lock('landscape');
        return true;
      }
    } catch (error) {
      console.warn('Little Bolt: orientation lock was rejected or unsupported.', error);
    }

    return false;
  }

  public destroy(): void {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;

    window.removeEventListener('resize', this.handleDisplayEvent);
    window.removeEventListener('orientationchange', this.handleDisplayEvent);
    document.removeEventListener('fullscreenchange', this.handleDisplayEvent);
    document.removeEventListener('visibilitychange', this.handleDisplayEvent);
    if (this.supportsWebkitFullscreen) {
      document.removeEventListener('webkitfullscreenchange', this.handleDisplayEvent);
    }
    this.game.events.off(Phaser.Core.Events.BLUR, this.handleDisplayEvent);
    this.game.events.off(Phaser.Core.Events.FOCUS, this.handleDisplayEvent);
  }

  private attachListeners(): void {
    window.addEventListener('resize', this.handleDisplayEvent);
    if ('onorientationchange' in window) {
      window.addEventListener('orientationchange', this.handleDisplayEvent);
    }
    document.addEventListener('fullscreenchange', this.handleDisplayEvent);
    document.addEventListener('visibilitychange', this.handleDisplayEvent);
    if (this.supportsWebkitFullscreen) {
      document.addEventListener('webkitfullscreenchange', this.handleDisplayEvent);
    }
    this.game.events.on(Phaser.Core.Events.BLUR, this.handleDisplayEvent);
    this.game.events.on(Phaser.Core.Events.FOCUS, this.handleDisplayEvent);
  }

  private emitChange(): void {
    if (this.destroyed) {
      return;
    }
    this.onChange(this.getState());
  }
}
