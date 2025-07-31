import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChocolateFilter.css';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const ChocolateFilter = () => {
  const [vrsteCokolade, setVrsteCokolade] = useState([]);
  const [selectedVrsta, setSelectedVrsta] = useState('');
  const [podvrsteCokolade, setPodvrsteCokolade] = useState([]);
  const [selectedPodvrsta, setSelectedPodvrsta] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      setIsAuthenticated(true);

      // Dekodiraj JWT token i provjeri ulogu korisnika
      try {
        const decodedToken = jwtDecode(token);
        console.log('Decoded Token:', decodedToken);

        if (decodedToken.role === 'admin') {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Greška pri dekodiranju tokena:', error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchVrste = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/vrsteCokolade', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
          },
        });
        if (response.status === 200) {
          setVrsteCokolade(response.data);
        } else {
          console.error('Greška pri dohvaćanju vrsta čokolade');
        }
      } catch (error) {
        console.error('Greška prilikom dohvaćanja vrsta čokolade:', error);
      }
    };

    fetchVrste();
  }, []);

  useEffect(() => {
    if (selectedVrsta) {
      const fetchPodvrste = async () => {
        try {
          const response = await axios.get(`http://localhost:5001/api/vrsteCokolade/${selectedVrsta}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
            },
          });
          if (response.status === 200) {
            setPodvrsteCokolade(response.data);
          } else {
            console.error('Greška pri dohvaćanju podvrsta čokolade');
          }
        } catch (error) {
          console.error('Greška prilikom dohvaćanja podvrsta čokolade:', error);
        }
      };

      fetchPodvrste();
    } else {
      setPodvrsteCokolade([]);
    }
  }, [selectedVrsta]);

  const handleVrstaChange = (e) => {
    setSelectedVrsta(e.target.value);
    setSelectedPodvrsta('');
  };

  const handlePodvrstaChange = (e) => {
    setSelectedPodvrsta(e.target.value);
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    navigate('/results', { state: { selectedVrsta, selectedPodvrsta } });
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    setIsAuthenticated(false);
    setIsAdmin(false); // Resetiramo admin stanje
    navigate('/login');
  };

  const handleManufacturerClick = () => {
    navigate('/manufacture');
  };

  const handleEditProductClick = () => {
    navigate('/edit-product');
  };

  const handleEditManufacturerClick = () => {
    navigate('/edit-manufacturer');
  };

  const handleUserListClick = () => {
    navigate('/userlist');
  };

  return (
    <div className="filter-container">
      {/* Botuni za admin korisnike */}
      {isAdmin && (
        <div className="admin-buttons">
          <button onClick={handleEditProductClick}>Edit proizvod</button>
          <button onClick={handleEditManufacturerClick}>Edit proizvođač</button>
          <button onClick={handleUserListClick}>Lista korisnika</button>
        </div>
      )}

      <form onSubmit={handleFilterSubmit}>
        <label htmlFor="vrsta">Odaberite vrstu čokolade:</label>
        <select id="vrsta" value={selectedVrsta} onChange={handleVrstaChange}>
          <option value="">-- Odaberite vrstu --</option>
          {vrsteCokolade.map((vrsta) => (
            <option key={vrsta} value={vrsta}>
              {vrsta}
            </option>
          ))}
        </select>

        <label htmlFor="podvrsta">Odaberite podvrstu čokolade:</label>
        <select id="podvrsta" value={selectedPodvrsta} onChange={handlePodvrstaChange}>
          <option value="">-- Odaberite podvrstu --</option>
          {podvrsteCokolade.map((podvrsta) => (
            <option key={podvrsta} value={podvrsta}>
              {podvrsta}
            </option>
          ))}
        </select>

        <button type="submit">Filtriraj</button>
      </form>

      <button className="manufacturer-button" onClick={handleManufacturerClick}>
        Proizvođači
      </button>

      <div className="auth-buttons">
        {!isAuthenticated ? (
          <>
            <button onClick={handleLoginRedirect}>Prijava</button>
            <button onClick={() => navigate('/registration')}>Registracija</button>
          </>
        ) : (
          <button onClick={handleLogout}>Odjava</button>
        )}
      </div>
    </div>
  );
};

export default ChocolateFilter;
