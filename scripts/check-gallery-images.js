const fs = require('fs');
const path = require('path');

// Read products data
const productsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/products.json'), 'utf8')
);

// Simple createSellerSlug function
function createSellerSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/č/g, 'c')
    .replace(/Č/g, 'C')
    .replace(/ć/g, 'c')
    .replace(/Ć/g, 'C')
    .replace(/š/g, 's')
    .replace(/Š/g, 'S')
    .replace(/ž/g, 'z')
    .replace(/Ž/g, 'Z')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Get all unique beekeepers
const beekeepersMap = new Map();
productsData.products.forEach((product) => {
  const sellerName = product.seller.name;
  const slug = createSellerSlug(sellerName);
  
  if (!beekeepersMap.has(slug)) {
    beekeepersMap.set(slug, {
      name: sellerName,
      slug: slug,
      location: product.seller.location
    });
  }
});

const beekeepers = Array.from(beekeepersMap.values()).sort((a, b) => a.name.localeCompare(b.name));

// Check gallery folder
const galleryDir = path.join(__dirname, '../public/images/gallery');
let existingImages = [];

try {
  existingImages = fs.readdirSync(galleryDir)
    .filter(file => /\.(jpg|jpeg|png|webp|avif)$/i.test(file));
} catch (error) {
  console.log('Gallery folder does not exist yet. It will be created when you upload images.\n');
}

console.log('\n📸 Gallery Images Status\n');
console.log(`Total beekeepers: ${beekeepers.length}`);
console.log(`Existing gallery images: ${existingImages.length}\n`);

beekeepers.forEach((beekeeper) => {
  const expectedImages = [];
  for (let i = 1; i <= 10; i++) {
    expectedImages.push(`${beekeeper.slug}-gallery-${i}.jpg`);
  }
  
  const foundImages = expectedImages.filter(img => existingImages.includes(img));
  
  console.log(`${beekeeper.name} (${beekeeper.slug}):`);
  console.log(`  Expected: ${expectedImages.length} possible images`);
  console.log(`  Found: ${foundImages.length} images`);
  if (foundImages.length > 0) {
    console.log(`  ✅ Images: ${foundImages.join(', ')}`);
  } else {
    console.log(`  ⚠️  No images found`);
  }
  console.log('');
});

console.log('📁 Upload location: public/images/gallery/');
console.log('📝 Naming format: {beekeeper-slug}-gallery-{1-10}.jpg\n');
