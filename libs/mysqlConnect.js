
var config = require('../config');


var mysql = require("mysql"),
    cMysql = mysql.createPool(config.get('mysqlConnection'));

var mysqlUtilities = require('mysql-utilities');
cMysql.on('connection', function(connection) {
    mysqlUtilities.upgrade(connection);
    mysqlUtilities.introspection(connection);
});



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
