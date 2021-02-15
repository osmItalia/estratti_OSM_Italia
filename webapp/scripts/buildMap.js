const fs = require("fs-extra");
const fetch = require("node-fetch");
const configuration = require("./../src/configuration.json");

const fetchServerFiles = async ({
  basePath,
  inputFilesPath,
  municipalities,
  provinces,
  regions,
}) => {
  const regionsJSON = await fetchAndWrite(
    basePath + inputFilesPath,
    regions,
    "regions"
  );

  const provincesJSON = await fetchAndWrite(
    basePath + inputFilesPath,
    provinces,
    "provinces"
  );

  const municipalitiesFile = await fetch(basePath + inputFilesPath + municipalities);
  const municipalitiesJSON = await municipalitiesFile.json();

  const regionsMap = {};
  regionsJSON.objects.limits_IT_regions.geometries.forEach(({properties})=>{
    regionsMap[properties.istat]=properties.name
  });

  const provincesMap = {};
  provincesJSON.objects.limits_IT_provinces.geometries.forEach(({properties})=>{
    provincesMap[properties.istat]=properties.name
  });
  
  const municipalitiesList = [];
  municipalitiesJSON.objects.limits_IT_municipalities.geometries.forEach(({ properties }) => {
    municipalitiesList.push({
          "name": properties.name,
          "reg_name": regionsMap[properties.reg_istat_code],
          "prov_name": provincesMap[properties.prov_istat_code],
          "com_istat_code": properties.istat,
          "prov_istat_code": properties.prov_istat_code,
          "reg_istat_code": properties.reg_istat_code
    });
  });

  fs.writeJSONSync(
    `./src/static/boundaries/municipalities.json`,
    municipalitiesList
  );
};

const fetchAndWrite = async (path, level, name) => {
  const file = await fetch(path + level);
  const fileJSON = await file.json();
  fs.outputFileSync(`./src/static/boundaries/limits_IT_${name}.json`, JSON.stringify(fileJSON));
  return fileJSON;
};

const main = async () => {
  const {
    basePathFiles,
    inputFilesPath,
    municipalities,
    provinces,
    regions,
  } = configuration;
  await fetchServerFiles({
    basePath: basePathFiles,
    inputFilesPath,
    municipalities,
    provinces,
    regions,
  });
};

main().catch(console.error);
