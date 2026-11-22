// Lightweight Node-side tests exercising pure logic (no DOM).
// Run with: npm test
import assert from 'node:assert/strict';
import { computeBalances } from '../src/utils/pointsCalculator.js';
import { validateRegistration, validateLogin } from '../src/utils/validators.js';
import { formatPoints, formatMemberId } from '../src/utils/formatters.js';
import { getTierFor, getNextTier } from '../src/data/membershipTiers.js';
import { nextReward, affordableRewards, canRedeem } from '../src/services/rewardService.js';

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); console.log('  ✓', name); passed++; }
  catch (e) { console.log('  ✗', name, '\n   ', e.message); failed++; }
}
async function testAsync(name, fn) {
  try { await fn(); console.log('  ✓', name); passed++; }
  catch (e) { console.log('  ✗', name, '\n   ', e.message); failed++; }
}

console.log('\nCloud Flare Rewards — unit tests\n');

test('formatPoints uses Indian grouping', () => {
  assert.equal(formatPoints(1250), '1,250');
  assert.equal(formatPoints(100000), '1,00,000');
});

test('formatMemberId pads to 7 digits', () => {
  assert.equal(formatMemberId(1024), 'CF-0001024');
});

test('Registration validation catches bad input', () => {
  const r = validateRegistration({ firstName: '', lastName: '', mobile: '123', email: 'x', password: '123', confirmPassword: '12', acceptTerms: false });
  assert.equal(r.valid, false);
  assert.ok(r.errors.firstName);
  assert.ok(r.errors.mobile);
  assert.ok(r.errors.email);
  assert.ok(r.errors.password);
  assert.ok(r.errors.confirmPassword);
  assert.ok(r.errors.acceptTerms);
});

test('Login validation accepts email and mobile', () => {
  assert.equal(validateLogin({ identity: 'a@b.com', password: '123456' }).valid, true);
  assert.equal(validateLogin({ identity: '9876543210', password: '123456' }).valid, true);
  assert.equal(validateLogin({ identity: 'nope', password: '123456' }).valid, false);
});

test('computeBalances derives correct totals', () => {
  const txs = [
    { kind: 'earn', amount: 100 },
    { kind: 'earn', amount: 75 },
    { kind: 'redeem', amount: 50 },
    { kind: 'bonus', amount: 50 },
  ];
  const b = computeBalances(txs);
  assert.equal(b.availablePoints, 175);
  assert.equal(b.lifetimeEarnedPoints, 225);
  assert.equal(b.redeemedPoints, 50);
  assert.equal(b.successfulScans, 2);
});

test('Balance 49 disables redemption', () => {
  assert.equal(canRedeem(49), false);
});

test('Balance 50 enables redemption', () => {
  assert.equal(canRedeem(50), true);
});

test('Balance 175 makes all rewards <=175 affordable', () => {
  const rewards = [
    { id: 'a', points: 50 }, { id: 'b', points: 100 },
    { id: 'c', points: 150 }, { id: 'd', points: 250 },
  ];
  const aff = affordableRewards(175, rewards).map((r) => r.id);
  assert.deepEqual(aff, ['a', 'b', 'c']);
});

test('Redeeming 100 from 175 leaves 75', () => {
  const txs = [
    { kind: 'earn', amount: 175 },
    { kind: 'redeem', amount: 100 },
  ];
  const b = computeBalances(txs);
  assert.equal(b.availablePoints, 75);
  // Lifetime earned must NOT reduce
  assert.equal(b.lifetimeEarnedPoints, 175);
});

test('nextReward picks the closest locked reward', () => {
  const rewards = [{ points: 50 }, { points: 100 }, { points: 250 }];
  const nr = nextReward(175, rewards);
  assert.equal(nr.reward.points, 250);
  assert.equal(nr.remaining, 75);
  assert.ok(nr.progress > 0 && nr.progress < 100);
});

test('Tier thresholds resolve correctly', () => {
  assert.equal(getTierFor(0).key, 'Bronze');
  assert.equal(getTierFor(200).key, 'Silver');
  assert.equal(getTierFor(500).key, 'Gold');
  assert.equal(getTierFor(1000).key, 'Platinum');
  assert.equal(getNextTier(175).key, 'Silver');
  assert.equal(getNextTier(1000), null);
});

await testAsync('IndexedDB reads resolve stored values', async () => {
  const user = { id: 'user-1', firstName: 'Test' };
  const db = {
    transaction(storeName) {
      const tx = {
        objectStore() {
          return {
            get: () => createRequest(user),
            getAll: () => createRequest([user]),
          };
        },
      };
      setTimeout(() => setTimeout(() => tx.oncomplete(), 0), 0);
      return tx;
    },
  };
  Object.defineProperty(globalThis, 'indexedDB', {
    configurable: true,
    value: {
      open() {
        const request = {};
        setTimeout(() => {
          request.result = db;
          request.onsuccess();
        }, 0);
        return request;
      },
    },
  });
  const { storage } = await import('../src/services/storageService.js');
  assert.deepEqual(await storage.get('users', user.id), user);
  assert.deepEqual(await storage.getAll('users'), [user]);
});

function createRequest(result) {
  const request = { result, onsuccess: null, onerror: null };
  setTimeout(() => request.onsuccess(), 0);
  return request;
}

console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);