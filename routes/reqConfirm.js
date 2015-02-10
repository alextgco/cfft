var sendSuccessConfirm = require('../modules/regMailer').sendSuccessConfirm;

var finish = function(err, res){
    if (err){
        return res.redirect('./registration_error');
    }else{
        return res.redirect('./registration_success');
    }
};

exports.get = function(req, res, next){
    var email = req.query.email;
    var p = req.query.p;
    if (p=='done'){
        return finish(true, res);
    }
    /*User.confirmEmail(email,p,function(err,user){
        if (err) {
            console.log(err);
            return finish(err, res);
        }
        sendSuccessConfirm({email:email}, function(err){
            // Здесь не будем обрабатывать err
            finish(null, res);

        });
    });*/
   /* User.find({email:email,mailKey:p},function(err, user){
        if (err){
            console.log(err);
            return finish(err, res);
        }

    });*/
};

