import Map from "../map/Map";
import { useEffect,useState } from "react";

function PrimjerMape({radioStations, setSelectedStation}){

  useEffect(() => {
    console.log("Rdio stanice u PrimjerMape: ")
    console.log(radioStations)
  })
  return (
      <Map lng="16.470369012927815" lat="43.51330933410279" zoom="1" radioStanice={radioStations} apiKey="EyqY6iqRC1RKzlOnWTFD" setSelectedStation={setSelectedStation}/>
    )
}

export default PrimjerMape;