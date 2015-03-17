var api = require('../libs/api');
exports.get = function(req, res, next){
    var id = req.query.id;
    if(id == 'new'){
        res.render('admin_article', {
            data: {
                data: [],
                isNew: true
            }
        });
    }else{
        api('get', 'article', {where: {id: id}},function(err,result){
            if (err){
                console.log(err, 'article');
                return callback(err);
            }

            console.log('FIND ME', result);
            res.render('admin_article', {
                data: result,
                isNew: false
            });
        });
    }
};