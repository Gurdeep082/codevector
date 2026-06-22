const router = require("express").Router();
const Product = require("../models/Product");

router.get("/", async (req, res) => {
  try {
    const limit = Number(req.query.limit || 50);
    const snapshotTime =
      req.query.snapshotTime || new Date().toISOString();

    // Base query
    const query = {
      updatedAt: { $lte: new Date(snapshotTime) },
    };

    // Search by product name (case-insensitive)
    if (req.query.name) {
      query.name = {
        $regex: req.query.name,
        $options: "i",
      };
    }

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Cursor pagination (works with or without search)
    if (req.query.cursorUpdatedAt && req.query.cursorId) {
      query.$or = [
        {
          updatedAt: {
            $lt: new Date(req.query.cursorUpdatedAt),
          },
        },
        {
          updatedAt: new Date(req.query.cursorUpdatedAt),
          _id: {
            $lt: req.query.cursorId,
          },
        },
      ];
    }

    const products = await Product.find(query)
      .sort({ updatedAt: -1, _id: -1 })
      .limit(limit);

    // Count matching documents
   const countQuery = {};

// Apply search filter
if (req.query.name) {
  countQuery.name = {
    $regex: req.query.name,
    $options: "i",
  };
}

// Apply category filter
if (req.query.category) {
  countQuery.category = req.query.category;
}

// Count all matching documents, ignoring pagination cursor
const totalCount = await Product.countDocuments(countQuery);

    const last = products[products.length - 1];

    res.json({
      snapshotTime,
      totalCount,
      nextCursor: last
        ? {
            updatedAt: last.updatedAt,
            id: last._id,
          }
        : null,
      count: products.length,
      products,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

module.exports = router;