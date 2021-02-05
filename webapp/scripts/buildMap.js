const fs = require('fs-extra');
const fetch = require('node-fetch');
const configuration = require('./configuration.json');

const fetchServerFiles = async({basePath, municipalities, provinces, regions}) => {

    const municipalitiesPromise = fetchAndWrite(basePath, regions, 'municipalities')
    //todo add mapping to make 'municipalitiesMap.json'
    const provincesPromise = fetchAndWrite(basePath, provinces, 'provinces')
    const regionsPromise = fetchAndWrite(basePath, regions, 'regions')

    await Promise.all([municipalitiesPromise, provincesPromise, regionsPromise])
}

const fetchAndWrite = async (basePath, level, name)=>{
    const file = await fetch(basePath+level);
    const fileJSON = await file.json()
    fs.writeJSONSync(`./src/static/boundaries/limits_IT_${name}.json`, fileJSON);
}

const convertFiles = async()=>{
    // const output = file.objects.comuni
    // fs.writeJSONSync('./src/static/boundaries/newlimits.json', output);
}

const main = async () =>{
    const { basePath, municipalities, provinces, regions } = configuration;
    await fetchServerFiles({basePath, municipalities, provinces, regions});
    await convertFiles()
}

main().catch(console.error)
