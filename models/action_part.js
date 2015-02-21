var Model = require('./MySQLModel');
var action = new Model({
    table: 'action_parts',
    table_ru: 'Этап мероприятия',
    ending:'',
    required_fields:['payment_type_id','title'],
    blob_fields:['description'],
    join_objs:[
        {
            payment_type_id:{
                table:"action_payment_types",
                fields:["payment_type"]
            }
        }
    ]
},function(){
    module.exports = action;
});

