var Model = require('./MySQLModel');
var MyError = require('../error').MyError;
var funcs = require('../libs/functions');
module.exports = function(callback){
    var article = new Model({
        table: 'articles',
        table_ru: 'Статья',
        ending:'а',
        published:true,
        required_fields:['title'],
        validation: {
            title:'notNull'
        },
        getFormating:{
            body:"parseBlob"
        },
        join_objs:[

        ],
        sort:{
            column:'id',
            direction:'DESC'
        }
    },function(err){
        if (err){
            console.log(err);
        }
        article.beforeFunction.modify = function (obj, callback) {
            if (obj.published===true){
                obj.published = funcs.getDateTimeMySQL();
            }else if (obj.published===false){
                obj.published = '5015-02-25 22:41:27';
            }

            callback(null, obj);
        };


        callback(article);
    });
};

