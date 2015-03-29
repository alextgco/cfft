var api = require('../libs/userApi');
module.exports = function(req, res, next){
    req.partners = res.locals.partners = null;
    api('get', 'partner', {},function(err,result){
        if (err){
            console.log(err);
            req.partners = res.locals.partners = [];
        }else{
            req.partners = res.locals.partners = result.data;
        }
        next();
    });
};