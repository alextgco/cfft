var Model = require('./MySQLModel');
var MyError = require('../error').MyError;
var funcs = require('../libs/functions');
module.exports = function(callback){
    var partner = new Model({
        table: 'partners',
        table_ru: 'Партнер',
        ending:'',
        required_fields:['name','image','url'],
        published: false,
        validation: {
            name:'notNull',
            url:'url'
        },
        getFormating:{}
    },function(err){
        if (err){
            console.log(err);
        }
        /*club.beforeFunction.add = function(obj, callback){
         obj.isAffiliate = (obj.isAffiliate)?1:0;
         return callback(null,obj);
         };*/
        callback(partner);
    });
};

