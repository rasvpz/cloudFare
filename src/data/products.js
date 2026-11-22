// Product catalog. In production this would come from a backend.
export const PRODUCTS = [
  {
    id: 'PROD-10001',
    name: 'Premium Coffee Pack',
    category: 'Beverages',
    price: 299,
    points: 15,
    badge: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop',
  },
  {
    id: 'PROD-10002',
    name: 'Smart Water Bottle',
    category: 'Lifestyle',
    price: 599,
    points: 30,
    badge: 'New',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop',
  },
  {
    id: 'PROD-10003',
    name: 'Organic Tea Collection',
    category: 'Beverages',
    price: 399,
    points: 20,
    badge: 'Organic',
    image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600&auto=format&fit=crop',
  },
  {
    id: 'PROD-10004',
    name: 'Bluetooth Speaker',
    category: 'Electronics',
    price: 1499,
    points: 75,
    badge: 'Hot',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop',
  },
  {
    id: 'PROD-10005',
    name: 'Travel Backpack',
    category: 'Travel',
    price: 1299,
    points: 65,
    badge: 'Trending',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop',
  },
  {
    id: 'PROD-10006',
    name: 'Wireless Mouse',
    category: 'Electronics',
    price: 799,
    points: 40,
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop',
  },
  {
    id: 'PROD-10007',
    name: 'Desk Organizer',
    category: 'Office',
    price: 499,
    points: 25,
    badge: 'Essential',
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed8?w=600&auto=format&fit=crop',
  },
  {
    id: 'PROD-10008',
    name: 'Fitness Band',
    category: 'Wearables',
    price: 1999,
    points: 100,
    badge: 'Premium',
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&auto=format&fit=crop',
  },
];

export function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id) || null;
}