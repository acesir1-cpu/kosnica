const fs = require('fs');
const path = require('path');

// Read gallery assignments
const assignmentsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/gallery-assignments.json'), 'utf8')
);

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

const galleryDir = path.join(__dirname, '../public/images/gallery');
const existingFiles = fs.readdirSync(galleryDir)
  .filter(file => /\.(jpg|jpeg|png|webp|avif)$/i.test(file));

console.log('\n🔍 Verifying gallery image paths...\n');

const assignments = assignmentsData.assignments;
let allValid = true;

Object.keys(assignments).forEach((slug) => {
  const imagePath = assignments[slug];
  const filename = path.basename(imagePath);
  const beekeeper = beekeepersMap.get(slug);
  
  if (existingFiles.includes(filename)) {
    console.log(`✅ ${beekeeper?.name || slug}: ${filename} - EXISTS`);
  } else {
    console.log(`❌ ${beekeeper?.name || slug}: ${filename} - NOT FOUND`);
    allValid = false;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Total assignments: ${Object.keys(assignments).length}`);
console.log(`   Valid images: ${Object.keys(assignments).filter(slug => {
  const filename = path.basename(assignments[slug]);
  return existingFiles.includes(filename);
}).length}`);
console.log(`   Missing images: ${Object.keys(assignments).filter(slug => {
  const filename = path.basename(assignments[slug]);
  return !existingFiles.includes(filename);
}).length}`);

if (allValid) {
  console.log(`\n✅ All gallery images exist!\n`);
} else {
  console.log(`\n⚠️  Some images are missing. Please check the paths.\n`);
}
