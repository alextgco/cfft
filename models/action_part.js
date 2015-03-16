var Model = require('./MySQLModel');
var funcs = require('../libs/functions');
module.exports = function(callback){
    var action_parts = new Model({
        table: 'action_parts',
        table_ru: 'Этап мероприятия',
        ending:'',
        required_fields:['action_id','title'],
        getFormating:{
            description1:"parseBlob"
        },
        validation: {
            status_id:'number',
            title:'notNull'
        },
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
                        },
                        {
                            column:"sys_name",
                            alias:"status_sys_name"
                        }
                    ]
                },
                city_id:{
                    table:"cities",
                    fields:[
                        {
                            column:"id",
                            alias:"city_id"
                        },
                        {
                            column:"title",
                            alias:"city"
                        }
                    ]
                }
            }
        ]
    },function(err){
        if (err){
            console.log(err);
        }
        action_parts.beforeFunction.add = function (obj, callback) {
            if (obj.status_id){
                action_parts.getDirectoryValue('statuses_of_action_parts',obj.status_id,function(err,val){
                    if (err){
                        return callback(new MyError('Нет такого статуса'));
                    }
                    if (val != 'DRAFT'){
                        obj.published = funcs.getDateTimeMySQL();
                        callback(null, obj);
                    }
                });
            }else{
                action_parts.getDirectoryId('statuses_of_action_parts','DRAFT',function(err,id){
                    if (err){
                        return callback(new MyError('Нет такого статуса'));
                    }
                    obj.status_id = id;
                    callback(null, obj);
                });
            }
        };
        action_parts.beforeFunction.modify = function (obj, callback) {
            if (obj.status_id){
                action_parts.getDirectoryValue('statuses_of_action_parts',obj.status_id,function(err,val){
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
                action_parts.getDirectoryId('statuses_of_action_parts','DRAFT',function(err,id){
                    if (err){
                        return callback(new MyError('Нет такого статуса'));
                    }
                    obj.status_id = id;
                    callback(null, obj);
                });
            }
        };

        callback(action_parts);
    });
};

