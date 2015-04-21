module.exports = function(req, res, next){
    req.slider = res.locals.slider = null;
    //console.log(req.session.slider);
    //if (!req.session.user) return next();
    var api = require('../libs/userApi');
    api('get', 'main_slides', {limit:3}, function(err,result){
        if (err){
            console.log(err, 'main_slides');
            return;
        }
        req.slider = res.locals.slider = result;
        next();
    });
};