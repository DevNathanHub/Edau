import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://chapinin777:CzvFbEsIpBeKaGDx@cluster0.hxakj.mongodb.net/edauDB';

const categories = [
  { name: 'Honey' },
  { name: 'Dorper Sheep' },
  { name: 'Fruits' },
  { name: 'Poultry' }
];

const products = [
  // Honey Products
  {
    name: 'Edau Raw Honey',
    category: 'Honey',
    unit: '1 kg',
    price: 1200,
    stock: 45,
    description: 'Pure, unfiltered honey harvested directly from Edau Farm’s apiaries. Retains natural enzymes, pollen, and antioxidants for authentic flavor and health benefits.',
    sku: 'HNY-RAW-01',
    image_url: 'https://edaufarm.com/images/raw-honey.jpg',
    tags: ['raw', 'organic', 'pure', 'unfiltered'],
    availability: true
  },
  {
    name: 'Edau Citrus-Infused Honey',
    category: 'Honey',
    unit: '500 g',
    price: 950,
    stock: 30,
    description: 'A delicious blend of Edau’s natural honey and organic citrus zest — perfect for adding a tangy twist to your tea or baked goods.',
    sku: 'HNY-FLV-CITRUS',
    image_url: 'https://edaufarm.com/images/citrus-honey.jpg',
    tags: ['flavored', 'citrus', 'infused', 'gourmet'],
    availability: true
  },
  {
    name: 'Edau Herbal Honey',
    category: 'Honey',
    unit: '250 g',
    price: 700,
    stock: 60,
    description: 'Infused with natural herbs and harvested from pollen-rich areas. Known for its soothing, antibacterial, and immunity-boosting properties.',
    sku: 'HNY-MED-250',
    image_url: 'https://edaufarm.com/images/herbal-honey.jpg',
    tags: ['medicinal', 'herbal', 'immunity', 'natural'],
    availability: true
  },
  // Dorper Sheep
  {
    name: 'Dorper Breeding Ram',
    category: 'Dorper Sheep',
    unit: 'unit',
    price: 35000,
    stock: 8,
    description: 'Premium Dorper ram for breeding, selected for rapid growth and excellent meat quality.',
    sku: 'SHEEP-RAM-01',
    image_url: 'https://edaufarm.com/images/dorper-ram.jpg',
    tags: ['breeding', 'dorper', 'meat', 'premium'],
    availability: true
  },
  {
    name: 'Dorper Ewe',
    category: 'Dorper Sheep',
    unit: 'unit',
    price: 32000,
    stock: 12,
    description: 'Healthy Dorper ewe, ideal for expanding your flock with high fertility rates.',
    sku: 'SHEEP-EWE-01',
    image_url: 'https://edaufarm.com/images/dorper-ewe.jpg',
    tags: ['ewe', 'dorper', 'fertility', 'flock'],
    availability: true
  },
  // Fruits
  {
    name: 'Edau Farm Apples',
    category: 'Fruits',
    unit: 'crate',
    price: 2500,
    stock: 20,
    description: 'Seasonal apples grown with care, harvested at peak ripeness for maximum flavor.',
    sku: 'FRUIT-APPLE-01',
    image_url: 'https://edaufarm.com/images/apples.jpg',
    tags: ['apples', 'seasonal', 'fresh', 'crate'],
    availability: true
  },
  {
    name: 'Edau Farm Peaches',
    category: 'Fruits',
    unit: 'box',
    price: 1800,
    stock: 15,
    description: 'Juicy, sweet peaches picked fresh from our orchards.',
    sku: 'FRUIT-PEACH-01',
    image_url: 'https://edaufarm.com/images/peaches.jpg',
    tags: ['peaches', 'juicy', 'orchard', 'box'],
    availability: true
  },
  // Poultry
  {
    name: 'Free-Range Chicken',
    category: 'Poultry',
    unit: 'unit',
    price: 1200,
    stock: 40,
    description: 'Naturally raised chicken, free from antibiotics and hormones.',
    sku: 'POULTRY-CHICKEN-01',
    image_url: 'https://edaufarm.com/images/chicken.jpg',
    tags: ['chicken', 'free-range', 'natural', 'healthy'],
    availability: true
  },
  {
    name: 'Farm Fresh Eggs',
    category: 'Poultry',
    unit: 'crate',
    price: 450,
    stock: 25,
    description: 'Eggs from free-range hens, packed with nutrition and flavor.',
    sku: 'POULTRY-EGGS-01',
    image_url: 'https://edaufarm.com/images/eggs.jpg',
    tags: ['eggs', 'free-range', 'crate', 'fresh'],
    availability: true
  }
];

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('edauDB');
    console.log('Connected to MongoDB');

    // Add categories
    for (const category of categories) {
      const existing = await db.collection('categories').findOne({ name: category.name });
      if (!existing) {
        const result = await db.collection('categories').insertOne({
          ...category,
          created_at: new Date(),
          updated_at: new Date()
        });
        console.log('Added category:', category.name, result.insertedId);
      } else {
        console.log('Category already exists:', category.name);
      }
    }

    // Add products
    for (const product of products) {
      const existing = await db.collection('products').findOne({ sku: product.sku });
      if (!existing) {
        const result = await db.collection('products').insertOne({
          ...product,
          created_at: new Date(),
          updated_at: new Date()
        });
        console.log('Added product:', product.name, result.insertedId);
      } else {
        console.log('Product already exists:', product.name);
      }
    }

    console.log('Seeding completed');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seedDatabase();