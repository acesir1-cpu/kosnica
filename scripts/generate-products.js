const fs = require('fs');
const path = require('path');

const categories = [
  'livadski-med',
  'planinski-med',
  'cvjetni-med',
  'cetinarski-med',
  'bagremov-med',
  'lipov-med',
  'kaduljin-med',
  'sumski-med'
];

const categoryNames = {
  'livadski-med': 'Livadski med',
  'planinski-med': 'Planinski med',
  'cvjetni-med': 'Cvjetni med',
  'cetinarski-med': 'Četinarski med',
  'bagremov-med': 'Bagremov med',
  'lipov-med': 'Lipov med',
  'kaduljin-med': 'Kaduljin med',
  'sumski-med': 'Šumski med'
};

const additives = [
  { slug: 'med-sa-orasima', name: 'orasima' },
  { slug: 'med-sa-bademima', name: 'bademima' },
  { slug: 'med-sa-ljesnacima', name: 'lješnacima' },
  { slug: 'med-sa-dumbirom', name: 'đumbirom' },
  { slug: 'med-sa-maticnom-mlijecju', name: 'matičnom mliječi' }
];

const seasons = [
  { slug: 'proljetni-med', name: 'Proljetni med', period: 'mart-maj' },
  { slug: 'ljetnji-med', name: 'Ljetnji med', period: 'juni-august' },
  { slug: 'jesenji-med', name: 'Jesenji med', period: 'septembar-oktobar' }
];

const weights = ['250g', '450g', '850g'];

const locations = [
  'Sanski Most', 'Konjic', 'Tuzla', 'Sarajevo', 'Banja Luka',
  'Mostar', 'Zenica', 'Bihać', 'Travnik', 'Jajce', 'Goražde',
  'Trebinje', 'Livno', 'Bugojno', 'Doboj'
];

const sellerNames = [
  'Alen Mešić', 'Emir Hodžić', 'Tarik Begović', 'Amir Hasanović',
  'Dženan Kovačević', 'Haris Dervišević', 'Kenan Smajlović',
  'Mirza Čaušević', 'Nedim Hadžić', 'Omer Mujić', 'Adnan Karić',
  'Benjamin Jusić', 'Dino Mulić', 'Emin Suljić', 'Faruk Avdić'
];

const descriptions = [
  'Domaći med sa Grmeča',
  'Vrhunski kvalitet, ručno vrcano',
  'Svijetao, blag i ljekovit',
  'Prirodan med direktno od pčelara',
  'Organski med bez dodataka',
  'Med sačuvan tradicionalnom metodom',
  'Premium kvalitet meda',
  'Prirodan med sa planina',
  'Med sačuvan u staklenim posudama',
  'Svjež med iz košnice',
  'Med sačuvan u prirodnim uvjetima',
  'Kvalitetan med sa domaćih livada',
  'Prirodan med bez konzervansa',
  'Med sačuvan ručnom metodom',
  'Organski certificirani med'
];

const longDescriptions = {
  'livadski-med': 'Livadski med je mješavina cvjetnog nektara sa različitih livada. Bogat okus i aroma, idealan za svakodnevnu upotrebu.',
  'planinski-med': 'Planinski med je prirodan med sačuvan na visokim nadmorskim visinama. Čist okus i visok kvalitet.',
  'cvjetni-med': 'Cvjetni med je prirodan med dobijen iz nektara različitih cvjetova. Blag okus i prijatna aroma.',
  'cetinarski-med': 'Četinarski med je tamniji med sa karakterističnim okusom četina. Bogat antioksidansima.',
  'bagremov-med': 'Bagremov med je jedan od najcjenjenijih i najčišćih vrsta meda, poznat po svojoj svijetloj boji, blagom okusu i dugotrajnoj tečnoj strukturi.',
  'lipov-med': 'Lipov med je prirodan med sačuvan iz nektara lipovog cvijeta. Blag okus i ljekovita svojstva.',
  'kaduljin-med': 'Kaduljin med je prirodan med sačuvan iz nektara kaduljine. Karakterističan okus i ljekovita svojstva.',
  'sumski-med': 'Šumski med je tamniji med sačuvan iz šumskog nektara. Bogat okus i visok kvalitet.'
};

let products = [];
let id = 1;

