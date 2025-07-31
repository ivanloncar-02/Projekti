// StationDetails.jsx
import React from "react";
import styles from './stationDetails.module.css';

const StationDetails = ({ station,setSelectedStation}) => {
  return (
    <>
      <div className={styles.stationDetails}>
        <span>{station.name}</span>
        <span>{station.country}</span>
        {station.tags ? <span>{station.tags}</span> : <span>Not known</span>}
       <span> <button onClick={setSelectedStation(station)} className={styles.playButton}>Play</button></span>
      </div>
    </>
  );
};

export default StationDetails;
