/**
 * Created by developer on 18.09.14.
 */
var toFile = require('./saveToFile').toFile;
var config = require('./config');

var nowTime = function(){
    var d = new Date();
    return {
        time: d,
        timestamp:d.getTime()
    };
};


var fileLog = config.logFile+'_'+nowTime().time.toTimeString();

function write(s) {
    console.log('Записано в файл:');
    console.log(s);
    toFile({fileName:fileLog,data:s});
}


exports.logF = write;
