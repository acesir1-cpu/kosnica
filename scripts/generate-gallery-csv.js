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

// Generate CSV
let csv = 'Beekeeper Name,Location,Slug,Image 1,Image 2,Image 3,Image 4,Image 5,Image 6\n';

beekeepers.forEach((beekeeper) => {
  const row = [
    beekeeper.name,
    beekeeper.location,
    beekeeper.slug,
    `${beekeeper.slug}-gallery-1.jpg`,
    `${beekeeper.slug}-gallery-2.jpg`,
    `${beekeeper.slug}-gallery-3.jpg`,
    `${beekeeper.slug}-gallery-4.jpg`,
    `${beekeeper.slug}-gallery-5.jpg`,
    `${beekeeper.slug}-gallery-6.jpg`
  ];
  csv += row.join(',') + '\n';
});

// Write CSV file
const csvPath = path.join(__dirname, '../GALLERY_IMAGES_LIST.csv');
fs.writeFileSync(csvPath, csv, 'utf8');

console.log('\n✅ CSV file generated: GALLERY_IMAGES_LIST.csv\n');
console.log(`📊 Total beekeepers: ${beekeepers.length}`);
console.log(`📸 Recommended images: ${beekeepers.length * 6} (6 per beekeeper)`);
console.log(`📁 Upload location: public/images/gallery/\n`);
