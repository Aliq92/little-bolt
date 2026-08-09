export interface MobilePlayOverlayOptions {
  container: HTMLElement;
  onPlayFullscreen: () => void;
  onFullscreenReentry: () => void;
}

const HIDDEN_CLASS = 'lb-hidden';

/**
 * Owns every DOM overlay used for the mobile play flow: the start overlay,
 * the rotate-device overlay, and the fullscreen re-entry button. Purely
 * presentational — it never touches physics or player state.
 */
export class MobilePlayOverlay {
  private readonly startOverlay: HTMLDivElement;
  private readonly rotateOverlay: HTMLDivElement;
  private readonly reentryButton: HTMLButtonElement;
  private readonly playButton: HTMLButtonElement;

  private readonly handlePlayClick: () => void;
  private readonly handleReentryClick: () => void;

  public constructor(options: MobilePlayOverlayOptions) {
    this.handlePlayClick = options.onPlayFullscreen;
    this.handleReentryClick = options.onFullscreenReentry;

    const { overlay: startOverlay, playButton } = this.buildStartOverlay();
    this.startOverlay = startOverlay;
    this.playButton = playButton;
    this.rotateOverlay = this.buildRotateOverlay();
    this.reentryButton = this.buildReentryButton();

    this.playButton.addEventListener('click', this.handlePlayClick);
    this.reentryButton.addEventListener('click', this.handleReentryClick);

    options.container.append(this.startOverlay, this.rotateOverlay, this.reentryButton);

    this.hideStartOverlay();
    this.hideRotateOverlay();
    this.hideFullscreenReentry();
  }

  public showStartOverlay(): void {
    this.startOverlay.classList.remove(HIDDEN_CLASS);
  }

  public hideStartOverlay(): void {
    this.startOverlay.classList.add(HIDDEN_CLASS);
  }

  public showRotateOverlay(): void {
    this.rotateOverlay.classList.remove(HIDDEN_CLASS);
  }

  public hideRotateOverlay(): void {
    this.rotateOverlay.classList.add(HIDDEN_CLASS);
  }

  public showFullscreenReentry(): void {
    this.reentryButton.classList.remove(HIDDEN_CLASS);
  }

  public hideFullscreenReentry(): void {
    this.reentryButton.classList.add(HIDDEN_CLASS);
  }

  public destroy(): void {
    this.playButton.removeEventListener('click', this.handlePlayClick);
    this.reentryButton.removeEventListener('click', this.handleReentryClick);

    this.startOverlay.remove();
    this.rotateOverlay.remove();
    this.reentryButton.remove();
  }

  private buildStartOverlay(): { overlay: HTMLDivElement; playButton: HTMLButtonElement } {
    const overlay = document.createElement('div');
    overlay.className = 'lb-overlay lb-start-overlay';

    const title = document.createElement('p');
    title.className = 'lb-overlay__title';
    title.textContent = 'LITTLE BOLT';

    const subtitle = document.createElement('p');
    subtitle.className = 'lb-overlay__subtitle';
    subtitle.textContent = 'Landscape recommended';

    const playButton = document.createElement('button');
    playButton.type = 'button';
    playButton.className = 'lb-play-button';
    playButton.textContent = 'PLAY FULLSCREEN';

    overlay.append(title, subtitle, playButton);
    return { overlay, playButton };
  }

  private buildRotateOverlay(): HTMLDivElement {
    const overlay = document.createElement('div');
    overlay.className = 'lb-overlay lb-rotate-overlay';

    const message = document.createElement('p');
    message.className = 'lb-overlay__title';
    message.textContent = 'Rotate your phone to play';

    overlay.append(message);
    return overlay;
  }

  private buildReentryButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'lb-reentry-button';
    button.textContent = 'Fullscreen';
    button.setAttribute('aria-label', 'Re-enter fullscreen');
    return button;
  }
}
