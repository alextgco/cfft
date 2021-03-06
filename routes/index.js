var checkAuth = require('../middleware/checkAuth');
var checkAuthApi = require('../middleware/checkAuthApi');
var checkAdmin = require('../middleware/checkAdmin');
var loadSlider = require('../middleware/loadSlider');
module.exports = function (app) {

  app.get('/test', function(req, res, next){
      res.render('test');
  });
    app.get('/test2', function(req, res, next){
        res.render('test2');
    });

    app.get('/', loadSlider, require('./mainPage').get);
  app.get('/admin', checkAdmin, require('./admin').get);
  app.post('/admin/api', checkAdmin, require('./adminApi').post);
  app.post('/api', require('./userApi').post);
  app.post('/sendFeedback', require('./sendFeedback').post);
  app.post('/sendSubscribe', checkAdmin, require('./sendSubscribe').post);
  app.post('/updateUserAges', require('./updateUserAges').post);

  //app.get('/login', require('./login').get);
  app.post('/login', require('./login').post);
  app.post('/logout', require('./logout').post);
  app.get('/private', checkAuth, require('./private').get);
  app.get('/registration', loadSlider, require('./registration').get);
  app.post('/registration', require('./registration').post);
  app.get('/reqConfirm', loadSlider, require('./reqConfirm').get);
  app.get('/unsubscribe', require('./unsubscribe').get);

  app.get('/events', loadSlider, require('./events').get);

  app.get('/event', loadSlider, require('./event').get);

  app.get('/wow', loadSlider, require('./wow').get);

  app.get('/wows', loadSlider, require('./wows').get);

  app.get('/edit_profile', loadSlider, checkAuth, require('./edit_profile').get);

  app.get('/profile', loadSlider, checkAuth, require('./profile').get);




  app.get('/for_athlets', loadSlider, function(req, res, next){
    res.render('for_athlets');
  });

  app.get('/clubs', loadSlider, require('./clubs').get);
  app.get('/club', loadSlider, require('./club').get);

  app.get('/articles', loadSlider, require('./articles').get);
  app.get('/article', loadSlider, require('./article').get);

  app.get('/for_partners', loadSlider, function(req, res, next){
    res.render('for_partners');
  });

  app.get('/contacts', loadSlider, function(req, res, next){
    res.render('contacts');
  });


  app.get('/rules_games', loadSlider, function(req, res, next){
    res.render('rules_games');
  });

  app.get('/rules_wow', loadSlider, function(req, res, next){
    res.render('rules_wow');
  });

  app.get('/registration_error', loadSlider, function(req, res, next){
    res.render('registration_error');
  });
  app.get('/registration_success', loadSlider, function(req, res, next){
    res.render('registration_success');
  });
  //app.get('/reqConfirm', require('./reqConfirm').get);


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

  app.get('/admin_main_slides', checkAdmin, require('./admin_main_slides').get);
  app.get('/admin_main_slide', checkAdmin, require('./admin_main_slide').get);

  app.get('/admin_partners', checkAdmin, require('./admin_partners').get);
  app.get('/admin_partner', checkAdmin, require('./admin_partner').get);

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

