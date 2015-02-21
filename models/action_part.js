var Model = require('./MySQLModel');
module.exports = function(callback){
    var action = new Model({
        table: 'action_part',
        table_ru: 'Этап мероприятия',
        ending:'',
        required_fields:['payment_type_id','title'],
        blob_fields:['description1','description2'],
        join_objs:[
            {
                payment_type_id:{
                    table:"action_payment_types",
                    fields:[
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

