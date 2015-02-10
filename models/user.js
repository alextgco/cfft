var crypto = require('crypto');
var async = require('async');
var AuthError = require('../error').AuthError;
var MyError = require('../error').MyError;
var Guid = require('guid');
var guid = Guid.create();


var user = {
    authorize:function(username, password, callback){
        pool.getConnection(function(err,conn) {
            if (err) {
                callback(err)
            } else {
                conn.queryRow("select id, email, salt, hashedPassword from users where email = ?", [username], function (err, row) {
                    if (err) {
                        return callback(err);
                    }
                    conn.release();

                    var check = checkPassword(row.salt,password, row.hashedPassword);
                    if (!check){
                        callback(new AuthError('Пароль не верный'));
                    }else{
                        callback(null,row);
                    }
                });

            }
        });
    }
};

var encryptPassword = function(password){
    var salt = Math.random() + '';
    return {
        hashedPassword:crypto.createHmac('sha1',salt).update(password).digest('hex'),
        salt:salt
    };
};
//console.dir(encryptPassword("123"));

var checkPassword = function(salt, password, hashedPassword){
    var pass = crypto.createHmac('sha1',salt).update(password).digest('hex');
    return pass === hashedPassword;
};


module.exports = user;


//exports.User = mongoose.model('User',scheme);
//var User = mongoose.model('User',scheme);
//var user = new User({username:'Вася',password:'123'});
//user.set('password','dfsa');
//user.get('password');