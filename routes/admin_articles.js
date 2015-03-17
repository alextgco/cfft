var api = require('../libs/api');
exports.get = function(req, res, next){
    api('get', 'article', {limit: 20}, function(err,result){
        if (err){
            console.log(err, 'admin_articles');
        }else{
            console.log(result);
            res.render('admin_articles', {
                items: result
            });
        }
    });
};