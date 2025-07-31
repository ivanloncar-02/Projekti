const mongoose = require('mongoose');
const Chocolate = require('../models/Chocolate');
const Manufacturer = require('../models/Manufacturer'); // Dodano

mongoose
  .connect('mongodb://127.0.0.1:27017/chocolates', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');

    try {
      // Brisanje postojećih podataka
      await Chocolate.deleteMany();
      await Manufacturer.deleteMany(); // Dodano za proizvođače

      // Umetanje proizvođača
      const manufacturers = await Manufacturer.insertMany([
        { name: 'Lindt', country: 'Switzerland', foundedYear: 1845 },
        { name: 'Godiva', country: 'Belgium', foundedYear: 1926 },
        { name: 'Ghirardelli', country: 'USA', foundedYear: 1852 },
        { name: 'test', country: 'USA', foundedYear: 1850 },
      ]);

      // Umetanje čokolada s poveznicama na proizvođače
      const chocolates = [
        {
          name: 'Mliječna čokolada',
          vrsta: 'Mliječna',
          podvrsta: 'S lješnjacima',
          price: 20,
          manufacturerId: manufacturers[0]._id, // Povezano s Lindt
        },
        {
          name: 'Tamna čokolada',
          vrsta: 'Tamna',
          podvrsta: 'S narančom',
          price: 25,
          manufacturerId: manufacturers[1]._id, // Povezano s Godiva
        },
        {
          name: 'Bijela čokolada',
          vrsta: 'Bijela',
          podvrsta: 'S bademima',
          price: 22,
          manufacturerId: manufacturers[1]._id, // Povezano s Godiva
        },
        {
          name: 'Mliječna čokolada s karamelom',
          vrsta: 'Mliječna',
          podvrsta: 'S karamelom',
          price: 24,
          manufacturerId: manufacturers[2]._id, // Povezano s Ghirardelli
        },
      ];

      await Chocolate.insertMany(chocolates);

      console.log('Seed podaci su uspješno dodani');
    } catch (err) {
      console.error('Greška tijekom seedanja podataka:', err);
    } finally {
      mongoose.connection.close();
    }
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });
