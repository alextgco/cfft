var async = require('async');
var MyError = require('../error').MyError;
var moment = require('moment');
var funcs = require('../libs/functions');
var model = {
    table: 'action_part',
    table_ru: '"Этап мероприятия"',
    required_fields:['action_id','title','result_type_id'],
    /**
     * Возвращает найденое мероприятие или fasle или err
     * @param id
     * @param callback
     */
    getById: function (id, callback) {
        var getRow = function (conn, callback) {
            conn.queryRow('select * from ' + model.table + ' where id=?', [id], function (err, row) {
                conn.release();
                callback(err, row);
            });
        };

        async.waterfall([
            pool.getConn,
            getRow
        ], function (err, results) {
            if (err) {
                return callback(err);
            }
            callback(null, funcs.formatResponse(0, 'success', 'ОК', results));
        });
    },
    get: function (where, callback) {
        var getRows = function (conn, callback) {
            conn.select(model.table, '*', where, function (err, rows) {
                conn.release();
                if (!err) {
                    for (var i in rows) {
                        rows[i].description = rows[i].description.toString();
                    }
                }
                callback(err, rows);
            });
        };

        async.waterfall([
            pool.getConn,
            getRows
        ], function (err, results) {
            if (err) {
                return callback(err);
            }
            callback(null, funcs.formatResponse(0, 'success', 'ОК', results));
        });
    },
    add: function (obj, callback) {

        for (var i in model.required_fields) {
            var finded = false;
            for (var j in obj) {
                if (j == model.required_fields[i]){
                    finded = true;
                    break;
                }
                if (!finded){
                    return callback(new MyError('Не переданы обязательные поля. '+model.required_fields.join(', ')));
                }
            }
        }
        var addToModel = function (conn, callback) {
            conn.insert(model.table, obj, function (err, recordId) {
                conn.release();
                callback(err, recordId);
            })
        };
        async.waterfall([
            pool.getConn,
            addToModel
        ], function (err, results) {
            if (err) {
                return callback(err);
            }
            var obj = funcs.formatResponse(0, 'success', model.table_ru + ' успешно добавлено.', {id: results});
            return callback(null, obj);
        });
    },
    modify: function (obj, callback) {
        var modifyModel = function (conn, callback) {
            if (!obj.id) {
                return callback(new MyError('Не передано ключевое поле'));
            }
            conn.update(model.table, obj, function (err, affected) {
                conn.release();
                callback(err, affected);
            })
        };
        async.waterfall([
            pool.getConn,
            modifyModel
        ], function (err, results) {
            if (err) {
                return callback(err);
            }
            if (results == 0) {
                callback(null, funcs.formatResponse(1, 'success', 'Запись не найдена.'))
            } else {
                callback(null, funcs.formatResponse(0, 'success', model.table_ru + ' успешно изменено'))
            }
        });
    },
    remove: function (obj, callback) {
        var removeModel = function (conn, callback) {
            conn.delete(model.table, {id: obj.id}, function (err, affected) {
                conn.release();
                callback(err, affected);
            })
        };
        async.waterfall([
            pool.getConn,
            removeModel
        ], function (err, results) {
            if (err) {
                return callback(err);
            }
            if (results == 0) {
                callback(null, funcs.formatResponse(1, 'success', 'Запись не найдена.'))
            } else {
                callback(null, funcs.formatResponse(0, 'success', model.table_ru + ' успешно удалено'))
            }
        });
    }

};


module.exports = model;