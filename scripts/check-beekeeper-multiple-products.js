const fs = require('fs');
const path = require('path');

// Read products data
const productsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/products.json'), 'utf8')
);

// Group products by seller
const sellerProducts = new Map();
productsData.products.forEach((product) => {
  const sellerId = product.seller.id;
  const sellerName = product.seller.name;
  
  if (!sellerProducts.has(sellerId)) {
    sellerProducts.set(sellerId, {
      id: sellerId,
      name: sellerName,
      products: []
    });
  }
  
  sellerProducts.get(sellerId).products.push(product);
});

console.log('\n🔍 Checking beekeepers with multiple products...\n');

// Find beekeepers with multiple products
const beekeepersWithMultipleProducts = Array.from(sellerProducts.values())
  .filter(seller => seller.products.length > 1)
  .sort((a, b) => b.products.length - a.products.length);

if (beekeepersWithMultipleProducts.length > 0) {
  console.log(`Found ${beekeepersWithMultipleProducts.length} beekeepers with multiple products:\n`);
  beekeepersWithMultipleProducts.forEach(seller => {
    console.log(`${seller.name} (ID: ${seller.id}): ${seller.products.length} products`);
    seller.products.forEach(p => {
      console.log(`  - Product ${p.id}: ${p.name}`);
    });
    console.log('');
  });
} else {
  console.log('No beekeepers with multiple products found.\n');
}

// Summary
console.log('📊 Summary:');
const productCounts = Array.from(sellerProducts.values()).map(s => s.products.length);
const maxProducts = Math.max(...productCounts);
const minProducts = Math.min(...productCounts);
const avgProducts = (productCounts.reduce((a, b) => a + b, 0) / productCounts.length).toFixed(2);

console.log(`  Total beekeepers: ${sellerProducts.size}`);
console.log(`  Products per beekeeper: ${minProducts} - ${maxProducts} (avg: ${avgProducts})`);
console.log(`  Beekeepers with 1 product: ${productCounts.filter(c => c === 1).length}`);
console.log(`  Beekeepers with 2+ products: ${productCounts.filter(c => c > 1).length}`);
console.log(`  Beekeepers with 3+ products: ${productCounts.filter(c => c >= 3).length}`);
console.log('');
