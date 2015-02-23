var Model = require('./MySQLModel');
module.exports = function(callback){
    var action = new Model({
        table: 'actions',
        table_ru: 'Мероприятие',
        ending:'о',
        required_fields:['payment_type_id','title'],
        blob_fields:['description1','description2'],
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

