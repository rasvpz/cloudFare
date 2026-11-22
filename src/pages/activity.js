import { getCurrentUser } from '../services/authService.js';
import { getTransactions } from '../services/loyaltyService.js';
import { formatPoints } from '../utils/formatters.js';
import { formatDateTime, isThisMonth } from '../utils/dateUtils.js';

let filter = 'all';

export async function renderActivityPage() {
  const main = document.getElementById('app-main');
  const user = await getCurrentUser();
  if (!user) { main.innerHTML = '<div class="cf-empty"><h3>Please log in</h3></div>'; return; }
  const txs = await getTransactions(user.id);

  main.innerHTML = `
    <section class="page" aria-label="Activity history">
      <h1 style="font-size:22px;font-weight:800;margin:4px 0 2px">Activity</h1>
      <p style="color:var(--cf-text-2);font-size:13px;margin:0 0 14px">Your complete loyalty journey.</p>

      <div class="cf-seg" role="tablist">
        ${['all','earned','redeemed','month'].map((f) => `
          <button role="tab" aria-selected="${f === filter}" class="${f === filter ? 'active' : ''}" data-filter="${f}">
            ${f === 'month' ? 'This Month' : f[0].toUpperCase() + f.slice(1)}
          </button>
        `).join('')}
      </div>
      <div id="cf-activity-list"></div>
    </section>`;

  main.querySelectorAll('[data-filter]').forEach((b) => {
    b.addEventListener('click', () => { filter = b.dataset.filter; renderActivityPage(); });
  });

  const list = main.querySelector('#cf-activity-list');
  const filtered = txs.filter((t) => {
    if (filter === 'earned') return t.kind === 'earn' || t.kind === 'bonus';
    if (filter === 'redeemed') return t.kind === 'redeem';
    if (filter === 'month') return isThisMonth(t.createdAt);
    return true;
  });

  if (filtered.length === 0) {
    list.innerHTML = `<div class="cf-empty"><i class="bi bi-clock-history"></i><h3>No activity</h3><p>Try another filter or scan a product.</p></div>`;
    return;
  }

  filtered.forEach((tx) => {
    const title = tx.kind === 'earn' ? (tx.productName || 'Product scanned')
      : tx.kind === 'redeem' ? (tx.rewardName || 'Reward redeemed')
      : tx.kind === 'bonus' ? (tx.note || 'Bonus points')
      : (tx.note || 'Points adjusted');
    const img = tx.productImage || tx.rewardImage;
    const el = document.createElement('div');
    el.className = 'cf-activity-item';
    el.innerHTML = `
      <div class="cf-activity-thumb">${img ? `<img src="${img}" alt="" loading="lazy" />` : `<i class="bi bi-receipt" style="font-size:20px;color:var(--cf-gold)"></i>`}</div>
      <div>
        <div class="cf-activity-name">${title}</div>
        <div class="cf-activity-meta">${formatDateTime(tx.createdAt)} • ${tx.id}</div>
      </div>
      <div>
        <div class="cf-activity-pts ${tx.amount >= 0 ? 'pos' : 'neg'}">${tx.amount >= 0 ? '+' : ''}${formatPoints(tx.amount)} pts</div>
        <div class="cf-activity-status">${tx.kind.toUpperCase()}</div>
      </div>`;
    list.appendChild(el);
  });
}