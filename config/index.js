var nconf = require('nconf');
var path = require('path');
var filename = 'config.json';
var remote = true;
if (remote){
    filename = 'configREMOTE.json';
}
console.log('Config selection.', filename);
nconf.argv()
    .env()
    .file({file:path.join(__dirname,filename)});

module.exports = nconf;