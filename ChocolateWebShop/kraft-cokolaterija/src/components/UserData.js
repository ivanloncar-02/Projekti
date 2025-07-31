import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const UserData = () => {
  const { id } = useParams();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/userdata/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
          },
        });
        if (response.status === 200) {
          setUserData(response.data);
        } else {
          console.error('Greška pri dohvaćanju korisničkih podataka');
        }
      } catch (error) {
        console.error('Greška prilikom dohvaćanja korisničkih podataka:', error);
      }
    };

    fetchUserData();
  }, [id]);


  return (
    <div>
      <h1>Podaci o korisniku</h1>
      {userData ? (
        <>
          <p>Ime: {userData.username}</p>
          <p>Email: {userData.email}</p>
          <p>Uloga: {userData.role}</p>
        </>
      ) : (
        <p>Učitavanje podataka...</p>
      )}
    </div>
  );
};

export default UserData;

