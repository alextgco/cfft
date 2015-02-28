var Model = require('./MySQLModel');
var funcs = require('../libs/functions');

var crypto = require('crypto');
var async = require('async');
var AuthError = require('../error').AuthError;
var MyError = require('../error').MyError;
var UserError = require('../error').UserError;

var moment = require('moment');
module.exports = function(callback){
    var user = new Model({
        table: 'users',
        table_ru: 'Пользователь',
        ending:'',
        required_fields:['firstname','surname','email','birthday','gender_id','city_id'],
        getFormating:{
            /*birthday:'age'*/
        },
        validation: {
            birthday:'isDate',
            gender:'number'
        },
        join_objs:[
            {
                gender_id:{
                    table:"gender",
                    fields:[
                        {
                            column:"id",
                            alias:"gender_id"
                        },
                        {
                            column:"name",
                            alias:"gender"
                        }
                    ]
                },
                city_id:{
                    table:"cities",
                    fields:[
                        {
                            column:"id",
                            alias:"city_id"
                        },
                        {
                            column:"title",
                            alias:"city"
                        }
                    ]
                }
            }
        ]
    },function(err){
        if (err){
            console.log(err);
        }
        user.encryptPassword = function(password){
            var salt = Math.random() + '';
            return {
                hashedPassword:crypto.createHmac('sha1',salt).update(password).digest('hex'),
                salt:salt
            };
        };
        user.checkPassword = function(salt, password, hashedPassword){
            var pass = crypto.createHmac('sha1',salt).update(password).digest('hex');
            return pass === hashedPassword;
        };
        user.authorize = function(obj, callback){
            if (typeof obj!=='object'){
                console.log('В user.authorize не переданы параметры');
                return callback(new MyError('Не удалось авторизироваться'))
            }
            var username = obj.login, password = obj.password;
            pool.getConn(function(err,conn) {
                if (err) {
                    callback(err)
                } else {
                    conn.queryRow("select id, email, salt, hashedPassword from users where email = ? and confirmed IS NOT NULL", [username], function (err, row) {
                        conn.release();
                        if (err) {
                            return callback(err);
                        }
                        if (!row){
                            return callback(new AuthError('Пользователь не найден.'))
                        }

                        var check = user.checkPassword(row.salt,password, row.hashedPassword);
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
        };
        user.checkExist = function(email, callback){
            pool.getConn(function(err,conn) {
                if (err) {
                    callback(err)
                } else {
                    conn.queryValue('select count(*) from users where email=?',[email],function(err,count){
                        conn.release();
                        if (err){
                            return callback(err);
                        }

                        if (count>0){
                            return callback(new MyError('Такой пользователь уже существует'));
                        }
                        console.log('user has no found');
                        callback(null, null);
                    });
                }
            });
        };
        user.registration = function(obj,callback){
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

            var passObj = user.encryptPassword(obj.password);
            obj.hashedPassword = passObj.hashedPassword;
            obj.salt = passObj.salt;
            delete obj.password;

            for (var i in user.required_fields) {
                var finded = false;
                for (var j in obj) {
                    if (j == user.required_fields[i]) {
                        finded = true;
                        break;
                    }
                }
                if (!finded) {
                    return callback(new MyError('Не переданы обязательные поля. ' + user.required_fields.join(', ')));
                }
            }
            var valid = user.validate(obj);
            if (typeof valid=='object'){
                return callback(new UserError(funcs.formatResponse(-1, 'error', valid.message, valid.fields)));
            }


            this.checkExist(obj.email,function(err){
                if (err) {
                    return callback(err)
                }
                pool.getConn(function(err,conn) {
                    if (err) {
                         return callback(err)
                    }
                    console.log('registration','Перед вставкой пользователя');
                    conn.insert('users',obj,function(err,recordId){
                        conn.release();
                        if (err){
                            console.log(err);
                            return callback(err);
                        }
                        console.log('registration','Пользователь успешно добавлен');
                        callback(null,recordId);
                    });
                });
            });
        };
        user.confirmEmail = function(obj,callback){
            if (typeof obj!=='object'){
                return callback(new MyError('В ConfirmEmail не переданы параметры'))
            }
            var email = obj.email;
            var p = obj.p;
            if (p=='EMPTY' || !email){
                callback(new MyError('Запрещено'));
            }
            pool.getConn(function(err,conn) {
                if (err) {
                    callback(err)
                } else {
                    //2015-02-14 19:09:25
                    var now = moment().format('YYYY-MM-DD HH:mm:ss');
                    //var sql = "update users set confirmed = '"+now+"' where id=";
                    conn.query("update users set confirmed = ?, mailKey='EMPTY' where email=? and mailKey=?",[now,email,p],function(err,affected){
                        conn.release();
                        if (err) {
                            callback(err);
                        }else if(affected==0){
                            callback(new MyError('Пользователь не найден'));
                        }else{
                            callback(null);
                        }
                    });
                }
            });
        };

        callback(user);
    });
};

