var async = require('async');
var MyError = require('../error').MyError;
var funcs = require('../libs/functions');

/**
 * Функция конструктор, создает стандартную модель для работы с таблицами в Mysql
 * Имеет стандартные методы get/add/modify/remove
 * @param params {}
 * Обязательным параметром явл. params.table (содержит имя таблицы в mySQL)
 table_ru Русское наименование таблицы, для формирования текста ошибок.
 ending окончание в тексте ошибок (объект удален/удалена/удалено) // 'о' 'а' ''
 required_fields = массив обязательных полей. Если при добавлении эти поля не переданы, функция add вернет ош. об этом
 not_editable = массив содержащий имена полей, запрещенных к редактированию. В этот массив всегда добавляется 'created'
 if (this.not_editable.indexOf('created')==-1){
        this.not_editable.push('created');
    }
 this.blob_fields Массив полей которые хронятся в двоичном виде и требуют форматирования после получения.
 this.defaults = Массив объектов, значения по умолчанию
 * @returns {boolean}
 * @constructor
 */
var Model = function (params, callback) {
    var self = this;
    if (typeof callback !== 'function') {
        throw new MyError('Не передан callback');
        return false;
    }
    if (typeof params !== 'object') {
        throw new MyError('Не верно вызвана функция конструктор в Model.js');
        return false;
    }
    if (!params.table) {
        throw new MyError('Не верно вызвана функция конструктор в Model.js Не указано имя таблицы (table).');
        return false;
    }
    this.table = params.table;
    this.table_ru = params.table_ru || 'Объект';
    this.ending = params.ending || ''; // 'о' 'а'
    this.required_fields = (typeof params.required_fields === 'object') ? params.required_fields : [];
    this.not_editable = (typeof params.not_editable === 'object') ? params.not_editable : ['created'];
    if (this.not_editable.indexOf('created') == -1) {
        this.not_editable.push('created');
    }
    this.blob_fields = (typeof params.blob_fields === 'object') ? params.blob_fields : [];
    this.defaults = (typeof params.defaults === 'object') ? params.blob_fields : [];
    this.join_objs = (typeof params.join_objs === 'object') ? params.join_objs : false;
    pool.getConn(function (err, conn) {
        if (err) {
            return callback(err);
        }
        /* SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_NAME='Laptop' AND
         COLUMN_NAME NOT IN ('code');*/
        conn.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME=?", [self.table], function (err, rows) {
            if (err) {
                callback(err);
            } else {
                self.columns = [];
                for (var i in rows) {
                    self.columns.push(rows[i]['COLUMN_NAME']);
                }
                callback(null);
            }
        });

    })

};
Model.prototype.getById = function (id, callback) {
    var getRow = function (conn, callback) {
        conn.queryRow('select * from ' + this.table + ' where id=?', [id], function (err, row) {
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
};
Model.prototype.get = function (params, callback) {
    var self = this;
    var getRows = function (conn, callback) {
        var where = params.where || {};
        var limit = params.limit || 1000;
        var sort = params.sort || (self.sort) ? funcs.cloneObj(self.sort) : {column:'id',direction:'DESC'};
        var deleted = !!params.deleted;

        var columns = params.columns || funcs.cloneObj(self.columns);
        var sql = "SELECT " + columns.join(', ') + " FROM " + self.table;


        var joinObjs = funcs.cloneObj(self.join_objs);
        var tmpWhere = {};

        /// Только в случае если нужно джоинить таблицы
        if (joinObjs) {
            var extTablesOn = [];
            for (var c in joinObjs) {
                var oneJoinObj = joinObjs[c];
                for (var i in oneJoinObj) {
                    if (columns.indexOf(i) == -1) {
                        continue;
                    }
                    extTablesOn.push(' LEFT JOIN ' + oneJoinObj[i].table + ' ON ' +
                    self.table + '.' + i + ' = ' + oneJoinObj[i].table + '.id');
                    for (var j in oneJoinObj[i].fields) {
                        var oneField = oneJoinObj[i].fields[j];
                        if (typeof  oneField == 'object') {
                            oneJoinObj[i].fields[j] = oneJoinObj[i].table + '.' + oneField.column + ' as ' + oneField.alias;
                        } else {
                            oneJoinObj[i].fields[j] = oneJoinObj[i].table + '.' + oneField;
                        }
                    }
                }
            }

            for (var i2 in columns) {
                var brk = false;
                for (var j2 in joinObjs) {
                    if (brk) {
                        break;
                    }
                    var oneJoinObj2 = joinObjs[j2];
                    for (var k in oneJoinObj2) {
                        if (columns[i2] == k) {
                            columns.splice(i2, 1, oneJoinObj2[k].fields.join(','));
                            brk = true;
                            break;
                        }
                    }
                }
                if (!brk) {
                    columns[i2] = self.table + '.' + columns[i2];
                }
            }

            for (var i in where) {
                if (typeof where[i] == 'object') {
                    var fields = where[i];
                    for (var j in fields) {
                        tmpWhere[i + '.' + j] = fields[j];
                    }
                } else {
                    tmpWhere[self.table + '.' + i] = where[i];
                }
            }
            where = tmpWhere;
            sql = "SELECT " + columns.join(', ') + " FROM " + self.table;
            sql += extTablesOn.join('');
        } else {

            for (var i in where) {
                if (typeof where[i] !== 'object') {
                    tmpWhere[i] = where[i];
                }
            }
            where = tmpWhere;
        }
        // Общее для всех
        sql += ' WHERE ';
        var whereString = conn.where(where);
        if (whereString !== '') {
            sql += whereString;
        }
        if (!deleted) {
            if (whereString !== '') {
                sql += ' AND';
            }
            sql += " (" + self.table + ".deleted IS NULL OR " + self.table + ".deleted >'" + funcs.getDataTimeMySQL() + "')"
        }
        if (sort) {
            var sortColumns = [];

            function prepareSort(obj) {
                sortColumns.push((obj.table || self.table) + '.' + obj.column + ' ' + (obj.direction || 'DESC'));
            }

            if (typeof sort == 'object') {
                if (sort.length) {
                    for (var i in sort) {
                        if (typeof sort[i] == 'object') {
                            prepareSort(sort(i));
                        } else {
                            prepareSort({column: sort});
                        }
                    }
                } else {
                    prepareSort(sort);
                }
            } else {
                prepareSort({column: sort});
            }

            sql += ' ORDER BY ' + sortColumns.join(', ');
        }
        if (limit) {
            sql += ' LIMIT ' + limit;
        }

        console.log(sql);
        conn.query(sql, [], function (err, rows) {
            conn.release();
            if (!err) {
                for (var i in rows) {
                    for (var j in self.blob_fields) {
                        if (rows[i][self.blob_fields[j]] === null) {
                            rows[i][self.blob_fields[j]] = '';
                        }
                        try {
                            rows[i][self.blob_fields[j]] = rows[i][self.blob_fields[j]].toString();
                        } catch (e) {
                            console.log(e);
                        }
                    }
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
};
Model.prototype.add = function (obj, callback) {
    var self = this;
    for (var i in this.required_fields) {
        var finded = false;
        for (var j in obj) {
            if (j == this.required_fields[i]) {
                finded = true;
                break;
            }
        }
        if (!finded) {
            return callback(new MyError('Не переданы обязательные поля. ' + this.required_fields.join(', ')));
        }
    }
    var addToModel = function (conn, callback) {
        obj.created = funcs.getDataTimeMySQL();
        conn.insert(self.table, obj, function (err, recordId) {
            conn.release();
            callback(err, recordId);
        });
    };
    async.waterfall([
        pool.getConn,
        addToModel
    ], function (err, results) {
        if (err) {
            return callback(err);
        }
        var obj = funcs.formatResponse(0, 'success', self.table_ru + ' успешно добавлен' + self.ending + '.', {id: results});
        return callback(null, obj);
    });
};
Model.prototype.modify = function (obj, callback) {
    var self = this;
    for (var i in self.not_editable) {
        delete obj[self.not_editable[i]];
    }
    var modifyModel = function (conn, callback) {
        if (!obj.id) {
            return callback(new MyError('Не передано ключевое поле. id,'+self.required_fields.join(',')));
        }
        conn.update(self.table, obj, function (err, affected) {
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
            callback(null, funcs.formatResponse(1, 'error', 'Запись не найдена.'))
        } else {
            callback(null, funcs.formatResponse(0, 'success', self.table_ru + ' успешно изменен' + self.ending + ''))
        }
    });
};
Model.prototype.remove = function (obj, callback) {
    var self = this;
    var removeModel = function (conn, callback) {
        conn.delete(self.table, {id: obj.id}, function (err, affected) {
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
            callback(null, funcs.formatResponse(0, 'success', self.table_ru + ' успешно удален' + self.ending + ''))
        }
    });
};


module.exports = Model;