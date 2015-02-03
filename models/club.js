var mongoose = require('../libs/mongoose'),
    Schema = mongoose.Schema;

var scheme = new Schema({
        name: {
            type: String,
            unique: true,
            required: true
        },
        photo: {
            type: String,
            required: false
        },
        city: {
            type: String,
            required: false
        },
        address: {
            type: String,
            required: false
        },
        url: {
            type: String,
            required: false
        },
        phones: [{phone:String}],
        emails:[{email:String}],
        affiliate: [{name:String}],
        created:{
            type:Date,
            default: Date.now
        },
        confirmed:{
            type:Boolean,
            default: false
        }
    }
);


exports.Club = mongoose.model('Club',scheme);
