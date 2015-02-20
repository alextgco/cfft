var nconf = require('nconf');
var path = require('path');
var filename = 'config_vaio.json';
var NODE_ENV = process.env.NODE_ENV || "development";
console.log('NODE_ENV',NODE_ENV);
if (NODE_ENV=='production'){
    filename = 'configREMOTE.json';
}
console.log('Config selection.', filename);
nconf.argv()
    .env()
    .file({file:path.join(__dirname,filename)});

module.exports = nconf;