import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      navigate('/login');  // Ako nema tokena, preusmjeri na login stranicu
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  return isAuthenticated ? children : null;
};

export default ProtectedRoute;
