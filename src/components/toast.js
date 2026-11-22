const stack = () => document.getElementById('app-toasts');

export function toast({ message, type = 'info', duration = 3200, icon }) {
  const host = stack();
  if (!host) return;
  const el = document.createElement('div');
  el.className = `cf-toast ${type}`;
  el.setAttribute('role', 'status');
  const iconMap = { success: 'bi-check-circle-fill', error: 'bi-exclamation-octagon-fill', info: 'bi-info-circle-fill' };
  el.innerHTML = `<i class="bi ${icon || iconMap[type] || iconMap.info}"></i><div>${message}</div>`;
  host.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity 250ms, transform 250ms';
    el.style.opacity = '0';
    el.style.transform = 'translateY(-8px)';
    setTimeout(() => el.remove(), 260);
  }, duration);
}