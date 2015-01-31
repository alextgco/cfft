var mongoose = require('mongoose');
var config = require('../config');

//mongoose.connect("mongodb://nodejitsu:44219d517fa3f6c2c9074b37b012ac94@troup.mongohq.com:10016/nodejitsudb2972759241",config.get('mongoose:options'));
mongoose.connect(config.get('mongoose:uri'),config.get('mongoose:options'));

module.exports = mongoose;

/*"uri":"mongodb://localhost/cfft",*/