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
    .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
    .map(file => `/images/products/${file}`)
    .sort(() => Math.random() - 0.5); // Shuffle randomly
} catch (error) {
  console.log('Error reading products folder:', error.message);
  process.exit(1);
}

console.log(`\n📸 Found ${allImages.length} images in products folder\n`);

// Group products by category to ensure same category doesn't use same image
const productsByCategory = {};
productsData.products.forEach(product => {
  if (!productsByCategory[product.categorySlug]) {
    productsByCategory[product.categorySlug] = [];
  }
  productsByCategory[product.categorySlug].push(product);
});

console.log(`📦 Products grouped by category:`);
Object.keys(productsByCategory).forEach(cat => {
  console.log(`   ${cat}: ${productsByCategory[cat].length} products`);
});
console.log('');

// Track used images per category
const usedImagesByCategory = {};
Object.keys(productsByCategory).forEach(cat => {
  usedImagesByCategory[cat] = new Set();
});

let globalImageIndex = 0;
const allUsedImages = new Set();

// Assign images ensuring same category doesn't use same image
const updatedProducts = productsData.products.map((product) => {
  const slug = product.slug;
  const category = product.categorySlug;
  
  // Find an image that hasn't been used for this category
  let firstImage = null;
  let attempts = 0;
  const maxAttempts = allImages.length * 2; // Try multiple rounds if needed
  
  while (!firstImage && attempts < maxAttempts) {
    // If we have unused images, use them first
    if (globalImageIndex < allImages.length) {
      const candidateImage = allImages[globalImageIndex];
      
      // Check if this image is already used for this category
      if (!usedImagesByCategory[category].has(candidateImage)) {
        firstImage = candidateImage;
        usedImagesByCategory[category].add(candidateImage);
        allUsedImages.add(candidateImage);
        globalImageIndex++;
      } else {
        globalImageIndex++;
        if (globalImageIndex >= allImages.length) {
          globalImageIndex = 0; // Reset and try again
        }
      }
    } else {
      // We've used all images, but need to find one not used for this category
      // Cycle through images and find one not used for this category
      const candidateImage = allImages[globalImageIndex % allImages.length];
      if (!usedImagesByCategory[category].has(candidateImage)) {
        firstImage = candidateImage;
        usedImagesByCategory[category].add(candidateImage);
        allUsedImages.add(candidateImage);
      }
      globalImageIndex++;
    }
    attempts++;
  }
  
  // Fallback: if we still don't have an image, use the first available
  if (!firstImage && allImages.length > 0) {
    firstImage = allImages[0];
    usedImagesByCategory[category].add(firstImage);
    console.log(`   ⚠️  Product ${product.id} (${product.name.substring(0, 30)}...): Using fallback image`);
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
      ? [firstImage, secondImage] // Only 2 images now
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

// Count unique images used
const uniqueImagesUsed = new Set();
updatedProducts.forEach(p => {
  if (p.image && !p.image.includes(p.slug)) {
    uniqueImagesUsed.add(p.image);
  }
});

console.log(`\n✅ Updated ${updatedProducts.length} products`);
console.log(`📸 Used ${uniqueImagesUsed.size} unique images`);
console.log(`🔄 Each category uses different images`);
console.log(`\n💡 All products now have 2 images assigned!\n`);
