var api = require('../libs/api');
exports.get = function(req, res, next){
    api('get', 'main_slides', {limit: 20}, function(err,result){ //, sort: 'sort_no'
        if (err){
            console.log(err, 'admin_main_slides');
        }else{
            console.log(result);
            res.render('admin_main_slides', {
                items: result
            });
        }
    });
};