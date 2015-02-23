var Model = require('./MySQLModel');
module.exports = function(callback){
    var action_types = new Model({
        table: 'action_types',
        table_ru: 'Типы мероприятия',
        ending:'ы',
        required_fields:['name']
    },function(err){
        if (err){
            console.log(err);
        }
        callback(action_types);
    });
};

