let current = null;

export function openModal({ title, subtitle, content, onClose, actions = [] }) {
  closeModal();
  const host = document.getElementById('app-modals');
  const backdrop = document.createElement('div');
  backdrop.className = 'cf-modal-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-label', title || 'Dialog');
  const actionsHtml = actions.length
    ? `<div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap">${actions
        .map((a, i) => `<button class="cf-btn ${a.variant || 'cf-btn-ghost'}" data-idx="${i}">${a.label}</button>`)
        .join('')}</div>`
    : '';
  backdrop.innerHTML = `
    <div class="cf-modal">
      <div class="cf-modal-handle"></div>
      ${title ? `<h3 class="cf-modal-title">${title}</h3>` : ''}
      ${subtitle ? `<p class="cf-modal-sub">${subtitle}</p>` : ''}
      <div class="cf-modal-body">${typeof content === 'string' ? content : ''}</div>
      ${actionsHtml}
    </div>`;
  host.appendChild(backdrop);
  if (typeof content !== 'string' && content instanceof Node) {
    backdrop.querySelector('.cf-modal-body').appendChild(content);
  }
  const close = () => {
    backdrop.remove();
    current = null;
    if (onClose) onClose();
  };
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  backdrop.querySelectorAll('[data-idx]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const a = actions[Number(btn.dataset.idx)];
      if (a && a.onClick) a.onClick(close);
      else close();
    });
  });
  current = { close, backdrop };
  return current;
}

export function closeModal() {
  if (current) current.close();
}