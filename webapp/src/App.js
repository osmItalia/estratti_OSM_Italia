import "./App.css";
import { MapContainer, TileLayer } from "react-leaflet";
import { useState, useMemo, useEffect } from "react";
import Italy from "./components/Italy";
import Breadcrumb from "./components/Breadcrumb";
import SideMenu from "./components/SideMenu";
import { italyBounds, geoRegions, makeItalianTree } from "./helpers";
import config from "./configuration.json";

function App() {
  const italyTree = useMemo(() => makeItalianTree(), []);
  const [currentGeoJSON, setCurrentGeoJSON] = useState(geoRegions);
  const [selectedTreeItem, setSelectedTreeItem] = useState(italyTree);
  const [selectedFeature, setSelectedFeature] = useState(null);

  useEffect(() => {
    selectedTreeItem.getChildFeatures().then((feature) => {
      setCurrentGeoJSON(feature);
      setSelectedFeature(feature);
    });
  }, [selectedTreeItem]);

  return (
    <div className="container">
      <Breadcrumb
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
          maxBoundsViscosity={0.5}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution={config.mapAttribution}
            url="https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png"
          />
          <Italy
            currentGeoJSON={currentGeoJSON}
            italyTree={italyTree}
            selectedTreeItem={selectedTreeItem}
            setSelectedTreeItem={setSelectedTreeItem}
          />
        </MapContainer>
        <SideMenu
          italyTree={italyTree}
          selectedTreeItem={selectedTreeItem}
          setSelectedTreeItem={setSelectedTreeItem}
          selectedFeature={selectedFeature}
        />
      </div>
    </div>
  );
}

export default App;
