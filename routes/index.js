var checkAuth = require('../middleware/checkAuth');
var checkAdmin = require('../middleware/checkAdmin');
module.exports = function (app) {

  app.get('/', function(req, res, next){
    res.render('mainPage',{
      title:""
    });
  });
  app.get('/admin', checkAdmin, require('./admin').get);
  app.post('/admin/api', checkAdmin, require('./adminApi').post);

  //app.get('/login', require('./login').get);
  app.post('/login', require('./login').post);
  app.post('/logout', require('./logout').post);
  app.get('/private', checkAuth, require('./private').get);
  app.get('/registration', require('./registration').get);
  app.post('/registration', require('./registration').post);
  app.get('/reqConfirm', require('./reqConfirm').get);

  app.get('/events', require('./events').get);

  app.get('/event', require('./event').get);

  app.get('/profile', function(req, res, next){
    res.render('profile');
  });

  app.get('/for_athlets', function(req, res, next){
    res.render('for_athlets');
  });

  app.get('/rules', function(req, res, next){
    res.render('rules');
  });

  app.get('/registration_error', function(req, res, next){
    res.render('registration_error');
  });
  app.get('/registration_success', function(req, res, next){
    res.render('registration_success');
  });
  app.get('/reqConfirm', require('./reqConfirm').get);


  app.get('/admin_users', checkAdmin, function(req, res, next){
    res.render('admin_users');
  });

  app.get('/admin_events', checkAdmin, require('./admin_events').get);
  app.get('/admin_event', checkAdmin, require('./admin_event').get);


  /*app.get('/users', function (req, res, next) {ss
    User.find({}, function (err, users) {
      if (err) return next(err);
      res.json(users);
    })
  });


  app.get('/users/:id', function (req, res, next) {
    try {
      var id = new ObjectID(req.params.id);
    } catch (e) {
      return next(404);
    }
    User.findById(id, function (err, user) {
      if (err) return next(err);
      if (!user) {
        next(new HttpError(404, 'Пользователь не найден'));
      }
      res.json(user);
    })
  });*/
};

