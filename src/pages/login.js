import { login } from '../services/authService.js';
import { validateLogin } from '../utils/validators.js';
import { emit } from '../main.js';
import { toast } from '../components/toast.js';
import { refreshHeaderUser } from '../components/header.js';

export function renderLoginPage() {
  const main = document.getElementById('app-main');
  main.innerHTML = `
    <section class="page" aria-label="Login">
      <div style="text-align:center;margin:10px 0 20px">
        <div style="width:64px;height:64px;border-radius:20px;background:linear-gradient(135deg,#0F2C55,#1A3B6E);display:grid;place-items:center;margin:0 auto;box-shadow:var(--cf-shadow-md),inset 0 0 0 1px rgba(245,196,81,0.25)">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M7 16c-2.2 0-4-1.6-4-3.6S4.8 9 7 9c.3-2.4 2.5-4.2 5.2-4.2 2.5 0 4.6 1.6 5.1 3.7 2.1.3 3.7 1.9 3.7 3.7 0 2-1.6 3.6-3.7 3.6H7z" fill="#F5C451"/></svg>
        </div>
        <h1 style="font-size:22px;font-weight:800;margin:12px 0 4px">Welcome back</h1>
        <p style="color:var(--cf-text-2);font-size:13px;margin:0">Log in to continue earning rewards.</p>
      </div>

      <form id="cf-login-form" novalidate>
        <div class="cf-field">
          <label for="li-identity">Mobile or Email</label>
          <input class="cf-input" id="li-identity" name="identity" autocomplete="username" placeholder="you@example.com or 98xxxxxxxx" />
          <div class="cf-field-error" data-error="identity"></div>
        </div>
        <div class="cf-field">
          <label for="li-password">Password</label>
          <div class="cf-input-wrap">
            <input class="cf-input" id="li-password" name="password" type="password" autocomplete="current-password" placeholder="••••••••" />
            <button type="button" class="cf-toggle-pass" aria-label="Show password"><i class="bi bi-eye"></i></button>
          </div>
          <div class="cf-field-error" data-error="password"></div>
        </div>
        <button type="submit" class="cf-btn cf-btn-primary" style="width:100%;margin-top:6px" id="li-submit">
          <span>Log In</span>
        </button>
        <p style="text-align:center;color:var(--cf-text-2);font-size:13px;margin:16px 0 0">
          New here? <a href="#" id="li-goto-register">Create an account</a>
        </p>
      </form>
    </section>`;

  const form = main.querySelector('#cf-login-form');
  const submit = main.querySelector('#li-submit');
  const passInput = main.querySelector('#li-password');
  main.querySelector('.cf-toggle-pass').addEventListener('click', () => {
    const isPw = passInput.type === 'password';
    passInput.type = isPw ? 'text' : 'password';
    main.querySelector('.cf-toggle-pass i').className = isPw ? 'bi bi-eye-slash' : 'bi bi-eye';
  });
  main.querySelector('#li-goto-register').addEventListener('click', (e) => { e.preventDefault(); emit('navigate', 'register'); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    main.querySelectorAll('.cf-field-error').forEach((el) => (el.textContent = ''));
    main.querySelectorAll('.cf-input.error').forEach((el) => el.classList.remove('error'));

    const data = {
      identity: form.identity.value,
      password: form.password.value,
    };
    const v = validateLogin(data);
    if (!v.valid) {
      Object.entries(v.errors).forEach(([k, msg]) => {
        const err = main.querySelector(`[data-error="${k}"]`);
        const input = form.querySelector(`[name="${k}"]`);
        if (err) err.textContent = msg;
        if (input) input.classList.add('error');
      });
      return;
    }
    submit.disabled = true; submit.innerHTML = '<i class="bi bi-hourglass-split"></i> Signing in...';
    try {
      await login(data.identity, data.password);
      await refreshHeaderUser();
      toast({ type: 'success', message: 'Welcome back!' });
      emit('navigate', 'home');
    } catch (err) {
      toast({ type: 'error', message: err.message });
    } finally {
      submit.disabled = false; submit.innerHTML = '<span>Log In</span>';
    }
  });
}