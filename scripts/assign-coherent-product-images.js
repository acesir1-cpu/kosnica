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

// Group products by seller to ensure same seller doesn't use same image
const productsBySeller = new Map();
productsData.products.forEach(product => {
  const sellerId = product.seller.id;
  if (!productsBySeller.has(sellerId)) {
    productsBySeller.set(sellerId, []);
  }
  productsBySeller.get(sellerId).push(product);
});

// Track used images per seller
const usedImagesBySeller = new Map();
productsBySeller.forEach((products, sellerId) => {
  usedImagesBySeller.set(sellerId, new Set());
});

let globalImageIndex = 0;

// Assign images ensuring same seller doesn't use same image for different products
const updatedProducts = productsData.products.map((product) => {
  const slug = product.slug;
  const sellerId = product.seller.id;
  const sellerUsedImages = usedImagesBySeller.get(sellerId) || new Set();
  
  // Find an image that hasn't been used for this seller's products
  let firstImage = null;
  let attempts = 0;
  const maxAttempts = allImages.length * 3;
  
  while (!firstImage && attempts < maxAttempts) {
    if (globalImageIndex >= allImages.length) {
      globalImageIndex = 0; // Cycle back
    }
    
    const candidateImage = allImages[globalImageIndex];
    
    // Check if this image is already used for this seller
    if (!sellerUsedImages.has(candidateImage)) {
      firstImage = candidateImage;
      sellerUsedImages.add(candidateImage);
      usedImagesBySeller.set(sellerId, sellerUsedImages);
      globalImageIndex++;
      break;
    }
    
    globalImageIndex++;
    attempts++;
  }
  
  // If we can't find unused image for this seller, cycle through all images
  // but ensure we don't reuse the same image for the same seller
  if (!firstImage) {
    // Try to find any image not used by this seller
    for (let i = 0; i < allImages.length; i++) {
      const candidateImage = allImages[i];
      if (!sellerUsedImages.has(candidateImage)) {
        firstImage = candidateImage;
        sellerUsedImages.add(candidateImage);
        usedImagesBySeller.set(sellerId, sellerUsedImages);
        break;
      }
    }
    
    // Last resort: use first available (will be same for multiple products of same seller if needed)
    if (!firstImage && allImages.length > 0) {
      firstImage = allImages[0];
      console.log(`   ⚠️  Product ${product.id} (${product.seller.name}): Using shared image`);
    }
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
    console.log(`✅ Product ${product.id} (${product.name.substring(0, 30)}... | ${product.seller.name}): ${path.basename(firstImage)}`);
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

// Verify: Check that same seller doesn't use same image for different products
const sellerImageMap = new Map();
let conflicts = 0;

updatedProducts.forEach(p => {
  const sellerId = p.seller.id;
  if (!sellerImageMap.has(sellerId)) {
    sellerImageMap.set(sellerId, new Map());
  }
  
  const sellerProducts = sellerImageMap.get(sellerId);
  if (sellerProducts.has(p.image) && sellerProducts.get(p.image) !== p.id) {
    conflicts++;
    console.log(`⚠️  Conflict: Seller ${p.seller.name} uses same image for products ${sellerProducts.get(p.image)} and ${p.id}`);
  } else {
    sellerProducts.set(p.image, p.id);
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Total products: ${updatedProducts.length}`);
console.log(`   Total sellers: ${productsBySeller.size}`);
console.log(`   Available images: ${allImages.length}`);
console.log(`   Image conflicts (same seller, same image): ${conflicts}`);
console.log(`\n✅ Products now have coherent images - each product keeps its image consistently!\n`);
