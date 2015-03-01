var Model = require('./MySQLModel');
var MyError = require('../error').MyError;
var funcs = require('../libs/functions');
module.exports = function(callback){
    var action = new Model({
        table: 'actions',
        table_ru: 'Мероприятие',
        ending:'о',
        required_fields:['payment_type_id','title'],
        validation: {
            payment_type_id:'number',
            status_id:'number',
            title:'notNull',
            date_start:'isDate',
            date_end:'isDate'
        },
        getFormating:{
            description1:"parseBlob",
            description2:"parseBlob"
        },
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
                },
                status_id:{
                    table:"action_statuses",
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
        action.beforeFunction.add = function (obj, callback) {
            if (obj.status_id){
                action.getDirectoryValue('action_statuses',obj.status_id,function(err,val){
                    if (err){
                        return callback(new MyError('Нет такого статуса'));
                    }
                    if (val != 'DRAFT'){
                        obj.published = funcs.getDateTimeMySQL();
                    }
                    callback(null, obj);
                });
            }else{
                action.getDirectoryId('action_statuses','DRAFT',function(err,id){
                    if (err){
                        return callback(new MyError('Нет такого статуса'));
                    }
                    obj.status_id = id;
                    callback(null, obj);
                });

            }
        };
        action.beforeFunction.modify = function (obj, callback) {
            if (obj.status_id==''){
                delete obj.status_id;
            }
            if (obj.status_id && obj.status_id!=''){
                action.getDirectoryValue('action_statuses',obj.status_id,function(err,val){
                    if (err){
                        return callback(new MyError('Нет такого статуса'));
                    }
                    //console.log(funcs.dateAmoreB('2015-02-24 23:58:50','2015-02-24 23:58:51'));
                    if (val == 'DRAFT'){
                        obj.published = '5015-02-25 22:41:27';
                        callback(null, obj);
                    }else{
                        obj.published = funcs.getDateTimeMySQL();
                        callback(null, obj);
                    }
                });
            }else{
                action.getDirectoryId('action_statuses','DRAFT',function(err,id){
                    if (err){
                        return callback(new MyError('Нет такого статуса'));
                    }
                    obj.status_id = id;
                    callback(null, obj);
                });
            }
        };

        callback(action);
    });
};

