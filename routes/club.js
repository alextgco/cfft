var api = require('../libs/userApi');
exports.get = function(req, res, next){
    var id = req.query.id;
    api('get', 'club', {where: {id: id}}, function(err,result){
        if (err){
            console.log(err, 'club');
        }else{
            res.render('club', {
                items: result
            });
        }
    });
};