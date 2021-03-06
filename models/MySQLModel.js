var async = require('async');
var MyError = require('../error').MyError;
var UserError = require('../error').UserError;

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
    this.validationFormats = {
        notNull:{
            format:'<значение>',
            example:'строка, число, дата...'
        },
        number:{
            format:'<число>',
            example:'10'
        },
        url:{
            format:'<Протокол>://<адрес>',
            example:'http://example.ru'
        },
        email:{
            format:'<Имя>@<домен>',
            example:'user@example.ru'
        }
    };
    this.beforeFunction = {
        get:function(obj,callback){
            callback(null,null);
        },
        add:function(obj,callback){
            callback(null,null);
        },
        modify:function(obj,callback){
            callback(null,null);
        },
        remove:function(obj,callback){
            callback(null,null);
        }
    };
    this.allowedForUserCommand = params.allowedForUserCommand || [];
    this.excludeForUserColumns = params.excludeForUserColumns;
    this.getFormating = params.getFormating || {};
    this.setFormating = params.setFormating || {};
    this.table = params.table;
    this.table_ru = params.table_ru || 'Объект';
    this.ending = params.ending || ''; // 'о' 'а'
    this.published = params.published;
    this.required_fields = (typeof params.required_fields === 'object') ? params.required_fields : [];
    this.not_editable = (typeof params.not_editable === 'object') ? params.not_editable : ['created'];
    if (this.not_editable.indexOf('created') == -1) {
        this.not_editable.push('created');
    }
    this.blob_fields = (typeof params.blob_fields === 'object') ? params.blob_fields : [];
    this.defaults = (typeof params.defaults === 'object') ? params.blob_fields : [];
    this.join_objs = (typeof params.join_objs === 'object') ? params.join_objs : false;
    this.concatFields = params.concatFields || [];
    this.where = params.where;
    this.sort = params.sort;
    this.validation = params.validation;
    this.distinct = params.distinct;
    self.columns = params.additionalColumns || [];
    pool.getConn(function (err, conn) {
        if (err) {
            return callback(err);
        }
        /* SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_NAME='Laptop' AND
         COLUMN_NAME NOT IN ('code');*/
        conn.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME=?", [self.table], function (err, rows) {
            conn.release();
            if (err) {
                callback(err);
            } else {

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
        var where = params.where || self.where || {};
        var limit = params.limit || 1000;
        var sort = params.sort || (self.sort) ? funcs.cloneObj(self.sort) : {column:'id',direction:'ASC'};
        var deleted = !!params.deleted;

        var published = params.published;
        var distinct = (self.distinct)? ' DISTINCT ' : '';
        var columns = params.columns || funcs.cloneObj(self.columns);
        var sqlStart = "SELECT " +distinct+ columns.join(', ') + " FROM " + self.table;
        var sql = "";


        var joinObjs = funcs.cloneObj(self.join_objs);
        var concatFields = self.concatFields.concat((params.concatFields || []));

        var tmpWhere = {};

        /// Только в случае если нужно джоинить таблицы
        if (joinObjs) {
            var extTablesOn = [];
            for (var c in joinObjs) {
                var
                    oneJoinObj = joinObjs[c];
                for (var i in oneJoinObj) {
                    if (columns.indexOf(i) == -1) {
                        continue;
                    }
                    extTablesOn.push(' LEFT JOIN ' + oneJoinObj[i].table + ' ON ' +
                    (oneJoinObj[i].joinTable || self.table) + '.' + i + ' = ' + oneJoinObj[i].table + '.id');
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

            //var w = {
            //    action_types:{
            //        action_id:5
            //    }
            //};
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
            sqlStart = "SELECT " + distinct + columns.join(', ') + " FROM " + self.table;
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
            sql += " (" + self.table + ".deleted IS NULL OR " + self.table + ".deleted >'" + funcs.getDateTimeMySQL() + "')"
        }
        if (published) {
            if (whereString !== '' || !deleted) {
                sql += ' AND';
            }
            published = (published===true)? funcs.getDateTimeMySQL() : published;
            sql += " (" + self.table + ".published IS NOT NULL AND " + self.table + ".published <'" + published + "')"
        }
        if (sort) {
            var sortColumns = [];

            function prepareSort(obj) {
                sortColumns.push((obj.table || self.table) + '.' + obj.column + ' ' + (obj.direction || 'ASC'));
            }

            if (typeof sort == 'object') {
                if (sort.length) {
                    for (var i in sort) {
                        if (typeof sort[i] == 'object') {
                            prepareSort(sort[i]);
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
        var countSQL = "SELECT COUNT(*) FROM "+self.table + sql;
        conn.queryValue(countSQL,[],function(err,count){
            conn.release();
            pool.getConn(function(err,conn){
                if (err){
                    return callback(err);
                }
                if (limit) {
                    sql += ' LIMIT ' + limit;
                }
                var realSQL = sqlStart+sql;
                console.log(realSQL);
                conn.query(realSQL, [], function (err, rows) {
                    conn.release();
                    if (err){
                        console.log(err);
                        return callback(err);
                    }
                    for (var i in rows) {
                        for (var k in rows[i]) {
                            if (rows[i][k] === null) {
                                rows[i][k] = '';
                            }
                        }

                        for (var j in self.getFormating) {
                            var val = rows[i][j];
                            try {
                                rows[i][j] = funcs[self.getFormating[j]](rows[i][j]);
                            } catch (e) {
                                console.log(e);
                                rows[i][j] = val;
                            }
                        }
                        if (typeof concatFields=='object'){
                            for (var c in concatFields) {
                                var item = concatFields[c];
                                var val = '';
                                for (var j in item) {
                                    var fields = item[j];
                                    for (var k in fields) {
                                        val += (rows[i][fields[k]]!=undefined)? rows[i][fields[k]]:fields[k];
                                    }
                                    rows[i][j] = val;
                                }

                            }
                        }
                    }
                    rows.count = count;
                    callback(null, rows);
                });
            })
        });

    };

    async.waterfall([
        function(callback){
            for (var i in self.setFormating) {
                if (typeof funcs[self.setFormating[i]]=='function'){
                    if (params[i]){
                        params[i] = funcs[self.setFormating[i]](params[i]);
                    }
                }
            }
            self.beforeFunction['get'](params,function(err){
                if (err){
                    return callback(new MyError('Ошибка выполнения beforeFunction'));
                }
                return callback(null);
            });
        },
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

    var addToModel = function (conn, callback) {
        obj.created = funcs.getDateTimeMySQL();
        conn.insert(self.table, obj, function (err, recordId) {
            conn.release();
            if (err){
                console.log(err);
            }
            callback(err, recordId);
        });
    };
    async.waterfall([
        function(callback){
            for (var i in self.setFormating) {
                if (typeof funcs[self.setFormating[i]]=='function'){
                    if (obj[i]){
                        obj[i] = funcs[self.setFormating[i]](obj[i]);
                    }
                }
            }
            self.beforeFunction['add'](obj,function(err){
                if (err){
                    return callback(new MyError('Ошибка выполнения beforeFunction'));
                }
                for (var i in self.required_fields) {
                    var finded = false;
                    for (var j in obj) {
                        if (j == self.required_fields[i]) {
                            finded = true;
                            break;
                        }
                    }
                    if (!finded) {
                        return callback(new MyError('Не переданы обязательные поля. ' + self.required_fields.join(', ')));
                    }
                }
                var valid = self.validate(obj);
                if (typeof valid=='object'){
                    return callback(new UserError(funcs.formatResponse(-1, 'error', valid.message, valid.fields)));
                }
                return callback(null);
            });
        },
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

    var modifyModel = function (conn, callback) {
        if (!obj.id) {
            return callback(new MyError('Не передано ключевое поле. id'));
        }
        //console.log(conn.where(obj));
        conn.update(self.table, obj, function (err, affected) {
            conn.release();
            if (err){
                console.log(err);
            }
            callback(err, affected);
        })
    };
    async.waterfall([
        function(callback){
            for (var i in self.setFormating) {
                if (typeof funcs[self.setFormating[i]]=='function'){
                    if (obj[i]){
                        obj[i] = funcs[self.setFormating[i]](obj[i]);
                    }
                }
            }
            self.beforeFunction['modify'](obj,function(err){
                if (err){
                    return callback(new MyError('Ошибка выполнения beforeFunction'));
                }
                for (var i in self.not_editable) {
                    delete obj[self.not_editable[i]];
                }
                var valid = self.validate(obj);
                if (typeof valid=='object'){
                    return callback(new UserError(funcs.formatResponse(-1, 'error', valid.message, valid.fields)));
                }
                return callback(null);
            });
        },
        pool.getConn,
        modifyModel
    ], function (err, results) {
        if (err) {
            return callback(err);
        }
        if (results == 0) {
            callback(null, funcs.formatResponse(1, 'error', 'Запись не найдена или не было изменений.'))
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
            if (err){
                console.log(err);
            }
            callback(err, affected);
        })
    };
    async.waterfall([
        function(callback){
            for (var i in self.setFormating) {
                if (typeof funcs[self.setFormating[i]]=='function'){
                    if (obj[i]){
                        obj[i] = funcs[self.setFormating[i]](obj[i]);
                    }
                }
            }
            self.beforeFunction['remove'](obj,function(err){
                if (err){
                    return callback(new MyError('Ошибка выполнения beforeFunction'));
                }
                return callback(null);
            });
        },
        pool.getConn,
        removeModel
    ], function (err, results) {
        if (err) {
            return callback(err);
        }
        if (results == 0) {
            callback(null, funcs.formatResponse(1, 'error', 'Запись не найдена.'))
        } else {
            callback(null, funcs.formatResponse(0, 'success', self.table_ru + ' успешно удален' + self.ending + ''))
        }
    });
};
Model.prototype.getDirectoryId = function(table, sys_name, callback){
    async.waterfall([
        pool.getConn,
        function(conn,callback){
            conn.queryValue("select id from ?? where sys_name = ?",[table,sys_name],function(err, id){
                conn.release();
                callback(err, id);
            });
        }
    ], function (err, id) {
        if (err){
            return callback(err);
        }
        callback(null, id);
    });
};
Model.prototype.getDirectoryValue = function(table, id, callback){
    async.waterfall([
        pool.getConn,
        function(conn,callback){
            conn.queryValue("select sys_name from ?? where id = ?",[table,id],function(err, id){
                conn.release();
                callback(err, id);
            });
        }
    ], function (err, id) {
        if (err){
            return callback(err);
        }
        callback(null, id);
    });
};

Model.prototype.validate = function(obj){
    var self = this;
    var not_valid = [];
    for (var field in self.validation) {
        if (self.columns.indexOf(field)==-1){
            continue;
        }
        var valFunc = self.validation[field];
        if (obj[field]===undefined || typeof funcs.validation[valFunc]!='function'){
            continue;
        }
        if (!funcs.validation[valFunc](obj[field])){
            not_valid.push({
                field:field,
                format:self.validationFormats[valFunc] || ''
            });
        }
    }
    if (not_valid.length>0){
        var o = {
            message:'Одно или несколько полей имеет не верный формат',
            fields:not_valid
        };
        return o;
    }else{
        return true;
    }
};

module.exports = Model;