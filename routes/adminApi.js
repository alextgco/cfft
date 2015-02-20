var api = require('../libs/api');
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
            return res.status(500).send('Не валидный JSON в params');
        }
    }else{
        return res.status(500).send('Не передан params');
    }

    api(command, object, newParams,function(err,result){
        if (err){
            res.status(500).send(err);
        }else{
            res.status(200).send(result);
        }
    });
};



/*
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

    try {
        var model = require('../models/' + object);
    } catch (e) {
        return res.status(500).send('Такого объекта не существует. '+object);
    }

    model[command](newParams,function(err,result){
        if(err){
            res.status(500).send(err);
        }
        res.status(200).send(result);
    });



};*/
