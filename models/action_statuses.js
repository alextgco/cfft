var Model = require('./MySQLModel');
module.exports = function(callback){
    var action_statuses = new Model({
        table: 'action_statuses',
        table_ru: 'Статусы мероприятия',
        ending:'ы',
        required_fields:['name'],
        sort:{
            column:'sort_no',
            direction:'ASC'
        }
    },function(err){
        if (err){
            console.log(err);
        }
        callback(action_statuses);
    });
};

