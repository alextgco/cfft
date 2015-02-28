var Model = require('./MySQLModel');
var MyError = require('../error').MyError;
var funcs = require('../libs/functions');
module.exports = function(callback){
    var gender = new Model({
        table: 'gender',
        table_ru: 'Пол',
        ending:'',
        required_fields:['name'],
        validation: {
            name:'notNull'
        },
        getFormating:{

        },
        join_objs:[
        ]
    },function(err){
        if (err){
            console.log(err);
        }
        callback(gender);
    });
};

