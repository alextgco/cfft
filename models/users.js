var Model = require('./MySQLModel');
var funcs = require('../libs/functions');
module.exports = function(callback){
    var user = new Model({
        table: 'users',
        table_ru: 'Пользователь',
        ending:'',
        required_fields:['firstname','email','birthday','gender'],
        getFormating:{
            birthday:'age'
        },
        validation: {
            birthday:'number',
            gender:'number'
        },
        join_objs:[
            {
                gender_id:{
                    table:"gender",
                    fields:[
                        {
                            column:"name",
                            alias:"gender"
                        }
                    ]
                },
                result_type_id:{
                    table:"result_types",
                    fields:[
                        {
                            column:"id",
                            alias:"result_type_id"
                        },
                        {
                            column:"name",
                            alias:"result_type"
                        },
                        {
                            column:"sys_name",
                            alias:"result_type_sys"
                        },
                        {
                            column:"num_of_fields",
                            alias:"num_of_fields"
                        }
                    ]
                },
                status_id:{
                    table:"statuses_of_action_parts",
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
        callback(action_parts);
    });
};

