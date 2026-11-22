// Derive balances from the transaction ledger.
export function computeBalances(transactions) {
  let available = 0;
  let lifetimeEarned = 0;
  let redeemed = 0;
  let scans = 0;
  for (const t of transactions) {
    if (t.kind === 'earn') {
      available += t.amount;
      lifetimeEarned += t.amount;
      scans += 1;
    } else if (t.kind === 'redeem') {
      available -= t.amount;
      redeemed += t.amount;
    } else if (t.kind === 'bonus') {
      available += t.amount;
      lifetimeEarned += t.amount;
    } else if (t.kind === 'adjust') {
      available += t.amount; // amount may be negative
      if (t.amount > 0) lifetimeEarned += t.amount;
    }
  }
  return {
    availablePoints: Math.max(0, available),
    lifetimeEarnedPoints: lifetimeEarned,
    redeemedPoints: redeemed,
    successfulScans: scans,
  };
}