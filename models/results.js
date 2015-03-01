var Model = require('./MySQLModel');
var MyError = require('../error').MyError;
var UserError = require('../error').UserError;
var funcs = require('../libs/functions');
var async = require('async');
module.exports = function(callback){
    var results = new Model({
        allowedForUserCommand:['get','addOrder','actionLeaderBoard'],
        table: 'results',
        table_ru: 'Результат',
        ending:'',
        required_fields:['action_part_id','video_url','result_type_id','user_id'],
        additionalColumns:['action_id','gender_id'],
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
                },
                gender_id:{
                    table:'gender',
                    joinTable:'users',
                    fields:[
                        {
                            column:'name',
                            alias:'gender'
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
            var exludedColumns = ['published', 'created', 'deleted'];
            var columns = obj.columns || funcs.cloneObj(results.columns);
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
                        if (err){
                            return callback(err);
                        }
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
                                                    conn.release();
                                                    callback(null,funcs.formatResponse(0, 'success', 'Заявка принята.'));
                                                    results.rePosition({
                                                        action_part_id:obj.action_part_id
                                                    }, function(err,r){

                                                    });
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
                    // Переприсвоить позиции
                    if (obj.action_part_id){
                        results.rePosition({
                            action_part_id:obj.action_part_id
                        }, function(err,r){

                        });
                    }


                })
            });

        };
        results.rePosition = function(obj,callback){
            if (typeof obj!='object'){
                console.log('Не корректно переданы параметры. rePosition');
                return callback(new MyError('Не корректно переданы параметры. rePosition'));
            }
            var action_part_id = obj.action_part_id;
            if (isNaN(+action_part_id)){
                console.log('Не корректно передан action_part_id параметры. rePosition');
                return callback(new MyError('Не корректно передан action_part_id параметры. rePosition'));
            }
            // Получим тип (формат) результата
            pool.getConn(function(err, conn){
                if (err){
                    return callback(err);
                }
                conn.queryRow('select rt.id as id,rt.sys_name as name from action_parts ap left join result_types as rt on ap.result_type_id = rt.id ' +
                'where ap.id = ?',action_part_id, function(err,r1){
                    conn.release();
                    if (err){
                        return callback(err);
                    }
                    var result_type_id = r1.id;
                    var result_type = r1.name;
                    var sort = '';
                    switch (result_type){
                        case "TIME":
                            sort = ' order by result_min, result_sec';
                            break;
                        case "REPEAT":
                            sort = ' order by result_repeat DESC';

                            break;
                        case "TIE_BREAK":
                            sort = ' order by result_repeat DESC, result_min, result_sec';
                            sort = '';
                            break;
                        case "TIE_BREAK_SHORT":
                            sort = ' order by result_repeat DESC, result_min, result_sec';
                            break;
                        default :
                            sort = '';
                            break;
                    }
                    var sql = "SELECT r.id, r.result_type_id, r.result_repeat, r.result_min, r.result_sec, r.result_approach from results r " +
                        "left join result_statuses as rs on r.status_id = rs.id " +
                        "where r.action_part_id = ? and r.result_type_id = ? and r.published is not null and rs.sys_name in ('IN_QUEUE','IN_PROGERSS','ACCEPTED')";
                    sql += sort;
                    console.log(sql);
                    pool.getConn(function(err,conn){
                        if (err){
                            return callback(err);
                        }
                        conn.query(sql,[action_part_id,result_type_id],function(err, r2){
                            conn.release();
                            if (err){
                                console.log(err);
                                return callback(err);
                            }
                            for (var i in r2) {
                                r2[i].position = +i+1;
                            }
                            async.each(r2,function(item, callback){
                                results.modify({
                                    id:item.id,
                                    position:item.position
                                },function(err,affected){
                                    if (err){
                                        console.log(err);
                                    }
                                    callback(null,affected);
                                })
                            })

                        });
                    });




                });
            });



        };
        results.actionLeaderBoard = function(obj, callback){

            results.getDirectoryId('result_statuses','ACCEPTED',function(err,result_status_id){
                if (err){
                    return callback(err);
                }
                pool.getConn(function(err,conn){
                    if (err){
                        return callback(err);
                    }
                    var sql = "SELECT action_part_id as id, max(position) as max_pos FROM results r" +
                        " WHERE status_id = ?" +
                        " GROUP BY action_part_id";
                    conn.query(sql,[result_status_id], function (err, res1) {
                        conn.release();
                        if (err){
                            return callback(err);
                        }
                        var parts_arr = res1;
                        var parts = {};
                        for (var i in res1) {
                            var item = res1[i];
                            parts[item.id] = {
                                id: item.id,
                                max_pos:item.max_pos
                            }
                        }
                        var arr = [];
                        pool.getConn(function(err,conn){
                            if (err){
                                return callback(err);
                            }
                            var sql = "select r.id, user_id, concat(u.surname, ' ', u.firstname) as FIO, r.position, r.action_part_id, ap.title, r.concat_result  from results r " +
                                "LEFT JOIN users as u on r.user_id = u.id" +
                                " LEFT JOIN action_parts as ap on r.action_part_id = ap.id" +
                                " LEFT JOIN actions as a on ap.action_id = a.id" +
                                " LEFT JOIN result_statuses as rs on r.status_id = rs.id" +
                                " where a.id = ? and rs.sys_name = 'ACCEPTED'" +
                                " GROUP BY r.user_id, r.action_part_id";

                            conn.query(sql,[41],function(err, res2){
                                conn.release();
                                if (err){
                                    return callback(err);
                                }
                                //console.log(res2);
                                var tbl = [];
                                var usr_obj = {};
                                for (var i in res2) {
                                    var item = res2[i];
                                    if (typeof  usr_obj[item.user_id]!=='object'){
                                        usr_obj[item.user_id] = {};
                                    }
                                    if(typeof usr_obj[item.user_id][item.action_part_id]!=='object'){
                                        usr_obj[item.user_id][item.action_part_id] = {};
                                    }
                                    //var curr_part = usr_obj[item.user_id][item.action_part_id];
                                    usr_obj[item.user_id][item.action_part_id].pos = item.position;
                                    usr_obj[item.user_id][item.action_part_id].concat_result = item.concat_result;
                                }
                                console.log('----------------------------------------------------------');
                                console.dir(usr_obj);
                                process.exit();

                                /*for (var i in res2) {
                                    var item = res2[i];
                                    var o = {
                                        user_id:item.user_id
                                    };
                                    for (var j in parts_arr) {
                                        o[parts_arr[j]] = {
                                            pos:(item.pos)
                                        }
                                    }
                                    arr.push({
                                        user_id:item.user_id
                                    })
                                }*/
                            })
                        });
                    });

                });
            });



            var sql = "select r.id, concat(u.surname, ' ', u.firstname) as FIO, r.position, r.action_part_id, ap.title, r.concat_result from results r" +
                " LEFT JOIN users as u on r.user_id = u.id" +
                " LEFT JOIN action_parts as ap on r.action_part_id = ap.id" +
                " LEFT JOIN actions as a on ap.action_id = a.id" +
                " LEFT JOIN result_statuses as rs on r.status_id = rs.id" +
                " where a.id = ? and rs.sys_name = 'ACCEPTED'" +
                " ORDER BY r.action_part_id";

        };
        callback(results);
    });
};

