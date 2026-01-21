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

// Get all beekeepers (group by name, not ID)
const beekeepersMap = new Map();
productsData.products.forEach((product) => {
  const sellerName = product.seller.name;
  const slug = createSellerSlug(sellerName);
  
  if (!beekeepersMap.has(slug)) {
    beekeepersMap.set(slug, {
      name: sellerName,
      slug: slug,
      products: []
    });
  }
  beekeepersMap.get(slug).products.push(product);
});

// Test: Get products by beekeeper slug (filter by name, not ID)
function getProductsByBeekeeperSlug(slug) {
  const beekeeper = Array.from(beekeepersMap.values()).find(b => b.slug === slug);
  if (!beekeeper) return [];
  // Filter by name to get ALL products from this beekeeper
  return productsData.products.filter(p => p.seller.name === beekeeper.name);
}

console.log('\n🔍 Testing beekeeper products retrieval (FIXED - by name)...\n');

// Test with beekeepers that have multiple products
const testBeekeepers = Array.from(beekeepersMap.values())
  .filter(b => b.products.length > 1)
  .slice(0, 5);

if (testBeekeepers.length > 0) {
  testBeekeepers.forEach(beekeeper => {
    const products = getProductsByBeekeeperSlug(beekeeper.slug);
    console.log(`Beekeeper: ${beekeeper.name}`);
    console.log(`  Slug: ${beekeeper.slug}`);
    console.log(`  Products found: ${products.length}`);
    console.log(`  Product IDs: ${products.map(p => p.id).join(', ')}`);
    products.forEach(p => {
      console.log(`    - Product ${p.id}: ${p.name} (seller.id: ${p.seller.id})`);
    });
    console.log('');
  });
} else {
  console.log('No beekeepers with multiple products found for testing.\n');
}

// Test with Omer Mujić specifically
const omerSlug = createSellerSlug('Omer Mujić');
const omerProducts = getProductsByBeekeeperSlug(omerSlug);
console.log(`\n📦 Omer Mujić (slug: ${omerSlug}):`);
console.log(`  Products found: ${omerProducts.length}`);
console.log(`  Product IDs: ${omerProducts.map(p => p.id).join(', ')}`);
omerProducts.forEach(p => {
  console.log(`    - Product ${p.id}: ${p.name} (seller.id: ${p.seller.id})`);
});

// Summary
console.log('\n📊 Summary:');
console.log(`  Total unique beekeepers: ${beekeepersMap.size}`);
const productCounts = Array.from(beekeepersMap.values()).map(b => b.products.length);
const maxProducts = Math.max(...productCounts);
const minProducts = Math.min(...productCounts);
const avgProducts = (productCounts.reduce((a, b) => a + b, 0) / productCounts.length).toFixed(2);
console.log(`  Products per beekeeper: ${minProducts} - ${maxProducts} (avg: ${avgProducts})`);
console.log(`  Beekeepers with 1 product: ${productCounts.filter(c => c === 1).length}`);
console.log(`  Beekeepers with 2+ products: ${productCounts.filter(c => c > 1).length}`);
console.log('');
