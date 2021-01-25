import * as topojson from "topojson-client";
import provinces from "./static/boundaries/limits_IT_provinces.json";
import regions from "./static/boundaries/limits_IT_regions.json";
import municipalities from "./static/boundaries/municipalitiesMap.json";
// import municipalities1 from "./static/boundaries/limits_IT_municipalities.topo.json";

console.log(regions)
console.log(provinces)
export const geoRegions = topojson.feature(regions, "limits_IT_regions");
const geoProvinces = topojson.feature(provinces, "limits_IT_provinces");

export const defaultFeature = {
  state: { index: 1, name: "Italy", feature: geoRegions },
  region: { index: 2, name: "", feature: null },
  province: { index: 3, name: "", feature: null },
  municipality: { index: 4, name: "", feature: null },
};

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
  const fileName = `estratti_OSM_Italia/static/boundaries/limits_P_${provinceIstatCode}_municipalities.json`;
  const fileFetched = await fetch(fileName);
  const municipalities = await fileFetched.json();
  return topojson.feature(municipalities, "-");
};

const getRegion = properties => ({
  istat: properties.reg_istat || (properties.adm === 4 ? properties.istat : null),
  name: properties.reg_name || (properties.adm === 4 ? properties.name : null),
})
const getProvince = properties => ({
  istat: properties.prov_istat || (properties.adm === 6 ? properties.istat : null),
  name: properties.prov_name || (properties.adm === 6 ? properties.name : null),
})
const getMunicipality = properties => ({
  istat: properties.com_istat || (properties.adm === 8 ? properties.istat : null),
  name: properties.com_name || (properties.adm === 8 ? properties.name : null),
})

export const fillDataFromProperties = async (
  feature,
  selectedFeature,
  setSelectedFeature,
  setCurrentGeoJSON,
  setFeatureIndex,
  selectionFromMap
) => {
  const properties = feature.properties;
  console.log(properties)

  const region = getRegion(properties)
  const provincesInRegion = region.istat? getProvincesFromRegionIstatCode(region.istat): null;
  
  const province = getProvince(properties)
  const municipalitiesInRegion = province.istat ? await getMunicipalitiesForProvinceIstatCode(province.istat) : null;

  const municipality = getMunicipality(properties)   

  const newFeature = {
    ...selectedFeature,
    region: {
      ...selectedFeature.region,
      name: region.name,
      feature: provincesInRegion,
      reg_istat: region.istat,
    },
    province: {
      ...selectedFeature.province,
      name: province.name,
      feature: municipalitiesInRegion,
      prov_istat: province.istat,
    },
    municipality: {
      ...selectedFeature.municipality,
      name:  municipality.name,
      feature: municipality.istat?feature:null,
      com_istat: municipality.istat,
    },
    selectionFromMap,
  }
  setSelectedFeature(newFeature);


  switch (true) {
    case !!properties.com_istat:
      setCurrentGeoJSON(feature);
      setFeatureIndex(4);
      break;
    case !!properties.prov_istat:
      setCurrentGeoJSON(municipalitiesInRegion);
      setFeatureIndex(3);
      break;
    case !!properties.reg_istat:
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
      prov_istat_code,
      reg_istat_code,
      com_istat_code,
    }) => {
      let previousRegions = italyTree.children.find(
        ({ reg_name: name }) => name === reg_name
      );

      let previousProvinces = previousRegions
        ? previousRegions?.children.find(({ prov_name: name }) => name === prov_name)
        : null;
    
      if (previousProvinces) {
        //insert municipalities
        previousProvinces.children.push({
          com_name: name,
          type:8,
          com_istat: com_istat_code,
          prov_istat: prov_istat_code,
          reg_istat: reg_istat_code,
          reg_name,
          prov_name,
        });
      } else if (previousRegions) {
        //insert provinces
        previousRegions.children.push({
          prov_name: prov_name,
          prov_istat: prov_istat_code,
          reg_istat: reg_istat_code,
          reg_name: reg_name,
          type:6,
          children: [{ com_name: name, 
            com_istat: com_istat_code,
             type:8, 
             prov_istat: prov_istat_code,
             reg_istat: reg_istat_code,
             reg_name,
             prov_name,
            }],
        });
      } else {
        //insert regions
        italyTree.children.push({
          reg_name: reg_name,
          reg_istat: reg_istat_code,
          type:4,
          children: [
            {
              prov_name: prov_name,
              prov_istat: prov_istat_code,
              reg_istat: reg_istat_code,
              reg_name: reg_name,
              type:6,
              children: [
                { com_name: name,
                  com_istat: com_istat_code,
                  type: 8,
                  prov_istat: prov_istat_code,
                  reg_istat: reg_istat_code,
                  reg_name,
                  prov_name,},
              ],
            },
          ],
        });
      }
    }
  );
console.log(italyTree)
  return italyTree;
};
