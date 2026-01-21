const fs = require('fs');
const path = require('path');

// Read products data
const productsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/products.json'), 'utf8')
);

// Get all unique seller names
const sellerNames = new Set();
productsData.products.forEach((product) => {
  sellerNames.add(product.seller.name);
});

console.log('\n📋 Current seller names:\n');
Array.from(sellerNames).sort().forEach((name, index) => {
  console.log(`${index + 1}. ${name}`);
});

console.log(`\nTotal unique sellers: ${sellerNames.size}\n`);