// Generate products for each category (7 per category = 56 products)
categories.forEach(category => {
  for (let i = 0; i < 7; i++) {
    const hasAdditive = Math.random() > 0.65;
    const additive = hasAdditive ? additives[Math.floor(Math.random() * additives.length)] : null;
    const season = seasons[Math.floor(Math.random() * seasons.length)];
    const weight = weights[Math.floor(Math.random() * weights.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const sellerName = sellerNames[Math.floor(Math.random() * sellerNames.length)];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    const rating = parseFloat((4 + Math.random()).toFixed(1));
    const reviews = Math.floor(Math.random() * 100) + 5;
    const price = parseFloat((12 + Math.random() * 10).toFixed(2));
    const badge = Math.random() > 0.7 ? (Math.random() > 0.5 ? 'najprodavanije' : 'novo-u-ponudi') : null;
    
    const productName = additive 
      ? `${categoryNames[category]} sa ${additive.name}`
      : categoryNames[category];
    
    const slug = additive
      ? `${category}-sa-${additive.slug.split('-').slice(2).join('-')}-${id}`
      : `${category}-${id}`;

    products.push({
      id: id++,
      name: productName,
      slug: slug,
      seller: {
        id: id,
        name: sellerName,
        location: location,
        avatar: `/images/sellers/${sellerName.toLowerCase().replace(/\s+/g, '-').replace(/ć/g, 'c').replace(/š/g, 's').replace(/đ/g, 'd').replace(/č/g, 'c').replace(/ž/g, 'z')}.jpg`
      },
      description: description,
      longDescription: longDescriptions[category] || `${categoryNames[category]} je prirodan med sačuvan direktno iz košnice.`,
      price: price,
      currency: 'BAM',
      weight: weight,
      availableWeights: weights,
      image: `/images/products/${slug}.jpg`,
      images: [
        `/images/products/${slug}.jpg`,
        `/images/products/${slug}-2.jpg`,
        `/images/products/${slug}-3.jpg`
      ],
      category: category,
      categorySlug: category,
      additives: additive ? [additive.slug] : [],
      season: season.slug,
      seasonSlug: season.slug,
      rating: rating,
      reviews: reviews,
      inStock: true,
      stock: Math.floor(Math.random() * 50) + 10,
      badge: badge,
      badgeText: badge === 'najprodavanije' ? 'NAJPRODAVANIJE' : badge === 'novo-u-ponudi' ? 'NOVO U PONUDI' : null,
      keyCharacteristics: {
        vrstaMeda: `${categoryNames[category]}${additive ? ` sa ${additive.name}` : ''} bez dodatih šećera`,
        dostupnaPakovanja: weights.join(', '),
        bojaITekstura: 'Prirodna boja i tekstura',
        ukus: 'Blag i prirodan okus'
      }
    });
  }
});

// Generate additional products with additives (15 more products)
additives.forEach(additive => {
  for (let i = 0; i < 3; i++) {
    const baseCategory = categories[Math.floor(Math.random() * categories.length)];
    const season = seasons[Math.floor(Math.random() * seasons.length)];
    const weight = weights[Math.floor(Math.random() * weights.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const sellerName = sellerNames[Math.floor(Math.random() * sellerNames.length)];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    const rating = parseFloat((4 + Math.random()).toFixed(1));
    const reviews = Math.floor(Math.random() * 50) + 3;
    const price = parseFloat((15 + Math.random() * 8).toFixed(2));
    
    const productName = `${categoryNames[baseCategory]} sa ${additive.name}`;
    const slug = `${additive.slug}-${id}`;

    products.push({
      id: id++,
      name: productName,
      slug: slug,
      seller: {
        id: id,
        name: sellerName,
        location: location,
        avatar: `/images/sellers/${sellerName.toLowerCase().replace(/\s+/g, '-').replace(/ć/g, 'c').replace(/š/g, 's').replace(/đ/g, 'd').replace(/č/g, 'c').replace(/ž/g, 'z')}.jpg`
      },
      description: description,
      longDescription: `${categoryNames[baseCategory]} sa ${additive.name} je kombinacija prirodnog meda i kvalitetnih dodataka.`,
      price: price,
      currency: 'BAM',
      weight: weight,
      availableWeights: weights,
      image: `/images/products/${slug}.jpg`,
      images: [
        `/images/products/${slug}.jpg`,
        `/images/products/${slug}-2.jpg`
      ],
      category: baseCategory,
      categorySlug: baseCategory,
      additives: [additive.slug],
      season: season.slug,
      seasonSlug: season.slug,
      rating: rating,
      reviews: reviews,
      inStock: true,
      stock: Math.floor(Math.random() * 40) + 5,
      badge: null,
      badgeText: null,
      keyCharacteristics: {
        vrstaMeda: `${categoryNames[baseCategory]} sa ${additive.name}`,
        dostupnaPakovanja: weights.join(', '),
        bojaITekstura: 'Prirodna boja i tekstura',
        ukus: 'Blag i prirodan okus'
      }
    });
  }
});

const data = { products };

const outputPath = path.join(__dirname, '..', 'data', 'products.json');
fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');

console.log(`✅ Generated ${products.length} products`);
console.log(`📁 Saved to: ${outputPath}`);
