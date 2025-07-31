// Map.jsx

import React, { useRef, useEffect, useState } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import './Map.css';

function isValidLongitude(longitude) {
  return typeof longitude === 'number' && !isNaN(longitude);
}

function Map({ lng, lat, zoom, apiKey, radioStanice, setSelectedStation }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  maptilersdk.config.apiKey = apiKey;
  const [odabranaStanica, setOdabranaStanica] = useState(null);

  useEffect(() => {
    const markers = [];
    const cleanupListeners = [];
    console.log("Radio stanice stigle u mapjsx: ")
    console.log(radioStanice)
    if (false/*map.current*/) {
      map.current.setZoom(zoom);
      map.current.setCenter([lng, lat]);
      map.current.redraw();
    } else {
      map.current = new maptilersdk.Map({
        container: mapContainer.current,
        style: maptilersdk.MapStyle.STREETS,
        center: [lng, lat],
        zoom: zoom,
      });

    }
    console.log("Raadio stanice u Map.jsx")
    console.log(radioStanice)

    radioStanice.forEach((rs) => {
      if (true) {
        // Your marker creation logic here
        const popup = new maptilersdk.Popup({ offset: 25 }).setHTML(
          `<div class="popupStyle">${rs.name},${rs.homepage} </div>`
        ).on('open', (ev) => {
          setOdabranaStanica(rs);
          setSelectedStation(rs)
        });

        const marker = new maptilersdk.Marker({ color: '#FF0000' });
        marker
          .setLngLat([rs.location.lng, rs.location.lat])
          .setPopup(popup)
          .addTo(map.current);

        markers.push(marker);
        console.log("marker kreirean!!")

        const handleMouseOver = () => {
          marker.getElement().classList.add('animated-marker');
        };

        const handleMouseLeave = () => {
          marker.getElement().classList.remove('animated-marker');
        };

        marker.getElement().addEventListener('mouseover', handleMouseOver);
        marker.getElement().addEventListener('mouseleave', handleMouseLeave);

        cleanupListeners.push(() => {
          marker.getElement().removeEventListener('mouseover', handleMouseOver);
          marker.getElement().removeEventListener('mouseleave', handleMouseLeave);
        });
      } else {
        //console.log(`Invalid longitude for station ${rs.name}: ${rs.lng}`);
      }
    });
    console.log("Markeri: " + markers)

    return () => {
      cleanupListeners.forEach(cleanup => cleanup());
    };
  }, [lng, lat, zoom, radioStanice]);

  return (
    <div>
      <div className="map-wrap">
        <div ref={mapContainer} className="map" />
      </div>
      {/* <DetaljiStanice stanica={odabranaStanica} /> */}
    </div>
  );
}

export default Map;