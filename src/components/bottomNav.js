import { emit } from '../main.js';

const TABS = [
  { key: 'home',     label: 'Home',     icon: 'bi-house-door-fill' },
  { key: 'rewards',  label: 'Rewards',  icon: 'bi-gift-fill' },
  { key: 'activity', label: 'Activity', icon: 'bi-clock-history' },
  { key: 'profile',  label: 'Profile',  icon: 'bi-person-circle' },
];

export function renderBottomNav(active = 'home') {
  const host = document.getElementById('app-bottom-nav');
  host.innerHTML = `
    <nav class="cf-bottom-nav" aria-label="Primary">
      <div class="cf-bottom-nav-inner">
        ${TABS.map((t) => `
          <button class="cf-nav-item ${t.key === active ? 'active' : ''}" data-tab="${t.key}" aria-current="${t.key === active ? 'page' : 'false'}">
            <i class="bi ${t.icon}"></i>
            <span>${t.label}</span>
          </button>
        `).join('')}
      </div>
    </nav>`;
  host.querySelectorAll('.cf-nav-item').forEach((btn) => {
    btn.addEventListener('click', () => emit('navigate', btn.dataset.tab));
  });
}