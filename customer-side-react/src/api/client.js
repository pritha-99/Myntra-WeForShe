// Base URL is empty — Vite dev proxy forwards /api/* to http://localhost:4001 (customer-side-backend)
const BASE_URL = '';


export async function fetchSellersGrouped() {
  const res = await fetch(`${BASE_URL}/api/customer/sellers-grouped`);
  if (!res.ok) throw new Error('Failed to fetch sellers');
  return res.json();
}

export async function fetchSellerDetail(sellerId) {
  const res = await fetch(`${BASE_URL}/api/customer/sellers/${sellerId}`);
  if (!res.ok) throw new Error('Seller not found');
  return res.json();
}

export async function fetchSellerProducts(sellerId) {
  const res = await fetch(`${BASE_URL}/api/customer/sellers/${sellerId}/products`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}
