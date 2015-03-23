var checkAuth = require('../middleware/checkAuth');
var checkAuthApi = require('../middleware/checkAuthApi');
var checkAdmin = require('../middleware/checkAdmin');
module.exports = function (app) {

  app.get('/', require('./mainPage').get);
  app.get('/admin', checkAdmin, require('./admin').get);
  app.post('/admin/api', checkAdmin, require('./adminApi').post);
  app.post('/api', require('./userApi').post);

  //app.get('/login', require('./login').get);
  app.post('/login', require('./login').post);
  app.post('/logout', require('./logout').post);
  app.get('/private', checkAuth, require('./private').get);
  app.get('/registration', require('./registration').get);
  app.post('/registration', require('./registration').post);
  app.get('/reqConfirm', require('./reqConfirm').get);
  app.get('/unsubscribe', require('./unsubscribe').get);

  app.get('/events', require('./events').get);

  app.get('/event', require('./event').get);

  app.get('/wow', require('./wow').get);

  app.get('/wows', require('./wows').get);

  app.get('/edit_profile', checkAuth, require('./edit_profile').get);

  app.get('/profile', checkAuth, require('./profile').get);




  app.get('/for_athlets', function(req, res, next){
    res.render('for_athlets');
  });

  app.get('/clubs', require('./clubs').get);
  app.get('/club', require('./club').get);

  app.get('/articles', require('./articles').get);
  app.get('/article', require('./article').get);


  app.get('/for_partners', function(req, res, next){
    res.render('for_partners');
  });

  app.get('/contacts', function(req, res, next){
    res.render('contacts');
  });


  app.get('/rules_games', function(req, res, next){
    res.render('rules_games');
  });

  app.get('/rules_wow', function(req, res, next){
    res.render('rules_wow');
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

  app.get('/admin_results', checkAdmin, require('./admin_results').get);
  app.get('/admin_judge_result', checkAdmin, require('./admin_judge_result').get);

  app.get('/admin_clubs', checkAdmin, require('./admin_clubs').get);
  app.get('/admin_club', checkAdmin, require('./admin_club').get);

  app.get('/admin_articles', checkAdmin, require('./admin_articles').get);
  app.get('/admin_article', checkAdmin, require('./admin_article').get);

  app.get('/admin_event_types', checkAdmin, require('./admin_event_types').get);
  app.get('/admin_event_type', checkAdmin, require('./admin_event_type').get);
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

