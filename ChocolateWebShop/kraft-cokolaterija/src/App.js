import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './components/Cart/CartContext.js';
import ChocolateFilter from './components/ChocolateFilter';
import Results from './components/Results';
import Details from './components/Details';
import Cart from './components/Cart/Cart';
import CartModal from './components/Cart/CartModal';
import Login from './components/LoginAndRegister/Login.js';
import Registration from './components/LoginAndRegister/Registration.js';
import ProtectedRoute from './components/ProtectedRoute';
import Manufacturers from './components/ManufacturerList';
import EditProduct from './components/EditProduct';
import EditManufacturer from './components/EditManufacturer';
import UserList from './components/UserList';
import UserData from './components/UserData';


// Postavite axios globalnu konfiguraciju za svaki zahtjev
axios.defaults.baseURL = 'http://localhost:5001/api'; // Osnovna URL adresa za backend
axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('jwtToken')}`;

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      if (token) {
        const response = await axios.get('/auth/user');
        console.log('Podaci o korisniku:', response.data);
        setUser(response.data.user);
      } else {
        console.log('Korisnik nije prijavljen.');
      }
    } catch (error) {
      console.error('Greška pri dohvaćanju podataka o korisniku:', error);
    }
  };

  return (
    <CartProvider>
      <Router>
        <CartModal />
        <Routes>
          <Route path="/" element={<ChocolateFilter />} />

          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            }
          />
          <Route
            path="/details/:id"
            element={
              <ProtectedRoute>
                <Details />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />

          <Route
            path="/userlist"
            element={
              <ProtectedRoute>
                <UserList />
              </ProtectedRoute>
            }
          />
          <Route
             path="/userdata/:id"
             element={
            <ProtectedRoute>
              <UserData />
            </ProtectedRoute>
             }
          />
          {/* Public rute */}
          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<Registration />} />

          <Route
            path="/manufacture"
            element={
              <ProtectedRoute>
                <Manufacturers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-product"
            element={
              <ProtectedRoute>
                <EditProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-manufacturer"
            element={
              <ProtectedRoute>
                <EditManufacturer />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </CartProvider>
  );
};

export default App;
