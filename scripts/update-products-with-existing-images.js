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
    .map(file => `/images/products/${file}`);
} catch (error) {
  console.log('Products folder not found or empty. Creating it...');
  // Create folder if it doesn't exist
  const productsDirPath = path.join(__dirname, '../public/images/products');
  if (!fs.existsSync(productsDirPath)) {
    fs.mkdirSync(productsDirPath, { recursive: true });
  }
  existingImages = [];
}

console.log(`\nFound ${existingImages.length} existing images in products folder\n`);

// Update products to use existing images for the first image
let imageIndex = 0;
const updatedProducts = productsData.products.map((product, index) => {
  // If we have existing images, use them for the first image
  if (existingImages.length > 0 && imageIndex < existingImages.length) {
    const firstImage = existingImages[imageIndex];
    // Keep the same slug-based naming for other images
    const slug = product.slug;
    const secondImage = `/images/products/${slug}-2.jpg`;
    const thirdImage = `/images/products/${slug}-3.jpg`;
    
    product.image = firstImage;
    product.images = [firstImage, secondImage, thirdImage];
    
    console.log(`Product ${product.id} (${product.name}): Using ${firstImage}`);
    imageIndex++;
  }
  
  return product;
});

// Write updated products
const updatedData = { products: updatedProducts };
fs.writeFileSync(
  path.join(__dirname, '../data/products.json'),
  JSON.stringify(updatedData, null, 2),
  'utf8'
);

console.log(`\n✅ Updated ${updatedProducts.length} products`);
console.log(`📸 Used ${Math.min(existingImages.length, updatedProducts.length)} existing images`);
console.log(`\nNote: Products without assigned images will still use their slug-based paths.`);
console.log(`You can add more images to public/images/products/ folder and run this script again.\n`);
