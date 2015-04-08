var Model = require('./MySQLModel');
var MyError = require('../error').MyError;
var funcs = require('../libs/functions');
var async = require('async');
var sendMail = require('../libs/sendMail');
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
            description2:"parseBlob",
            diary:"parseBlob",
            date_start:'userFriendlyDate',
            date_end:'userFriendlyDate'
        },
        setFormating:{
            date_start:'getDateTimeMySQL',
            date_end:'getDateTimeMySQL'
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
        action.autoFinish = function(obj,callback){
            if (typeof obj!='object'){
                obj = {};
            }
            action.getDirectoryId('action_statuses','OPENED',function(err,id){
                if (err){
                    return callback(new MyError('Нет такого статуса'));
                }
                var status_id = id;
                var o = {
                    columns:['id','date_end'],
                    where:{
                        status_id:status_id
                    }
                };

                action.get(o,function(err,res){
                    if (err){
                        return callback(new MyError('Не удалось обновить мероприятия.'));
                    }
                    var needUpdate = [];
                    res = res.data;
                    action.getDirectoryId('action_statuses','FINISHED',function(err,id) {
                        if (err) {
                            return callback(new MyError('Нет такого статуса'));
                        }
                        var status_id = id;
                        for (var i in res) {
                            var date_end = res[i].date_end;

                            var dateMySQL = funcs.getDateMySQL();
                            if (date_end == dateMySQL) {
                                needUpdate.push({
                                    id: res[i].id,
                                    status_id: status_id
                                });
                            }
                        }
                        async.each(needUpdate, function (item, callback) {
                            action.modify(item, function (err, affected) {
                                if (err) {
                                    console.log(err);
                                }
                                callback(null, affected);
                            })
                        }, function (err, r) {
                            callback(err, needUpdate.length);
                        });
                    });
                });
            });
        };
        action.doSubscribe = function(obj,callback){
            if (typeof obj!=='object'){
                return callback(new MyError('Не корректный объект'));
            }
            /*if(!obj.user_id){
                callback(null, funcs.formatResponse(1, 'error', 'Для отправки заявки необходимо авторизоваться..'));
            }*/
            pool.getConn(function(err, conn){
                if (err){
                    return callback(err);
                }
                var sql = 'select email from users where email is not null and isAgree = 1';
                conn.query(sql,[],function(err, res){
                    conn.release();
                    if (err){
                        return callback(err);
                    }
                    async.each(res, function (item, callback) {
                        var o = {
                            email: item.email,
                            subject: obj.subject || 'Тест рассылки мероприятия',
                            html: obj.html || 'Тест рассылки мероприятия.'
                        };
                        sendMail(o, function (err) {
                            callback(err);
                        });
                    }, function (err,r) {
                        callback(err,r);
                    })
                });
            });

            /*var o = {
                email: obj.email,
                subject: 'Отказ от рассылки',
                html: 'Вы успешно отписались от рассылки.'
            };
            sendMail(o, function (err) {
                callback(err);
            });*/

        };
        action.updateRealResults = function(obj,callback){
            return;
            if (typeof obj!='object'){
                return callback(new MyError('Не передан параметр obj в updateRealResults'));
            }
            pool.getConn(function (err, conn) {
                if (err){
                    console.log(err);
                    return callback(new MyError('Не удалось установить подключение updateRealResults'));
                }
                conn.upsert('real_action_results',obj, function (err, affected) {
                    if (err){
                        return callback(err,affected);
                    }
                })
            })
        };

        callback(action);
    });
};

