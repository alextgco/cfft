var api = require('../libs/api');
exports.get = function(req, res, next){
    var id = req.query.id;
    api('get', 'article', {where: {id: id}},function(err,result){
        if (err){
            console.log(err, 'article');
            return callback(err);
        }
        res.render('article', {
            data: result
        });
    });
};