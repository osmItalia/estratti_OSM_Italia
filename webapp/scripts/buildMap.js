const fs = require('fs-extra');
const path = require('path');
const fetch = require('node-fetch');
const configuration = require('./configuration.json');

const fetchServerFiles = async(basePath, municipalities) => {
    const filePath = path.resolve(__dirname, `./data/${municipalities}`)
    const municipalitiesFile = await fetch(basePath+municipalities);
    const municipalitiesFileJson = await municipalitiesFile.json()

    console.log(municipalitiesFileJson);
    fs.writeJSONSync('./src/static/boundaries/newlimits.json', municipalitiesFileJson);
}
//todo add mapping to make 'municipalitiesMap.json'

const convertFiles = async()=>{
    // const output = file.objects.comuni
    // fs.writeJSONSync('./src/static/boundaries/newlimits.json', output);
}

const main = async () =>{
    const { basePath, municipalities } = configuration;
    await fetchServerFiles(basePath, municipalities);
    await convertFiles()
}

main().catch(console.error)