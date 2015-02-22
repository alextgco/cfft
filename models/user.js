var crypto = require('crypto');
var async = require('async');
var AuthError = require('../error').AuthError;
var MyError = require('../error').MyError;
var Guid = require('guid');
var guid = Guid.create();
var moment = require('moment');


var user = {
    authorize:function(username, password, callback){
        pool.getConnection(function(err,conn) {
            if (err) {
                callback(err)
            } else {
                conn.queryRow("select id, email, salt, hashedPassword from users where email = ? and confirmed IS NOT NULL", [username], function (err, row) {
                    conn.release();
                    if (err) {
                        return callback(err);
                    }
                    if (!row){
                        return callback(new AuthError('Пользователь не найден'))
                    }

                    var check = checkPassword(row.salt,password, row.hashedPassword);
                    if (!check){
                        callback(new AuthError('Пароль не верный'));
                    }else{
                        delete row.salt;
                        delete row.hashedPassword;
                        callback(null,row);
                    }
                });
            }
        });
    },
    checkExist:function(email, callback){
        pool.getConnection(function(err,conn) {
            if (err) {
                callback(err)
            } else {
                conn.queryValue('select count(*) from users where email=?',[email],function(err,count){
                    if (err){
                        conn.release();
                        return callback(err);
                    }

                    if (count>0){
                        conn.release();
                        return callback(new MyError('Такой пользователь уже существует'));
                    }
                    console.log('user has no found');
                    callback(null);
                    conn.release();
                });
            }
        });
    },
    registration:function(obj,callback){
        console.log('Зашел в регистрацию');
        if (typeof obj!=='object'){
            return callback(new MyError('Ошибка при добавлении пользователя.'));
        }
        if (!obj.firstname || !isNaN(+obj.firstname)){
            return callback(new MyError('Имя не указано или указано не корректно.'));
        }
        if (!obj.email || !isNaN(+obj.email)){
            return callback(new MyError('Email не указан или указан не корректно.'));
        }
        if (!obj.password){
            return callback(new MyError('Не указан пароль.'));
        }

        var passObj = encryptPassword(obj.password);
        obj.hashedPassword = passObj.hashedPassword;
        obj.salt = passObj.salt;
        delete obj.password;
        this.checkExist(obj.email,function(err){
            if (err) {
                return callback(err)
            }
            pool.getConnection(function(err,conn) {
                if (err) {
                    callback(err)
                } else {
                    console.log('registration','Перед вставкой пользователя');
                    conn.insert('users',obj,function(err,recordId){
                        conn.release();
                        if (err){
                            console.log(err);
                            return callback(err);
                        }
                        console.log('registration','Пользователь успешно добавлен');
                        callback(null);
                    });
                }
            });
        });

    },
    confirmEmail:function(email,p,callback){
        if (p=='EMPTY'){
            callback(new MyError('Запрещено'));
        }
        pool.getConnection(function(err,conn) {
            if (err) {
                callback(err)
            } else {
                //2015-02-14 19:09:25
                var now = moment().format('YYYY-MM-DD HH:mm:ss');
                //var sql = "update users set confirmed = '"+now+"' where id=";
                conn.query("update users set confirmed = ?, mailKey='EMPTY' where email=? and mailKey=?",[now,email,p],function(err,affected){
                    if (err) {
                        callback(err);
                    }else if(affected==0){
                        callback(new MyError('Пользователь не найден'));
                    }else{
                        callback(null);
                    }
                    conn.release();
                });


            }
        });
    },
    remove:function(user_id,callback){
        pool.getConnection(function(err,conn) {
            if (err) {
                callback(err)
            } else {
                conn.delete('users', {id:user_id}, function (err, affectedRow) {
                    conn.release();
                    if (err) {
                        return callback(err);
                    }
                    callback(null,affectedRow);
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