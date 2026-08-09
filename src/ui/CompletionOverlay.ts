export interface CompletionOverlayOptions {
  container: HTMLElement;
  onPlayAgain: () => void;
}

const HIDDEN_CLASS = 'lb-hidden';

/**
 * Owns the objective-completion DOM overlay and its Play Again button.
 * Follows the same DOM-overlay pattern as MobilePlayOverlay: purely
 * presentational, never touches physics or player state.
 */
export class CompletionOverlay {
  private readonly overlay: HTMLDivElement;
  private readonly playAgainButton: HTMLButtonElement;
  private readonly handlePlayAgainClick: () => void;

  public constructor(options: CompletionOverlayOptions) {
    this.handlePlayAgainClick = options.onPlayAgain;

    const { overlay, playAgainButton } = this.build();
    this.overlay = overlay;
    this.playAgainButton = playAgainButton;
    this.playAgainButton.addEventListener('click', this.handlePlayAgainClick);

    options.container.appendChild(this.overlay);
    this.hide();
  }

  public show(): void {
    this.overlay.classList.remove(HIDDEN_CLASS);
  }

  public hide(): void {
    this.overlay.classList.add(HIDDEN_CLASS);
  }

  public destroy(): void {
    this.playAgainButton.removeEventListener('click', this.handlePlayAgainClick);
    this.overlay.remove();
  }

  private build(): { overlay: HTMLDivElement; playAgainButton: HTMLButtonElement } {
    const overlay = document.createElement('div');
    overlay.className = 'lb-overlay lb-completion-overlay';

    const title = document.createElement('p');
    title.className = 'lb-overlay__title';
    title.textContent = 'POWER RESTORED';

    const subtitle = document.createElement('p');
    subtitle.className = 'lb-overlay__subtitle';
    subtitle.textContent = 'Objective complete';

    const playAgainButton = document.createElement('button');
    playAgainButton.type = 'button';
    playAgainButton.className = 'lb-play-button lb-playagain-button';
    playAgainButton.textContent = 'PLAY AGAIN';

    overlay.append(title, subtitle, playAgainButton);
    return { overlay, playAgainButton };
  }
}
