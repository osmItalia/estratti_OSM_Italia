import { useEffect, useRef } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import * as topojson from "topojson-client";

const Italy = ({
  provinces,
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
    map.fitBounds(geoJSONref.current.getBounds());
  }, [currentGeoJSON, geoJSONref.current]);

  const getProvincesFromRegionIstatCode = (istatCode) => {
    const filteredProvinces = provinces.features.filter(
      ({ properties }) => properties.reg_istat_code === istatCode
    );

    return {
      features: filteredProvinces,
      type: "FeatureCollection",
    };
  };

  const getMunicipalitiesForProvinceIstatCode = async (provinceIstatCode) => {
    const fileName = `estratti_OSM_Italia/static/boundaries/limits_P_${provinceIstatCode}_municipalities.topo.json`;
    const fileFetched = await fetch(fileName);
    const municipalities = await fileFetched.json();
    return topojson.feature(municipalities, "municipalities");
  };

  return (
    <GeoJSON
      ref={geoJSONref}
      eventHandlers={{
        click: async (e) => {
          const properties = e.layer.feature.properties;
          console.log(properties);
          switch (true) {
            case !!properties.com_catasto_code:
              setSelectedFeature({
                ...selectedFeature,
                municipality: {
                  ...selectedFeature.municipality,
                  name: properties.name,
                  feature: e.layer.feature,
                },
              });
              setCurrentGeoJSON(e.layer.feature);
              setFeatureIndex(4);
              break;
            case !!properties.prov_istat_code_num:
              const provIstatCode = properties.prov_istat_code_num;
              const municipalitiesForIstatCode = await getMunicipalitiesForProvinceIstatCode(
                provIstatCode
              );
              setSelectedFeature({
                ...selectedFeature,
                province: {
                  ...selectedFeature.province,
                  name: properties.prov_name,
                  feature: municipalitiesForIstatCode,
                },
                municipality: {
                  ...selectedFeature.municipality,
                  name: null,
                  feature: null,
                },
              });
              setCurrentGeoJSON(municipalitiesForIstatCode);
              setFeatureIndex(3);
              break;
            case !!properties.reg_istat_code:
            default:
              const regionIstatCode = properties.reg_istat_code;
              const provincesForIstatCode = getProvincesFromRegionIstatCode(
                regionIstatCode
              );
              setCurrentGeoJSON(provincesForIstatCode);
              setSelectedFeature({
                ...selectedFeature,
                region: {
                  ...selectedFeature.region,
                  name: properties.reg_name,
                  feature: provincesForIstatCode,
                },
                province: {
                  ...selectedFeature.province,
                  name: null,
                  feature: null,
                },
                municipality: {
                  ...selectedFeature.municipality,
                  name: null,
                  feature: null,
                },
              });
              setFeatureIndex(2);
              break;
          }
        },
      }}
      pathOptions={{ color: "red" }}
      key={currentGeoJSON && JSON.stringify(currentGeoJSON).substring(0, 100)}
      data={currentGeoJSON}
    />
  );
};

export default Italy;
