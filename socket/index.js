//var log = require('lib/log')(module);
var config = require('../config');
var connect = require('connect'); // npm i connect
var async = require('async');
var cookie = require('cookie');   // npm i cookie
var cookieParser = require('cookie-parser');
var sessionStore = require('../libs/sessionStore');
var HttpError = require('../error').HttpError;
//var User = require('models/user').User;

function loadSession(sid, callback) {

  // sessionStore callback is not quite async-style!
  sessionStore.load(sid, function(err, session) {
    if (arguments.length == 0) {
      // no arguments => no session
      return callback(null, null);
    } else {
      return callback(null, session);
    }
  });

}

/*function loadUser(session, callback) {

  if (!session.user) {
    console.log("Session %s is anonymous", session.id);
    return callback(null, null);
  }
  pool.getConnection(function(err,conn) {
    if (err) {
      return callback(err);
    } else {
      conn.queryRow("select * from users where id = ?", [session.user], function (err, row) {
        conn.release();
        if (err) {
          return next(err);
        }

        if (!row) {
          return callback(null, null);
        }
        console.log("user findbyId result: " + row);
        callback(null, row);
      });

    }
  });
}*/

module.exports = function(server) {
  var io = require('socket.io').listen(server);
  io.set('origins', 'localhost:*');
  //io.set('logger', log);

  io.set('authorization', function(handshake, callback) {
    console.log('authorization');
    async.waterfall([
      function(callback) {
        // сделать handshakeData.cookies - объектом с cookie
        handshake.cookies = cookie.parse(handshake.headers.cookie || '');
        var sidCookie = handshake.cookies[config.get('session:key')];
        //var sid = connect.utils.parseSignedCookie(sidCookie, config.get('session:secret'));
        var sid = cookieParser.signedCookie(sidCookie, config.get('session:secret'));
        loadSession(sid, callback);
      },
      function(session, callback) {
        if (!session) {
            return callback(new HttpError(403, "Anonymous session may not connect"));
        }
        if (!session.user) {
            return callback(new HttpError(403, "Anonymous session may not connect"));
        }
        handshake.session = session;
        handshake.user = session.user;
        callback(null);
      }

    ], function(err) {
      if (!err) {
        return callback(null, true);
      }

      if (err instanceof HttpError) {
        return callback(null, false);
      }
      callback(err);
    });
  });

  io.sockets.on('session:reload', function(sid) {
    var clients = io.sockets.clients();

    clients.forEach(function(client) {
      if (client.handshake.session.id != sid) return;

      loadSession(sid, function(err, session) {
        if (err) {
          client.emit("error", "server error");
          client.disconnect();
          return;
        }

        if (!session) {
          client.emit("logout");
          client.disconnect();
          return;
        }

        client.handshake.session = session;
      });
        
    });

  });

  io.sockets.on('connection', function(socket) {

    var user = socket.handshake.user;
    console.log('user connected', user);

    socket.on('message', function(text, cb) {
      console.log('socket on message');
      cb && cb();
    });

    socket.on('disconnect', function() {
      console.log('socket on disconnect');
    });

  });

  return io;
};