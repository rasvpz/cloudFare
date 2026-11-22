// Editable tier configuration.
// Redeeming points must NOT reduce lifetimeEarnedPoints or downgrade the tier.
export const MEMBERSHIP_TIERS = [
  { key: 'Bronze',   min: 0,    color: '#CD7F32', icon: 'bi-award' },
  { key: 'Silver',   min: 200,  color: '#C0C0C0', icon: 'bi-shield-check' },
  { key: 'Gold',     min: 500,  color: '#F5C451', icon: 'bi-star-fill' },
  { key: 'Platinum', min: 1000, color: '#A8B8FF', icon: 'bi-gem' },
];

export function getTierFor(lifetimePoints) {
  let tier = MEMBERSHIP_TIERS[0];
  for (const t of MEMBERSHIP_TIERS) {
    if (lifetimePoints >= t.min) tier = t;
  }
  return tier;
}

export function getNextTier(lifetimePoints) {
  for (const t of MEMBERSHIP_TIERS) {
    if (lifetimePoints < t.min) return t;
  }
  return null;
}