const fs = require('fs');
const path = require('path');

// Read products data
const productsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/products.json'), 'utf8')
);

console.log('\n🔍 Checking seller image uniqueness...\n');

// Group products by seller
const sellerProducts = new Map();
productsData.products.forEach(product => {
  const sellerId = product.seller.id;
  const sellerName = product.seller.name;
  
  if (!sellerProducts.has(sellerId)) {
    sellerProducts.set(sellerId, {
      name: sellerName,
      products: []
    });
  }
  
  sellerProducts.get(sellerId).products.push({
    id: product.id,
    name: product.name,
    image: product.image
  });
});

// Check for conflicts: same seller using same image for different products
let conflicts = 0;
sellerProducts.forEach((sellerData, sellerId) => {
  const imageUsage = new Map();
  
  sellerData.products.forEach(product => {
    if (!imageUsage.has(product.image)) {
      imageUsage.set(product.image, []);
    }
    imageUsage.get(product.image).push(product.id);
  });
  
  // Check if same seller uses same image for multiple products
  imageUsage.forEach((productIds, image) => {
    if (productIds.length > 1) {
      conflicts++;
      console.log(`⚠️  Seller "${sellerData.name}" uses same image for multiple products:`);
      console.log(`   Image: ${path.basename(image)}`);
      productIds.forEach(pid => {
        const product = sellerData.products.find(p => p.id === pid);
        console.log(`   - Product ${pid}: ${product.name}`);
      });
      console.log('');
    }
  });
});

if (conflicts === 0) {
  console.log('✅ Perfect! No seller uses the same image for different products.\n');
} else {
  console.log(`⚠️  Found ${conflicts} conflicts where same seller uses same image for different products.\n`);
}

// Summary
console.log('📊 Summary:');
console.log(`   Total sellers: ${sellerProducts.size}`);
console.log(`   Conflicts: ${conflicts}`);
console.log('');
