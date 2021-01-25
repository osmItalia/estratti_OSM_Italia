import { useEffect, useRef } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import { fillDataFromProperties } from "../helpers";

const pathColors = ["#2196f3", "#42a5f5", "#57b1fa", "#6ec6ff"];

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
  }, [currentGeoJSON, geoJSONref, map]);

  return (
    <GeoJSON
      ref={geoJSONref}
      eventHandlers={{
        click: (e) => {
          console.log(e)
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
