export function generateRandomProduct(brandId = null) {
  const rand = Math.floor(Math.random() * 100000);

  return {
    sku: `SKU_${rand}`,
    name: `Product_${rand}`,
    description: 'K6 test product',
    quantity: Math.floor(Math.random() * 20) + 1,
    price: Math.floor(Math.random() * 100000) + 10000,
    taxable: Math.random() > 0.5,
    isActive: true,
    brand: brandId,
  };
}
