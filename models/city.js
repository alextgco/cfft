var mongoose = require('../libs/mongoose'),
    Schema = mongoose.Schema;

var scheme = new Schema({
        name: {
            type: String,
            unique: true,
            required: true
        },
        created:{
            type:Date,
            default: Date.now
        }
    }
);


exports.City = mongoose.model('City',scheme);
