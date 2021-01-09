import * as topojson from "topojson-client";
import provinces from "./static/boundaries/limits_IT_provinces.topo.json";
import regions from "./static/boundaries/limits_IT_regions.topo.json";
import municipalities from "./static/boundaries/municipalitiesMap.json";

export const geoRegions = topojson.feature(regions, "regions");
const geoProvinces = topojson.feature(provinces, "provinces");

const getProvincesFromRegionIstatCode = (istatCode) => {
  const filteredProvinces = geoProvinces.features.filter(
    ({ properties }) => properties.reg_istat_code === istatCode
  );

  return {
    features: filteredProvinces,
    type: "FeatureCollection",
  };
};

export const getMunicipalitiesForProvinceIstatCode = async (
  provinceIstatCode
) => {
  const fileName = `estratti_OSM_Italia/static/boundaries/limits_P_${provinceIstatCode}_municipalities.topo.json`;
  const fileFetched = await fetch(fileName);
  const municipalities = await fileFetched.json();
  return topojson.feature(municipalities, "municipalities");
};

export const defaultFeature = {
  state: { index: 1, name: "Italy", feature: geoRegions },
  region: { index: 2, name: "", feature: null },
  province: { index: 3, name: "", feature: null },
  municipality: { index: 4, name: "", feature: null },
};

export const fillDataFromProperties = async (
  feature,
  selectedFeature,
  setSelectedFeature,
  setCurrentGeoJSON,
  setFeatureIndex,
  selectionFromMap
) => {
  const properties = feature.properties;

const provincesInRegion = properties.reg_istat_code ? getProvincesFromRegionIstatCode(properties.reg_istat_code): null;
const municipalitiesInRegion = properties.prov_istat_code_num ? await getMunicipalitiesForProvinceIstatCode(
  properties.prov_istat_code_num
) : null;

const newFeature = {
  ...selectedFeature,
  region: {
    ...selectedFeature.region,
    name: properties.reg_name? (properties.reg_name|| properties.name):null,
    feature: provincesInRegion,
    reg_istat_code: properties.reg_istat_code || null,
  },
  province: {
    ...selectedFeature.province,
    name: properties.prov_name?(properties.prov_name||properties.name):null,
    feature: municipalitiesInRegion,
    prov_istat_code_num: properties.prov_istat_code_num || null,
  },
  municipality: {
    ...selectedFeature.municipality,
    name:  properties.com_istat_code_num?properties.name: null,
    feature: properties.com_istat_code_num?feature:null,
    com_istat_code_num: properties.com_istat_code_num || null,
  },
  selectionFromMap,
}
  setSelectedFeature(newFeature);


  switch (true) {
    case !!properties.com_istat_code_num:
      setCurrentGeoJSON(feature);
      setFeatureIndex(4);
      break;
    case !!properties.prov_istat_code_num:
      setCurrentGeoJSON(municipalitiesInRegion);
      setFeatureIndex(3);
      break;
    case !!properties.reg_istat_code:
      setCurrentGeoJSON(provincesInRegion);
      setFeatureIndex(2);
      break;
    default:
      setCurrentGeoJSON(geoRegions);
      defaultFeature.selectionFromMap = selectionFromMap;
      setSelectedFeature(defaultFeature);
      setFeatureIndex(1);
      break;
  }
};

export const makeItalianTree = () => {
  let italyTree = {
    name: "Italy",
    children: [],
  };

  municipalities.forEach(
    ({
      name,
      reg_name,
      prov_name,
      prov_istat_code_num,
      reg_istat_code,
      com_istat_code_num,
    }) => {
      let previousRegions = italyTree.children.find(
        ({ name }) => name === reg_name
      );

      let previousProvinces = previousRegions
        ? previousRegions?.children.find(({ name }) => name === prov_name)
        : null;

      if (previousProvinces) {
        //insert municipalities
        previousProvinces.children.push({
          name: name,
          reg_name,
          prov_name,
          com_istat_code_num,
          prov_istat_code_num,
          reg_istat_code,
        });
      } else if (previousRegions) {
        //insert provinces
        previousRegions.children.push({
          name: prov_name,
          prov_name,
          reg_name,
          prov_istat_code_num,
          reg_istat_code,
          children: [{ name: name, com_istat_code_num, prov_istat_code_num, reg_istat_code }],
        });
      } else {
        //insert regions
        italyTree.children.push({
          name: reg_name,
          reg_name,
          reg_istat_code,
          children: [
            {
              name: prov_name,
              prov_name,
              prov_istat_code_num,
              reg_istat_code,
              children: [
                { name: name, com_istat_code_num, prov_istat_code_num, reg_istat_code },
              ],
            },
          ],
        });
      }
    }
  );
  return italyTree;
};
