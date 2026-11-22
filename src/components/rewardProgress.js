import { getCurrentUser } from '../services/authService.js';
import { getBalances } from '../services/loyaltyService.js';
import { nextReward } from '../services/rewardService.js';
import { formatPoints } from '../utils/formatters.js';

export async function renderRewardProgress(host) {
  host.innerHTML = `<div class="skeleton" style="height:120px"></div>`;
  const user = await getCurrentUser();
  if (!user) { host.innerHTML = ''; return; }
  const b = await getBalances(user.id);
  const nr = nextReward(b.availablePoints);
  if (!nr) {
    host.innerHTML = `
      <div class="cf-section-title"><h2>Your Next Reward</h2></div>
      <div class="cf-next-reward">
        <div class="cf-next-reward-img"><i class="bi bi-stars" style="font-size:30px;color:var(--cf-gold)"></i></div>
        <div>
          <div class="cf-next-reward-title">All current rewards unlocked!</div>
          <div class="cf-next-reward-sub">You've reached the top of our catalog. Stay tuned for new rewards.</div>
        </div>
      </div>`;
    return;
  }
  host.innerHTML = `
    <div class="cf-section-title"><h2>Your Next Reward</h2></div>
    <div class="cf-next-reward" role="region" aria-label="Next reward progress">
      <div class="cf-next-reward-img">
        <img src="${nr.reward.image}" alt="${nr.reward.name}" loading="lazy" />
      </div>
      <div>
        <div class="cf-next-reward-title">${nr.reward.name}</div>
        <div class="cf-next-reward-sub">Requires ${formatPoints(nr.reward.points)} points • ${formatPoints(nr.remaining)} to go</div>
        <div class="cf-progress" aria-hidden="true">
          <div class="cf-progress-bar" style="width:0%" data-target="${nr.progress}"></div>
        </div>
        <div class="cf-next-reward-msg">You're just ${formatPoints(nr.remaining)} points away from your next reward!</div>
      </div>
    </div>`;
  // Animate the bar after paint
  requestAnimationFrame(() => {
    const bar = host.querySelector('.cf-progress-bar');
    if (bar) bar.style.width = bar.dataset.target + '%';
  });
}