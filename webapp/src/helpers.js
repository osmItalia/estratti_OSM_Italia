import * as topojson from "topojson-client";
import provinces from "./static/boundaries/limits_IT_provinces.json";
import regions from "./static/boundaries/limits_IT_regions.json";
import municipalities from "./static/boundaries/municipalitiesMap.json";
// import municipalities1 from "./static/boundaries/limits_IT_municipalities.topo.json";
// import jsonpack from 'jsonpack';

// // console.log(regions)
// // console.log(provinces)

// var encoded = jsonpack.pack(municipalities);

// console.log(encoded)
// document.write(encoded)
// var decoded = jsonpack.unpack(encoded);

// console.log(decoded)

export const geoRegions = topojson.feature(regions, "limits_IT_regions");
const geoProvinces = topojson.feature(provinces, "limits_IT_provinces");

export const defaultFeature = {
  state: { index: 1, name: "Italia", feature: geoRegions },
  region: { index: 2, name: "", feature: null },
  province: { index: 3, name: "", feature: null },
  municipality: { index: 4, name: "", feature: null },
};

export const getParentForFeature = (feature, selectedFeature) =>{
  if(feature.properties.adm===6){
    return {
      ...feature,
      properties: {
        ...feature.properties,
        reg_name: selectedFeature.region.name,
        reg_istat: selectedFeature.region.reg_istat
      }
    }
  }
  return feature
}
const getProvincesFromRegionIstatCode = (italyTree, istatCode) => {

  const region = italyTree.children.find(({reg_istat})=>reg_istat === istatCode)
console.log('region',region)
  const provincesIstatCodes = region.children.map(({prov_istat})=>prov_istat)

  console.log('provincesIstatCodes',provincesIstatCodes)
  const filteredProvinces = geoProvinces.features.filter(
    ({ properties }) => provincesIstatCodes.includes(properties.istat)
  );

  return {
    features: filteredProvinces,
    type: "FeatureCollection",
    properties: {
      reg_istat: region.reg_istat
    }
  };
};

export const getMunicipalitiesForProvinceIstatCode = async (
  provinceIstatCode
) => {
  const fileName = `estratti_OSM_Italia/static/boundaries/limits_P_${provinceIstatCode}_municipalities.json`;
  const fileFetched = await fetch(fileName);
  const municipalities = await fileFetched.json();
  return topojson.feature(municipalities, `limits_P_${provinceIstatCode}_municipalities`);
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
  selectionFromMap,
  italyTree,
  ) => {
  const properties = feature.properties;

  const region = getRegion(properties)
  console.log('properties',properties)
  console.log('region', region)
 
  const provincesInRegion = region.istat? getProvincesFromRegionIstatCode(italyTree, region.istat): null;

  console.log('provincesInRegion',provincesInRegion)
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
  console.log('setSelectedFeature',newFeature)

console.log('switch',properties )
console.log('region',region )
  switch (true) {
    case !!properties.com_istat || !!municipality.istat: //todo check
    console.log('isMuni')
      setCurrentGeoJSON(feature);
      setFeatureIndex(4);
      break;
    case !!properties.prov_istat || !!province.istat:
      console.log('isProvince')
      setCurrentGeoJSON(municipalitiesInRegion);
      setFeatureIndex(3);
      break;
    case !!properties.reg_istat || !!region.istat:
      console.log('isRegion')
      setCurrentGeoJSON(provincesInRegion);
      setFeatureIndex(2);
      break;
    default:
      console.log('itItaly')
      setCurrentGeoJSON(geoRegions);
      defaultFeature.selectionFromMap = selectionFromMap;
      setSelectedFeature(defaultFeature);
      setFeatureIndex(1);
      break;
  }
};
const findMunicipalityInProvince = (currentGeoJSON, com_istat ) =>
currentGeoJSON.features.find(
  ({ properties }) =>
    properties.istat === com_istat
);
export const makeItalianTree = () => {
  let italyTree = {
    name: "Italy",
    type:2,
    getChildFeatures: () => geoRegions,
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
        const region = {
          reg_name: reg_name,
          reg_istat: reg_istat_code,
          type:4,
          parent: italyTree,
          getChildFeatures: ()=> getProvincesFromRegionIstatCode(italyTree, reg_istat_code)
        }
        const province = {
          prov_name: prov_name,
          prov_istat: prov_istat_code,
          reg_istat: reg_istat_code,
          reg_name: reg_name,
          type:6,
          parent: region,
          getChildFeatures: async()=> await getMunicipalitiesForProvinceIstatCode(prov_istat_code)
        }
        const commonMunicipalityProperties={
          com_name: name,
          com_istat: com_istat_code,
          type: 8,
          prov_istat: prov_istat_code,
          reg_istat: reg_istat_code,
          reg_name,
          prov_name,
        }
        const municipality={ 
         ...commonMunicipalityProperties,
          parent: province,
          getChildFeatures: async ()=>{
            const featureGeometry = await province.getChildFeatures()
            const municipalityFeature = findMunicipalityInProvince(featureGeometry, com_istat_code)
            return { ...municipalityFeature, properties: commonMunicipalityProperties};
          }
        }

      if (previousProvinces) {
        //insert municipalities
        previousProvinces.children.push(municipality);
      } else if (previousRegions) {
        //insert provinces
        previousRegions.children.push({ ...province,children: [municipality]});
      } else {
        //insert regions
        italyTree.children.push({
          reg_name: reg_name,
          reg_istat: reg_istat_code,
          type:4,
          ...region,
          children: [
            {...province,children: [municipality]},
          ],
        });
      }
    }
  );
console.log('console.log(italyTree)',italyTree)
  return italyTree;
};
