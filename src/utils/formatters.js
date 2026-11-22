export const formatPoints = (n) =>
  new Intl.NumberFormat('en-IN').format(Number(n) || 0);

export const formatINR = (n) =>
  '₹' + new Intl.NumberFormat('en-IN').format(Number(n) || 0);

export const formatMemberId = (n) => {
  const padded = String(n).padStart(7, '0');
  return `CF-${padded}`;
};

export const truncate = (s, n = 40) =>
  s && s.length > n ? s.slice(0, n - 1) + '…' : s || '';