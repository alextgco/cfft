var MyError = require('../error').MyError;

var club = {
    getById: function(club_id, callback){
        pool.getConnection(function(err,conn) {
            if (err) {
                callback(err)
            } else {
                conn.queryRow("select * from clubs where id = ?", [club_id], function (err, row) {
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