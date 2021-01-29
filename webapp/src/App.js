import "./App.css";
import { MapContainer, TileLayer } from "react-leaflet";
import { useState, useMemo } from "react";
import Italy from "./components/Italy";
import Breadcrumb from "./components/Breadcrumb";
import SideMenu from "./components/SideMenu";
import { defaultFeature, geoRegions, makeItalianTree } from "./helpers";

const italyBounds = [[36.6199872, 6.74995527 ], [47.11539317, 18.48024702 ]];

function App() {
  const italyTree = useMemo(() => makeItalianTree(), []);
  const [currentGeoJSON, setCurrentGeoJSON] = useState(geoRegions);
  const [selectedTreeItem, setSelectedTreeItem]= useState(italyTree)
  const [selectedFeature, setSelectedFeature] = useState(defaultFeature);
  const [featureIndex, setFeatureIndex] = useState(1);

  return (
    <div className="container">
      <Breadcrumb
        setCurrentGeoJSON={setCurrentGeoJSON}
        selectedTreeItem={selectedTreeItem}
        setSelectedTreeItem={setSelectedTreeItem}
      />
      <div className="content">
        <MapContainer
          id="mapContainer"
          zoom={6}
          minZoom={6}
          bounds={italyBounds}
          maxBounds={italyBounds}
          maxBoundsViscosity={1}
          scrollWheelZoom={true}
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
            italyTree={italyTree}
          />
        </MapContainer>
        <SideMenu
          italyTree={italyTree}
          currentGeoJSON={currentGeoJSON}
          selectedFeature={selectedFeature}
          setSelectedFeature={setSelectedFeature}
          setCurrentGeoJSON={setCurrentGeoJSON}
          setFeatureIndex={setFeatureIndex}
          selectedTreeItem={selectedTreeItem}
          setSelectedTreeItem={setSelectedTreeItem}
        />
      </div>
    </div>
  );
}

export default App;
