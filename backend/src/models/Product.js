
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  createdAt: Date,
  updatedAt: Date
});

module.exports = mongoose.model('Product', ProductSchema);
