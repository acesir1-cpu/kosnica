const fs = require('fs');
const path = require('path');

// Read products data
const productsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/products.json'), 'utf8')
);

// Get list of existing images in products folder
const productsDir = path.join(__dirname, '../public/images/products');
let existingImages = [];

try {
  existingImages = fs.readdirSync(productsDir)
    .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
    .map(file => ({
      filename: file,
      path: `/images/products/${file}`
    }));
} catch (error) {
  console.log('Error reading products folder:', error.message);
  process.exit(1);
}

console.log(`\n📸 Found ${existingImages.length} images in products folder\n`);

// Update products to match images by slug
const updatedProducts = productsData.products.map((product) => {
  const slug = product.slug;
  
  // Find images that match this product's slug
  // Look for: {slug}.jpg, {slug}-2.jpg, {slug}-3.jpg
  const matchingImages = existingImages.filter(img => {
    const imgName = img.filename.toLowerCase();
    const slugLower = slug.toLowerCase();
    
    // Exact match: {slug}.jpg or {slug}-2.jpg or {slug}-3.jpg
    return imgName === `${slugLower}.jpg` ||
           imgName === `${slugLower}.png` ||
           imgName === `${slugLower}.webp` ||
           imgName === `${slugLower}-2.jpg` ||
           imgName === `${slugLower}-2.png` ||
           imgName === `${slugLower}-2.webp` ||
           imgName === `${slugLower}-3.jpg` ||
           imgName === `${slugLower}-3.png` ||
           imgName === `${slugLower}-3.webp`;
  });
  
  // Sort matching images: first image, then -2, then -3
  const firstImage = matchingImages.find(img => {
    const name = img.filename.toLowerCase();
    return name === `${slug.toLowerCase()}.jpg` || 
           name === `${slug.toLowerCase()}.png` ||
           name === `${slug.toLowerCase()}.webp`;
  });
  
  const secondImage = matchingImages.find(img => {
    const name = img.filename.toLowerCase();
    return name === `${slug.toLowerCase()}-2.jpg` || 
           name === `${slug.toLowerCase()}-2.png` ||
           name === `${slug.toLowerCase()}-2.webp`;
  });
  
  const thirdImage = matchingImages.find(img => {
    const name = img.filename.toLowerCase();
    return name === `${slug.toLowerCase()}-3.jpg` || 
           name === `${slug.toLowerCase()}-3.png` ||
           name === `${slug.toLowerCase()}-3.webp`;
  });
  
  // Build images array
  const images = [];
  if (firstImage) {
    images.push(firstImage.path);
    console.log(`✅ Product ${product.id} (${product.name.substring(0, 40)}...): Found ${firstImage.filename}`);
  } else {
    images.push(`/images/products/${slug}.jpg`);
  }
  
  if (secondImage) {
    images.push(secondImage.path);
  } else {
    images.push(`/images/products/${slug}-2.jpg`);
  }
  
  if (thirdImage) {
    images.push(thirdImage.path);
  } else {
    images.push(`/images/products/${slug}-3.jpg`);
  }
  
  return {
    ...product,
    image: firstImage ? firstImage.path : `/images/products/${slug}.jpg`,
    images: images
  };
});

// Write updated products
const updatedData = { products: updatedProducts };
fs.writeFileSync(
  path.join(__dirname, '../data/products.json'),
  JSON.stringify(updatedData, null, 2),
  'utf8'
);

// Count how many products got matched images
const matchedCount = updatedProducts.filter(p => {
  const slug = p.slug.toLowerCase();
  return existingImages.some(img => {
    const imgName = img.filename.toLowerCase();
    return imgName === `${slug}.jpg` || imgName === `${slug}.png` || imgName === `${slug}.webp`;
  });
}).length;

console.log(`\n✅ Updated ${updatedProducts.length} products`);
console.log(`📸 Matched ${matchedCount} products with existing images`);
console.log(`\n💡 Products with matching images will display them, others will use placeholder paths.\n`);
