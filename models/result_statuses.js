var Model = require('./MySQLModel');
module.exports = function(callback){
    var result_statuses = new Model({
        table: 'result_statuses',
        table_ru: 'Статус результата',
        ending:'',
        required_fields:['name'],
        sort:{
            column:'sort_no',
            direction:'ASC'
        }
    },function(err){
        if (err){
            console.log(err);
        }
        callback(result_statuses);
    });
};

