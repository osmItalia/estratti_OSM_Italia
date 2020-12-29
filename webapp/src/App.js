import "./App.css";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import * as topojson from "topojson-client";
import provinces from "./static/boundaries/limits_IT_provinces.topo.json";
import regions from "./static/boundaries/limits_IT_regions.topo.json";

import { useState } from "react";

const italyCoords = [42, 12.5];
const geoRegions = topojson.feature(regions, "regions");
const geoProvinces = topojson.feature(provinces, "provinces");

const getProvincesFromRegionIstatCode = (istatCode) => {
  const filteredProvinces = geoProvinces.features.filter(
    ({ properties }) => properties.reg_istat_code === istatCode
  );

  return {
    features: filteredProvinces,
    type: "FeatureCollection",
  };
};

const getMunicipalitiesForProvinceIstatCode = async (provinceIstatCode) => {
  const fileName = `estratti_OSM_Italia/static/boundaries/limits_P_${provinceIstatCode}_municipalities.topo.json`;
  console.log(fileName);
  const fileFetched = await fetch(fileName);
  const municipalities = await fileFetched.json();
  console.log(municipalities);
  return topojson.feature(municipalities, "municipalities");
};

function App() {
  const [currentGeoJSON, setCurrentGeoJSON] = useState(geoRegions);
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
        <GeoJSON
          eventHandlers={{
            click: async (e) => {
              const properties = e.layer.feature.properties;
              console.log(properties);

              switch (true) {
                case !!properties.prov_istat_code_num:
                  const provIstatCode = properties.prov_istat_code_num;
                  const municipalitiesForIstatCode = await getMunicipalitiesForProvinceIstatCode(
                    provIstatCode
                  );
                  console.log(municipalitiesForIstatCode);
                  setCurrentGeoJSON(municipalitiesForIstatCode);
                  break;
                case !!properties.reg_istat_code:
                default:
                  const regionIstatCode = properties.reg_istat_code;
                  const provincesForIstatCode = getProvincesFromRegionIstatCode(
                    regionIstatCode
                  );
                  console.log(provincesForIstatCode);
                  setCurrentGeoJSON(provincesForIstatCode);
                  break;
              }
            },
          }}
          pathOptions={{ color: "red" }}
          key={currentGeoJSON.features?.length}
          data={currentGeoJSON}
        />
      </MapContainer>
    </div>
  );
}

export default App;
