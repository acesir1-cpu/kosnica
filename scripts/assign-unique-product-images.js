const fs = require('fs');
const path = require('path');

// Read products data
const productsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/products.json'), 'utf8')
);

// Get list of existing images in products folder
const productsDir = path.join(__dirname, '../public/images/products');
let allImages = [];

try {
  allImages = fs.readdirSync(productsDir)
    .filter(file => /\.(jpg|jpeg|png|webp|avif)$/i.test(file))
    .map(file => `/images/products/${file}`)
    .sort(() => Math.random() - 0.5); // Shuffle randomly
} catch (error) {
  console.log('Error reading products folder:', error.message);
  process.exit(1);
}

console.log(`\n📸 Found ${allImages.length} images in products folder\n`);

// Track used images to ensure uniqueness
const usedImages = new Set();
let imageIndex = 0;

// Assign unique images to each product
const updatedProducts = productsData.products.map((product) => {
  const slug = product.slug;
  
  // Find next unused image
  let firstImage = null;
  let attempts = 0;
  const maxAttempts = allImages.length * 3;
  
  while (!firstImage && attempts < maxAttempts) {
    if (imageIndex >= allImages.length) {
      imageIndex = 0; // Cycle back to start if we've used all images
    }
    
    const candidateImage = allImages[imageIndex];
    
    // Only use if not already used
    if (!usedImages.has(candidateImage)) {
      firstImage = candidateImage;
      usedImages.add(candidateImage);
      imageIndex++;
      break;
    }
    
    imageIndex++;
    attempts++;
  }
  
  // If we still don't have an image (shouldn't happen if we have enough), use first available
  if (!firstImage && allImages.length > 0) {
    firstImage = allImages[0];
    console.log(`   ⚠️  Product ${product.id}: Using fallback image (all images used)`);
  }
  
  // Second image: try to find -2 version, otherwise reuse first image
  let secondImage = firstImage; // Default to first image
  if (firstImage) {
    const imageBase = path.basename(firstImage, path.extname(firstImage));
    const imageExt = path.extname(firstImage);
    const secondImagePath = `/images/products/${imageBase}-2${imageExt}`;
    
    // Check if -2 version exists in folder
    if (allImages.includes(secondImagePath)) {
      secondImage = secondImagePath;
    }
  } else {
    secondImage = `/images/products/${slug}-2.jpg`;
  }
  
  if (firstImage) {
    console.log(`✅ Product ${product.id} (${product.name.substring(0, 35)}...): ${path.basename(firstImage)}`);
  }
  
  return {
    ...product,
    image: firstImage || `/images/products/${slug}.jpg`,
    images: firstImage 
      ? [firstImage, secondImage] // Only 2 images
      : [`/images/products/${slug}.jpg`, `/images/products/${slug}-2.jpg`]
  };
});

// Write updated products
const updatedData = { products: updatedProducts };
fs.writeFileSync(
  path.join(__dirname, '../data/products.json'),
  JSON.stringify(updatedData, null, 2),
  'utf8'
);

// Verify uniqueness
const imageUsage = new Map();
updatedProducts.forEach(p => {
  if (p.image) {
    if (!imageUsage.has(p.image)) {
      imageUsage.set(p.image, []);
    }
    imageUsage.get(p.image).push(p.id);
  }
});

const duplicates = Array.from(imageUsage.entries()).filter(([img, ids]) => ids.length > 1);

if (duplicates.length > 0) {
  console.log(`\n⚠️  Warning: ${duplicates.length} images are still used by multiple products:`);
  duplicates.forEach(([img, ids]) => {
    console.log(`   ${path.basename(img)}: Products ${ids.join(', ')}`);
  });
} else {
  console.log(`\n✅ All products have unique images!`);
}

console.log(`\n📊 Summary:`);
console.log(`   Total products: ${updatedProducts.length}`);
console.log(`   Unique images assigned: ${usedImages.size}`);
console.log(`   Products with images: ${updatedProducts.filter(p => p.image).length}`);
console.log(`\n💡 Each product now has a unique image that will be used consistently across all pages.\n`);
