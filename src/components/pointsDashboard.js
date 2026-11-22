import { getCurrentUser } from '../services/authService.js';
import { getBalances } from '../services/loyaltyService.js';
import { formatPoints } from '../utils/formatters.js';

function animateCount(el, target) {
  const start = 0;
  const duration = 900;
  const t0 = performance.now();
  function frame(now) {
    const p = Math.min(1, (now - t0) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = formatPoints(Math.round(start + (target - start) * eased));
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

export async function renderPointsDashboard(host) {
  host.innerHTML = `
    <div class="cf-points-grid">
      <div class="skeleton" style="height:96px"></div>
      <div class="skeleton" style="height:96px"></div>
      <div class="skeleton" style="height:96px"></div>
      <div class="skeleton" style="height:96px"></div>
    </div>`;
  const user = await getCurrentUser();
  if (!user) { host.innerHTML = ''; return; }
  const b = await getBalances(user.id);
  host.innerHTML = `
    <div class="cf-points-grid" role="region" aria-label="Loyalty summary">
      <div class="cf-stat">
        <div class="cf-stat-icon emerald"><i class="bi bi-wallet2"></i></div>
        <div class="cf-stat-label">Available Points</div>
        <div class="cf-stat-value emerald" data-counter="${b.availablePoints}">0</div>
      </div>
      <div class="cf-stat">
        <div class="cf-stat-icon"><i class="bi bi-trophy"></i></div>
        <div class="cf-stat-label">Lifetime Earned</div>
        <div class="cf-stat-value gold" data-counter="${b.lifetimeEarnedPoints}">0</div>
      </div>
      <div class="cf-stat">
        <div class="cf-stat-icon"><i class="bi bi-gift"></i></div>
        <div class="cf-stat-label">Redeemed</div>
        <div class="cf-stat-value" data-counter="${b.redeemedPoints}">0</div>
      </div>
      <div class="cf-stat">
        <div class="cf-stat-icon emerald"><i class="bi bi-qr-code-scan"></i></div>
        <div class="cf-stat-label">Successful Scans</div>
        <div class="cf-stat-value emerald" data-counter="${b.successfulScans}">0</div>
      </div>
    </div>`;
  host.querySelectorAll('[data-counter]').forEach((el) => {
    animateCount(el, Number(el.dataset.counter));
  });
}