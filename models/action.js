var Model = require('./MySQLModel');
var MyError = require('../error').MyError;
module.exports = function(callback){
    var action = new Model({
        table: 'actions',
        table_ru: 'Мероприятие',
        ending:'о',
        required_fields:['payment_type_id','title'],
        getFormating:{
            description1:"parseBlob",
            description2:"parseBlob"
        },
        join_objs:[
            {
                type_id:{
                    table:"action_types",
                    fields:[
                        {
                            column:"id",
                            alias:"type_id"
                        },
                        {
                            column:"name",
                            alias:"action_type"
                        }
                    ]
                },
                payment_type_id:{
                    table:"action_payment_types",
                    fields:[
                        {
                            column:"id",
                            alias:"payment_type_id"
                        },
                        {
                            column:"name",
                            alias:"payment_type"
                        }
                    ]
                },
                status_id:{
                    table:"action_statuses",
                    fields:[
                        {
                            column:"id",
                            alias:"status_id"
                        },
                        {
                            column:"name",
                            alias:"status"
                        },
                        {
                            column:"sys_name",
                            alias:"status_sys_name"
                        }
                    ]
                }
            }
        ]
    },function(err){
        if (err){
            console.log(err);
        }

        callback(action);
    });
};

