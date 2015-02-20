module.exports = function(command,object,params,callback){
    var newParams;
    if (params){
        try {
            newParams = JSON.parse(params);
        } catch (e) {
            return callback('Не валидный JSON в params');
        }
    }else{
        return callback('Не передан params');
    }

    try {
        var model = require('../models/' + object);
    } catch (e) {
        return callback('Такого объекта не существует. '+object);
    }
    model[command](newParams,function(err,result){
        if(err){
            callback(err);
        }
        callback(null,result);
    });
};

