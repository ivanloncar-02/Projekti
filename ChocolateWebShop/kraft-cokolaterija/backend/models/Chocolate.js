const mongoose = require('mongoose');

const ChocolateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  vrsta: { type: String, required: true },
  podvrsta: { type: String, required: true },
  price: { type: Number, required: true },
  manufacturerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Manufacturer', required: true }
});

module.exports = mongoose.model('Chocolate', ChocolateSchema);
