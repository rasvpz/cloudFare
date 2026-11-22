import { getCurrentUser } from '../services/authService.js';
import { emit } from '../main.js';

export function renderHeader() {
  const host = document.getElementById('app-header');
  host.innerHTML = `
    <header class="cf-header" role="banner">
      <div class="cf-header-inner">
        <div class="cf-brand" aria-label="Cloud Flare Rewards">
          <div class="cf-brand-logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M7 16c-2.2 0-4-1.6-4-3.6S4.8 9 7 9c.3-2.4 2.5-4.2 5.2-4.2 2.5 0 4.6 1.6 5.1 3.7 2.1.3 3.7 1.9 3.7 3.7 0 2-1.6 3.6-3.7 3.6H7z" fill="#F5C451"/>
              <path d="M12 8l1.3 3 3.2.4-2.3 2.3.5 3.2L12 15.3 9.3 16.9l.5-3.2L7.5 11.4l3.2-.4z" fill="#061225"/>
            </svg>
          </div>
          <div class="cf-brand-text">
            <div class="cf-brand-name">Cloud Flare</div>
            <div class="cf-brand-sub">LOYALTY REWARDS</div>
          </div>
        </div>
        <div class="cf-header-actions">
          <button class="cf-icon-btn primary" id="cf-open-scanner" aria-label="Scan QR code" title="Scan QR code">
            <i class="bi bi-qr-code-scan"></i>
          </button>
          <div id="cf-header-user"></div>
        </div>
      </div>
    </header>`;
  host.querySelector('#cf-open-scanner').addEventListener('click', () => emit('open-scanner'));
  refreshHeaderUser();
}

export async function refreshHeaderUser() {
  const host = document.getElementById('cf-header-user');
  if (!host) return;
  const user = await getCurrentUser();
  if (!user) {
    host.innerHTML = `<button class="cf-login-btn" id="cf-header-login">Login</button>`;
    host.querySelector('#cf-header-login').addEventListener('click', () => emit('navigate', 'login'));
    return;
  }
  const initial = (user.firstName || '?').charAt(0).toUpperCase();
  host.innerHTML = `
    <button class="cf-avatar" id="cf-header-avatar" aria-label="Open profile menu" title="Profile">
      ${user.avatar ? `<img src="${user.avatar}" alt="">` : initial}
    </button>`;
  host.querySelector('#cf-header-avatar').addEventListener('click', () => emit('open-profile-menu'));
}