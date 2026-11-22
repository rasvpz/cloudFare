import { formatPoints } from '../utils/formatters.js';

export function renderRewardCard(reward, { availablePoints, onRedeem }) {
  const unlocked = availablePoints >= reward.points;
  const need = reward.points - availablePoints;
  const el = document.createElement('article');
  el.className = `cf-reward-card ${unlocked ? 'unlocked' : 'locked'}`;
  el.innerHTML = `
    <div class="cf-reward-img"><img src="${reward.image}" alt="${reward.name}" loading="lazy" /></div>
    <div>
      <div class="cf-reward-name">${reward.name}</div>
      <div class="cf-reward-desc">${reward.description}</div>
      <div class="cf-reward-pts"><i class="bi bi-star-fill"></i> ${formatPoints(reward.points)} pts</div>
      ${!unlocked ? `<div class="cf-reward-lock">Unlock with <b>${formatPoints(need)}</b> more points</div>` : ''}
      <div class="cf-reward-actions">
        <button class="cf-btn ${unlocked ? 'cf-btn-emerald' : 'cf-btn-ghost'}" ${unlocked ? '' : 'disabled'}>
          <i class="bi ${unlocked ? 'bi-gift' : 'bi-lock-fill'}"></i>
          ${unlocked ? 'Redeem' : 'Locked'}
        </button>
      </div>
    </div>`;
  if (unlocked) {
    el.querySelector('button').addEventListener('click', () => onRedeem && onRedeem(reward));
  }
  return el;
}