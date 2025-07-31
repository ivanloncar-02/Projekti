const express = require('express');
const router = express.Router();
const Chocolate = require('../models/Chocolate');
const Manufacturer = require('../models/Manufacturer');
const User = require('../models/User'); // Pretpostavljamo da postoji User model
const authRoutes = require('./auth');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Ruta za autentifikaciju
router.use('/auth', authRoutes);

// Ruta za dohvat svih vrsta čokolade (zaštićena ruta)
router.get('/vrsteCokolade', authenticate, async (req, res) => {
  try {
    const vrste = await Chocolate.distinct('vrsta');
    res.json(vrste);
  } catch (error) {
    console.error('Greška pri dohvaćanju vrsta čokolade:', error);
    res.status(500).json({ message: 'Greška pri dohvaćanju vrsta čokolade' });
  }
});

// Ruta za dohvat podvrsta čokolade na temelju vrste (zaštićena ruta)
router.get('/vrsteCokolade/:vrsta', authenticate, async (req, res) => {
  const { vrsta } = req.params;
  try {
    const podvrste = await Chocolate.distinct('podvrsta', { vrsta });
    res.json(podvrste);
  } catch (error) {
    console.error('Greška pri dohvaćanju podvrsta čokolade:', error);
    res.status(500).json({ message: 'Greška pri dohvaćanju podvrsta čokolade' });
  }
});

// Ruta za dohvat filtriranih proizvoda
router.get('/proizvodi', authenticate, async (req, res) => {
  const { vrsta, podvrsta } = req.query;
  try {
    let filter = {};
    if (vrsta) filter.vrsta = vrsta;
    if (podvrsta) filter.podvrsta = podvrsta;

    const proizvodi = await Chocolate.find(filter);
    res.json({ proizvodi });
  } catch (error) {
    console.error('Greška prilikom dohvaćanja proizvoda:', error);
    res.status(500).json({ message: 'Greška prilikom dohvaćanja proizvoda' });
  }
});

// Ruta za dohvat proizvođača i povezanih čokolada
router.get('/manufacturers', authenticate, async (req, res) => {
  try {
    const manufacturers = await Manufacturer.find().populate('chocolates');
    res.status(200).json(manufacturers);
  } catch (error) {
    console.error('Greška pri dohvaćanju proizvođača:', error);
    res.status(500).json({ message: 'Greška pri dohvaćanju proizvođača' });
  }
});

// Ruta za dohvaćanje korisničkih imena (samo za admina)
router.get('/userlist', authenticate, authorize('admin'), async (req, res) => {
  try {
    const usernames = await User.find({}, 'username'); // Dohvaća samo polje 'username'
    res.status(200).json(usernames);
  } catch (error) {
    console.error('Greška pri dohvaćanju korisničkih imena:', error);
    res.status(500).json({ message: 'Greška pri dohvaćanju korisničkih imena.' });
  }
});

// Ruta za dohvaćanje podataka o korisniku (samo za admina)
router.get('/userdata/:id', authenticate, authorize('admin'), async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).select('username email role');
    if (!user) {
      return res.status(404).json({ message: 'Korisnik nije pronađen.' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Greška pri dohvaćanju podataka o korisniku:', error);
    res.status(500).json({ message: 'Greška pri dohvaćanju podataka o korisniku.' });
  }
});


// Nova ruta za brisanje proizvođača koji nemaju povezane čokolade
router.delete('/manufacturers/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const manufacturer = await Manufacturer.findById(id).populate('chocolates');
    if (manufacturer.chocolates.length > 0) {
      return res.status(400).json({ message: 'Ne možete obrisati proizvođača s povezanim čokoladama.' });
    }

    await Manufacturer.findByIdAndDelete(id);
    res.status(200).json({ message: 'Proizvođač obrisan.' });
  } catch (error) {
    console.error('Greška pri brisanju proizvođača:', error);
    res.status(500).json({ message: 'Greška pri brisanju proizvođača.' });
  }
});

// Nova ruta za brisanje čokolade
router.delete('/proizvodi/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const chocolate = await Chocolate.findById(id);
    if (!chocolate) {
      return res.status(404).json({ message: 'Čokolada nije pronađena.' });
    }

    await Chocolate.findByIdAndDelete(id);
    res.status(200).json({ message: 'Čokolada obrisana.' });
  } catch (error) {
    console.error('Greška pri brisanju čokolade:', error);
    res.status(500).json({ message: 'Greška pri brisanju čokolade.' });
  }
});

// Nova ruta za dodavanje proizvođača
router.post('/manufacturers', authenticate, async (req, res) => {
  const { name, country, foundedYear } = req.body;

  if (!name || !country || !foundedYear) {
    return res.status(400).json({ message: 'Sva polja su obavezna!' });
  }

  try {
    const newManufacturer = new Manufacturer({
      name,
      country,
      foundedYear,
    });

    const savedManufacturer = await newManufacturer.save();
    res.status(201).json(savedManufacturer);
  } catch (error) {
    console.error('Greška pri dodavanju proizvođača:', error);
    res.status(500).json({ message: 'Greška pri dodavanju proizvođača.' });
  }
});

module.exports = router;
