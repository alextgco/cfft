var sendSuccessUnsubscribe = require('../modules/regMailer').sendSuccessUnsubscribe;
var api = require('../libs/userApi');
exports.get = function(req, res, next){
    var finish = function(err, res){
        if (err){
            return res.redirect('./registration_error');
        }else{
            return res.redirect('./registration_success');
        }
    };

    var key = req.query.key;
    api('unsubscribe', 'user', {
        key:key
    }, function(err,email){
        if (err) {
            console.log(err);
            return finish(err, res);
        }
        sendSuccessUnsubscribe({email:email}, function(err){
            // Здесь не будем обрабатывать err
            console.log(err);
            finish(null, res);

        });
    });

};

