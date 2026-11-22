import { renderLoyaltyCard } from '../components/loyaltyCard.js';
import { renderPointsDashboard } from '../components/pointsDashboard.js';
import { renderRewardProgress } from '../components/rewardProgress.js';
import { renderProductSlider } from '../components/productSlider.js';
import { renderActivityList } from '../components/activityList.js';

export async function renderHomePage() {
  const main = document.getElementById('app-main');
  main.innerHTML = `
    <section class="page" aria-label="Home dashboard">
      <div id="cf-loyalty-card"></div>
      <div id="cf-points-dashboard"></div>
      <div id="cf-reward-progress"></div>
      <div id="cf-products"></div>
      <div id="cf-activity"></div>
    </section>`;
  await Promise.all([
    renderLoyaltyCard(main.querySelector('#cf-loyalty-card')),
    renderPointsDashboard(main.querySelector('#cf-points-dashboard')),
    renderRewardProgress(main.querySelector('#cf-reward-progress')),
  ]);
  renderProductSlider(main.querySelector('#cf-products'));
  await renderActivityList(main.querySelector('#cf-activity'), { limit: 4, showViewAll: true });
}