import { storage } from './storageService.js';
import { getBalances } from './loyaltyService.js';
import { REWARDS, getRewardById } from '../data/rewards.js';
import { nowISO } from '../utils/dateUtils.js';

const MIN_REDEEM_POINTS = 50;

export async function listRewards() {
  return REWARDS;
}

export async function getRedemptions(userId) {
  const all = await storage.getAllByIndex('redemptions', 'userId', userId);
  return all.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function redeemReward({ userId, rewardId }) {
  const reward = getRewardById(rewardId);
  if (!reward) throw new Error('Reward not found.');
  const balances = await getBalances(userId);
  if (balances.availablePoints < reward.points) {
    throw new Error('Insufficient points for this reward.');
  }
  if (balances.availablePoints - reward.points < 0) {
    throw new Error('Insufficient points for this reward.');
  }
  const id = 'RDM-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  const redemption = {
    id,
    userId,
    rewardId,
    rewardName: reward.name,
    rewardImage: reward.image,
    points: reward.points,
    status: 'issued', // pending | issued | fulfilled | collected
    createdAt: nowISO(),
  };
  await storage.put('redemptions', redemption);

  // Record redeem transaction (atomic subtraction via ledger)
  const txnId = 'TXN-RDM-' + Date.now().toString(36).toUpperCase();
  await storage.put('transactions', {
    id: txnId,
    userId,
    kind: 'redeem',
    amount: reward.points,
    rewardId,
    rewardName: reward.name,
    redemptionId: id,
    createdAt: nowISO(),
  });

  const newBalances = await getBalances(userId);
  return { redemption, newBalances };
}

export function canRedeem(availablePoints) {
  return availablePoints >= MIN_REDEEM_POINTS;
}

export function affordableRewards(availablePoints, rewards = REWARDS) {
  return rewards.filter((r) => r.points <= availablePoints);
}

export function nextReward(availablePoints, rewards = REWARDS) {
  const sorted = [...rewards].sort((a, b) => a.points - b.points);
  const next = sorted.find((r) => r.points > availablePoints);
  if (!next) return null;
  const remaining = next.points - availablePoints;
  const progress = Math.max(0, Math.min(100, (availablePoints / next.points) * 100));
  return { reward: next, remaining, progress };
}