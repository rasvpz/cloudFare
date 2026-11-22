import { getCurrentUser, logout, updateCurrentUser } from '../services/authService.js';
import { getBalances, getMembershipTier } from '../services/loyaltyService.js';
import { getRedemptions } from '../services/rewardService.js';
import { formatPoints } from '../utils/formatters.js';
import { formatDate } from '../utils/dateUtils.js';
import { emit } from '../main.js';
import { openModal } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { refreshHeaderUser } from '../components/header.js';

export async function renderProfilePage() {
  const main = document.getElementById('app-main');
  const user = await getCurrentUser();
  if (!user) { emit('navigate', 'login'); return; }
  const b = await getBalances(user.id);
  const tier = await getMembershipTier(user.id);
  const redemptions = await getRedemptions(user.id);
  const initial = (user.firstName || '?').charAt(0).toUpperCase();

  main.innerHTML = `
    <section class="page" aria-label="Profile">
      <div class="cf-profile-head">
        <div class="cf-profile-avatar" id="cf-profile-avatar">
          ${user.avatar ? `<img src="${user.avatar}" alt="">` : initial}
        </div>
        <div style="flex:1">
          <div class="cf-profile-name">${user.firstName} ${user.lastName}</div>
          <div class="cf-profile-meta">${user.mobile} • ${user.email}</div>
          <div class="cf-profile-meta">Member ID: <b style="color:var(--cf-gold)">${user.memberId}</b> • Since ${formatDate(user.joinedAt)}</div>
          <div class="cf-profile-meta">Tier: <b style="color:${tier.color}">${tier.key}</b> • <b style="color:var(--cf-emerald)">${formatPoints(b.availablePoints)} pts</b></div>
        </div>
      </div>

      <div class="cf-menu" style="margin-top:14px">
        <button class="cf-menu-item" data-action="edit"><i class="bi bi-person-lines-fill"></i> Edit Profile</button>
        <button class="cf-menu-item" data-action="rewards"><i class="bi bi-gift"></i> My Rewards <span style="margin-left:auto;color:var(--cf-text-2);font-weight:500">${redemptions.length}</span></button>
        <button class="cf-menu-item" data-action="history"><i class="bi bi-clock-history"></i> Redemption History</button>
        <button class="cf-menu-item" data-action="notif"><i class="bi bi-bell"></i> Notification Preferences</button>
        <button class="cf-menu-item" data-action="terms"><i class="bi bi-file-earmark-text"></i> Terms and Conditions</button>
        <button class="cf-menu-item" data-action="privacy"><i class="bi bi-shield-lock"></i> Privacy Policy</button>
        <button class="cf-menu-item" data-action="help"><i class="bi bi-question-circle"></i> Help and Support</button>
        <button class="cf-menu-item" data-action="demo-qr"><i class="bi bi-qr-code"></i> Developer: Test QR Codes</button>
        <button class="cf-menu-item danger" data-action="logout"><i class="bi bi-box-arrow-right"></i> Logout</button>
      </div>
    </section>`;

  main.querySelector('#cf-profile-avatar').addEventListener('click', () => uploadAvatar(user));

  main.querySelectorAll('.cf-menu-item').forEach((btn) => {
    btn.addEventListener('click', () => handleMenu(btn.dataset.action, user));
  });
}

async function uploadAvatar(user) {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = 'image/*';
  input.addEventListener('change', async () => {
    const file = input.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      await updateCurrentUser({ avatar: reader.result });
      await refreshHeaderUser();
      renderProfilePage();
      toast({ type: 'success', message: 'Profile picture updated.' });
    };
    reader.readAsDataURL(file);
  });
  input.click();
}

