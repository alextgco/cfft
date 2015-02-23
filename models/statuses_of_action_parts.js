var Model = require('./MySQLModel');
module.exports = function(callback){
    var statuses_of_action_parts = new Model({
        table: 'statuses_of_action_parts',
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
        callback(statuses_of_action_parts);
    });
};

