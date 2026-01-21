const fs = require('fs');
const path = require('path');

// Read products data
const productsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/products.json'), 'utf8')
);

console.log('\n🔍 Checking seller consistency...\n');

// Group by seller name
const sellersByName = new Map();
productsData.products.forEach((product) => {
  const sellerName = product.seller.name;
  if (!sellersByName.has(sellerName)) {
    sellersByName.set(sellerName, {
      name: sellerName,
      ids: new Set(),
      products: []
    });
  }
  sellersByName.get(sellerName).ids.add(product.seller.id);
  sellersByName.get(sellerName).products.push({
    id: product.id,
    name: product.name,
    sellerId: product.seller.id
  });
});

// Find sellers with multiple IDs (inconsistency)
const inconsistentSellers = Array.from(sellersByName.entries())
  .filter(([name, data]) => data.ids.size > 1);

if (inconsistentSellers.length > 0) {
  console.log('⚠️  Found sellers with multiple IDs (inconsistency):\n');
  inconsistentSellers.forEach(([name, data]) => {
    console.log(`${name}:`);
    console.log(`  IDs: ${Array.from(data.ids).join(', ')}`);
    console.log(`  Products: ${data.products.length}`);
    data.products.forEach(p => {
      console.log(`    - Product ${p.id} (${p.name}): seller.id = ${p.sellerId}`);
    });
    console.log('');
  });
} else {
  console.log('✅ All sellers have consistent IDs\n');
}

// Find sellers with multiple products
const sellersWithMultipleProducts = Array.from(sellersByName.entries())
  .filter(([name, data]) => data.products.length > 1);

if (sellersWithMultipleProducts.length > 0) {
  console.log(`\n📦 Found ${sellersWithMultipleProducts.length} sellers with multiple products:\n`);
  sellersWithMultipleProducts.forEach(([name, data]) => {
    console.log(`${name} (ID: ${Array.from(data.ids)[0]}): ${data.products.length} products`);
    data.products.forEach(p => {
      console.log(`  - Product ${p.id}: ${p.name}`);
    });
    console.log('');
  });
} else {
  console.log('\n📦 No sellers with multiple products found\n');
}

// Summary
console.log('📊 Summary:');
console.log(`  Total sellers: ${sellersByName.size}`);
const productCounts = Array.from(sellersByName.values()).map(s => s.products.length);
const maxProducts = Math.max(...productCounts);
const minProducts = Math.min(...productCounts);
console.log(`  Products per seller: ${minProducts} - ${maxProducts}`);
console.log(`  Sellers with 1 product: ${productCounts.filter(c => c === 1).length}`);
console.log(`  Sellers with 2+ products: ${productCounts.filter(c => c > 1).length}`);
console.log('');
