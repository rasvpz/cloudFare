import { getCurrentUser } from '../services/authService.js';
import { getTransactions } from '../services/loyaltyService.js';
import { formatPoints } from '../utils/formatters.js';
import { formatDateTime } from '../utils/dateUtils.js';
import { emit } from '../main.js';

const ICON_BY_KIND = {
  earn: 'bi-qr-code-scan',
  redeem: 'bi-gift',
  bonus: 'bi-stars',
  adjust: 'bi-arrow-left-right',
};

function describe(tx) {
  if (tx.kind === 'earn') return tx.productName || 'Product scanned';
  if (tx.kind === 'redeem') return tx.rewardName || 'Reward redeemed';
  if (tx.kind === 'bonus') return tx.note || 'Bonus points';
  return tx.note || 'Points adjusted';
}

function thumbFor(tx) {
  const img = tx.productImage || tx.rewardImage;
  if (img) return `<img src="${img}" alt="" loading="lazy" />`;
  return `<i class="bi ${ICON_BY_KIND[tx.kind] || 'bi-receipt'}" style="font-size:20px;color:var(--cf-gold)"></i>`;
}

export async function renderActivityList(host, { limit = 5, showViewAll = true } = {}) {
  host.innerHTML = `<div class="skeleton" style="height:60px"></div><div class="skeleton" style="height:60px;margin-top:10px"></div>`;
  const user = await getCurrentUser();
  if (!user) { host.innerHTML = ''; return; }
  const txs = await getTransactions(user.id);
  const slice = txs.slice(0, limit);
  if (slice.length === 0) {
    host.innerHTML = `
      <div class="cf-section-title"><h2>Recent Activity</h2></div>
      <div class="cf-empty">
        <i class="bi bi-clock-history"></i>
        <h3>No activity yet</h3>
        <p>Scan your first product to start earning points.</p>
      </div>`;
    return;
  }
  host.innerHTML = `
    <div class="cf-section-title"><h2>Recent Activity</h2><span class="cf-link">Your loyalty journey, one scan at a time.</span></div>
    <div>
      ${slice.map((tx) => `
        <div class="cf-activity-item" role="listitem">
          <div class="cf-activity-thumb">${thumbFor(tx)}</div>
          <div>
            <div class="cf-activity-name">${describe(tx)}</div>
            <div class="cf-activity-meta">${formatDateTime(tx.createdAt)} • ${tx.id}</div>
          </div>
          <div>
            <div class="cf-activity-pts ${tx.amount >= 0 ? 'pos' : 'neg'}">${tx.amount >= 0 ? '+' : ''}${formatPoints(tx.amount)} pts</div>
            <div class="cf-activity-status">${tx.kind === 'earn' ? 'Successful' : tx.kind.toUpperCase()}</div>
          </div>
        </div>
      `).join('')}
    </div>
    ${showViewAll && txs.length > limit ? `<button class="cf-view-all-btn" id="cf-view-all-activity">View All Activity</button>` : ''}`;
  const btn = host.querySelector('#cf-view-all-activity');
  if (btn) btn.addEventListener('click', () => emit('navigate', 'activity'));
}