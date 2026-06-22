require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../src/models/Product");

const categories = [
  "Electronics",
  "Books",
  "Fashion",
  "Home",
  "Sports",
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Optional: clear existing data
    await Product.deleteMany({});
    console.log("Old products deleted.");

    const TOTAL = 200000;
    const BATCH = 10000;

    // Base time: Product 0 starts here
    const baseTime = new Date("2024-01-01T00:00:00Z").getTime();

    for (let offset = 0; offset < TOTAL; offset += BATCH) {
      const docs = Array.from({ length: BATCH }, (_, i) => {
        const index = offset + i;

        // Each successive product gets a slightly newer timestamp
        const timestamp = new Date(baseTime + index * 1000);

        return {
          name: `Product ${index}`,
          category:
            categories[Math.floor(Math.random() * categories.length)],
          price: Number((Math.random() * 1000).toFixed(2)),
          createdAt: timestamp,
          updatedAt: timestamp,
        };
      });

      await Product.insertMany(docs, { ordered: false });
      console.log(`Inserted ${Math.min(offset + BATCH, TOTAL)} products`);
    }

    // Create indexes
    await Product.collection.createIndex({
      updatedAt: -1,
      _id: -1,
    });

    await Product.collection.createIndex({
      category: 1,
      updatedAt: -1,
      _id: -1,
    });

    console.log("✅ Seeding complete.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();