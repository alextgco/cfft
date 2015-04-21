var api = require('../libs/userApi');
exports.get = function(req, res, next){
    var id = req.query.id;
    if (!id) res.redirect('/articles');
    api('get', 'article', {},function(err,result){
        if (err){
            console.log(err, 'article');
            return next(err);
        }
        if (result.code!==0) return next(err);
        var thisArticle;

        for(var i in result.data){
            if(result.data[i].id == id){
                thisArticle = result.data[i];
            }
        }
        if (!thisArticle) return next(err);
        //console.log('FIND ME', result, thisArticle);

        res.render('article', {
            data: {
                articles: result.data,
                article: thisArticle
            }
        });
    });
};
