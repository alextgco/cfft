var Model = require('./MySQLModel');
//var async = require('async');
var MyError = require('../error').MyError;
//var funcs = require('../libs/functions');
var action = new Model({
    table: 'actions',
    table_ru: 'Мероприятие',
    ending:'о',
    required_fields:['payment_type_id','title'],
    blob_fields:['description']
},function(){
    module.exports = action;
});

