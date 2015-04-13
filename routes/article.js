var api = require('../libs/userApi');
exports.get = function(req, res, next){
    var id = req.query.id;
    api('get', 'article', {},function(err,result){
        if (err){
            console.log(err, 'article');
            return callback(err);
        }
        var thisArticle;

        for(var i in result.data){
            if(result.data[i].id == id){
                thisArticle = result.data[i];
            }
        }
        //console.log('FIND ME', result, thisArticle);

        res.render('article', {
            data: {
                articles: result.data,
                article: thisArticle
            }
        });
    });
};
