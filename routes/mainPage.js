var api = require('../libs/userApi');
var async = require('async');
exports.get = function(req, res, next){

    var loadArticles = function(callback){
        api('get', 'article', {limit:3}, function(err,result){
            if (err){
                console.log(err, 'mainPage');
            }else{
                console.log('ART', result);
                //res.render('mainPage', {
                //    data: result
                //});
            }

            callback(null,result);
        });
    };

    var loadSlides = function(callback){
        api('get', 'main_slides', {limit:3}, function(err,result){
            if (err){
                console.log(err, 'main_slides');
            }else{
                console.log('ART', result);
                //res.render('mainPage', {
                //    data: result
                //});
            }

            callback(null,result);
        });
    };


    async.series([
        loadArticles,
        loadSlides
    ],function(err,results){
        if (err){
            return next(err);
        }
        res.render('mainPage', {
            data: {
                data: results[0],
                slides: results[1]
            }
        });
    });
};