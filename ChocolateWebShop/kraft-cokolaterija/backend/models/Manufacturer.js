const mongoose = require('mongoose');

const manufacturerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  foundedYear: { type: Number, required: true },
});

// Dodajemo virtualno polje 'chocolates' koje će povezati proizvođače sa čokoladama
manufacturerSchema.virtual('chocolates', {
  ref: 'Chocolate',            // Referenca na model Chocolate
  localField: '_id',           // Polje u Manufacturer modelu
  foreignField: 'manufacturerId', // Polje u Chocolate modelu koje sadrži ObjectId proizvođača
  justOne: false               // Vratiti više čokolada (nema potrebe za justOne jer jedan proizvođač može imati više čokolada)
});

// Omogućiti korištenje virtualnih polja pri serijalizaciji u JSON formatu
manufacturerSchema.set('toObject', { virtuals: true });
manufacturerSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Manufacturer', manufacturerSchema);
