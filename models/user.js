var crypto = require('crypto');
var async = require('async');
var AuthError = require('../error').AuthError;
var Guid = require('guid');
var guid = Guid.create();

var Club = require('../models/club').Club;

var mongoose = require('../libs/mongoose'),
    Schema = mongoose.Schema;

var scheme = new Schema({
        firstname: {
            type: String,
            required: true
        },
        surname: {
            type: String,
            required: true
        },
        secondname: {
            type: String,
            required: false
        },
        phone: {
            type: String,
            required: false
        },
        city: {
            type: String,
            required: false
        },
        gender: {
            type: String,
            required: false
        },
        weight: {
            type: Number,
            required: false
        },
        birthday: {
            type: Date,
            required: false
        },
        height: {
            type: Number,
            required: false
        },
        photo: {
            type: String,
            required: false
        },
        clubs: [Club],
        isAgree: {
            type: Boolean,
            required: false
        },
        raiting: {
            type: Number,
            required: false
        },
        isBanned: {
            type: Boolean,
            required: false
        },
        bannetToDate: {
            type: Date,
            required: false
        },
        email: {
            type: String,
            unique: true,
            required: true
        },
        hashedPassword:{
            type:String,
            required:true
        },
        salt:{
            type:String,
            required:true
        },
        created:{
            type:Date,
            default: Date.now
        },
        confirmed:{
            type:Boolean,
            default: false
        },
        mailKey:{
            type:String

        },
        isAdmin:{
            type: Boolean,
            default: false
        }
    }
);

scheme.methods.encryptPassword = function(password){
    return crypto.createHmac('sha1',this.salt).update(password).digest('hex');
};

scheme.virtual('password')
    .set(function(password){
        this._plainPassword = password;
        this.salt = Math.random() + '';
        this.hashedPassword = this.encryptPassword(password);
    }
);
scheme.methods.checkPassword = function(password){
    return this.encryptPassword(password) === this.hashedPassword;
};

scheme.statics.authorize = function(username, password, callback){
    var User = this;
    async.waterfall([
        function(callback){
            User.findOne({email:username,confirmed:true},callback);
        },
        function(user, callback){
            if (user){
                if (user.checkPassword(password)){
                    callback(null,user);
                }else{
                    callback(new AuthError('Пароль не верный'));
                }
            }else{
                callback(new AuthError('Пользователь не найден'));
            }
        }
    ],callback);
};

scheme.statics.registration = function(obj, callback){
    var User = this;
    var user = User.findOne({email:obj.email},function(err, user){
        if (err) return callback(err);
        if (user){
            return callback(new AuthError('Такой пользователь уже существует'));
        }
        user = new User(obj);
        user.save(function(err){
            if (err) return callback(err);
            return callback(null, user);
        });
    });
};
scheme.statics.setAdmin = function(user, callback){
    var User = this;
    user.isAdmin = true;
    user.save(function(err){
        if (err) return callback(err);
        return callback(null, user);
    });
};
scheme.statics.confirmEmail = function(email, p, callback){
    var User = this;
    User.findOneAndUpdate({email:email},{confirmed:true},function(err,user){
        callback(err, user);
    });
    /*var user = User.findOne({email:email},function(err, user){
        if (err) return callback(err);
        if (user){
            user.confirmed = true;
            user.save(function (err) {
                if (err) {
                    return callback(err);
                }
                callback(null,user);
            });
        }
    });*/
};



exports.User = mongoose.model('User',scheme);
//var User = mongoose.model('User',scheme);
//var user = new User({username:'Вася',password:'123'});
//user.set('password','dfsa');
//user.get('password');