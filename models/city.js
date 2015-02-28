var Model = require('./MySQLModel');
var MyError = require('../error').MyError;
var funcs = require('../libs/functions');
module.exports = function(callback){
    var city = new Model({
        table: 'cities',
        table_ru: 'Город',
        ending:'',
        distinct:true,
        columns:['id','title','country_id'],
        required_fields:['country_id','title'],
        sort:' important DESC, title',
        validation: {
            country_id:'number',
            title:'notNull'
        },
        getFormating:{

        },
        join_objs:[
            {
                country_id:{
                    table:"countries",
                    fields:[
                        {
                            column:"id",
                            alias:"country_id"
                        },
                        {
                            column:"title",
                            alias:"country"
                        }
                    ]
                }
            }
        ]
    },function(err){
        if (err){
            console.log(err);
        }
        callback(city);
    });
};

