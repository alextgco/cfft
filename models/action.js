var Model = require('./MySQLModel');
var action = new Model({
    table: 'actions',
    table_ru: 'Мероприятие',
    ending:'о',
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
},function(){
    module.exports = action;
});

