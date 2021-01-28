const fs = require('fs-extra');
const path = require('path');

const filePath = path.resolve(__dirname, './data/limits_IT_municipalities.topo.json')
console.log(filePath)
const file = fs.readJSONSync(filePath);
  

const output = file.objects.comuni
fs.writeJSONSync('./src/static/boundaries/newlimits.json', output);

  