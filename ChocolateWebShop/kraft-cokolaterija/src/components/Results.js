import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from './Cart/CartContext';
import './Results.css';
import axios from 'axios';

const Results = () => {
  const { cart, addToCart } = useCart();
  const [filteredProizvodi, setFilteredProizvodi] = useState([]);
  const [error, setError] = useState('');
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const navigate = useNavigate();

  const location = useLocation();
  const { selectedVrsta, selectedPodvrsta } = location.state || {}; // Dohvati filtrirane parametre

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      setIsUserLoggedIn(false);
      navigate('/login');
    } else {
      setIsUserLoggedIn(true); // Ako token postoji, korisnik je prijavljen
    }
  }, [navigate]);

  // Dohvaćanje proizvoda prema filtriranim parametrima
  const fetchAndFilterProducts = async () => {
    try {
      let url = 'http://localhost:5001/api/proizvodi';

      // Ako je odabrana vrsta čokolade, filtriraj prema vrsti
      if (selectedVrsta) {
        url += `?vrsta=${selectedVrsta}`;
      }

      // Ako je odabrana podvrsta, filtriraj prema podvrsti
      if (selectedPodvrsta) {
        url += `&podvrsta=${selectedPodvrsta}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`, // Slanje JWT tokena
        },
      });

      if (response.status === 200) {
        setFilteredProizvodi(response.data.proizvodi);
      } else {
        setError('Greška prilikom dohvaćanja proizvoda.');
      }
    } catch (error) {
      console.error('Greška prilikom dohvaćanja proizvoda:', error);
      setError('Greška: Failed to fetch or filter products.');
    }
  };

  useEffect(() => {
    if (isUserLoggedIn) {
      fetchAndFilterProducts(); // Ako je korisnik prijavljen, filtriraj proizvode
    }
  }, [isUserLoggedIn, selectedVrsta, selectedPodvrsta]);

  const handleAddToCart = (proizvod) => {
    addToCart(proizvod);
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  return (
    <div className="results-container">
      <h2>Proizvodi</h2>

      <div className="cart-info" onClick={handleCartClick}>
        <FaShoppingCart />
        <span>{cart.length}</span>
      </div>

      {error && <p className="error-message">{error}</p>}

      <ul>
        {filteredProizvodi.length === 0 ? (
          <p className="no-products">Nema proizvoda koji odgovaraju kriterijima.</p>
        ) : (
          filteredProizvodi.map((proizvod) => (
            <li key={proizvod._id} className="product-item">
              <div className="product-info">
                <span>Ime: {proizvod.name}</span>
                <span>Vrsta: {proizvod.vrsta}</span>
                <span>Podvrsta: {proizvod.podvrsta}</span>
                <span>Cijena: {proizvod.price} HRK</span>
              </div>
              <button
                className="add-to-cart-button"
                onClick={() => handleAddToCart(proizvod)}
              >
                Dodaj u košaricu
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Results;
