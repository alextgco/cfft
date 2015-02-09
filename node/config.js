var fs = require('fs');

var host = '192.168.2.70';
var socketPort = 8080;
var printerPort = 3000;

var useHTTPS = false;
if (useHTTPS){
    var privateKey = fs.readFileSync('key/barvikha.multibooker.ru.key').toString();
    var certificate = fs.readFileSync('key/barvikha.multibooker.ru.crt').toString();
//var ca = fs.readFileSync('../intermediate.crt').toString();
}


var connectData = {
    hostname: "localhost",
        port: 1521,
        database: "PDBORCL", // System ID (SID)
        user: "ticket_b2c",
        password: "qweqwe"
};
//var perlScript = '/cgi-bin/b2e';
var perlScript = '/var/www/multibooker/cgi-bin/b2e2';

var deliveryPath = '/var/www/multibooker/public_html/upload/';


exports.host = host;
exports.useHTTPS = useHTTPS;
exports.privateKey = privateKey;
exports.certificate = certificate;
//exports.ca = ca;

var ticket_template = 'BARVIKHA';
//var ticket_template = 'MIR_BILETA';

exports.deliveryPath = deliveryPath;
exports.socketPort = socketPort;
exports.printerPort = printerPort;
exports.connectData = connectData;
exports.perlScript = perlScript;
exports.ticket_template = ticket_template;

var logFile = 'log/my_log';
exports.logFile = logFile;
