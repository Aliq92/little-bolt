import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
  public constructor() {
    super('MainScene');
  }

  public create(): void {
    const { centerX, centerY } = this.cameras.main;

    this.add
      .text(centerX, centerY - 28, 'LITTLE BOLT', {
        color: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSize: '48px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, centerY + 34, 'Project initialized successfully.', {
        color: '#a8b5c7',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSize: '22px',
      })
      .setOrigin(0.5);
  }
}
