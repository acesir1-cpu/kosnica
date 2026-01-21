const fs = require('fs');
const path = require('path');

// Read products data
const productsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/products.json'), 'utf8')
);

// Simple createSellerSlug function (same as in data.ts)
function createSellerSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/č/g, 'c')
    .replace(/Č/g, 'C')
    .replace(/ć/g, 'c')
    .replace(/Ć/g, 'C')
    .replace(/š/g, 's')
    .replace(/Š/g, 'S')
    .replace(/ž/g, 'z')
    .replace(/Ž/g, 'Z')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Get all beekeepers
const beekeepersMap = new Map();
productsData.products.forEach((product) => {
  if (!beekeepersMap.has(product.seller.id)) {
    beekeepersMap.set(product.seller.id, {
      id: product.seller.id,
      name: product.seller.name,
      slug: createSellerSlug(product.seller.name),
      products: []
    });
  }
  beekeepersMap.get(product.seller.id).products.push(product);
});

// Test: Get products by beekeeper slug
function getProductsByBeekeeperSlug(slug) {
  const beekeeper = Array.from(beekeepersMap.values()).find(b => b.slug === slug);
  if (!beekeeper) return [];
  return beekeeper.products;
}

console.log('\n🔍 Testing beekeeper products retrieval...\n');

// Test with a few beekeepers
const testBeekeepers = Array.from(beekeepersMap.values()).slice(0, 5);

testBeekeepers.forEach(beekeeper => {
  const products = getProductsByBeekeeperSlug(beekeeper.slug);
  console.log(`Beekeeper: ${beekeeper.name}`);
  console.log(`  Slug: ${beekeeper.slug}`);
  console.log(`  ID: ${beekeeper.id}`);
  console.log(`  Products found: ${products.length}`);
  console.log(`  Product IDs: ${products.map(p => p.id).join(', ')}`);
  console.log('');
});

// Check if all beekeepers have products
console.log('\n📊 Summary:');
console.log(`  Total beekeepers: ${beekeepersMap.size}`);
const beekeepersWithProducts = Array.from(beekeepersMap.values()).filter(b => b.products.length > 0);
console.log(`  Beekeepers with products: ${beekeepersWithProducts.length}`);
const beekeepersWithoutProducts = Array.from(beekeepersMap.values()).filter(b => b.products.length === 0);
if (beekeepersWithoutProducts.length > 0) {
  console.log(`  ⚠️  Beekeepers without products: ${beekeepersWithoutProducts.length}`);
  beekeepersWithoutProducts.forEach(b => {
    console.log(`    - ${b.name} (ID: ${b.id})`);
  });
}
console.log('');
