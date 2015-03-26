var api = require('../libs/userApi');
exports.get = function(req, res, next){
    var id = req.query.id;
    api('get', 'article', {},function(err,result){
        if (err){
            console.log(err, 'articles');
            return callback(err);
        }
        res.render('articles', {
            data: result
        });
    });
};