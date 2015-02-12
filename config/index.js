var nconf = require('nconf');
var path = require('path');
var filename = 'config.json';
var remote = true;
if (remote){
    filename = 'configREMOTE.json';
}
nconf.argv()
    .env()
    .file({file:path.join(__dirname,filename)});

module.exports = nconf;