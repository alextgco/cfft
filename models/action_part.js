var Model = require('./MySQLModel');
module.exports = function(callback){
    var action = new Model({
        table: 'action_parts',
        table_ru: 'Этап мероприятия',
        ending:'',
        required_fields:['action_id','title'],
        blob_fields:['description'],
        join_objs:[
            {
                action_id:{
                    table:"actions",
                    fields:[
                        {
                            column:"title",
                            alias:"action"
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

