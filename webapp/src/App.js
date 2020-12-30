import "./App.css";
import { MapContainer, TileLayer } from "react-leaflet";
import { useEffect, useState } from "react";
import * as topojson from "topojson-client";
import Italy from "./components/Italy";
import regions from "./static/boundaries/limits_IT_regions.topo.json";
import provinces from "./static/boundaries/limits_IT_provinces.topo.json";

const italyCoords = [42, 12.5];

const Breadcrumb = ({
  selectedFeature,
  selectFeature,
  featureIndex,
  setFeatureIndex,
}) => {
  return (
    <div className="breadcrumb">
      {Object.entries(selectedFeature)
        .filter(
          ([, { index, name, feature }]) =>
            name && feature && index <= featureIndex
        )
        .map(([type, { index, name, feature }]) => {
          return (
            <p
              key={name + type}
              className={`breadItem ${type}`}
              onClick={() => {
                selectFeature(feature);
                setFeatureIndex(index);
              }}
            >
              {name}
            </p>
          );
        })}
    </div>
  );
};
const geoRegions = topojson.feature(regions, "regions");
const geoProvinces = topojson.feature(provinces, "provinces");

function App() {
  const [currentGeoJSON, setCurrentGeoJSON] = useState(geoRegions);
  const [selectedFeature, setSelectedFeature] = useState({
    state: { index: 1, name: "Italy", feature: geoRegions },
    region: { index: 2, name: "", feature: null },
    province: { index: 3, name: "", feature: null },
    municipality: { index: 4, name: "", feature: null },
  });
  const [featureIndex, setFeatureIndex] = useState(1);

  return (
    <div className="container">
      <Breadcrumb
        selectedFeature={selectedFeature}
        selectFeature={setCurrentGeoJSON}
        featureIndex={featureIndex}
        setFeatureIndex={setFeatureIndex}
      />
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
        <Italy
          provinces={geoProvinces}
          currentGeoJSON={currentGeoJSON}
          setCurrentGeoJSON={setCurrentGeoJSON}
          selectedFeature={selectedFeature}
          setSelectedFeature={setSelectedFeature}
          setFeatureIndex={setFeatureIndex}
        />
      </MapContainer>
    </div>
  );
}

export default App;
