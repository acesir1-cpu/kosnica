const fs = require('fs');
const path = require('path');

// Read products data
const productsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/products.json'), 'utf8')
);

console.log('\n🔍 Checking product image consistency...\n');

// Track image usage per product
const imageToProductMap = new Map();
const productImageMap = new Map();

// Build mapping: which image belongs to which product
productsData.products.forEach(product => {
  // Store the main image for this product
  if (product.image) {
    productImageMap.set(product.id, product.image);
    
    // Track which product uses which image
    if (!imageToProductMap.has(product.image)) {
      imageToProductMap.set(product.image, []);
    }
    imageToProductMap.get(product.image).push({
      id: product.id,
      name: product.name,
      seller: product.seller.name
    });
  }
});

// Check for duplicate image usage
let duplicatesFound = false;
imageToProductMap.forEach((products, image) => {
  if (products.length > 1) {
    duplicatesFound = true;
    console.log(`⚠️  Image ${path.basename(image)} is used by multiple products:`);
    products.forEach(p => {
      console.log(`   - Product ${p.id}: ${p.name} (${p.seller})`);
    });
    console.log('');
  }
});

if (!duplicatesFound) {
  console.log('✅ All product images are unique - each product has its own image!\n');
} else {
  console.log('⚠️  Some images are shared between products. Consider assigning unique images.\n');
}

// Verify consistency: same product should always use same image
let consistencyIssues = 0;
productsData.products.forEach(product => {
  const expectedImage = productImageMap.get(product.id);
  
  // Check if images array is consistent
  if (product.images && product.images.length > 0) {
    // First image should match the main image
    if (product.images[0] !== product.image && product.images[0] !== expectedImage) {
      consistencyIssues++;
      console.log(`⚠️  Product ${product.id} (${product.name}): Main image mismatch`);
      console.log(`   Main: ${product.image}`);
      console.log(`   First in array: ${product.images[0]}`);
    }
  }
});

if (consistencyIssues === 0) {
  console.log('✅ All product images are consistent!\n');
} else {
  console.log(`⚠️  Found ${consistencyIssues} consistency issues.\n`);
}

// Summary
console.log('📊 Summary:');
console.log(`   Total products: ${productsData.products.length}`);
console.log(`   Unique images: ${imageToProductMap.size}`);
console.log(`   Products with images: ${productImageMap.size}`);
console.log('');
