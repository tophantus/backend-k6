export function generateMerchant() {
  const rand = Math.floor(Math.random() * 100000);
  return {
    name: `Merchant Test ${rand}`,
    business: 'E-commerce store',
    phoneNumber: `090${rand.toString().slice(0, 7)}`,
    email: `merchant${rand}@example.com`,
    brandName: `Brand ${rand}`,
  };
}