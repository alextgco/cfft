module.exports = function(req, res, next){
    req.user = res.locals.user = null;
    console.log(req.session.user);
    if (!req.session.user) return next();
    pool.getConnection(function(err,conn) {
        if (err) {
            return next(err);
        } else {
            conn.queryRow("select * from users where id = ?", [req.session.user], function (err, row) {
                conn.release();
                if (err) {
                    return next(err);
                }
                req.user = res.locals.user = row;
                next();
            });
        }
    });
};