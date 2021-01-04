import "./App.css";
import { MapContainer, TileLayer } from "react-leaflet";
import { useEffect, useState, useMemo } from "react";
import Italy from "./components/Italy";
import Breadcrumb from "./components/Breadcrumb";
import SideMenu from "./components/SideMenu";

import {
  fillDataFromProperties,
  makeItalianTree,
  defaultFeature,
  geoRegions,
  getMunicipalitiesForProvinceIstatCode,
} from "./helpers";

const italyCoords = [42, 12.5];

function App() {
  const italyTree = useMemo(() => makeItalianTree(), []);
  const [currentGeoJSON, setCurrentGeoJSON] = useState(geoRegions);
  const [selectedFeature, setSelectedFeature] = useState(defaultFeature);
  const [featureIndex, setFeatureIndex] = useState(1);
  const [selectedIstatProperties, setSelectedIstatProperties] = useState(null);

  useEffect(() => {
    if (!selectedIstatProperties) {
      return;
    }

    if (selectedIstatProperties.prov_istat_code_num) {
      getMunicipalitiesForProvinceIstatCode(
        selectedIstatProperties.prov_istat_code_num
      ).then((featureGeometry) => {
        const feature = {
          properties: selectedIstatProperties,
          feature: featureGeometry,
        };
        fillDataFromProperties(
          feature,
          selectedFeature,
          setSelectedFeature,
          setCurrentGeoJSON,
          setFeatureIndex
        );
      });
    } else if (selectedIstatProperties.com_istat_code_num) {
      let selectedFeature = currentGeoJSON.features.find(
        ({ properties }) =>
          properties.com_istat_code_num ===
          selectedIstatProperties.com_istat_code_num
      );

      const feature = {
        properties: selectedIstatProperties,
        ...selectedFeature,
      };
      fillDataFromProperties(
        feature,
        selectedFeature,
        setSelectedFeature,
        setCurrentGeoJSON,
        setFeatureIndex
      );
    }
  }, [selectedIstatProperties]);

  return (
    <div className="container">
      <Breadcrumb
        selectedFeature={selectedFeature}
        selectFeature={setCurrentGeoJSON}
        featureIndex={featureIndex}
        setFeatureIndex={setFeatureIndex}
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
            currentGeoJSON={currentGeoJSON}
            setCurrentGeoJSON={setCurrentGeoJSON}
            selectedFeature={selectedFeature}
            setSelectedFeature={setSelectedFeature}
            setFeatureIndex={setFeatureIndex}
          />
        </MapContainer>
        <SideMenu
          italyTree={italyTree}
          setSelectedIstatProperties={setSelectedIstatProperties}
        />
      </div>
    </div>
  );
}

export default App;
