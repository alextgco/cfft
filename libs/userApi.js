module.exports = function(command,object,params,callback){
    try {
        require('../models/' + object)(function(model){
            model[command](params,function(err,result){
                if(err){
                    callback(err);
                }
                callback(null,result);
            });
        });
    } catch (e) {
        return callback('Такого объекта не существует. '+object);
    }

};

