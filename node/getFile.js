var toFile = require('./saveToFile').toFile;
var oracle = require('./oracle2');
var logF = require('./my_log').logF;
var funcs = require('./functions').functions;
function getFile(obj,callback) {
    if (typeof obj !== "object") {
        logF('В getFile не получен объект');
        return;
    }
    var queryObj = obj.o;

    if (typeof queryObj !== "object") {
        logF('В getFile не получен объект для получения данных obj.o = {...}');
        return;
    }
    var fileName = obj.fileName;
    if (!fileName) {
        for (var i in queryObj) {
            if (i === "sid" || i == "mode" || i == "where" || typeof queryObj[i] === "object") {
                continue;
            }
            if (fileName.length > 0) {
                fileName += '_';
            }
            fileName += queryObj[i];
        }
    }
    var ext = queryObj.mode || queryObj.output_format || 'log';
    ext = ext.toLowerCase();
    oracle.execute({
        o: queryObj, callback: function (obj) {
            var data = obj.result;
            toFile({
                fileName: '../public_html/savedFiles/' + fileName + '.' + ext,
                flags: 'w',
                data: data
            }, function (err, fileName) {
                console.log('-------------------------------');
                console.log(fileName);
                if (typeof callback === "function") {
                    callback(err, fileName);
                }
            });
        }
    });
}
module.exports.get = getFile;