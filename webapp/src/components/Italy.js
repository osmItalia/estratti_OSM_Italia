import { useEffect, useRef } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import { fillDataFromProperties } from "../helpers";


const pathColors = [
  getComputedStyle(document.documentElement).getPropertyValue('--mainColor1'),
  getComputedStyle(document.documentElement).getPropertyValue('--mainColor2'),
  getComputedStyle(document.documentElement).getPropertyValue('--mainColor3'),
  getComputedStyle(document.documentElement).getPropertyValue('--mainColor4'),
];

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
  italyTree,
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
console.log(currentGeoJSON)
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
            true,
            italyTree,
          );
        },
      }}
      pathOptions={{ color: getPathColor(featureIndex) }}
      key={currentGeoJSON && currentGeoJSON.properties
         ? (
           currentGeoJSON.properties.com_istat
           ||
           currentGeoJSON.properties.prov_istat
           ||
           currentGeoJSON.properties.reg_istat
         ) : JSON.stringify(currentGeoJSON).substring(0, 100)
        }
      
      data={currentGeoJSON}
    />
  );
};

export default Italy;
