var util = require('util');
var http = require('http');

//ошибки для выдачи посетителю

function HttpError(status, message){
    Error.apply(this,arguments);
    Error.captureStackTrace(this, HttpError);
    this.status = status;
    this.message = message || http.STATUS_CODES[status] || 'Error';
}
util.inherits(HttpError, Error);
HttpError.prototype.name = 'HttpError';

function AuthError(message){
    Error.apply(this,arguments);
    Error.captureStackTrace(this, AuthError);
    this.message= message;
}
util.inherits(AuthError, Error);
AuthError.prototype.name = 'AuthError';

function MyError(message){
    Error.apply(this,arguments);
    Error.captureStackTrace(this, MyError);
    this.message= message;
}
util.inherits(MyError, Error);
MyError.prototype.name = 'MyError';


function UserError(message){
    Error.apply(this,arguments);
    Error.captureStackTrace(this, UserError);
    this.message= message;
}
util.inherits(UserError, Error);
UserError.prototype.name = 'UserError';


exports.UserError = UserError;
exports.MyError = MyError;
exports.AuthError = AuthError;
exports.HttpError = HttpError;