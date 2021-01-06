import { useEffect, useRef } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import { fillDataFromProperties } from "../helpers";

const pathColors = ["#4a40c3", "#5d53dc", "#6b62ee", "#9287f7"];

const getPathColor = (featureIndex) => {
  return pathColors[featureIndex - 1];
};

const Italy = ({
  featureIndex,
  selectedFeature,
  setSelectedFeature,
  setCurrentGeoJSON,
  currentGeoJSON,
  setFeatureIndex,
}) => {
  const geoJSONref = useRef();
  const map = useMap();

  useEffect(() => {
    if (!geoJSONref.current) {
      return;
    }
    const bounds = geoJSONref.current.getBounds();
    if (!Object.entries(bounds).length) {
      return;
    }
    map.fitBounds(bounds);
  }, [currentGeoJSON, geoJSONref.current]);

  return (
    <GeoJSON
      ref={geoJSONref}
      eventHandlers={{
        click: (e) => {
          const feature = e.layer.feature;
          fillDataFromProperties(
            feature,
            selectedFeature,
            setSelectedFeature,
            setCurrentGeoJSON,
            setFeatureIndex,
            true
          );
        },
      }}
      pathOptions={{ color: getPathColor(featureIndex) }}
      key={currentGeoJSON && JSON.stringify(currentGeoJSON).substring(0, 100)}
      data={currentGeoJSON}
    />
  );
};

export default Italy;
