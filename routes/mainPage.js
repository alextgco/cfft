var api = require('../libs/userApi');
exports.get = function(req, res, next){
    api('get', 'article', function(err,result){
        if (err){
            console.log(err, 'mainPage');
        }else{
            console.log('ART', result);
            res.render('mainPage', {
                articles: result
            });
        }
    });
};