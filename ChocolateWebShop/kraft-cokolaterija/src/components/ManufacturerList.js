// ManufacturerList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManufacturerList = () => {
  const [manufacturers, setManufacturers] = useState([]);

  useEffect(() => {
    const fetchManufacturers = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/manufacturers');
        setManufacturers(response.data);
      } catch (error) {
        console.error('Error fetching manufacturers:', error);
      }
    };

    fetchManufacturers();
  }, []);

  return (
    <div>
      <h1>Proizvođači</h1>
      <ul>
        {manufacturers.map(manufacturer => (
          <li key={manufacturer._id}>
            <h3>{manufacturer.name}</h3>
            <p>Država: {manufacturer.country}</p>
            <p>Godina osnivanja: {manufacturer.foundedYear}</p>
            <h3>Čokolade:</h3>
            <ul>
              {manufacturer.chocolates && manufacturer.chocolates.map(chocolate => (
                <li key={chocolate._id}>{chocolate.name}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManufacturerList;
