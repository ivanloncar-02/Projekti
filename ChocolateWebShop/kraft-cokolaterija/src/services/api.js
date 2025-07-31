import axios from 'axios';

// Kreiranje axios instancije za slanje zahtjeva na backend
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
});

// Dodavanje tokena u header, ukoliko je prisutan u localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`; // Dodaj token u header
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Funkcija za dohvat detalja proizvoda
export const getProductDetails = (id) => {
  return api.get(`/proizvodi/${id}`)
    .then((response) => response.data)
    .catch((error) => {
      console.error('Error fetching product details:', error);
      throw error;
    });
};


export default api;
