const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware za provjeru JWT tokena
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Nema pristupa. Token nije dostupan.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Dodajemo korisničke podatke u zahtjev (req)
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({
      success: false,
      message: 'Neispravan ili istekao token.',
    });
  }
};

// Middleware za provjeru role
const authorize = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== requiredRole) {
      return res.status(403).json({
        success: false,
        message: 'Nemate dopuštenje za ovu radnju.',
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
