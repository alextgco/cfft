
var config = require('../config');


var mysql = require("mysql"),
    cMysql = mysql.createPool(config.get('mysqlConnection'));

var mysqlUtilities = require('mysql-utilities');
cMysql.on('connection', function(connection) {
    console.log('MySQL pool connected');
    mysqlUtilities.upgrade(connection);
    mysqlUtilities.introspection(connection);
});
cMysql.on('error', function(err) {
    console.log('MySQL ERROR --------');
    console.log(err);
});

cMysql.getConn = function(callback){
    cMysql.getConnection(function(err,conn) {
        if (err) {
            callback(err)
        } else {
            callback(null,conn);
        }
    });
};

module.exports = cMysql;


/*pool.getConnection(function(err,conn){
    if(err){
        console.log("MYSQL: can't get connection from pool:",err)
    }else {
        conn.insert('countries',{
            title:'TEST',
            external_id: 1
        },function(err,recordId){
            if (err){
                console.log(err);
            }
            console.log('Inserted:',recordId);
            conn.release();
        });

    }
});*/
