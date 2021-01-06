import "./App.css";
import { MapContainer, TileLayer } from "react-leaflet";
import { useEffect, useState, useMemo } from "react";
import Italy from "./components/Italy";
import Breadcrumb from "./components/Breadcrumb";
import SideMenu from "./components/SideMenu";

import { makeItalianTree, defaultFeature, geoRegions } from "./helpers";

const italyCoords = [42, 12.5];

function App() {
  const italyTree = useMemo(() => makeItalianTree(), []);
  const [currentGeoJSON, setCurrentGeoJSON] = useState(geoRegions);
  const [selectedFeature, setSelectedFeature] = useState(defaultFeature);
  const [featureIndex, setFeatureIndex] = useState(1);

  return (
    <div className="container">
      <Breadcrumb
        currentGeoJSON={currentGeoJSON}
        setCurrentGeoJSON={setCurrentGeoJSON}
        selectedFeature={selectedFeature}
        setSelectedFeature={setSelectedFeature}
        setFeatureIndex={setFeatureIndex}
        featureIndex={featureIndex}
      />
      <div className="content">
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
            featureIndex={featureIndex}
            currentGeoJSON={currentGeoJSON}
            setCurrentGeoJSON={setCurrentGeoJSON}
            selectedFeature={selectedFeature}
            setSelectedFeature={setSelectedFeature}
            setFeatureIndex={setFeatureIndex}
          />
        </MapContainer>
        <SideMenu
          italyTree={italyTree}
          currentGeoJSON={currentGeoJSON}
          selectedFeature={selectedFeature}
          setSelectedFeature={setSelectedFeature}
          setCurrentGeoJSON={setCurrentGeoJSON}
          setFeatureIndex={setFeatureIndex}
        />
      </div>
    </div>
  );
}

export default App;
