var Model = require('./MySQLModel');
module.exports = function(callback){
    var results = new Model({
        table: 'results',
        table_ru: 'Результаты',
        ending:'',
        required_fields:['action_part_id','video_url','result_type_id','user_id'],
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
                result_type_id:{
                    table:"result_type",
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
                }
            }
        ]
    },function(err){
        if (err){
            console.log(err);
        }
        results.addOrder = function(obj,callback){
            if (typeof obj!=='object'){
                return callback(new MyError('Не корректный объект'));
            }
            if(!obj.user_id){
                return callback(new MyError('Не авторизированный доступ'));
            }
            var required_fields = [].concat(results.required_fields);
            var avaliable_fields = [].concat(required_fields);
            for (var i0 in obj) {
                if (avaliable_fields.indexOf(i0)==-1) {
                    delete obj[i0];
                }
            }
            for (var i in required_fields) {
                var finded = false;
                for (var j in obj) {
                    if (j == required_fields[i]) {
                        finded = true;
                        break;
                    }
                }
                if (!finded) {
                    return callback(new MyError('Не переданы обязательные поля. ' + required_fields.join(', ')));
                }
            }
            results.add(obj, function(err,result){
                callback(err,result);
            });
        };
        callback(results);
    });
};

