export function generateRandomCategory() {
  const rand = Math.random().toString(36).substring(2, 8);
  return {
    name: `Cate_${rand}`,
    description: 'Performance test category',
    isActive: true,
  };
}