// Demo single-use loyalty codes. In production these are minted by the backend
// and embedded in product packaging as unique QR payloads.
//
// IMPORTANT: These are for DEMONSTRATION ONLY. Real codes must be single-use,
// cryptographically signed, and validated server-side.

export const DEMO_CODES = [
  // Fresh, unused codes
  { code: 'CF-PROD-10001-A1', productId: 'PROD-10001', used: false },
  { code: 'CF-PROD-10002-B2', productId: 'PROD-10002', used: false },
  { code: 'CF-PROD-10003-C3', productId: 'PROD-10003', used: false },
  { code: 'CF-PROD-10004-D4', productId: 'PROD-10004', used: false },
  { code: 'CF-PROD-10005-E5', productId: 'PROD-10005', used: false },
  { code: 'CF-PROD-10006-F6', productId: 'PROD-10006', used: false },
  { code: 'CF-PROD-10007-G7', productId: 'PROD-10007', used: false },
  { code: 'CF-PROD-10008-H8', productId: 'PROD-10008', used: false },
  // Already-redeemed code (for duplicate testing)
  { code: 'CF-USED-9999', productId: 'PROD-10001', used: true },
];

// Invalid code examples (not in catalog)
// 'CF-INVALID-XYZ'
// 'NOT-A-CODE'