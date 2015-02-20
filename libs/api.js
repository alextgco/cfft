module.exports = function(command,object,params,callback){
    try {
        var model = require('../models/' + object);
    } catch (e) {
        return callback('Такого объекта не существует. '+object);
    }
    model[command](params,function(err,result){
        if(err){
            callback(err);
        }
        callback(null,result);
    });
};

