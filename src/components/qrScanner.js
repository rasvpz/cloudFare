import { Html5Qrcode } from 'html5-qrcode';
import { processScan } from '../services/qrService.js';
import { getCurrentUser } from '../services/authService.js';
import { getBalances } from '../services/loyaltyService.js';
import { formatPoints } from '../utils/formatters.js';
import { toast } from './toast.js';
import { emit } from '../main.js';

let scanner = null;
let hostEl = null;

export async function openScanner() {
  const user = await getCurrentUser();
  if (!user) {
    toast({ type: 'error', message: 'Please log in to scan QR codes.' });
    emit('navigate', 'login');
    return;
  }
  hostEl = document.getElementById('app-scanner');
  hostEl.innerHTML = `
    <div class="cf-scanner" role="dialog" aria-label="QR code scanner">
      <div class="cf-scanner-top">
        <div class="cf-scanner-title">Scan Product QR</div>
        <button class="cf-icon-btn" id="cf-scan-close" aria-label="Close scanner"><i class="bi bi-x-lg"></i></button>
      </div>
      <div class="cf-scanner-stage">
        <div class="cf-scanner-frame">
          <div id="cf-qr-reader"></div>
          <div class="cf-scanner-line"></div>
        </div>
      </div>
      <div class="cf-scanner-bottom">
        <button class="cf-scanner-btn" id="cf-scan-torch" aria-label="Toggle flashlight" title="Flashlight"><i class="bi bi-flashlight"></i></button>
        <button class="cf-scanner-btn" id="cf-scan-switch" aria-label="Switch camera" title="Switch camera"><i class="bi bi-arrow-repeat"></i></button>
        <button class="cf-scanner-btn" id="cf-scan-manual" aria-label="Enter code manually" title="Enter code"><i class="bi bi-keyboard"></i></button>
        <button class="cf-scanner-btn" id="cf-scan-upload" aria-label="Upload QR image" title="Upload QR"><i class="bi bi-image"></i></button>
      </div>
    </div>`;
  hostEl.querySelector('#cf-scan-close').addEventListener('click', closeScanner);
  hostEl.querySelector('#cf-scan-manual').addEventListener('click', () => promptManual(user));
  hostEl.querySelector('#cf-scan-upload').addEventListener('click', () => uploadImage(user));

  let facing = 'environment';
  try {
    scanner = new Html5Qrcode('cf-qr-reader', { verbose: false });
    await scanner.start(
      { facingMode: facing },
      { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1.0 },
      async (decodedText) => {
        // Prevent multiple fires
        try { await scanner.stop(); } catch {}
        await handleScanResult(decodedText, user);
      },
      () => { /* ignore per-frame failures */ }
    );
    hostEl.querySelector('#cf-scan-torch').addEventListener('click', async () => {
      try {
        const track = scanner.getRunningTrack?.();
        if (track) {
          const caps = track.getCapabilities?.() || {};
          if (caps.torch) {
            const settings = track.getSettings();
            await track.applyConstraints({ advanced: [{ torch: !settings.torch }] });
          } else {
            toast({ type: 'info', message: 'Flashlight not supported on this device.' });
          }
        }
      } catch { toast({ type: 'error', message: 'Unable to control flashlight.' }); }
    });
    hostEl.querySelector('#cf-scan-switch').addEventListener('click', async () => {
      try {
        await scanner.stop();
        facing = facing === 'environment' ? 'user' : 'environment';
        await scanner.start({ facingMode: facing }, { fps: 10, qrbox: { width: 240, height: 240 } },
          async (decodedText) => { try { await scanner.stop(); } catch {}; await handleScanResult(decodedText, user); },
          () => {});
      } catch { toast({ type: 'error', message: 'Unable to switch camera.' }); }
    });
  } catch (err) {
    toast({ type: 'error', message: 'Camera permission denied or unavailable.' });
    console.error(err);
  }
}

export function closeScanner() {
  if (scanner) {
    scanner.stop().then(() => scanner.clear()).catch(() => {});
    scanner = null;
  }
  if (hostEl) hostEl.innerHTML = '';
}

function promptManual(user) {
  const code = prompt('Enter the Cloud Flare product code:');
  if (code && code.trim()) handleScanResult(code.trim(), user);
}

function uploadImage(user) {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = 'image/*';
  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      if (!scanner) scanner = new Html5Qrcode('cf-qr-reader', { verbose: false });
      const result = await scanner.scanFile(file, /* showImage */ false);
      await handleScanResult(result, user);
    } catch {
      toast({ type: 'error', message: 'Could not read a QR code from that image.' });
    }
  });
  input.click();
}

async function handleScanResult(payload, user) {
  const result = await processScan({ userId: user.id, payload });
  closeScanner();
  if (!result.ok) {
    toast({ type: 'error', message: result.message });
    return;
  }
  const balances = await getBalances(user.id);
  showSuccess({
    user,
    product: result.product,
    earned: result.product.points,
    newBalance: balances.availablePoints,
  });
}

function showSuccess({ user, product, earned, newBalance }) {
  const host = document.getElementById('app-scanner');
  host.innerHTML = `
    <div class="cf-success" role="alertdialog" aria-label="Scan successful">
      <div class="cf-success-ring"><div class="cf-success-check"><i class="bi bi-check-lg"></i></div></div>
      <div class="cf-success-title">Congratulations ${user.firstName}!</div>
      <div class="cf-success-sub">You scanned <b>${product.name}</b></div>
      <div class="cf-success-pts">+${formatPoints(earned)} points</div>
      <div class="cf-success-sub" style="margin-top:6px">New balance: <b style="color:var(--cf-text)">${formatPoints(newBalance)} pts</b></div>
      <div style="display:flex;gap:10px;margin-top:22px;flex-wrap:wrap;justify-content:center">
        <button class="cf-btn cf-btn-primary" id="cf-success-home">Back to Home</button>
        <button class="cf-btn cf-btn-ghost" id="cf-success-activity">View Activity</button>
      </div>
    </div>
    <div class="cf-confetti" aria-hidden="true"></div>`;
  spawnConfetti(host.querySelector('.cf-confetti'));
  host.querySelector('#cf-success-home').addEventListener('click', () => { host.innerHTML = ''; emit('navigate', 'home'); });
  host.querySelector('#cf-success-activity').addEventListener('click', () => { host.innerHTML = ''; emit('navigate', 'activity'); });
  // Announce to screen readers
  const live = document.getElementById('app-main');
  if (live) live.setAttribute('aria-label', `You earned ${earned} points. New balance ${newBalance}.`);
}

function spawnConfetti(host) {
  const colors = ['#F5C451', '#16C784', '#FF6575', '#A8B8FF', '#F7FAFF'];
  const count = 60;
  for (let i = 0; i < count; i++) {
    const s = document.createElement('span');
    s.style.left = Math.random() * 100 + 'vw';
    s.style.background = colors[i % colors.length];
    s.style.animationDuration = (1.6 + Math.random() * 1.6) + 's';
    s.style.animationDelay = (Math.random() * 0.4) + 's';
    s.style.transform = `rotate(${Math.random() * 360}deg)`;
    host.appendChild(s);
  }
  setTimeout(() => host.remove(), 4000);
}