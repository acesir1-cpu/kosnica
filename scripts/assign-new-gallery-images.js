const fs = require('fs');
const path = require('path');

// Read products to get beekeeper info
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
      id: product.seller.id
    });
  }
});

// Get all gallery images
const galleryDir = path.join(__dirname, '../public/images/gallery');
const galleryImages = fs.readdirSync(galleryDir)
  .filter(file => /\.(jpg|jpeg|png|webp|avif)$/i.test(file))
  .map(file => `/images/gallery/${file}`)
  .sort();

console.log(`\n📸 Found ${galleryImages.length} gallery images\n`);
console.log(`👥 Found ${beekeepersMap.size} beekeepers\n`);

// Assign images to beekeepers
const assignments = {};
const beekeeperSlugs = Array.from(beekeepersMap.keys()).sort();

beekeeperSlugs.forEach((slug, index) => {
  const imageIndex = index % galleryImages.length;
  assignments[slug] = galleryImages[imageIndex];
  const beekeeper = beekeepersMap.get(slug);
  console.log(`✅ ${beekeeper.name}: ${galleryImages[imageIndex]}`);
});

// Save assignments
const assignmentsData = {
  assignments: assignments
};

fs.writeFileSync(
  path.join(__dirname, '../data/gallery-assignments.json'),
  JSON.stringify(assignmentsData, null, 2),
  'utf8'
);

console.log(`\n✅ Saved assignments to gallery-assignments.json\n`);
