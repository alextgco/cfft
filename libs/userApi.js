var funcs = require('../libs/functions');
module.exports = function(command,object,params,callback){
    var exludeCommand = ['add','modify','remove'];
    if (exludeCommand.indexOf(command)!==-1){
        return callback('Команда '+command+' запрещена.');
    }
    var useModel = function(model){
        if (typeof model[command]!=='function'){
            return callback('Нет такой команды')
        }
        if (command == 'get'){
            params.published = (typeof model.published==='undefined')? model.published : true;
        }
        var allowedForUserCommand = model.allowedForUserCommand || [];
        if (allowedForUserCommand.indexOf(command)===-1 && command!='get'){
            return callback('Команда '+command+' запрещена.');
        }
        var columns = funcs.cloneObj(params.columns || model.columns);
        var excludeForUserColumns = model.excludeForUserColumns;
        if (excludeForUserColumns){
            for (var i in excludeForUserColumns) {
                columns.splice(columns.indexOf(excludeForUserColumns[i]),1);
            }
            params.columns = columns;
            console.log(params.columns);
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

