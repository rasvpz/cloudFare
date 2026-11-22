import { getCurrentUser } from '../services/authService.js';
import { getBalances } from '../services/loyaltyService.js';
import { listRewards, redeemReward, canRedeem } from '../services/rewardService.js';
import { getRedemptions } from '../services/rewardService.js';
import { renderRewardCard } from '../components/rewardCard.js';
import { formatPoints, formatINR } from '../utils/formatters.js';
import { formatDate } from '../utils/dateUtils.js';
import { openModal } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { emit } from '../main.js';

let filter = 'all';

export async function renderRewardsPage() {
  const main = document.getElementById('app-main');
  const user = await getCurrentUser();
  if (!user) { emit('navigate', 'login'); return; }
  const balances = await getBalances(user.id);
  const rewards = await listRewards();
  const redemptions = await getRedemptions(user.id);

  main.innerHTML = `
    <section class="page" aria-label="Rewards program">
      <h1 style="font-size:22px;font-weight:800;margin:4px 0 2px">Rewards Program</h1>
      <p style="color:var(--cf-text-2);font-size:13px;margin:0 0 14px">Your loyalty deserves something extraordinary.</p>

      <div class="cf-points-grid" style="grid-template-columns:repeat(3,1fr)">
        <div class="cf-stat">
          <div class="cf-stat-icon emerald"><i class="bi bi-wallet2"></i></div>
          <div class="cf-stat-label">Available</div>
          <div class="cf-stat-value emerald">${formatPoints(balances.availablePoints)}</div>
        </div>
        <div class="cf-stat">
          <div class="cf-stat-icon"><i class="bi bi-gift"></i></div>
          <div class="cf-stat-label">Redeemed</div>
          <div class="cf-stat-value gold">${redemptions.length}</div>
        </div>
        <div class="cf-stat">
          <div class="cf-stat-icon"><i class="bi bi-shield-check"></i></div>
          <div class="cf-stat-label">Tier</div>
          <div class="cf-stat-value" style="font-size:16px">${user.membershipTier || 'Member'}</div>
        </div>
      </div>

      ${!canRedeem(balances.availablePoints) ? `
        <div class="cf-next-reward" style="margin-top:14px;border-color:rgba(245,196,81,0.3);background:linear-gradient(160deg,rgba(245,196,81,0.1),rgba(16,43,80,0.5))">
          <div class="cf-next-reward-img" style="background:rgba(245,196,81,0.12)"><i class="bi bi-lock-fill" style="font-size:28px;color:var(--cf-gold)"></i></div>
          <div>
            <div class="cf-next-reward-title" style="color:var(--cf-gold)">Redeem unlocks at 50 points</div>
            <div class="cf-next-reward-sub">Just ${formatPoints(50 - balances.availablePoints)} more points to unlock your first reward!</div>
            <div class="cf-progress" style="margin-top:10px"><div class="cf-progress-bar" style="width:${(balances.availablePoints / 50) * 100}%"></div></div>
          </div>
        </div>
      ` : ''}

      <div class="cf-section-title" style="margin-top:18px"><h2>Browse Rewards</h2></div>
      <div class="cf-seg" role="tablist">
        ${['all','available','locked','redeemed'].map((f) => `
          <button role="tab" aria-selected="${f === filter}" class="${f === filter ? 'active' : ''}" data-filter="${f}">
            ${f[0].toUpperCase() + f.slice(1)}
          </button>
        `).join('')}
      </div>
      <div id="cf-rewards-list" style="display:flex;flex-direction:column;gap:10px"></div>

      ${redemptions.length ? `
        <div class="cf-section-title" style="margin-top:22px"><h2>My Rewards</h2></div>
        <div id="cf-my-rewards" style="display:flex;flex-direction:column;gap:10px"></div>
      ` : ''}
    </section>`;

  main.querySelectorAll('[data-filter]').forEach((b) => {
    b.addEventListener('click', () => { filter = b.dataset.filter; renderRewardsPage(); });
  });

  const list = main.querySelector('#cf-rewards-list');
  const filtered = rewards.filter((r) => {
    const unlocked = balances.availablePoints >= r.points;
    if (filter === 'available') return unlocked;
    if (filter === 'locked') return !unlocked;
    return true;
  });
  filtered.forEach((r) => list.appendChild(renderRewardCard(r, {
    availablePoints: balances.availablePoints,
    onRedeem: (reward) => openRedeemFlow(reward, user, balances),
  })));

  const my = main.querySelector('#cf-my-rewards');
  if (my) {
    redemptions.forEach((r) => {
      const el = document.createElement('div');
      el.className = 'cf-activity-item';
      el.innerHTML = `
        <div class="cf-activity-thumb"><img src="${r.rewardImage}" alt="" loading="lazy" /></div>
        <div>
          <div class="cf-activity-name">${r.rewardName}</div>
          <div class="cf-activity-meta">${formatDate(r.createdAt)} • ${r.id} • ${r.status.toUpperCase()}</div>
        </div>
        <div>
          <div class="cf-activity-pts neg">-${formatPoints(r.points)} pts</div>
        </div>`;
      my.appendChild(el);
    });
  }
}

