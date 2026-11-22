import { register } from '../services/authService.js';
import { validateRegistration } from '../utils/validators.js';
import { emit } from '../main.js';
import { toast } from '../components/toast.js';
import { refreshHeaderUser } from '../components/header.js';

export function renderRegisterPage() {
  const main = document.getElementById('app-main');
  main.innerHTML = `
    <section class="page" aria-label="Create account">
      <div style="text-align:center;margin:10px 0 18px">
        <h1 style="font-size:22px;font-weight:800;margin:0 0 4px">Join Cloud Flare Rewards</h1>
        <p style="color:var(--cf-text-2);font-size:13px;margin:0">Scan More. Earn More. Live Rewarded.</p>
      </div>
      <form id="cf-register-form" novalidate>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div class="cf-field">
            <label for="r-first">First Name</label>
            <input class="cf-input" id="r-first" name="firstName" autocomplete="given-name" />
            <div class="cf-field-error" data-error="firstName"></div>
          </div>
          <div class="cf-field">
            <label for="r-last">Last Name</label>
            <input class="cf-input" id="r-last" name="lastName" autocomplete="family-name" />
            <div class="cf-field-error" data-error="lastName"></div>
          </div>
        </div>
        <div class="cf-field">
          <label for="r-mobile">Mobile Number</label>
          <input class="cf-input" id="r-mobile" name="mobile" inputmode="tel" autocomplete="tel" placeholder="98xxxxxxxx" />
          <div class="cf-field-error" data-error="mobile"></div>
        </div>
        <div class="cf-field">
          <label for="r-email">Email Address</label>
          <input class="cf-input" id="r-email" name="email" type="email" autocomplete="email" />
          <div class="cf-field-error" data-error="email"></div>
        </div>
        <div class="cf-field">
          <label for="r-password">Password</label>
          <div class="cf-input-wrap">
            <input class="cf-input" id="r-password" name="password" type="password" autocomplete="new-password" />
            <button type="button" class="cf-toggle-pass" data-target="r-password" aria-label="Show password"><i class="bi bi-eye"></i></button>
          </div>
          <div class="cf-field-error" data-error="password"></div>
        </div>
        <div class="cf-field">
          <label for="r-confirm">Confirm Password</label>
          <div class="cf-input-wrap">
            <input class="cf-input" id="r-confirm" name="confirmPassword" type="password" autocomplete="new-password" />
            <button type="button" class="cf-toggle-pass" data-target="r-confirm" aria-label="Show password"><i class="bi bi-eye"></i></button>
          </div>
          <div class="cf-field-error" data-error="confirmPassword"></div>
        </div>
        <div class="cf-field" style="display:flex;align-items:flex-start;gap:8px">
          <input type="checkbox" id="r-terms" name="acceptTerms" style="margin-top:4px" />
          <label for="r-terms" style="font-size:12px;color:var(--cf-text-2);margin:0">I accept the <a href="#">Terms and Conditions</a> and <a href="#">Privacy Policy</a>.</label>
        </div>
        <div class="cf-field-error" data-error="acceptTerms" style="margin-top:-8px"></div>
        <button type="submit" class="cf-btn cf-btn-primary" style="width:100%;margin-top:6px" id="r-submit">Create Account</button>
        <p style="text-align:center;color:var(--cf-text-2);font-size:13px;margin:14px 0 0">
          Already a member? <a href="#" id="r-goto-login">Log in</a>
        </p>
      </form>
    </section>`;

  main.querySelectorAll('.cf-toggle-pass').forEach((b) => {
    b.addEventListener('click', () => {
      const input = main.querySelector('#' + b.dataset.target);
      const isPw = input.type === 'password';
      input.type = isPw ? 'text' : 'password';
      b.querySelector('i').className = isPw ? 'bi bi-eye-slash' : 'bi bi-eye';
    });
  });
  main.querySelector('#r-goto-login').addEventListener('click', (e) => { e.preventDefault(); emit('navigate', 'login'); });

  const form = main.querySelector('#cf-register-form');
  const submit = main.querySelector('#r-submit');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    main.querySelectorAll('.cf-field-error').forEach((el) => (el.textContent = ''));
    main.querySelectorAll('.cf-input.error').forEach((el) => el.classList.remove('error'));

    const data = {
      firstName: form.firstName.value,
      lastName: form.lastName.value,
      mobile: form.mobile.value,
      email: form.email.value,
      password: form.password.value,
      confirmPassword: form.confirmPassword.value,
      acceptTerms: form.acceptTerms.checked,
    };
    const v = validateRegistration(data);
    if (!v.valid) {
      Object.entries(v.errors).forEach(([k, msg]) => {
        const err = main.querySelector(`[data-error="${k}"]`);
        const input = form.querySelector(`[name="${k}"]`);
        if (err) err.textContent = msg;
        if (input) input.classList.add('error');
      });
      return;
    }
    submit.disabled = true; submit.innerHTML = '<i class="bi bi-hourglass-split"></i> Creating account...';
    try {
      await register(data);
      await refreshHeaderUser();
      toast({ type: 'success', message: 'Account created! Welcome bonus: +175 pts.' });
      emit('navigate', 'home');
    } catch (err) {
      toast({ type: 'error', message: err.message });
    } finally {
      submit.disabled = false; submit.innerHTML = 'Create Account';
    }
  });
}