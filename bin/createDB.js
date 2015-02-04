var mongoose = require('../libs/mongoose');
var async = require('async');
var User = require('../models/user').User;
var Country = require('../models/country').Country;
var City = require('../models/city').City;

var request = require('request');
var t1 = new Date().getTime();

var countries = [];
var cities = [];
function getCountriesPortion(offset,callback){
    offset = offset || 0;
    var url = 'http://api.vk.com/method/database.getCountries?v=5.5&need_all=1&offset='+offset+'&count=1000';
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var res = JSON.parse(body);
            var items = res.response.items;
            for (var i in items) {
                countries.push(items[i]);
            }
        }
        callback();
    })
}


function getCitiesPortion(country_id,offset,callback){
    offset = offset || 0;
    var country;
    for (var i in countries) {
        if (countries[i].id==country_id){
            country = countries[i];
            break;
        }
    }
    var url = 'http://api.vk.com/method/database.getCities?country_id='+country_id+'&v=5.5&need_all=1&offset='+offset+'&count=1000';
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var res = JSON.parse(body);
            //cities = res.response.items;
            var items = res.response.items;
            for (var i in items) {
                items[i].country_id = country_id;
                items[i].country_title = country.title;
                cities.push(items[i]);
            }
            if (cities.length==1000){
                offset +=1000;
                return getCitiesPortion(country_id,offset,callback);
            }else{
                callback();
            }
        }
    })
}

/*getCities(function(){
*//*    console.log(countries[0]);
    console.log(cities[0]);*//*
    for (var i in cities) {
        if (cities[i].title=="Москва"){
            console.log(cities[i]);

        }

    }
});
return;*/

/*
{ id: 1,
    title: 'Москва',
    important: 1,
    country_id: 1,
    country_title: 'Россия' }*/

var start = function(){
    async.series([
        open,
        dropCollections,
       /* dropDatabase,
        requireModels,*/
        createUsers,
        getCities,
        createCities/*,
        createCountries*/
    ], function (err) {
        console.log(arguments);
        setTimeout(
            function() {
                mongoose.disconnect(function(err) {
                    if (err) throw err;
                    console.log('disconnected');
                    var t2 = new Date().getTime();
                    console.log(t2-t1);
                });
            },
            1000
        );
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
function dropCollections(callback){
    var colls = ['users','clubs','cities'];
    async.each(colls,function(item,callback){
        debugger;
        mongoose.connection.db.dropCollection(item,function(err){
            if (err) {
                console.log(err);
            }
            callback();
        });
    },callback);

}
function getCities(callback) {
    getCountriesPortion(0, function () {
        async.each(countries, function (item, callback) {
            getCitiesPortion(item.id, 0, function () {

                callback();
            })
        }, callback);
    });
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

function createCities(callback){

    async.each(cities,function(item,callback){
        var city = new City(item);
        city.save(function(err){
            if (err){
                return callback(err);
            }
            callback();
        });
    },callback);
}
module.exports = start;

start();