import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5001/api/auth/login', { email, password });

      const { token } = response.data;
      localStorage.setItem('jwtToken', token);

      // Dohvatiti korisničke podatke
      const userDataResponse = await axios.get('http://localhost:5001/api/auth/user', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('User data:', userDataResponse.data);

      navigate('/');
    } catch (err) {
      console.error('Greška pri prijavi:', err);
      setError('Pogrešan email ili lozinka');
    }
  };

  return (
    <div>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Login</button>
      </form>

      {error && <p>{error}</p>}
    </div>
  );
};

export default Login;
