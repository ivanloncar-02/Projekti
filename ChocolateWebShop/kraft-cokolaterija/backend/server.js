require('dotenv').config();  // Učitavanje varijabli iz .env datoteke

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Povezivanje s MongoDB
mongoose.connect('mongodb://localhost:27017/chocolates', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// API routes
app.use('/api', apiRoutes);  // Sve rute će biti pod /api

// Pokretanje servera
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
