var Model = require('./MySQLModel');
var MyError = require('../error').MyError;
var funcs = require('../libs/functions');
module.exports = function(callback){
    var club = new Model({
        table: 'clubs',
        table_ru: 'Клуб',
        ending:'',
        required_fields:['name','city_id'],
        published: false,
        validation: {
            name:'notNull',
            city_id:'number',
            url:'url'
        },
        getFormating:{
            description:"parseBlob"
        },
        concatFields:[{
            title:['name']
        }],
        join_objs:[
            {
                city_id:{
                    table:"cities",
                    fields:[
                        {
                            column:"id",
                            alias:"city_id"
                        },
                        {
                            column:"title",
                            alias:"city"
                        }
                    ]
                },
                user_id:{
                    table:"users",
                    fields:[
                        {
                            column:"id",
                            alias:"user_id"
                        },
                        {
                            column:"firstname",
                            alias:"user"
                        }
                    ]
                }
            }
        ]
    },function(err){
        if (err){
            console.log(err);
        }
        /*club.beforeFunction.add = function(obj, callback){
            obj.isAffiliate = (obj.isAffiliate)?1:0;
            return callback(null,obj);
        };*/
        callback(club);
    });
};

