var HttpError = require('../error').HttpError;
var funcs = require('../libs/functions');
module.exports = function(req, res, next){
    if (!req.session.user){
        funcs.formatResponse(-1, 'error', 'Доступ запрещен.');

        //return next(new HttpError(401, "Вы не авторизованы"));
    }
    next();
};