var Model = require('./MySQLModel');
var MyError = require('../error').MyError;
var UserError = require('../error').UserError;
var funcs = require('../libs/functions');
module.exports = function(callback){
    var results = new Model({
        allowedForUserCommand:['get','addOrder'],
        table: 'results',
        table_ru: 'Результат',
        ending:'',
        required_fields:['action_part_id','video_url','result_type_id','user_id'],
        additionalColumns:['action_id'],
        // var avaliable_fields = ['video_url','concat_result','result_min','result_sec','result_repeat','result_approach','isAff'].
        validation: {
            video_url:'url',
            result_type_id:'number',
            action_part_id:'number',
            result_min:'number',
            result_sec:'number',
            result_repeat:'number',
            result_approach:'number',
            isAff:'number'
        },
        /*concatFields:[{
            result:['result_min',':','result_sec']
        }],*/
        /*getFormating:{
            description1:"parseBlob"
        },*/
        join_objs:[
            {

                action_part_id:{
                    table:"action_parts",
                    fields:[
                        {
                            column:"id",
                            alias:"action_part_id"
                        },
                        {
                            column:"title",
                            alias:"action_part"
                        }
                    ]
                },
                action_id:{
                    table:"actions",
                    joinTable:'action_parts',
                    fields:[
                        {
                            column:"id",
                            alias:"action_id"
                        },
                        {
                            column:"title",
                            alias:"action_title"
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
                        }
                    ]
                },
                status_id:{
                    table:"result_statuses",
                    fields:[
                        {
                            column:"id",
                            alias:"status_id"
                        },
                        {
                            column:"name",
                            alias:"status_name"
                        },
                        {
                            column:"sys_name",
                            alias:"status_name_sys"
                        }
                    ]
                },

                user_id:{
                    table:"users",
                    fields:[
                        {
                            column:"id",
                            alias:"user_id"
                        },
                        {
                            column:"firstname",
                            alias:"user_firstname"
                        },
                        {
                            column:"surname",
                            alias:"user_surname"
                        }
                    ]
                }
            }
        ]
    },function(err){
        var self = this;
        if (err){
            console.log(err);
        }
        //var protoGet = results.get;

        results.beforeFunction.get = function (obj, callback) {
            /*if (!obj.user_id) {
                return callback(null,null);
            }*/
            var exludedColumns = ['published', 'created', 'deleted'];
            var columns = funcs.cloneObj(results.columns);
            for (var i in exludedColumns) {
                columns.splice(columns.indexOf(exludedColumns[i]),1);
                //delete columns[columns.indexOf(exludedColumns[i])];
            }
            //columns = funcs.clearEmpty(columns);
            obj.columns = columns;
            return callback(null,obj);
        };
        results.addOrder = function(obj,callback){
            if (typeof obj!=='object'){
                return callback(new MyError('Не корректный объект'));
            }
            if(!obj.user_id){
                callback(null, funcs.formatResponse(1, 'error', 'Для отправки заявки необходимо авторизоваться..'));
            }

            switch (obj.result_type){
                case "TIME":
                    obj.concat_result = obj.result_min+':'+obj.result_sec;
                    break;
                case "REPEAT":
                    obj.concat_result = obj.result_repeat;
                    break;
                case "TIE_BREAK":
                    obj.concat_result = obj.result_approach + '(' + obj.result_repeat + '(' + obj.result_min + ':' + obj.result_sec + '))';
                    break;
                case "TIE_BREAK_SHORT":
                    obj.concat_result = obj.result_repeat + '(' + obj.result_min + ':' + obj.result_sec + ')';
                    break;
                default :
                    break;
            }
            obj.published = funcs.getDateTimeMySQL();


            var required_fields = [].concat(results.required_fields);
            var avaliable_fields = ['published','video_url','concat_result','result_min','result_sec','result_repeat','result_approach','isAff'].concat(required_fields);
            for (var i0 in obj) {
                if (avaliable_fields.indexOf(i0)==-1) {
                    delete obj[i0];
                }
            }
            var notFinded = [];
            for (var i in required_fields) {
                var finded = false;
                for (var j in obj) {
                    if (j == required_fields[i] || obj[j]=='') {
                        finded = true;
                        break;
                    }
                }
                notFinded.push(required_fields[i]);
            }
            if (!finded) {
                return callback(new MyError('Не переданы (или переданы не корректно) обязательные поля. ' + notFinded.join(', ')));
            }
            obj.isAff = +obj.isAff || 0;

            results.getDirectoryId('action_statuses','OPENED',function(err,action_status_id){
                results.getDirectoryId('statuses_of_action_parts','OPENED',function(err,action_part_status_id){
                    pool.getConn(function(err,conn){
                        conn.queryValue("select count(*) from action_parts ap left join actions as a on ap.action_id = a.id where a.status_id=? and ap.status_id=? and ap.id = ?",
                            [action_part_status_id, action_status_id, obj.action_part_id],
                            function (err, v) {
                                conn.release();
                                if (err){
                                    return callback(err);
                                }
                                if (v==0){
                                    return callback(null, funcs.formatResponse(1, 'error', 'Регистрация закрыта.'));
                                }
                                results.getDirectoryId('result_statuses','IN_QUEUE',function(err,id){
                                    if (err){
                                        return callback(new MyError('Нет подходящего статуса'));
                                    }
                                    obj.status_id = id;
                                    results.getDirectoryId('result_statuses','IN_HISTORY',function(err,result_status_id){
                                        if (err){
                                            return callback(new MyError('Нет такого статуса'));
                                        }

                                        results.add(obj, function(err,result){
                                            //{"code":0,"toastr":{"type":"success","message":"Результат успешно добавлен."},"data":{"id":36}}
                                            if(err){
                                                return callback(err,result);
                                            }
                                            if (result.code!=0){
                                                return callback(err,result);
                                            }
                                            var id = result.data.id;

                                            pool.getConn(function(err,conn){
                                                var sql = 'update results set published = NULL, status_id = ? where user_id = ? AND action_part_id = ? AND published IS NOT NULL AND id <> ?';
                                                conn.query(sql,[result_status_id, obj.user_id,obj.action_part_id,id],function(err,affected){
                                                    console.log('update:', err, affected);
                                                    conn.release();
                                                    callback(null,funcs.formatResponse(0, 'success', 'Заявка принята.'));

                                                })
                                            });


                                        });



                                    });


                                });
                            })
                    });
                });
            });

        };
        results.approve = function(obj,callback){
            results.getDirectoryId('result_statuses',obj.status,function(err,id){
                if (err){
                    return callback(null, funcs.formatResponse(1, 'error', 'Не удалось указать статус заявки. Нет такого статуса '+obj.status));
                }
                var o = {
                    id:obj.id,
                    status_id:id,
                    reject_reason:obj.reject_reason || ''
                };
                results.modify(o,function(err,result){
                    callback(err,result);
                })
            });

        };

        callback(results);
    });
};

