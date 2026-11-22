import { DEMO_CODES } from '../data/demoCodes.js';
import { getProductById } from '../data/products.js';
import { hasCodeBeenUsed, earnPoints } from './loyaltyService.js';

// Validate a scanned QR payload.
// IMPORTANT: In production, this must call a backend endpoint.
// The point value must NEVER be trusted from the QR code itself.
export async function validateQR(payload) {
  let data;
  try {
    data = typeof payload === 'string' ? JSON.parse(payload) : payload;
  } catch {
    return { ok: false, error: 'invalid', message: 'This QR code is not a valid Cloud Flare product code.' };
  }
  if (!data || data.type !== 'CLOUD_FLARE_PRODUCT' || !data.code) {
    return { ok: false, error: 'invalid', message: 'This QR code is not a valid Cloud Flare product code.' };
  }

  // Demo-only: verify the code exists in the demo catalog.
  const demo = DEMO_CODES.find((c) => c.code === data.code);
  if (!demo) {
    return { ok: false, error: 'unknown', message: 'Unknown product code.' };
  }
  if (demo.used) {
    return { ok: false, error: 'used', message: 'This code has already been redeemed.' };
  }
  const product = getProductById(demo.productId);
  if (!product) {
    return { ok: false, error: 'unknown', message: 'Product not found in catalog.' };
  }
  return { ok: true, product, code: demo.code };
}

export async function processScan({ userId, payload }) {
  const v = await validateQR(payload);
  if (!v.ok) return v;

  // Double-check single-use via ledger (defense in depth)
  if (await hasCodeBeenUsed(v.code)) {
    return { ok: false, error: 'used', message: 'This code has already been redeemed.' };
  }

  const txn = await earnPoints({
    userId,
    productId: v.product.id,
    productName: v.product.name,
    productImage: v.product.image,
    points: v.product.points,
    code: v.code,
  });

  return { ok: true, product: v.product, transaction: txn };
}