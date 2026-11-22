export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || ''));
export const isMobile = (v) => /^[6-9]\d{9}$/.test(String(v || '').replace(/\D/g, ''));
export const isStrongPassword = (v) => String(v || '').length >= 6;

export function validateRegistration(data) {
  const errors = {};
  if (!data.firstName || data.firstName.trim().length < 2) errors.firstName = 'Enter your first name.';
  if (!data.lastName || data.lastName.trim().length < 2) errors.lastName = 'Enter your last name.';
  if (!isMobile(data.mobile)) errors.mobile = 'Enter a valid 10-digit mobile number.';
  if (!isEmail(data.email)) errors.email = 'Enter a valid email address.';
  if (!isStrongPassword(data.password)) errors.password = 'Password must be at least 6 characters.';
  if (data.password !== data.confirmPassword) errors.confirmPassword = 'Passwords do not match.';
  if (!data.acceptTerms) errors.acceptTerms = 'Please accept the terms and conditions.';
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateLogin(data) {
  const errors = {};
  const id = String(data.identity || '').trim();
  if (!id) errors.identity = 'Enter your mobile or email.';
  else if (!isEmail(id) && !isMobile(id)) errors.identity = 'Enter a valid mobile or email.';
  if (!isStrongPassword(data.password)) errors.password = 'Enter your password.';
  return { valid: Object.keys(errors).length === 0, errors };
}