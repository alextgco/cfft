var Model = require('./MySQLModel');
var MyError = require('../error').MyError;
var funcs = require('../libs/functions');
module.exports = function(callback){
    var main_slides = new Model({
        table: 'main_slides',
        table_ru: 'Слайд',
        ending:'',
        published:false,
        required_fields:['photo','sort_no'],
        validation: {
            url:'url',
            sort_no:'number'
        },
        getFormating:{

        },
        join_objs:[

        ],
        sort:{
            column:'sort_no',
            direction:'ASC'
        }
    },function(err){
        if (err){
            console.log(err);
        }
        callback(main_slides);
    });
};

