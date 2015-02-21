var Model = require('./MySQLModel');
module.exports = function(callback){
    var action_payment_types = new Model({
        table: 'action_payment_types',
        table_ru: 'Типы оплаты',
        ending:'ы',
        required_fields:['name','type']
    },function(err){
        if (err){
            console.log(err);
        }
        callback(action_payment_types);
    });
};

