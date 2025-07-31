import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditManufacturer = () => {
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [foundedYear, setFoundedYear] = useState('');
  const [message, setMessage] = useState('');
  const [manufacturers, setManufacturers] = useState([]);

  useEffect(() => {
    const fetchManufacturers = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/manufacturers');
        setManufacturers(response.data);
      } catch (error) {
        console.error('Greška pri dohvaćanju proizvođača:', error);
      }
    };

    fetchManufacturers();
  }, []);

  const handleAddManufacturer = async (e) => {
    e.preventDefault();
    setMessage(''); // Reset the message

    if (!name || !country || !foundedYear) {
      setMessage('Sva polja su obavezna!');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5001/api/manufacturers', {
        name,
        country,
        foundedYear: parseInt(foundedYear, 10),
      });
      setMessage('Proizvođač uspješno dodan!');
      setName('');
      setCountry('');
      setFoundedYear('');
      setManufacturers([...manufacturers, response.data]);
    } catch (error) {
      console.error('Greška pri dodavanju proizvođača:', error);
      setMessage('Došlo je do greške pri dodavanju proizvođača.');
    }
  };

  const handleDeleteManufacturer = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/api/manufacturers/${id}`);
      setManufacturers(manufacturers.filter((m) => m._id !== id));
      setMessage('Proizvođač uspješno obrisan!');
    } catch (error) {
      console.error('Greška pri brisanju proizvođača:', error);
      setMessage('Došlo je do greške pri brisanju proizvođača.');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Dodaj Novog Proizvođača</h2>
      <form onSubmit={handleAddManufacturer} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">Ime</label>
          <input
            id="name"
            type="text"
            className="border border-gray-300 p-2 rounded w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="country" className="block text-sm font-medium">Država</label>
          <input
            id="country"
            type="text"
            className="border border-gray-300 p-2 rounded w-full"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="foundedYear" className="block text-sm font-medium">Godina Osnivanja</label>
          <input
            id="foundedYear"
            type="number"
            className="border border-gray-300 p-2 rounded w-full"
            value={foundedYear}
            onChange={(e) => setFoundedYear(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Dodaj Proizvođača
        </button>
      </form>

      {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}

      <h2 className="text-xl font-bold mt-8 mb-4">Postojeći Proizvođači</h2>
      <ul className="space-y-2">
        {manufacturers.map((manufacturer) => (
          <li key={manufacturer._id} className="border p-4 rounded">
            <p><strong>Ime:</strong> {manufacturer.name}</p>
            <p><strong>Država:</strong> {manufacturer.country}</p>
            <p><strong>Godina Osnivanja:</strong> {manufacturer.foundedYear}</p>
            <h4 className="font-bold">Čokolade:</h4>
            {manufacturer.chocolates && manufacturer.chocolates.length > 0 ? (
              <ul className="list-disc list-inside">
                {manufacturer.chocolates.map((chocolate) => (
                  <li key={chocolate._id}>{chocolate.name}</li>
                ))}
              </ul>
            ) : (
              <p>Ovaj proizvođač nema povezane čokolade.</p>
            )}
            {manufacturer.chocolates && manufacturer.chocolates.length === 0 && (
              <button
                onClick={() => handleDeleteManufacturer(manufacturer._id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mt-2"
              >
                Obriši Proizvođača
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EditManufacturer;
