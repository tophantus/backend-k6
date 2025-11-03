export function generateRandomBrand() {
  const rand = Math.random().toString(36).substring(2, 8);
  return {
    name: `Brand ${rand}`,
    description: 'Performance test brand',
    isActive: true,
  };
}
