const fs = require('fs');
const path = require('path');

// Read products data
const productsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/products.json'), 'utf8')
);

const products = productsData.products;

console.log('\n=== LISTA SVIH PROIZVODA SA SLUG-OVIMA ===\n');
console.log(`Ukupno proizvoda: ${products.length}\n`);
console.log(`Ukupno potrebno slika: ${products.length * 3} (${products.length} proizvoda × 3 slike)\n`);
console.log('='.repeat(80));
console.log('\n');

products.forEach((p, i) => {
  console.log(`${i + 1}. ID: ${p.id} | Ime: ${p.name}`);
  console.log(`   Slug: ${p.slug}`);
  console.log(`   Pčelar: ${p.seller.name} | Lokacija: ${p.seller.location}`);
  console.log(`   Potrebne slike:`);
  console.log(`   1. ${p.slug}.jpg          → Glavna slika meda`);
  console.log(`   2. ${p.slug}-2.jpg       → Ista slika meda - druga veličina`);
  console.log(`   3. ${p.slug}-3.jpg       → Slika gdje se proizvodi (košnica/lokacija)`);
  console.log('');
});

console.log('='.repeat(80));
console.log(`\n📊 REZIME:`);
console.log(`   - Ukupno proizvoda: ${products.length}`);
console.log(`   - Ukupno slika: ${products.length * 3}`);
console.log(`   - Folder: public/images/products/`);
console.log(`\n✅ Sve slike treba uploadovati u folder: public/images/products/`);
console.log(`\n`);
