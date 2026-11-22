import { getCurrentUser } from '../services/authService.js';
import { getBalances, getMembershipTier } from '../services/loyaltyService.js';
import { formatPoints } from '../utils/formatters.js';
import { formatDate } from '../utils/dateUtils.js';

export async function renderLoyaltyCard(host) {
  host.innerHTML = `<div class="skeleton" style="aspect-ratio:1.586/1"></div>`;
  const user = await getCurrentUser();
  if (!user) { host.innerHTML = ''; return; }
  const balances = await getBalances(user.id);
  const tier = await getMembershipTier(user.id);
  const fullName = `${user.firstName} ${user.lastName}`.toUpperCase();
  host.innerHTML = `
    <div class="cf-card-wrap">
      <div class="cf-loyalty-card" role="region" aria-label="Loyalty membership card">
        <div class="cf-card-top">
          <div class="cf-card-brand">CLOUD FLARE</div>
          <div class="cf-card-tier"><i class="bi ${tier.icon}"></i> ${tier.key.toUpperCase()} MEMBER</div>
        </div>
        <div class="cf-card-name">${fullName}</div>
        <div class="cf-card-meta">
          <span>Member Since</span>
          <strong>${formatDate(user.joinedAt)}</strong>
        </div>
        <div class="cf-card-points">
          <div class="cf-card-points-label">LOYALTY POINTS</div>
          <div class="cf-card-points-value">${formatPoints(balances.availablePoints)} PTS</div>
        </div>
        <div class="cf-card-meta" style="left:auto;right:22px;bottom:58px;text-align:right">
          <span>Member ID</span>
          <strong>${user.memberId}</strong>
        </div>
      </div>
      <p class="cf-card-tagline">Every scan brings you closer to something amazing.</p>
    </div>`;
}