function openRedeemFlow(reward, user, balances) {
  const after = balances.availablePoints - reward.points;
  openModal({
    title: reward.name,
    subtitle: reward.description,
    content: `
      <div style="display:grid;grid-template-columns:120px 1fr;gap:14px;align-items:center;margin-bottom:14px">
        <div style="width:120px;height:120px;border-radius:18px;overflow:hidden;border:1px solid var(--cf-border)">
          <img src="${reward.image}" alt="${reward.name}" style="width:100%;height:100%;object-fit:cover" />
        </div>
        <div>
          <div style="font-size:13px;color:var(--cf-text-2)">Required</div>
          <div style="font-size:22px;font-weight:800;color:var(--cf-gold)">${formatPoints(reward.points)} pts</div>
          <div style="font-size:13px;color:var(--cf-text-2);margin-top:10px">Current balance</div>
          <div style="font-weight:700">${formatPoints(balances.availablePoints)} pts</div>
          <div style="font-size:13px;color:var(--cf-text-2);margin-top:10px">Balance after redemption</div>
          <div style="font-weight:700;color:var(--cf-emerald)">${formatPoints(after)} pts</div>
        </div>
      </div>
      <p style="font-size:13px;color:var(--cf-text-2)">Redeem this reward for <b style="color:var(--cf-text)">${formatPoints(reward.points)} points</b>?</p>`,
    actions: [
      { label: 'Cancel', variant: 'cf-btn-ghost', onClick: (close) => close() },
      { label: 'Confirm Redeem', variant: 'cf-btn-emerald', onClick: async (close) => {
        try {
          const { redemption, newBalances } = await redeemReward({ userId: user.id, rewardId: reward.id });
          close();
          showRedemptionReceipt(redemption, newBalances);
        } catch (err) {
          toast({ type: 'error', message: err.message || 'Unable to redeem.' });
        }
      } },
    ],
  });
}

function showRedemptionReceipt(redemption, newBalances) {
  openModal({
    title: 'Reward Redeemed Successfully!',
    subtitle: redemption.rewardName,
    content: `
      <div style="text-align:center;padding:8px 0 4px">
        <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,var(--cf-emerald),var(--cf-emerald-2));display:grid;place-items:center;margin:0 auto;color:#042018;font-size:36px;box-shadow:0 10px 30px rgba(22,199,132,0.4)">
          <i class="bi bi-check-lg"></i>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px dashed var(--cf-border)">
        <span style="color:var(--cf-text-2)">Points Used</span><b>${formatPoints(redemption.points)}</b>
      </div>
      <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px dashed var(--cf-border)">
        <span style="color:var(--cf-text-2)">Remaining Balance</span><b style="color:var(--cf-emerald)">${formatPoints(newBalances.availablePoints)} pts</b>
      </div>
      <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px dashed var(--cf-border)">
        <span style="color:var(--cf-text-2)">Redemption ID</span><b>${redemption.id}</b>
      </div>
      <div style="display:flex;justify-content:space-between;padding:10px 0">
        <span style="color:var(--cf-text-2)">Date</span><b>${formatDate(redemption.createdAt)}</b>
      </div>`,
    actions: [
      { label: 'View My Rewards', variant: 'cf-btn-primary', onClick: (close) => { close(); renderRewardsPage(); } },
    ],
  });
}