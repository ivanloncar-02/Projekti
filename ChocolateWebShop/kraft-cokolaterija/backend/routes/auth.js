const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticate } = require('../middleware/authMiddleware'); // Middleware za autentifikaciju
const JWT_SECRET = process.env.JWT_SECRET; // Tajni ključ iz .env datoteke

// Ruta za registraciju
router.post('/register', async (req, res) => {
  const { username, email, password, role = 'user' } = req.body; // Zadana uloga je 'user'

  try {
    // Provjera postoji li korisnik s istim emailom ili username-om
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Korisnik s ovim emailom ili korisničkim imenom već postoji.' });
    }

    // Kreiranje novog korisnika
    const newUser = new User({ username, email, password, role });
    await newUser.save();

    res.status(201).json({ message: 'Registracija uspješna' });
  } catch (error) {
    console.error('Greška pri registraciji:', error);
    res.status(500).json({ message: 'Greška pri registraciji' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Pogrešan email ili lozinka' });
    }

    // Provjera lozinke
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Pogrešan email ili lozinka' });
    }

    // Kreiranje JWT tokena s dodatkom role
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, message: 'Prijava uspješna' });
  } catch (error) {
    console.error('Greška pri prijavi:', error);
    res.status(500).json({ message: 'Došlo je do greške pri prijavi.' });
  }
});

// Ruta za dohvat podataka korisnika na temelju JWT tokena
router.get('/user', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password'); // Ne vraćamo lozinku
    if (!user) {
      return res.status(404).json({ message: 'Korisnik nije pronađen.' });
    }
    res.json(user);
  } catch (error) {
    console.error('Greška pri dohvaćanju korisničkih podataka:', error);
    res.status(500).json({ message: 'Greška pri dohvaćanju korisničkih podataka.' });
  }
});

module.exports = router;
