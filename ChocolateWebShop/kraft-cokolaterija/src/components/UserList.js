import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const UserList = () => {
  const [korisnici, setKorisnici] = useState([]);

  useEffect(() => {
    const fetchKorisnici = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/userlist', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
          },
        });
        if (response.status === 200) {
          setKorisnici(response.data);
        } else {
          console.error('Greška pri dohvaćanju korisnika');
        }
      } catch (error) {
        console.error('Greška prilikom dohvaćanja korisnika:', error);
      }
    };

    fetchKorisnici();
  }, []);

  return (
    <div>
      <h1>Lista Korisnika</h1>
      <ul>
        {korisnici.map((korisnik) => (
          <li key={korisnik._id}>
            <Link to={`/userdata/${korisnik._id}`}>{korisnik.username}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
