var Model = require('./MySQLModel');
module.exports = function(callback){
    var result_types = new Model({
        table: 'result_types',
        table_ru: 'Типы подачи результата',
        ending:'ы',
        required_fields:['name']
    },function(err){
        if (err){
            console.log(err);
        }
        callback(result_types);
    });
};

