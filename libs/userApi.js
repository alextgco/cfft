module.exports = function(command,object,params,callback){
    var exludeCommand = ['add','modify','remove'];
    if (exludeCommand.indexOf(command)!==-1){
        return callback('Команда '+command+' запрещена.');
    }
    var useModel = function(model){
        if (command == 'get'){
            params.published = true;
        }
        var allowedForUserCommand = model.allowedForUserCommand || [];
        if (allowedForUserCommand.indexOf(command)!==-1){
            return callback('Команда '+command+' запрещена.');
        }
        model[command](params,function(err,result){
            if(err){
                return callback(err);
            }
            callback(null,result);
        });
    };
    var usr = (params.user_id || 0);
    if (typeof global.models[usr]!=='object'){
        global.models[usr] = {};
    }
    if (!global.models[usr][object]){
        try {
            require('../models/' + object)(function(model){
                global.models[usr][object] = model;
                useModel(model);
            });
        } catch (e) {
            return callback('Такого объекта не существует. '+object);
        }
    }else{
        useModel(global.models[usr][object]);
    }
};

