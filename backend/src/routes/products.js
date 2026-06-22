
const router = require('express').Router();
const Product = require('../models/Product');

router.get('/', async (req, res) => {
  const limit = Number(req.query.limit || 50);
  const snapshotTime = req.query.snapshotTime || new Date().toISOString();

  let query = {
    updatedAt: { $lte: new Date(snapshotTime) }
  };

  if (req.query.category) {
    query.category = req.query.category;
  }

  if (req.query.cursorUpdatedAt && req.query.cursorId) {
    query = {
      ...query,
      $or: [
        { updatedAt: { $lt: new Date(req.query.cursorUpdatedAt) } },
        {
          updatedAt: new Date(req.query.cursorUpdatedAt),
          _id: { $lt: req.query.cursorId }
        }
      ]
    };
  }

  const products = await Product.find(query)
    .sort({ updatedAt: -1, _id: -1 })
    .limit(limit);

  const last = products[products.length - 1];

  res.json({
    snapshotTime,
    nextCursor: last ? {
      updatedAt: last.updatedAt,
      id: last._id
    } : null,
    count: products.length,
    products
  });
});

module.exports = router;
