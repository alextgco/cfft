var Model = require('./MySQLModel');
var MyError = require('../error').MyError;
var funcs = require('../libs/functions');
module.exports = function(callback){
    var results = new Model({
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
        if (err){
            console.log(err);
        }
        results.get = function(obj,callback){
            var exludedColumns = ['published','created','deleted'];
            var columns = funcs.cloneObj(results.columns);
            for (var i in exludedColumns) {
                delete columns[exludedColumns[i]];
            }
            obj.columns = columns;
            results.prototype.get(obj,function(err, results){
                callback(err, results);
            })
        };
        results.addOrder = function(obj,callback){
            if (typeof obj!=='object'){
                return callback(new MyError('Не корректный объект'));
            }
            if(!obj.user_id){
                return callback(new MyError('Не авторизированный доступ'));
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



            var required_fields = [].concat(results.required_fields);
            var avaliable_fields = ['video_url','concat_result','result_min','result_sec','result_repeat','result_approach','isAff'].concat(required_fields);
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
            results.getDirectoryId('result_statuses','IN_QUEUE',function(err,id){
                if (err){
                    return callback(new MyError('Нет подходящего статуса'));
                }
                obj.status_id = id;
                results.add(obj, function(err,result){
                    callback(err,result);
                });
            });
        };

        callback(results);
    });
};

