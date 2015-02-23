module.exports = function(command,object,params,callback){
    var exludeCommand = ['add','modify','remove'];
    if (exludeCommand.indexOf(command)!==-1){
        return callback('Команда '+command+' запрещена.');
    }
    var useModel = function(model){

        model[command](params,function(err,result){
            if(err){
                callback(err);
            }
            callback(null,result);
        });
    };
    if (!global.models[object]){
        try {
            require('../models/' + object)(function(model){
                global.models[object] = model;
                useModel(model);
            });
        } catch (e) {
            return callback('Такого объекта не существует. '+object);
        }
    }else{
        useModel(global.models[object]);
    }
};

