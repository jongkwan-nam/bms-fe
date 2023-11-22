const madge = require('madge');
const fs = require('fs');

const entries = ['main', 'approvalBox'];

const madgeConfig = {
  fontSize: '12px',
  fontName: 'D2Coding',
  rankdir: 'LR',
  nodeColor: '#c6c5fe',
  noDependencyColor: '#cfffac',
  edgeColor: '#757575',
};

let svgList = [];

(async () => {
  //
  for (let entry of entries) {
    let res = await madge(`src/${entry}.js`, madgeConfig);
    let output = await res.svg();
    let svgString = output.toString();

    svgList.push({ entry: entry, svg: svgString });
  }

  fs.writeFile('./src/dependencies-viewer.json', JSON.stringify(svgList), 'utf8', () => {
    console.log('write dependencies-viewer.json');
  });
})();
