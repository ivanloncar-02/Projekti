const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Za enkripciju lozinke

// Kreiramo shemu za korisnika
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Osiguravamo da username bude jedinstven
    trim: true, // Uklanja suvišne razmake
    minlength: 3, // Minimalna duljina username-a
    maxlength: 50, // Maksimalna duljina username-a
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Minimalna duljina lozinke
  },
  email: {
    type: String,
    required: true,
    unique: true, // Osiguravamo da email bude jedinstven
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'], // Regex za validaciju emaila
  },
  role: {
    type: String,
    required: true,
    enum: ['user', 'admin'], // Dozvoljene vrijednosti za ulogu
    default: 'user', // Zadana vrijednost je "user"
  },
}, { timestamps: true }); // Automatski dodaje createdAt i updatedAt

// Mongoose middleware za enkripciju lozinke prije spremanja u bazu podataka
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next(); // Ako lozinka nije promijenjena, ne treba ju ponovo enkriptirati
  const salt = await bcrypt.genSalt(10); // Generiramo "salt" s faktorom 10
  this.password = await bcrypt.hash(this.password, salt); // Enkriptiramo lozinku
  next();
});

// Kreiramo metodu za usporedbu lozinke prilikom prijave
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password); // Provjerava da li unesena lozinka odgovara enkriptiranoj lozinki
};

// Kreiramo model temeljen na shemi
const User = mongoose.model('User', userSchema);

module.exports = User;
