var Model = require('./MySQLModel');
var MyError = require('../error').MyError;
var funcs = require('../libs/functions');
module.exports = function(callback){
    var country = new Model({
        table: 'countries',
        table_ru: 'Страна',
        ending:'',
        required_fields:['title'],
        validation: {
            title:'notNull'
        },
        getFormating:{

        },
        join_objs:[
        ]
    },function(err){
        if (err){
            console.log(err);
        }
        callback(country);
    });
};

