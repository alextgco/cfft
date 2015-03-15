var Model = require('./MySQLModel');
var MyError = require('../error').MyError;
var funcs = require('../libs/functions');
module.exports = function(callback){
    var article = new Model({
        table: 'articles',
        table_ru: 'Статья',
        ending:'а',
        required_fields:['title'],
        validation: {
            title:'notNull'
        },
        getFormating:{
            body:"parseBlob"
        },
        join_objs:[

        ]
    },function(err){
        if (err){
            console.log(err);
        }


        callback(article);
    });
};

