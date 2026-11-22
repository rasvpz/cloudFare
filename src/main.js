import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/main.css';
import './styles/components.css';
import './styles/responsive.css';

import { renderHeader, refreshHeaderUser } from './components/header.js';
import { renderBottomNav } from './components/bottomNav.js';
import { openScanner, closeScanner } from './components/qrScanner.js';
import { openModal } from './components/modal.js';
import { toast } from './components/toast.js';
import { getCurrentUser, logout } from './services/authService.js';

import { renderHomePage } from './pages/home.js';
import { renderRewardsPage } from './pages/rewards.js';
import { renderActivityPage } from './pages/activity.js';
import { renderProfilePage } from './pages/profile.js';
import { renderLoginPage } from './pages/login.js';
import { renderRegisterPage } from './pages/register.js';

const AUTH_REQUIRED = new Set(['home', 'rewards', 'activity', 'profile']);
const PUBLIC_PAGES = new Set(['login', 'register']);

let currentPage = 'home';

const listeners = new Map();
export function on(event, fn) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(fn);
}
export function off(event, fn) { listeners.get(event)?.delete(fn); }
export function emit(event, payload) { listeners.get(event)?.forEach((fn) => fn(payload)); }

async function navigate(page) {
  const user = await getCurrentUser();
  if (AUTH_REQUIRED.has(page) && !user) { page = 'login'; }
  if (PUBLIC_PAGES.has(page) && user && page !== 'login') {
    // already logged in, keep them where they want
  }
  currentPage = page;
  const showNav = !['login', 'register'].includes(page);
  document.getElementById('app-bottom-nav').style.display = showNav ? '' : 'none';
  renderBottomNav(['home', 'rewards', 'activity', 'profile'].includes(page) ? page : null);

  switch (page) {
    case 'home': return renderHomePage();
    case 'rewards': return renderRewardsPage();
    case 'activity': return renderActivityPage();
    case 'profile': return renderProfilePage();
    case 'login': return renderLoginPage();
    case 'register': return renderRegisterPage();
    default: return renderHomePage();
  }
}

async function openProfileMenu() {
  const user = await getCurrentUser();
  if (!user) { navigate('login'); return; }
  openModal({
    title: `${user.firstName} ${user.lastName}`,
    subtitle: `${user.email} • ${user.memberId}`,
    content: `
      <div class="cf-menu">
        <button class="cf-menu-item" data-act="profile"><i class="bi bi-person-circle"></i> View Profile</button>
        <button class="cf-menu-item" data-act="rewards"><i class="bi bi-gift"></i> My Rewards</button>
        <button class="cf-menu-item" data-act="activity"><i class="bi bi-clock-history"></i> Activity</button>
        <button class="cf-menu-item danger" data-act="logout"><i class="bi bi-box-arrow-right"></i> Logout</button>
      </div>`,
  });
  document.querySelectorAll('#app-modals [data-act]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const act = btn.dataset.act;
      if (act === 'logout') {
        await logout();
        await refreshHeaderUser();
        toast({ type: 'info', message: 'You have been logged out.' });
        navigate('login');
      } else if (act === 'profile') navigate('profile');
      else if (act === 'rewards') navigate('rewards');
      else if (act === 'activity') navigate('activity');
    });
  });
}

async function init() {
  renderHeader();
  on('navigate', navigate);
  on('open-scanner', openScanner);
  on('close-scanner', closeScanner);
  on('open-profile-menu', openProfileMenu);

  const user = await getCurrentUser();
  navigate(user ? 'home' : 'login');

  // PWA update prompt
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const reg = await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
        reg.addEventListener('updatefound', () => {
          const w = reg.installing;
          w.addEventListener('statechange', () => {
            if (w.state === 'installed' && navigator.serviceWorker.controller) {
              toast({
                type: 'info',
                message: 'A new version is available.',
                duration: 8000,
                icon: 'bi-arrow-clockwise',
              });
            }
          });
        });
      } catch (e) { console.warn('SW registration failed', e); }
    });
  }
}

init();