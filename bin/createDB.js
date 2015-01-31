var mongoose = require('mongoose');
var async = require('async');
var User = require('../models/user').User;


var start = function(){
    async.series([
        open,
        dropDatabase,
        requireModels,
        createUsers
    ], function (err) {
        console.log(arguments);
        mongoose.disconnect();
    });
};


function open(callback){
    mongoose.connection.on('open',callback);
    console.log('open');
}
function dropDatabase(callback){
    var db = mongoose.connection.db;
    db.dropDatabase(callback);
    console.log('dropDatabase');
}
function requireModels(callback){
    require('../models/user');
    async.each(Object.keys(mongoose.models),function(modelName,callback){
        mongoose.models[modelName].ensureIndexes(callback);
    },callback);
    console.log('requireModels');
}
function createUsers(callback){
    var users = [
        {email:'admin@admin.ru',password:'admin',surname:"admin",firstname:"admin", isAdmin:true, confirmed:true},
        {email:'user1@user1.ru',password:'user1',surname:"user1",firstname:"user1"}
    ];
    async.each(users,function(userData,callback){
        var user = new User(userData);
        console.log(userData.username);
        user.save(callback);
    },callback);
    console.log('createUsers');
}
module.exports = start;