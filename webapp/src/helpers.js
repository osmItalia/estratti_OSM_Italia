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
  switch (true) {
    case !!properties.com_istat_code_num:
      setSelectedFeature({
        ...selectedFeature,
        municipality: {
          ...selectedFeature.municipality,
          name: properties.name,
          feature: feature,
          com_istat_code_num: properties.com_istat_code_num,
        },
        selectionFromMap,
      });
      console.log(feature.feature)
      setCurrentGeoJSON(feature);
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
          name: properties.prov_name || properties.name,
          feature: municipalitiesForIstatCode,
          prov_istat_code_num: provIstatCode,
        },
        municipality: {
          ...selectedFeature.municipality,
          name: null,
          feature: null,
          com_istat_code_num: null,
        },
        selectionFromMap,
      });
      console.log(municipalitiesForIstatCode)
      setCurrentGeoJSON(municipalitiesForIstatCode);
      setFeatureIndex(3);
      break;
    case !!properties.reg_istat_code:
      const regionIstatCode = properties.reg_istat_code;
      const provincesForIstatCode = getProvincesFromRegionIstatCode(
        regionIstatCode
      );
      setCurrentGeoJSON(provincesForIstatCode);
      setSelectedFeature({
        ...selectedFeature,
        region: {
          ...selectedFeature.region,
          name: properties.reg_name || properties.name,
          feature: provincesForIstatCode,
          reg_istat_code: regionIstatCode,
        },
        province: {
          ...selectedFeature.province,
          name: null,
          feature: null,
          prov_istat_code_num: null,
        },
        municipality: {
          ...selectedFeature.municipality,
          name: null,
          feature: null,
          com_istat_code_num: null,
        },
        selectionFromMap,
      });
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
//IN Case we don't have municipalities
// export const makeItalianTree = (provinces) => {
//   const italyTree = {
//     name: "Italy",
//     toggled: true,
//     children: {},
//   };

//   provinces.objects.provinces.geometries.forEach(
//     ({
//       properties: { reg_name, prov_name, prov_istat_code_num, reg_istat_code },
//     }) => {
//       const previousChildren = italyTree.children[reg_name]?.children || [];
//       italyTree.children[reg_name] = {
//         name: reg_name,
//         reg_istat_code: reg_istat_code,
//         children: [
//           ...previousChildren,
//           { name: prov_name, prov_istat_code_num: prov_istat_code_num },
//         ],
//       };
//     }
//   );

//   italyTree.children = Object.values(italyTree.children);
//   return italyTree;
// };
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
          com_istat_code_num,
          prov_istat_code_num,
          reg_istat_code,
        });
      } else if (previousRegions) {
        //insert provinces
        previousRegions.children.push({
          name: prov_name,
          prov_istat_code_num,
          reg_istat_code,
          children: [{ name: name, com_istat_code_num, prov_istat_code_num, reg_istat_code }],
        });
      } else {
        //insert regions
        italyTree.children.push({
          name: reg_name,
          reg_istat_code,
          children: [
            {
              name: prov_name,
              prov_istat_code_num,
              reg_istat_code,
              children: [
                { name: name,  com_istat_code_num,  prov_istat_code_num, reg_istat_code },
              ],
            },
          ],
        });
      }
    }
  );
  return italyTree;
};
