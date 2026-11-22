export const REWARDS = [
  {
    id: 'RWD-001',
    name: 'Coffee Voucher',
    description: 'Enjoy a complimentary premium coffee.',
    points: 50,
    category: 'Vouchers',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop',
  },
  {
    id: 'RWD-002',
    name: 'Shopping Discount',
    description: 'Get ₹100 off your next eligible purchase.',
    points: 100,
    category: 'Discounts',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&auto=format&fit=crop',
  },
  {
    id: 'RWD-003',
    name: 'Premium Gift Box',
    description: 'Unbox an exclusive Cloud Flare surprise.',
    points: 150,
    category: 'Gifts',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop',
  },
  {
    id: 'RWD-004',
    name: 'Wireless Earbuds',
    description: 'Enjoy wireless sound wherever you go.',
    points: 250,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop',
  },
  {
    id: 'RWD-005',
    name: 'Smartwatch',
    description: 'Upgrade your everyday lifestyle.',
    points: 500,
    category: 'Wearables',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6234f9?w=600&auto=format&fit=crop',
  },
  {
    id: 'RWD-006',
    name: 'Travel Backpack',
    description: 'Travel comfortably with our premium backpack.',
    points: 750,
    category: 'Travel',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop',
  },
  {
    id: 'RWD-007',
    name: 'Bluetooth Speaker',
    description: 'Take your favorite music anywhere.',
    points: 1000,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop',
  },
  {
    id: 'RWD-008',
    name: 'Premium Smartphone',
    description: 'Unlock our exclusive grand loyalty reward.',
    points: 5000,
    category: 'Grand Rewards',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop',
  },
];

export function getRewardById(id) {
  return REWARDS.find((r) => r.id === id) || null;
}