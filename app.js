var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var mongoose = require('./libs/mongoose');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var config = require('config');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//app.set('env','predprod');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
var HttpError = require('error').HttpError;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
var MongoStore = require('connect-mongo')(session);
app.use(session({
    secret: config.get('session:secret'),
    key: config.get('session:key'),
    cookie: config.get('session:cookie'),
    saveUninitialized: true,
    store: new MongoStore({mongoose_connection:mongoose.connection})
}));
/*app.use(function(req,res,next){
    req.session.numb = req.session.numb + 1 || 1;
    res.send("Visits " + req.session.numb);
});*/

app.use(require('middleware/sendHttpError'));
app.use(require('middleware/loadUser'));

require('routes')(app);
app.use(express.static(path.join(__dirname, 'public')));
/*
app.use('/', routes);
app.use('/users', users);*/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
/*if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}*/

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    if (typeof err == 'number'){
        err = new HttpError(err);
    }
    if (err instanceof HttpError){
        res.sendHttpError(err);
    }else{
        if (app.get('env') === 'development'){
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        }else{
            //logger.error(err);
            err = new HttpError(500);
            res.sendHttpError(err);
        }
    }
});


module.exports = app;
