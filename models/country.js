var mongoose = require('../libs/mongoose'),
    Schema = mongoose.Schema;

var scheme = new Schema({
        name: {
            type: String,
            unique: true,
            required: true
        },
        cities:[],
        created:{
            type:Date,
            default: Date.now
        }
    }
);


exports.Country = mongoose.model('Country',scheme);
