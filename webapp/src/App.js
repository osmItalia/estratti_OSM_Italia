import "./App.css";
import { MapContainer, TileLayer } from "react-leaflet";
import { useState } from "react";
import * as topojson from "topojson-client";
import Italy from "./components/Italy";
import Breadcrumb from "./components/Breadcrumb";
import SideMenu from "./components/SideMenu";
import regions from "./static/boundaries/limits_IT_regions.topo.json";
import provinces from "./static/boundaries/limits_IT_provinces.topo.json";
const italyCoords = [42, 12.5];

const geoRegions = topojson.feature(regions, "regions");
const geoProvinces = topojson.feature(provinces, "provinces");

const makeItalianTree = (provinces) => {
  const italyTree = {
    name: "Italy",
    toggled: true,
    children: {},
  };

  provinces.objects.provinces.geometries.forEach(
    ({ properties: { reg_name, prov_name } }) => {
      const previousChildren = italyTree.children[reg_name]?.children || [];
      italyTree.children[reg_name] = {
        name: reg_name,
        children: [...previousChildren, { name: prov_name }],
      };
    }
  );

  italyTree.children = Object.values(italyTree.children);
  return italyTree;
};

function App() {
  const italyTree = makeItalianTree(provinces);
  const [currentGeoJSON, setCurrentGeoJSON] = useState(geoRegions);
  const [selectedFeature, setSelectedFeature] = useState({
    state: { index: 1, name: "Italy", feature: geoRegions },
    region: { index: 2, name: "", feature: null },
    province: { index: 3, name: "", feature: null },
    municipality: { index: 4, name: "", feature: null },
  });
  const [featureIndex, setFeatureIndex] = useState(1);
  const [selected, setSelected] = useState(null); // TODO: connect sidemenu

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
            provinces={geoProvinces}
            currentGeoJSON={currentGeoJSON}
            setCurrentGeoJSON={setCurrentGeoJSON}
            selectedFeature={selectedFeature}
            setSelectedFeature={setSelectedFeature}
            setFeatureIndex={setFeatureIndex}
          />
        </MapContainer>
        <SideMenu italyTree={italyTree} setSelected={setSelected} />
      </div>
    </div>
  );
}

export default App;
