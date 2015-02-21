var Model = require('./MySQLModel');
var action = new Model({
    table: 'action_parts',
    table_ru: 'Этап мероприятия',
    ending:'',
    required_fields:['payment_type_id','title'],
    blob_fields:['description'],
    join_objs:[
        {
            action_id:{
                table:"actions",
                fields:[]
            }
        }
    ]
},function(){
    module.exports = action;
});

