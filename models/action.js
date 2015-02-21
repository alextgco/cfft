var Model = require('./MySQLModel');
//var async = require('async');
var MyError = require('../error').MyError;
//var funcs = require('../libs/functions');
var action = new Model({
    table: 'actions',
    table_ru: 'Мероприятие',
    ending:'о',
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

