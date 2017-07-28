'use strict';
const roi = require('roi');

module.exports = exports = function nameService (endpoint) {
  return new Promise((resolve, reject) => {
    roi.get({ endpoint })
    .then(response => {
      if (response.statusCode !== 200) return reject();
      resolve(response.body);
    })
    .catch(reject);
  });
}
