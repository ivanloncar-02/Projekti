import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EditProduct = () => {
  const [chocolates, setChocolates] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Dohvaćanje svih čokolada
    const fetchChocolates = async () => {
      try {
        const response = await axios.get('/proizvodi');
        setChocolates(response.data.proizvodi);
      } catch (error) {
        console.error('Greška prilikom dohvaćanja čokolada:', error);
      }
    };

    fetchChocolates();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/proizvodi/${id}`);
      // Nakon brisanja, ponovo dohvatiti čokolade
      setChocolates(chocolates.filter(chocolate => chocolate._id !== id));
    } catch (error) {
      console.error('Greška prilikom brisanja čokolade:', error);
    }
  };

  return (
    <div>
      <h1>Uredi čokolade</h1>
      <h3>Lista svih čokolada</h3>
      <ul>
        {chocolates.map((chocolate) => (
          <li key={chocolate._id}>
            <h4>{chocolate.name}</h4>
            <p>Vrsta: {chocolate.vrsta}</p>
            <p>Podvrsta: {chocolate.podvrsta}</p>
            <p>Cijena: {chocolate.price} HRK</p>
            <button onClick={() => handleDelete(chocolate._id)}>
              Obriši
            </button>
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EditProduct;
