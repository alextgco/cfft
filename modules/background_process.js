var async = require('async');
var moment = require('moment');

var getMinStart = function(callback){
    var t1 = setTimeout(function(){
        var m1 = moment().format('ss');
        console.log('getMinStart', m1);
        //var m2 = moment().format('hh-mm-ss');
        if (m1=='59'){
            return callback(null);
        }
        getMinStart(callback);
    },1000);
};
var getHourStart = function(callback){
    var t1 = setTimeout(function(){
        var m1 = moment().format('mm');
        console.log('getHourStart', m1);
        if (m1 == '59'){
            var m2 = moment().format('hh-mm-ss');
            console.log('getHourStart', m2);
            return callback(null);
        }
        getHourStart(callback);
    },60000);
};

var hourlyTimer = function (callbcak) {
    var t1 = setTimeout(function () {
        var m1 = moment().format('mm');
        if (m1 == '59') {
            var m2 = moment().format('hh-mm-ss');
            if (typeof callback === 'function') {
                callback();
            }
        }
        getHourStart(callbcak);
    }, 60000);
};
var daily = function (callback) {
    var t1 = setTimeout(function () {
        var m1 = moment().format('hh');
        if (m1 == '03') {
            var m2 = moment().format('hh-mm-ss');
            if (typeof callback === 'function') {
                callback(m2);
            }
        }
        daily(callback);
    }, 3600000);
};
 daily(function(res){
     console.log(res);
 });