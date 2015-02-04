var mongoose = require('../libs/mongoose'),
    Schema = mongoose.Schema;

var scheme = new Schema({
        title:{
            type:String,
            required: true
        },
        country_id:{
            type:String,
            required: true
        },
        country_title:{
            type:String,
            required: true
        },
        important:{
            type:Boolean,
            required: false
        },
        created:{
            type:Date,
            default: Date.now
        }
    }
);

/*{ id: 1,
    title: 'Москва',
    important: 1,
    country_id: 1,
    country_title: 'Россия' }*/
exports.City = mongoose.model('City',scheme);