function handleMenu(action, user) {
  if (action === 'edit') {
    openModal({
      title: 'Edit Profile',
      content: `
        <div class="cf-field"><label>First Name</label><input class="cf-input" id="ef-first" value="${user.firstName}" /></div>
        <div class="cf-field"><label>Last Name</label><input class="cf-input" id="ef-last" value="${user.lastName}" /></div>
        <div class="cf-field"><label>Mobile</label><input class="cf-input" id="ef-mobile" value="${user.mobile}" /></div>`,
      actions: [
        { label: 'Cancel', variant: 'cf-btn-ghost', onClick: (c) => c() },
        { label: 'Save', variant: 'cf-btn-primary', onClick: async (c) => {
          const first = document.getElementById('ef-first').value.trim();
          const last = document.getElementById('ef-last').value.trim();
          const mobile = document.getElementById('ef-mobile').value.trim();
          if (!first || !last) { toast({ type: 'error', message: 'Names are required.' }); return; }
          await updateCurrentUser({ firstName: first, lastName: last, mobile });
          await refreshHeaderUser();
          c(); renderProfilePage();
          toast({ type: 'success', message: 'Profile updated.' });
        } },
      ],
    });
  } else if (action === 'rewards' || action === 'history') {
    emit('navigate', 'rewards');
  } else if (action === 'notif') {
    openModal({ title: 'Notification Preferences', content: `<p style="color:var(--cf-text-2)">You'll be notified about new rewards, point updates, and special offers.</p>` });
  } else if (action === 'terms') {
    openModal({ title: 'Terms and Conditions', content: `<p style="color:var(--cf-text-2)">By using Cloud Flare Rewards, you agree to earn points only through legitimate product purchases. Points are non-transferable and have no cash value. Redemptions are subject to availability.</p>` });
  } else if (action === 'privacy') {
    openModal({ title: 'Privacy Policy', content: `<p style="color:var(--cf-text-2)">We store only the data needed to operate your loyalty account. Your scan history and redemptions are kept private to your account.</p>` });
  } else if (action === 'help') {
    openModal({ title: 'Help and Support', content: `<p style="color:var(--cf-text-2)">Need help? Email <b>support@cloudflare.example</b> or scan any Cloud Flare product QR to start earning.</p>` });
  } else if (action === 'demo-qr') {
    showDemoQrUtility();
  } else if (action === 'logout') {
    openModal({
      title: 'Log out?',
      subtitle: 'You can log back in anytime.',
      actions: [
        { label: 'Cancel', variant: 'cf-btn-ghost', onClick: (c) => c() },
        { label: 'Log out', variant: 'cf-btn-danger', onClick: async (c) => {
          await logout(); c();
          emit('navigate', 'login');
          toast({ type: 'info', message: 'You have been logged out.' });
        } },
      ],
    });
  }
}

async function showDemoQrUtility() {
  const { DEMO_CODES } = await import('../data/demoCodes.js');
  const { default: QRCode } = await import('https://cdn.jsdelivr.net/npm/qrcode@1.5.3/+esm').catch(() => ({ default: null }));
  const body = document.createElement('div');
  body.innerHTML = `
    <p style="color:var(--cf-text-2);font-size:13px">Developer-only utility. Generates sample QR codes for testing. <b>Do not use in production.</b></p>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:10px" id="cf-demo-qr-grid"></div>`;
  openModal({ title: 'Test QR Codes', content: body });
  const grid = body.querySelector('#cf-demo-qr-grid');
  for (const c of DEMO_CODES) {
    const card = document.createElement('div');
    card.style.cssText = 'background:rgba(255,255,255,0.04);border:1px solid var(--cf-border);border-radius:14px;padding:10px;text-align:center';
    const payload = JSON.stringify({ version: 1, type: 'CLOUD_FLARE_PRODUCT', code: c.code });
    if (QRCode) {
      const url = await QRCode.toDataURL(payload, { width: 160, margin: 1, color: { dark: '#F5C451', light: '#061225' } });
      card.innerHTML = `<img src="${url}" alt="${c.code}" style="width:100%;border-radius:10px"/><div style="font-size:11px;color:var(--cf-text-2);margin-top:6px;word-break:break-all">${c.code}</div><div style="font-size:10px;color:${c.used ? 'var(--cf-error)' : 'var(--cf-emerald)'}">${c.used ? 'USED' : 'UNUSED'}</div>`;
    } else {
      card.innerHTML = `<div style="font-size:11px;color:var(--cf-text-2);word-break:break-all">${c.code}</div><div style="font-size:10px;color:${c.used ? 'var(--cf-error)' : 'var(--cf-emerald)'}">${c.used ? 'USED' : 'UNUSED'}</div>`;
    }
    grid.appendChild(card);
  }
}