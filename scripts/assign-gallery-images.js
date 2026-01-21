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
      location: product.seller.location,
      id: product.seller.id
    });
  }
});

const beekeepers = Array.from(beekeepersMap.values()).sort((a, b) => a.name.localeCompare(b.name));

// Get all gallery images
const galleryDir = path.join(__dirname, '../public/images/gallery');
let galleryImages = [];

try {
  galleryImages = fs.readdirSync(galleryDir)
    .filter(file => /\.(jpg|jpeg|png|webp|avif)$/i.test(file))
    .map(file => `/images/gallery/${file}`)
    .sort(() => Math.random() - 0.5); // Shuffle
} catch (error) {
  console.log('Error reading gallery folder:', error.message);
  process.exit(1);
}

console.log(`\n📸 Found ${galleryImages.length} images in gallery folder\n`);

// Assign one image per beekeeper
const assignments = [];
let imageIndex = 0;

beekeepers.forEach((beekeeper) => {
  if (imageIndex < galleryImages.length) {
    const assignedImage = galleryImages[imageIndex];
    assignments.push({
      beekeeper: beekeeper.name,
      slug: beekeeper.slug,
      image: assignedImage,
      filename: path.basename(assignedImage)
    });
    console.log(`✅ ${beekeeper.name} (${beekeeper.slug}): ${path.basename(assignedImage)}`);
    imageIndex++;
  } else {
    console.log(`⚠️  ${beekeeper.name}: No image available (all images used)`);
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Total beekeepers: ${beekeepers.length}`);
console.log(`   Total gallery images: ${galleryImages.length}`);
console.log(`   Beekeepers with images: ${assignments.length}`);
console.log(`\n💡 Each beekeeper now has one gallery image assigned.\n`);

// Write assignment list to JSON for reference
const assignmentData = {
  assignments: assignments,
  timestamp: new Date().toISOString()
};

fs.writeFileSync(
  path.join(__dirname, '../GALLERY_ASSIGNMENTS.json'),
  JSON.stringify(assignmentData, null, 2),
  'utf8'
);

console.log('✅ Assignment list saved to: GALLERY_ASSIGNMENTS.json\n');
