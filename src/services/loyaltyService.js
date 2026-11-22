import { storage } from './storageService.js';
import { computeBalances } from '../utils/pointsCalculator.js';
import { getTierFor } from '../data/membershipTiers.js';
import { nowISO } from '../utils/dateUtils.js';

export async function getTransactions(userId) {
  const all = await storage.getAllByIndex('transactions', 'userId', userId);
  return all.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getBalances(userId) {
  const txs = await getTransactions(userId);
  return computeBalances(txs);
}

export async function earnPoints({ userId, productId, productName, productImage, points, code, reference }) {
  const id = 'TXN-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  const txn = {
    id,
    userId,
    kind: 'earn',
    amount: points,
    productId,
    productName,
    productImage,
    code,
    reference: reference || id,
    createdAt: nowISO(),
  };
  await storage.put('transactions', txn);
  // Mark code used
  await storage.put('usedCodes', { code, userId, txnId: id, usedAt: nowISO() });
  return txn;
}

export async function hasCodeBeenUsed(code) {
  const used = await storage.get('usedCodes', code);
  return !!used;
}

export async function getMembershipTier(userId) {
  const b = await getBalances(userId);
  return getTierFor(b.lifetimeEarnedPoints);
}