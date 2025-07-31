import React, { useState, useEffect } from "react";
import styles from "./RadioStationSearch.module.css";
import StationDetails from "../stationDetails/stationDetails.jsx";

const RadioStationSearch = ({ radioStations, setSelectedStation}) => {
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [filteredStations, setFilteredStations] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");

  const openWindow = () => {
    setIsWindowOpen(true);
  };

  const closeWindow = () => {
    setIsWindowOpen(false);
  };

  useEffect(() => {
    setFilteredStations(radioStations);
  }, [radioStations]);

  const handleSort = () => {
    const sortOrderToggle = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(sortOrderToggle);

    const sortedStationsByCountry = [...filteredStations].sort((a, b) => {
      const valueA = a.country || "";
      const valueB = b.country || "";
      const order = sortOrderToggle === "asc" ? 1 : -1;
      return valueA.localeCompare(valueB) * order;
    });

    setFilteredStations(sortedStationsByCountry);
  };

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchTerm(searchTerm);

    const filteredStationsByName = radioStations.filter(
      (station) =>
        station.name.toLowerCase().includes(searchTerm) ||
        station.country.toLowerCase().includes(searchTerm)
    );

    setFilteredStations(filteredStationsByName);
  };

  return (
    <>
      <button className={styles.openButton} onClick={openWindow}>
          Radio Stations
      </button>

      {isWindowOpen && (
        <div className={styles.overlay}>
          <div className={styles.window}>
            <div className={styles.sortButtons}>
              <button onClick={handleSort}>Sort by Country</button>
            </div>
            <div className={styles.inputContainer}>
              <input
                type="text"
                placeholder="Search by Name, Country or Tag"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <div className={styles.stationContainer}>
              {filteredStations.map((station, i) => (
                <StationDetails
                  setSelectedStation={setSelectedStation}
                  station={station}
                  key={station.stationuuid + 100 * i}
                />
              ))}
            </div>
            <button className={styles.exitButton} onClick={closeWindow}>
              Exit
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default RadioStationSearch;
