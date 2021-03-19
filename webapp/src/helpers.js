import * as topojson from "topojson-client";
import provinces from "./static/boundaries/limits_IT_provinces.json";
import regions from "./static/boundaries/limits_IT_regions.json";
import municipalities from "./static/boundaries/municipalities.json";
import config from "./configuration.json";

export const italyBounds = [[35, 5], [48.5, 19.5]];
export const geoRegions = topojson.feature(regions, "limits_IT_regions");
const geoProvinces = topojson.feature(provinces, "limits_IT_provinces");

export const parentItem = "Italia";

export const getParentForFeature = (feature, selectedFeature) => {
  if (feature.properties.adm === 6) {
    return {
      ...feature,
      properties: {
        ...feature.properties,
        reg_name: selectedFeature.region.name,
        reg_istat: selectedFeature.region.reg_istat,
      },
    };
  }
  return feature;
};

const getProvincesFromRegionIstatCode = async (italyTree, istatCode) => {
  const region = italyTree.children.find(
    ({ reg_istat }) => reg_istat === istatCode
  );
  const provincesIstatCodes = region.children.map(
    ({ prov_istat }) => prov_istat
  );
  const filteredProvinces = geoProvinces.features.filter(({ properties }) =>
    provincesIstatCodes.includes(properties.istat)
  );
  const regionsFeatures = await italyTree.getChildFeatures();
  const regionFeature =
    regionsFeatures?.features.find(
      ({ properties }) => properties.istat === istatCode
    ) ?? {};

  return {
    features: filteredProvinces,
    type: "FeatureCollection",
    properties: {
      ...regionFeature.properties,
      reg_istat: region.reg_istat,
    },
  };
};

export const getMunicipalitiesForProvinceIstatCode = async (
  provinceIstatCode
) => {
  const provinceFeature =
    geoProvinces?.features.find(
      ({ properties }) => properties.istat === provinceIstatCode
    ) ?? {};

  const fileName = `${config.basePathApp +
    config.inputFilesPath}limits_P_${provinceIstatCode}_municipalities.json`;
  const fileFetched = await fetch(fileName);
  const municipalities = await fileFetched.json();
  return [
    topojson.feature(
      municipalities,
      `limits_P_${provinceIstatCode}_municipalities`
    ),
    provinceFeature.properties,
  ];
};

const findMunicipalityInProvince = (currentGeoJSON, com_istat) =>
  currentGeoJSON.features.find(
    ({ properties }) => properties.istat === com_istat
  );

export const makeItalianTree = () => {
  let italyTree = {
    name: parentItem,
    type: 2,
    getChildFeatures: async () => geoRegions,
    children: [],
  };

  municipalities.forEach(
    ({
      name,
      reg_name,
      prov_name,
      prov_istat_code,
      reg_istat_code,
      com_istat_code,
    }) => {
      let previousRegions = italyTree.children.find(
        ({ reg_name: name }) => name === reg_name
      );
      let previousProvinces = previousRegions
        ? previousRegions?.children.find(
            ({ prov_name: name }) => name === prov_name
          )
        : null;
      const region = {
        reg_name: reg_name,
        reg_istat: reg_istat_code,
        type: 4,
        parent: italyTree,
        getChildFeatures: async () => {
          const provinces = await getProvincesFromRegionIstatCode(
            italyTree,
            reg_istat_code
          );
          return { ...provinces, parent: italyTree, reg_istat: reg_istat_code };
        },
      };
      const province = {
        prov_name: prov_name,
        prov_istat: prov_istat_code,
        reg_istat: reg_istat_code,
        reg_name: reg_name,
        type: 6,
        parent: region,
        getChildFeatures: async () => {
          const [
            municipalities,
            properties,
          ] = await getMunicipalitiesForProvinceIstatCode(prov_istat_code);
          return {
            ...municipalities,
            parent: region,
            properties,
            prov_istat: prov_istat_code,
            reg_istat: reg_istat_code,
          };
        },
      };
      const commonMunicipalityProperties = {
        com_name: name,
        com_istat: com_istat_code,
        type: 8,
        prov_istat: prov_istat_code,
        reg_istat: reg_istat_code,
        reg_name,
        prov_name,
      };
      const municipality = {
        ...commonMunicipalityProperties,
        parent: province,
        getChildFeatures: async () => {
          const featureGeometry = await province.getChildFeatures();
          const municipalityFeature = findMunicipalityInProvince(
            featureGeometry,
            com_istat_code
          );
          return {
            ...municipalityFeature,
            com_istat: com_istat_code,
            prov_istat: prov_istat_code,
            reg_istat: reg_istat_code,
          };
        },
      };

      if (previousProvinces) {
        //insert municipalities
        previousProvinces.children.push(municipality);
      } else if (previousRegions) {
        //insert provinces
        previousRegions.children.push({
          ...province,
          children: [municipality],
        });
      } else {
        //insert regions
        italyTree.children.push({
          reg_name: reg_name,
          reg_istat: reg_istat_code,
          type: 4,
          ...region,
          children: [{ ...province, children: [municipality] }],
        });
      }
    }
  );
  // console.log("italyTree", italyTree);
  return italyTree;
};
