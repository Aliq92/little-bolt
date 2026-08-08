import Phaser from 'phaser';

import { gameConfig } from './config/gameConfig';
import './style.css';

function showStartupFailureMessage(): void {
  const container = document.getElementById('game') ?? document.body;
  container.textContent = '';

  const message = document.createElement('p');
  message.textContent = 'Little Bolt could not start. Please reload the page.';
  message.style.color = '#f8fafc';
  message.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  message.style.fontSize = '18px';
  message.style.textAlign = 'center';
  message.style.padding = '24px';

  container.appendChild(message);
}

try {
  new Phaser.Game(gameConfig);
} catch (error) {
  console.error('Little Bolt failed to start.', error);
  showStartupFailureMessage();
}
