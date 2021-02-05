import "./App.css";
import { MapContainer, TileLayer } from "react-leaflet";
import { useState, useMemo, useEffect } from "react";
import Italy from "./components/Italy";
import Breadcrumb from "./components/Breadcrumb";
import SideMenu from "./components/SideMenu";
import { italyBounds, geoRegions, makeItalianTree } from "./helpers";

function App() {
  const italyTree = useMemo(() => makeItalianTree(), []);
  const [currentGeoJSON, setCurrentGeoJSON] = useState(geoRegions);
  const [selectedTreeItem, setSelectedTreeItem] = useState(italyTree);

  useEffect(() => {
    selectedTreeItem.getChildFeatures().then(setCurrentGeoJSON);
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
          maxBoundsViscosity={1}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
        />
      </div>
    </div>
  );
}

export default App;
