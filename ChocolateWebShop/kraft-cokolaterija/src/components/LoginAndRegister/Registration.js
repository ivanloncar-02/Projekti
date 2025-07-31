import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Registration = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleUsernameChange = (e) => setUsername(e.target.value);
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  // Funkcija za registraciju korisnika
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5001/api/auth/register', { username, email, password });

      if (response.data.success) {
        setSuccessMessage('Registracija uspješna!');
        setErrorMessage('');
      } else {
        setErrorMessage(response.data.message);
        setSuccessMessage('');
      }
    } catch (error) {
      console.error('Greška pri registraciji:', error);
      setErrorMessage('Došlo je do greške pri registraciji. Pokušajte ponovno.');
      setSuccessMessage('');
    }
  };

  const goToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Registracija</h2>

        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label htmlFor="username">Korisničko ime:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={handleUsernameChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Lozinka:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              required
            />
          </div>

          {errorMessage && <div className="error-message">{errorMessage}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <button type="submit">Registracija</button>
        </form>

        <button onClick={goToLogin} className="go-to-login-button">Login</button>
      </div>
    </div>
  );
};

export default Registration;
