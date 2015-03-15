var Model = require('./MySQLModel');
module.exports = function(callback){
    var action_types = new Model({
        table: 'action_types',
        table_ru: 'Тип мероприятия',
        ending:'',
        required_fields:['name'],
        getFormating:{
            regulations:"parseBlob"
        }
    },function(err){
        if (err){
            console.log(err);
        }
        callback(action_types);
    });
};

