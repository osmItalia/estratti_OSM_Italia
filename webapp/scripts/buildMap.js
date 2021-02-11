const fs = require("fs-extra");
const fetch = require("node-fetch");
const configuration = require("./../src/configuration.json");

const fetchServerFiles = async ({
  basePath,
  inputFilesPath,
  //   municipalities,
  provinces,
  regions,
}) => {
  //   const file = await fetch(basePath + inputFilesPath + municipalities);
  //   const fileJSON = await file.json();
  //   const mapped = fileJSON; //map data to municipalitiesMap.json
  //   fs.writeJSONSync(
  //     `./src/static/boundaries/limits_IT_municipalities.json`,
  //     mapped
  //   );

  //   //todo add mapping to make 'municipalitiesMap.json'
  const provincesPromise = fetchAndWrite(
    basePath + inputFilesPath,
    provinces,
    "provinces"
  );
  const regionsPromise = fetchAndWrite(
    basePath + inputFilesPath,
    regions,
    "regions"
  );

  await Promise.all([provincesPromise, regionsPromise]);
};

const fetchAndWrite = async (path, level, name) => {
  const file = await fetch(path + level);
  const fileJSON = await file.json();
  fs.writeJSONSync(`./src/static/boundaries/limits_IT_${name}.json`, fileJSON);
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
