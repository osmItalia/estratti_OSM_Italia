import "./App.css";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import * as topojson from "topojson-client";
import provinces from "./static/boundaries/provinces.topo.json";
import boundaries from "./static/boundaries.json";
import { useState } from "react";
const italyCoords = [42, 12.5];

const getProvincesForRegion = (region) => {
  return boundaries[region]?.provinces;
};

const getFeaturesFromProvinces = async (provinces) => {
  const provincesIds = Object.values(provinces).map(({ id }) => id);
  provincesIds.forEach(async (id) => {
    const fileName = `estratti_OSM_Italia/static/boundaries/l_${id}.json`;
    const f1 = await fetch(fileName);
    console.log(f1);
  });
};

function App() {
  const geoProv = topojson.feature(provinces, "provinces");
  const [currentFeatures, selectCurrentFeatures] = useState([geoProv]);
  return (
    <div className="container">
      <MapContainer
        id="mapContainer"
        center={italyCoords}
        zoom={6}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {currentFeatures.map((feature) => (
          <GeoJSON
            eventHandlers={{
              click: async (e) => {
                const properties = e.layer.feature.properties;
                const region = properties.reg_name.toLowerCase();
                console.log(region);
                const provinces = getProvincesForRegion(region);
                console.log(provinces);
                const features = getFeaturesFromProvinces(provinces);
                console.log(features);
              },
            }}
            pathOptions={{ color: "red" }}
            key={"geoProv"}
            data={feature}
          />
        ))}
      </MapContainer>
    </div>
  );
}

export default App;
