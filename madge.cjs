const madge = require('madge');

madge('src/main.js')
  .then((res) => res.image('./doc/main.svg'))
  .then((writtenImagePath) => {
    console.log('Image written to ' + writtenImagePath);
  });

madge('src/approvalBox.js')
  .then((res) => res.image('./doc/approvalBox.svg'))
  .then((writtenImagePath) => {
    console.log('Image written to ' + writtenImagePath);
  });
