const fs = require('fs');
const path = require('path');

// Read products data
const productsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/products.json'), 'utf8')
);

const products = productsData.products;

// Generate CSV
let csv = 'ID,Proizvod,Pčelar,Lokacija,Slug,Slika 1 (Glavna),Slika 2 (Druga veličina),Slika 3 (Lokacija)\n';

products.forEach((p) => {
  const row = [
    p.id,
    `"${p.name}"`,
    `"${p.seller.name}"`,
    `"${p.seller.location}"`,
    p.slug,
    `${p.slug}.jpg`,
    `${p.slug}-2.jpg`,
    `${p.slug}-3.jpg`
  ].join(',');
  csv += row + '\n';
});

// Write CSV file
const csvPath = path.join(__dirname, '../IMAGE_UPLOAD_LIST.csv');
fs.writeFileSync(csvPath, csv, 'utf8');

console.log(`\n✅ CSV fajl kreiran: ${csvPath}`);
console.log(`📊 Ukupno proizvoda: ${products.length}`);
console.log(`🖼️  Ukupno slika: ${products.length * 3}\n`);
