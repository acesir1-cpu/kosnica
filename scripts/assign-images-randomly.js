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

// Shuffle products array for random assignment
const shuffledProducts = [...productsData.products].sort(() => Math.random() - 0.5);

let imageIndex = 0;
const usedImages = new Set();

// First pass: Assign images randomly to products
const updatedProducts = shuffledProducts.map((product, idx) => {
  const slug = product.slug;
  
  // Get first image (randomly from available images)
  let firstImage;
  if (imageIndex < allImages.length) {
    // Find next unused image
    while (imageIndex < allImages.length && usedImages.has(allImages[imageIndex])) {
      imageIndex++;
    }
    if (imageIndex < allImages.length) {
      firstImage = allImages[imageIndex];
      usedImages.add(firstImage);
      imageIndex++;
    }
  }
  
  // If we ran out of images, reuse existing images (cycle through)
  if (!firstImage && allImages.length > 0) {
    const reuseIndex = (idx % allImages.length);
    firstImage = allImages[reuseIndex];
    console.log(`   Reusing image for product ${product.id}: ${firstImage}`);
  }
  
  // For second and third images, try to find matching ones, otherwise use placeholder
  let secondImage = `/images/products/${slug}-2.jpg`;
  let thirdImage = `/images/products/${slug}-3.jpg`;
  
  // Try to find -2 and -3 versions if they exist
  const imageBase = firstImage ? path.basename(firstImage, path.extname(firstImage)) : slug;
  const imageExt = firstImage ? path.extname(firstImage) : '.jpg';
  
  // Check if -2 version exists
  const secondImagePath = `/images/products/${imageBase}-2${imageExt}`;
  if (allImages.includes(secondImagePath)) {
    secondImage = secondImagePath;
  }
  
  // Check if -3 version exists
  const thirdImagePath = `/images/products/${imageBase}-3${imageExt}`;
  if (allImages.includes(thirdImagePath)) {
    thirdImage = thirdImagePath;
  }
  
  // If we don't have enough unique images, reuse the first image for second/third
  if (!allImages.includes(secondImage) && firstImage) {
    secondImage = firstImage; // Reuse first image
  }
  if (!allImages.includes(thirdImage) && firstImage) {
    thirdImage = firstImage; // Reuse first image
  }
  
  if (firstImage) {
    console.log(`✅ Product ${product.id} (${product.name.substring(0, 35)}...): ${path.basename(firstImage)}`);
  }
  
  return {
    ...product,
    image: firstImage || `/images/products/${slug}.jpg`,
    images: firstImage 
      ? [firstImage, secondImage, thirdImage]
      : [`/images/products/${slug}.jpg`, `/images/products/${slug}-2.jpg`, `/images/products/${slug}-3.jpg`]
  };
});

// Restore original order by ID
const finalProducts = updatedProducts.sort((a, b) => a.id - b.id);

// Write updated products
const updatedData = { products: finalProducts };
fs.writeFileSync(
  path.join(__dirname, '../data/products.json'),
  JSON.stringify(updatedData, null, 2),
  'utf8'
);

const assignedCount = finalProducts.filter(p => 
  !p.image.includes(p.slug) || allImages.some(img => p.image === img)
).length;

console.log(`\n✅ Updated ${finalProducts.length} products`);
console.log(`📸 Assigned ${Math.min(allImages.length, finalProducts.length)} images randomly`);
console.log(`🔄 Reused images for ${finalProducts.length - Math.min(allImages.length, finalProducts.length)} products`);
console.log(`\n💡 All products now have images assigned!\n`);
