
var config = require('../config');


var mysql = require("mysql"),
    cMysql = mysql.createPool(config.get('mysqlConnection'));

var mysqlUtilities = require('mysql-utilities');
var mysqlUtilitiesExtendedWhere = require('./mysqlUtiltiesExtendedWhere');
cMysql.on('connection', function(connection) {
    console.log('MySQL pool connected');
    mysqlUtilities.upgrade(connection);
    //mysqlUtilitiesExtendedWhere.upgradeWhere(connection);
    mysqlUtilities.introspection(connection);
});
cMysql.on('error', function(err) {
    console.log('MySQL ERROR --------');
    console.log(err);
});
cMysql.on('release', function(err) {
    console.log('MySQL release --------');
    //console.log(err);
});

cMysql.getConn = function(callback){
    console.log('cMysql.getConn');
    cMysql.getConnection(function(err,conn) {
        console.log('cMysql.getConn GETTED');
        if (err) {
            console.log(err);
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
