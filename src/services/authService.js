import { storage } from './storageService.js';
import { formatMemberId } from '../utils/formatters.js';
import { nowISO } from '../utils/dateUtils.js';

export const SESSION_KEY = 'current';

export async function register(data) {
  const id = 'USR-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  const memberId = formatMemberId(Math.floor(1000 + Math.random() * 9000000));
  const user = {
    id,
    memberId,
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    mobile: data.mobile.replace(/\D/g, ''),
    email: data.email.trim().toLowerCase(),
    password: data.password, // demo-only; real app must hash server-side
    avatar: null,
    joinedAt: nowISO(),
    acceptTerms: true,
  };
  await storage.put('users', user);
  await storage.put('sessions', { id: SESSION_KEY, userId: user.id });
  // Seed an initial earn transaction so balance is derivable
  await storage.put('transactions', {
    id: 'TXN-SEED-' + user.id,
    userId: user.id,
    kind: 'bonus',
    amount: 175,
    note: 'Welcome bonus',
    createdAt: nowISO(),
  });
  return user;
}

export async function login(identity, password) {
  const users = await storage.getAll('users');
  const needle = String(identity).trim().toLowerCase();
  const user = users.find((u) =>
    u.email.toLowerCase() === needle || u.mobile === needle.replace(/\D/g, '')
  );
  if (!user) throw new Error('No account found with that mobile or email.');
  if (user.password !== password) throw new Error('Incorrect password.');
  await storage.put('sessions', { id: SESSION_KEY, userId: user.id });
  return user;
}

export async function logout() {
  await storage.delete('sessions', SESSION_KEY);
}

export async function getCurrentUser() {
  const session = await storage.get('sessions', SESSION_KEY);
  if (!session) return null;
  const user = await storage.get('users', session.userId);
  return user || null;
}

export async function updateCurrentUser(patch) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated.');
  const updated = { ...user, ...patch };
  await storage.put('users', updated);
  return updated;
}