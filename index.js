const path = require('path');
const backendModules = path.join(__dirname, 'backend', 'node_modules');
if (!module.paths.includes(backendModules)) {
  module.paths.push(backendModules);
}

const app = require('./backend/server.js');
module.exports = app;
