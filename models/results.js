var Model = require('./MySQLModel');
module.exports = function(callback){
    var action = new Model({
        table: 'action_parts',
        table_ru: 'Этап мероприятия',
        ending:'',
        required_fields:['action_id','title'],
        getFormating:{
            description1:"parseBlob"
        },
        join_objs:[
            {
                status_id:{
                    table:"result_statuses",
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
                },
                result_type_id:{
                    table:"result_statuses",
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

