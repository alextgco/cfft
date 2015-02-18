var async = require('async');
var MyError = require('../error').MyError;
var moment = require('moment');

var action = require('../models/action');

exports.post = function(req, res, next){
    var command = req.body.command;
    var object = req.body.object;
    var params = req.body.params;
    var newParams;
    if (params){
        try {
            newParams = JSON.parse(params);
        } catch (e) {
            return res.send(500,'Не валидный JSON в params');
        }
    }else{
        return res.send(500,'Не передан params');
    }

    var model = require('../models/'+object);

    model[command](newParams,function(err,result){
        if(err){
            res.status(500).send(err);
        }
        res.status(200).send(result);
    });



};