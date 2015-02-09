var fs = require('fs');
var config = require('./config');

var nowTime = function () {
    var d = new Date();
    return {
        time: d,
        timestamp: d.getTime()
    };
};
/**
 * Записывает переданные данные в файл
 * @param obj
 * fileName имя файла (с путем или без)
 * flags режим в котором открывается файл (по умолчанию, дозаписывать)
 * data данные которые надо записать
 * @param callback
 */
function toFile(obj, callback) {
    var flags = obj.flags || 'a';
    var fileName = obj.fileName || 'savedFile_' + nowTime().time.toTimeString();
    var data = obj.data || '';
    var writer = fs.createWriteStream(fileName, {flags: flags,highWaterMark:6400000});

    function write(data) {
        var ok = writer.write(data);
        if (!ok) {
            writer.once('drain', write(data));
            return;
        }
        writer.end();
    };
    writer.on('finish', function () {
        if (typeof callback === "function") {
            callback(undefined, fileName);
        }
        //console.log('Запись выполнена успешно.');
    });
    writer.on('error', function (err) {
        console.log('writer error: ' + err);
        if (typeof callback === "function") {
            callback(err);
        }
    });
    write(data);
}


exports.toFile = toFile;
