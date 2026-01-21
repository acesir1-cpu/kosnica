const fs = require('fs');
const path = require('path');

// Read products data
const productsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/products.json'), 'utf8')
);

// Simple createSellerSlug function (same as in data.ts)
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

console.log('\n📸 Gallery Images Requirements for "Gdje radimo" Section\n');
console.log(`Total unique beekeepers: ${beekeepers.length}\n`);
console.log('Recommended: 3-6 images per beekeeper (showing their apiaries, hives, work environment)\n');
console.log('📋 Beekeepers and their required gallery images:\n');

beekeepers.forEach((beekeeper, index) => {
  console.log(`${index + 1}. ${beekeeper.name} (${beekeeper.location})`);
  console.log(`   Slug: ${beekeeper.slug}`);
  console.log(`   Recommended images: 3-6 images`);
  console.log(`   Suggested filenames:`);
  for (let i = 1; i <= 6; i++) {
    console.log(`     - ${beekeeper.slug}-gallery-${i}.jpg`);
  }
  console.log('');
});

console.log('📊 Summary:');
console.log(`   Total beekeepers: ${beekeepers.length}`);
console.log(`   Minimum images (3 per beekeeper): ${beekeepers.length * 3}`);
console.log(`   Recommended images (6 per beekeeper): ${beekeepers.length * 6}`);
console.log(`   Maximum images (10 per beekeeper): ${beekeepers.length * 10}`);
console.log('\n📁 Storage Location:');
console.log('   public/images/gallery/');
console.log('\n💡 Note: You can upload any number of images per beekeeper (3-10 recommended).');
console.log('   The system will use all available images for each beekeeper.\n');
