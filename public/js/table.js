(function(){

    CF = CF || {};

    CF.directories = {
        columnNames: {
            action_id: 'ID Мероприятия',
            action_part: "Этап",
            action_part_id: "ID Этапа мероприятия",
            action_title: "Мероприятие",
            concat_result: "Результат",
            created: "Дата создания",
            deleted: "Удален",
            id: "ID",
            isAff: "Сдан в аффилиате",
            judge_result_approach: "Судья: Подходы",
            judge_result_min: "Судья: минут",
            judge_result_repeat: "Судья: Повторы",
            judge_result_sec: "Судья: Секунды",
            published: "Опубликовано",
            result_approach: "Подходы",
            result_min: "Минут",
            result_repeat: "Повторы",
            result_sec: "Секунды",
            result_type: "Тип результата",
            result_type_id: "ID Типа результата",
            status_id: "ID Статуса",
            status_name: "Статус",
            status_name_sys: "Статус SYS",
            user_firstname: "Имя",
            user_id: "ID Пользователя",
            user_surname: "Фамилия",
            video_url: "Ссылка на видео"
        }
    };

    CF.Tables = function(){
        this.items = [];
    };

    CF.Tables.prototype.getItem = function(id){
        for(var i in this.items){
            if(this.items[i].id == id){
                return id;
            }
        }
    };

    CF.Tables.prototype.addItem = function(item){
        this.items.push(item);
    };

    CF.Tables.prototype.removeItem = function(id){
        for(var i in this.items){
            if(this.items[i].id == id){
                this.items.splice(i,1);
            }
        }
    };

    CF.TablesList = new CF.Tables();

    CF.Table = function(p){
        this.id =               p.id || CF.guid();
        this.wrapper =          p.wrapper || undefined;
        this.where =            p.where || {};
        this.defaultWhere =     p.defaultWhere || {};
        this.getObject =        p.getObject || undefined;
        this.limit =            p.limit || 20;
        this.perPage =          p.perPage || 20;
        this.sort =             p.sort || '';
        this.columns =          p.columns || '';
        this.visible_columns =  p.visible_columns || [];
        this.goToObject =       p.goToObject || '';
        this.primaryKey =       p.primaryKey || undefined;
        this.filters =          p.filters || [];
        this.tempPage =         1;
        this.specialColumns =   p.specialColumns || [];
        this.isLeaderBoard =    p.isLeaderBoard || false;
    };

    CF.Table.prototype.init = function(){
        var _t = this;
        _t.getData(function(){
            _t.render(function(){
                _t.setHandlers();
                _t.renderFilters();
                _t.initFilters();
            });

            CF.TablesList.addItem(_t);
        });
    };

    CF.Table.prototype.getData = function(cb){
        var _t = this;

        if(_t.isLeaderBoard){
            _t.totalCount = 3;
            _t.data = [
                {
                    position: 1,
                    user: 'adsasd',
                    part_1: '1(1(2:2))',
                    part_2: '1(1(2:2))',
                    part_3: '1(1(2:2))'
                },
                {
                    position: 2,
                    user: 'f fsd adsasd',
                    part_1: '1(1(2:2))',
                    part_2: '1(1(2:2))',
                    part_3: '1(1(2:2))'
                },
                {
                    position: 3,
                    user: 'g gfp d[f',
                    part_1: '1(1(2:2))',
                    part_2: '1(1(2:2))',
                    part_3: '1(1(2:2))'
                }
            ];
            _t.columns = [
                {
                    title: 'part1',
                    sort_id: '1'
                },
                {
                    title: 'part2',
                    sort_id: '2'
                },
                {
                    title: 'part3',
                    sort_id: '3'
                }
            ];

            if(typeof cb == 'function'){
                cb();
            }
            return;
        }

        var o = {
            command: 'get',
            object: _t.getObject,
            params: {
                where: _t.where,
                limit: _t.limit,
                sort: _t.sort,
                columns: _t.columns
            }
        };

        sendQuery(o, function(res){
            if(_t.isLeaderBoard){
                _t.totalCount = res.totalCount;
                _t.data = res.data;
                _t.columns = res.columns;
            }else{
                _t.totalCount = res.totalCount;
                _t.data = res.data;
            }

            if(typeof cb == 'function'){
                cb();
            }
        });

    };

    CF.Table.prototype.getColumnName = function(column){
        return CF.directories.columnNames[column];
    };

    CF.Table.prototype.checkSpecial = function(column){
        var _t = this;

        for(var i in _t.specialColumns){
            var c = _t.specialColumns[i];
            if(c.column == column){
                return true;
            }
        }
        return false;
        //return _t.specialColumns.indexOf(column) >= 0;
    };

    CF.Table.prototype.checkVisibility = function(column){
        var _t = this;
        return _t.visible_columns.indexOf(column) >= 0;
    };

    CF.Table.prototype.getPrimaryKey = function(row){
        var _t = this;
        var pk = _t.primaryKey;
        for(var i in row){
            if(i == pk){
                return row[i];
            }
        }
    };

    CF.Table.prototype.renderFilters = function(){
        var _t = this;
        _t.wrapper.find('.filterContainer').remove();
        if(_t.filters.length == 0){
            return;
        }
        var html = '<div class="filterContainer"><div class="row"><div class="filters-wrapper"></div><div class=""><div class="confirm-filter filterBtn fa fa-check"></div><div class="clear-filter filterBtn fa fa-ban"></div></div></div></div>';
        _t.wrapper.prepend(html);
    };

    CF.Table.prototype.render = function(cb){
        var _t = this;

        if(_t.isLeaderBoard){
            _t.renderLeaderBoard();
            if(typeof cb == 'function'){
                cb();
            }
            return;
        }

        var prev = (_t.tempPage > 1)? '<li><a href="#" aria-label="Previous" class="prev"><span aria-hidden="true">&laquo;</span></a></li>' : '';
        var next = (_t.totalCount > _t.tempPage * _t.perPage)? '<li><a href="#" aria-label="Next" class="next"><span aria-hidden="true">&raquo;</span></a></li>' : '';
        var page = (_t.totalCount > _t.tempPage * _t.perPage)? '<li><a href="#" data-page="{{pageNo}}" class="page">{{pageNo}}</a></li>' : '';

        var tpl = '<div class="refresh_table fa fa-refresh"></div><table class="table simpleView">' +
                    '<thead>' +
                    '<tr>{{#columns}}' +
                    '<th data-column="{{column}}">{{column_ru}}</th>{{/columns}}' +
                    '</tr>' +
                    '</thead>' +
                    '<tbody>{{#rows}}' +
                    '<tr data-id="{{id}}">{{#tds}}' +
                    '<td>{{{value}}}</td>{{/tds}}' +
                    '</tr>{{/rows}}' +
                    '</tbody>' +
                    '</table>' +
                    '<nav>'+
                        '<ul class="pagination">'+
                            prev+
                            '{{#pages}}'+
                                page +
                            '{{/pages}}'+
                            next+
                        '</ul>'+
                    '</nav>';

        var mO = {
            columns: [
                {
                    column: '#',
                    column_ru: '#'
                }
            ],
            rows: [],
            pages: [
                {
                    pageNo: _t.tempPage
                }
            ]
        };
        for(var i in _t.data[0]){
            var item = _t.data[0][i];
            if(_t.checkVisibility(i)){
                mO.columns.push({
                    column: i,
                    column_ru: _t.getColumnName(i)
                });
            }
        }

        var idx = 0;
        for(var k in _t.data){
            var item = _t.data[k];
            mO.rows.push({
                tds: [
                    {
                        value: idx+1
                    }
                ]
            });

            for(var j in item){
                var jtem = item[j];
                if(_t.checkVisibility(j)) {
                    if(_t.checkSpecial(j)){
                        mO.rows[idx].id = _t.getPrimaryKey(item);
                        mO.rows[idx].tds.push({
                            value: '<a target="_blank" href="'+jtem+'"><i class="fa fa-video-camera"></i></a>'
                        });
                    }else{
                        mO.rows[idx].id = _t.getPrimaryKey(item);
                        mO.rows[idx].tds.push({
                            value: jtem
                        });
                    }
                }
            }

            idx++;
        }
        _t.wrapper.find('table.table.simpleView').remove();
        _t.wrapper.find('nav').remove();
        _t.wrapper.find('.no_results').remove();
        _t.wrapper.append(Mustache.to_html(tpl, mO));

        if(_t.data.length == 0){
            _t.wrapper.append('<div class="no_results">Результатов нет, пока.</div>');
        }
        if(typeof cb == 'function'){
            cb();
        }
    };

    CF.Table.prototype.renderLeaderBoard = function(){
        var _t = this;
        var tpl = '<div class="refresh_table fa fa-refresh"></div><table class="table simpleView">' +
                    '<thead>' +
                    '<tr>{{#columns}}' +
                    '<th data-column="{{sort_id}}">{{title}}</th>{{/columns}}' +
                    '</tr>' +
                    '</thead>' +
                    '<tbody>' +
                        '{{#rows}}' +
                            '<tr data-id="{{id}}">' +
                                '{{#tds}}' +
                                    '<td>{{{value}}}</td>' +
                                '{{/tds}}' +
                            '</tr>' +
                        '{{/rows}}' +
                    '</tbody>' +
                    '</table>' ;

        var rows = [];
        for(var i in _t.data){
            var it = _t.data[i];
            rows.push([]);
            for(var k in it){
                rows[i].push({
                    id: k,
                    tds:[]
                });
            }
        }

        for(var i in _t.data){
            var it = _t.data[i];
            for(var k in it){
                console.log(rows[i]);
            }
        }

        console.log('ROWS', rows);
        var mO = {
            columns: _t.columns,
            rows: rows
        };

        _t.wrapper.html(Mustache.to_html(tpl, mO));
    };

    CF.Table.prototype.setHandlers = function(){
        var _t = this;
        _t.wrapper.find('tbody tr').off('click').on('click', function(){
            var id = $(this).data('id');
            if(_t.goToObject != ''){
                window.open(_t.goToObject+'?'+_t.primaryKey+'='+id , '_blank');
            }

        });

        var refresh = _t.wrapper.find('.refresh_table');
        var paginationWrapper = _t.wrapper.find('.pagination');
        var pages = paginationWrapper.find('a.page');
        var prev = paginationWrapper.find('a.prev');
        var next = paginationWrapper.find('a.next');

        next.off('click').on('click', function(){
            _t.limit = _t.tempPage*_t.perPage+','+_t.perPage;

            _t.getData(function(){
                _t.tempPage = _t.tempPage + 1;
                _t.render(function(){
                    _t.setHandlers();
                });
            });
        });
        prev.off('click').on('click', function(){
            _t.limit = (_t.tempPage -2)*_t.perPage+','+_t.perPage;

            _t.getData(function(){
                _t.tempPage = _t.tempPage - 1;
                _t.render(function(){
                    _t.setHandlers();
                });
            });

        });

        refresh.off('click').on('click', function(){
            _t.getData(function(){
                _t.render(function(){
                    _t.setHandlers();
                });
            });
        });
    };

    CF.Table.prototype.initFilters = function(){
        var _t = this;
        var filterWrapper = _t.wrapper.find('.filters-wrapper');
        for(var i in _t.filters){
            var filter = _t.filters[i];
            var html = '';
            if(filter.type == 'like'){
                html = '<div class="col-md-3"><label>'+filter.label+'</label><input type="text" data-where_type="'+filter.whereType+'" data-where_table="'+filter.whereTable+'" class="tableFilter form-control" data-filter_type="like" data-column="'+filter.column+'"/></div>';
            }else if(filter.type == 'select'){
                html = '<div class="col-md-3"><label>'+filter.label+'</label><input type="hidden" data-where_type="'+filter.whereType+'" data-where_table="'+filter.whereTable+'" data-return_id="'+filter.returnId+'" data-return_name="'+filter.returnName+'" class="tableFilter form-control select2" data-text="" data-filter_type="select" data-name="'+filter.column+'" data-server_name="'+filter.returnName+'" data-table="'+filter.tableName+'" data-column="'+filter.column+'"/></div>';
            }
            filterWrapper.append(html);
        }
        filterWrapper.find('input.select2[type="hidden"]').each(function(idx, elem){
            var $elem = $(elem);
            var name = $elem.data('server_name');
            var returnId = $elem.data('return_id');
            var returnName = $elem.data('return_name');
            var whereType = $elem.data('where_type');
            var whereTable = $elem.data('where_table');
            $elem.select2({
                query: function(query){
                    var data = {results: []};


                    var o = {
                        command: 'get',
                        object: $elem.data('table'),
                        params: {
                            where: {},
                            limit: 100
                        }
                    };
                    if(query.term.length > 0){
                        o.params.where[name] = '*'+query.term+'*';
                    }

                    sendQuery(o, function(res){
                        for(var i in res.data){
                            var item = res.data[i];
                            data.results.push({
                                id: item[returnId],
                                text: item[returnName]
                            });
                        }
                        query.callback(data);
                    });
                },
                initSelection: function(element, callback){
                    var data = {id: element.val(), text: $(element).data('text')};
                    callback(data);
                }
            });
            $elem.off('change').on('change', function(){
                if(whereType == 'external'){
                    if(!_t.where[whereTable]){
                        _t.where[whereTable] = {};
                    }
                    _t.where[whereTable][$elem.data('column')] = $elem.select2('data').id;
                }else{
                    _t.where[$elem.data('column')] = $elem.select2('data').id;
                }
            });
        });

        filterWrapper.find('input.tableFilter[type="text"][data-filter_type="like"]').off('input').on('input', function(){
            var whereType = $(this).data('where_type');
            var whereTable = $(this).data('where_table');
            if(whereType == 'external'){
                if(!_t.where[whereTable]){
                    _t.where[whereTable] = {};
                }
                _t.where[whereTable][$(this).data('column')] = '*'+$(this).val()+'*';
            }else{
                _t.where[$(this).data('column')] = '*'+$(this).val()+'*';
            }


        });

        _t.wrapper.find('.confirm-filter').off('click').on('click', function(){
            _t.getData(function(){
                _t.render(function(){
                    _t.setHandlers();
                });
            });
        });

        _t.wrapper.find('.clear-filter').off('click').on('click', function(){
            _t.where = CF.cloneObj(_t.defaultWhere);

            console.log(_t.where);

            _t.getData(function(){
                _t.render(function(){
                    _t.setHandlers();
                    _t.renderFilters();
                    _t.initFilters();
                });
            });
        });
    };


}());
