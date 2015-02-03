var mongoose = require('../libs/mongoose');
var async = require('async');
var User = require('../models/user').User;
var Country = require('../models/country').Country;
var City = require('../models/city').City;


var start = function(){
    async.series([
        open,
        dropDatabase,
        requireModels,
        createUsers
    ], function (err) {
        console.log(arguments);
        mongoose.connection.db.close();
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
function createCountries(callback){
    var countries = [
        {name:"Россия"}
    ];
    var cities = {
        "Россия":['Москва, Питер, Екатеринбург']
    };
    async.each(countries,function(item,callback){
        var country = new Country(item);
        var citys = cities[item.name];
        if (citys){
            async.each(citys,function(cityItem,callback){
                var city = new City({name:cityItem});
                city.save(function(err){
                    if (err){
                        return;
                    }
                    country.cities.push(city.id);
                });

            },function(){
                country.save(callback);
            });
        }
    },callback);
    console.log('createCountries');
}
module.exports = start;

start();