import "./App.css";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";

const italyCoords = [42, 12.5];

function App() {
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
      </MapContainer>
    </div>
  );
}

export default App;
