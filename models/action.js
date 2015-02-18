var async = require('async');
var MyError = require('../error').MyError;
var moment = require('moment');
var funcs = require('../libs/functions');


var getConnections = function(callback){
    pool.getConnection(function(err,conn) {
        if (err) {
            callback(err)
        } else {
            callback(null,conn);
        }
    });
};

var action = {
    /**
     * Возвращает найденое мероприятие или fasle или err
     * @param id
     * @param callback
     */
    getById:function(id,callback){
        var getRow = function(conn,callback){
            conn.queryRow('select * from actions where id=?',[id],function(err,row){
                conn.release();
                callback(err,row);
            });
        };

        async.waterfall([
            getConnections,
            getRow
        ],function(err,results){
            if (err){
                return callback(err);
            }
            callback(null,funcs.formatResponse(0,'success','ОК',results));
        });
    },
    get:function(where,callback){
        var getRows = function(conn,callback){
            var sql = conn.where(where);
            conn.query(sql,[],function(err,row){
                conn.release();
                callback(err,row);
            });
        };

        async.waterfall([
            getConnections,
            getRows
        ],function(err,results){
            if (err){
                return callback(err);
            }
            callback(null,funcs.formatResponse(0,'success','ОК',results));
        });
    },
    add:function(obj, callback){
        var addAction = function(conn,callback){
            conn.insert('actions',obj,function(err,recordId){
                conn.release();
                callback(err,recordId);
            })
        };
        async.waterfall([
            getConnections,
            addAction
        ],function(err,results){
            if (err){
                return callback(err);
            }
            var obj = funcs.formatResponse(0,'success','Мероприятие успешно добавлено.',{id:results});
            return callback(null,obj);
        });
    },
    modify:function(obj,callback){
        var modifyAction = function(conn,callback){
            if (!obj.id){
                return callback(new MyError('Не передано ключевое поле'));
            }
            conn.update('actions',obj,function(err,affected){
                conn.release();
                callback(err,affected);
            })
        };
        async.waterfall([
            getConnections,
            modifyAction
        ],function(err,results){
            if (err){
                return callback(err);
            }
            if (results==0){
                callback(null,funcs.formatResponse(1,'success','Запись не найдена.'))
            }else{
                callback(null,funcs.formatResponse(0,'success','Мероприятие успешно изменено'))
            }
        });
    },
    remove:function(obj,callback){
        var removeAction = function(conn,callback){
            conn.delete('actions',{id:obj.id},function(err,affected){
                conn.release();
                callback(err,affected);
            })
        };
        async.waterfall([
            getConnections,
            removeAction
        ],function(err,results){
            if (err){
                return callback(err);
            }
            if (results==0){
                callback(null,funcs.formatResponse(1,'success','Запись не найдена.'))
            }else{
                callback(null,funcs.formatResponse(0,'success','Мероприятие успешно удалено'))
            }
        });
    }

};



module.exports = action;