var api = require('../libs/api');
exports.get = function(req, res, next){
    var id = req.query.id;
    if(id == 'new'){
        res.render('admin_main_slide', {
            data: {
                data: [],
                isNew: true
            }
        });
    }else{
        api('get', 'main_slides', {where: {id: id}},function(err,result){
            if (err){
                console.log(err, 'main_slides');
                return callback(err);
            }
            res.render('admin_main_slide', {
                data: result,
                isNew: false
            });
        });
    }
};