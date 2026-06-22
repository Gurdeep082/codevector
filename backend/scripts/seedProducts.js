
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/Product');

const categories = ['Electronics','Books','Fashion','Home','Sports'];

function randomDate() {
  const start = new Date(2024,0,1).getTime();
  const end = Date.now();
  return new Date(start + Math.random() * (end - start));
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const TOTAL = 200000;
  const BATCH = 10000;

  for (let offset = 0; offset < TOTAL; offset += BATCH) {
    const docs = Array.from({ length: BATCH }, (_, i) => ({
      name: `Product ${offset + i}`,
      category: categories[Math.floor(Math.random()*categories.length)],
      price: Number((Math.random()*1000).toFixed(2)),
      createdAt: randomDate(),
      updatedAt: randomDate()
    }));

    await Product.insertMany(docs, { ordered: false });
    console.log(`Inserted ${offset + BATCH}`);
  }

  await Product.collection.createIndex({ updatedAt: -1, _id: -1 });
  await Product.collection.createIndex({ category: 1, updatedAt: -1, _id: -1 });

  console.log('Seeding complete');
  process.exit(0);
})();
