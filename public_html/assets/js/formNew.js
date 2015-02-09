(function(){
    MB = MB || {};
    MB.FormsConstructor = function(){
        this.forms = [];
    };
    MB.Forms = new MB.FormsConstructor();

    MB.FormN = function(params){

        console.log('New form init', params);

        this.id = params.id || MB.Core.guid();
        this.data = undefined;
        this.name = params.name || 'unnamed';
        this.type = params.type;
        this.activeId = params.ids[0];
        this.modalId = undefined;
        this.position = params.position || 'fullscreen';
        this.changes = [];
        this.tblInstances = [];
        this.params = params.params || {};
    };

    MB.FormsConstructor.prototype.addForm = function(form){
        this.forms.push(form);
    };

    MB.FormsConstructor.prototype.getForm = function(name, id){
        var _t = this;
        for(var i in _t.forms){
            var form = _t.forms[i];
            if(form.id == id && form.name == name){
                return form;
            }
        }
    };

    MB.FormsConstructor.prototype.removeForm = function(id){
        var _t = this;
        for(var i in _t.forms){
            var form = _t.forms[i];
            if(form.id == id){
                this.forms.splice(i, 1);
            }
        }
    };


    MB.FormN.prototype.getProfile = function(name, callback){
        var _t = this;
        if(this.name === 'unnamed'){
            console.warn('form without name');
            return false;
        }else{
            if(localStorage.getItem('formN_'+name) !== null){
                _t.profile = JSON.parse(localStorage.getItem('formN_'+name));
                if(typeof callback == 'function'){
                    callback();
                }
            }else{
                var o = {
                    command: 'get',
                    object: 'user_profile',
                    client_object: name
                };



                MB.Core.sendQuery(o, function(r){
                    _t.profile = r;
                    localStorage.setItem('formN_'+name, JSON.stringify(r));
                    if(typeof callback == 'function'){
                        callback();
                    }
                });
            }
        }
    };

    MB.FormN.prototype.getData = function(callback){
        var _t = this;

        if(_t.activeId === 'new'){
            _t.data = 'new';
            _t.wasNew = true;
            if(_t.profile['OBJECT_PROFILE']['CHILD_CLIENT_OBJECT'].length != ''){
                _t.data = 'new';
                if(typeof callback == 'function'){
                    callback();
                }

//
//                var no = {
//                    command: 'new',
//                    object: _t.profile['OBJECT_PROFILE']['OBJECT_COMMAND']
//                };
//                socketQuery(no, function(res){
//                    res = JSON.parse(res);
//                    res = res['results'][0];
//
//                    if( res['code'] != 0){
//                        _t.data = 'new';
//                        _t.activeId = 'new';
//                        if(typeof callback == 'function'){
//                            callback();
//                        }
//                    }else{
//                        _t.activeId = res.id;
//
//                        var o = {
//                            command: 'get',
//                            object: _t.profile['OBJECT_PROFILE']['GET_OBJECT_COMMAND'],
//                            sid: MB.User.sid,
//                            params: {
//                                where: _t.profile['OBJECT_PROFILE']['PRIMARY_KEY']+' = '+_t.activeId
//                            }
//                        };
//                        MB.Core.sendQuery(o, function(r){
//                            _t.data = r;
//                            if(typeof callback == 'function'){
//                                callback();
//                            }
//                        });
//                    }
//
//
//                });
            }else{
                _t.data = 'new';
                if(typeof callback == 'function'){
                    callback();
                }
            }

        }else{
            var activeIdStr = (isNaN(+_t.activeId))? "'"+_t.activeId +"'": _t.activeId;

            var o = {
                command: 'get',
                object: _t.profile['OBJECT_PROFILE']['GET_OBJECT_COMMAND'],
                sid: MB.User.sid,
                params: {
                    where: _t.profile['OBJECT_PROFILE']['PRIMARY_KEY']+' = '+activeIdStr
                }
            };
            MB.Core.sendQuery(o, function(r){
                _t.data = r;
                console.log('asdasdsa', _t.profile, o, r);
                if(typeof callback == 'function'){
                    callback();
                }
            });
        }

    };

    MB.FormN.prototype.create = function(callback){
        var _t = this;
        _t.getProfile(_t.name, function(){
            _t.getData(function(){
                //console.log('DATA READY', _t.data);
                _t.getTemplate(function(){
                    _t.createContent(function(){
                        _t.createChildTables('', function(){
                            _t.initControllers(function(){
                                MB.Forms.addForm(_t);
                                _t.getScript(function(){
                                    _t.populateLowerButtons();
                                    _t.setHandlers(function(){
                                        if(typeof callback == 'function'){
                                            callback(_t);
                                        }
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    };

    MB.FormN.prototype.populateFieldByName = function(fieldName){
        var _t = this;
        var profileNames = _t.profile.NAMES;

        if(_t.activeId !== 'new'){
            var dataNames = _t.data.NAMES;
        }

        var field = {};
        field.profile = {};
        field.profile.DATA = [];
        for(var i in _t.profile.DATA){
            var item = _t.profile.DATA[i];
            if(item[profileNames.indexOf('COLUMN_NAME')] == fieldName){
                field.profile.DATA.push(item);
                break;
            }
        }

        if(_t.activeId !== 'new'){
            field.value = _t.data.DATA[0][dataNames.indexOf(fieldName)];
            field.selValue = _t.data.DATA[0][dataNames.indexOf(field.profile.DATA[0][profileNames.indexOf('LOV_COLUMNS')].split(',')[0])];
        }else{
            field.value = '';
            field.selValue = '';
        }

        field.name = fieldName;
        return field;
    };

    MB.FormN.prototype.initControllers = function(callback){
        var _t = this;
        for(var i in _t.fields){
            var f = _t.fields[i];
            var profData = f.profile.DATA[0];
            var type = profData[_t.profile.NAMES.indexOf('TYPE_OF_EDITOR')];

            if($('#mw-'+_t.modalId).find('.fn-field[data-column="'+ f.name+'"]').length > 0){

                var parent = $('#mw-'+_t.modalId).find('.fn-field[data-column="'+ f.name+'"]');
                var checkboxWrapper = parent.find('.checkbox-wrapper');
                var selectWrapper = parent.find('.fn-select3-wrapper');

                var queryObject =           f.profile.DATA[0][_t.profile.NAMES.indexOf('LOV_COMMAND')];
                var forSelectId =           f.profile.DATA[0][_t.profile.NAMES.indexOf('LOV_COLUMNS')].split(',')[0];
                var forSelectName =         f.profile.DATA[0][_t.profile.NAMES.indexOf('LOV_COLUMNS')].split(',')[1];
                var forSelectViewName =     f.profile.DATA[0][_t.profile.NAMES.indexOf('REFERENCE_CLIENT_OBJECT')];
                var forSelectLovWhere =     f.profile.DATA[0][_t.profile.NAMES.indexOf('LOV_WHERE')];

                var selInstance = undefined;

                switch(type){
                    case 'text':
                        break;
                    case 'select2':
                        selInstance = MB.Core.select3.init({
                            id: MB.Core.guid(),
                            wrapper: selectWrapper,
                            getString: queryObject,
                            column_name: forSelectId,
                            view_name: forSelectViewName,
                            value: {
                                id: (f.selValue == '')? 'empty' : f.selValue,
                                name: (f.value == '')? '' : f.value
                            },
                            data: [],
                            fromServerIdString: forSelectId,
                            fromServerNameString: forSelectName,
                            searchKeyword: forSelectName,
                            withEmptyValue: false,
                            absolutePosition: true,
                            parentObject: _t,
                            dependWhere: (forSelectLovWhere.indexOf('[:') != -1)? forSelectLovWhere: '',
                            profile_column_name: f.name
                        });
                        break;
                    case 'select2withEmptyValue':
                        selInstance = MB.Core.select3.init({
                            id: MB.Core.guid(),
                            wrapper: selectWrapper,
                            getString: queryObject,
                            column_name: forSelectId,
                            view_name: forSelectViewName,
                            value: {
                                id: (f.selValue == '')? 'empty' : f.selValue,
                                name: (f.value == '')? '' : f.value
                            },
                            data: [],
                            fromServerIdString: forSelectId,
                            fromServerNameString: forSelectName,
                            searchKeyword: forSelectName,
                            withEmptyValue: true,
                            absolutePosition: true,
                            parentObject: _t,
                            dependWhere: (forSelectLovWhere.indexOf('[:') != -1)? forSelectLovWhere: '',
                            profile_column_name: f.name
                        });
                        break;
                    case 'select2FreeType':
                        selInstance = MB.Core.select3.init({
                            id: MB.Core.guid(),
                            wrapper: selectWrapper,
                            getString: queryObject,
                            column_name: forSelectId,
                            view_name: forSelectViewName,
                            value: {
                                id: (f.selValue == '')? 'empty' : f.selValue,
                                name: (f.value == '')? '' : f.value
                            },
                            data: [],
                            fromServerIdString: forSelectId,
                            fromServerNameString: forSelectName,
                            searchKeyword: forSelectName,
                            withEmptyValue: true,
                            freeType: true,
                            absolutePosition: true,
                            parentObject: _t,
                            dependWhere: (forSelectLovWhere.indexOf('[:') != -1)? forSelectLovWhere: '',
                            profile_column_name: f.name
                        });
                        break;
                    case 'checkbox':
                        checkboxWrapper.checkboxIt();
                        break;
                    default:
                        break;
                }

            }
        }

        if(typeof callback == 'function'){
            callback();
        }
    };

    MB.FormN.prototype.createField = function(field) {
        var _t = this;
        _t.fields.push(field);
        var html = '';
        var nameRu = field.profile.DATA[0][_t.profile.NAMES.indexOf('NAME')];
        var typeOfEditor = field.profile.DATA[0][_t.profile.NAMES.indexOf('TYPE_OF_EDITOR')];
        var required = (field.profile.DATA[0][_t.profile.NAMES.indexOf('REQUIRED')] == 'TRUE')? 'required': '';

        // set required by field LOV_RETURN_TO_COLUMN required value;
        var returnToColumnValue = (field.profile.DATA[0][_t.profile.NAMES.indexOf('LOV_RETURN_TO_COLUMN')] != "")? field.profile.DATA[0][_t.profile.NAMES.indexOf('LOV_RETURN_TO_COLUMN')] : field.profile.DATA[0][_t.profile.NAMES.indexOf('COLUMN_NAME')];
        if(returnToColumnValue != ""){
            for(var i in _t.profile.DATA){
                var fld = _t.profile.DATA[i];
                var cellName = fld[_t.profile.NAMES.indexOf('COLUMN_NAME')];
                if(returnToColumnValue == cellName){
                    if(fld[_t.profile.NAMES.indexOf('REQUIRED')] == 'TRUE'){
                        required = 'required';
                    }
                }
            }
        }

        var isVisible = field.profile.DATA[0][_t.profile.NAMES.indexOf('VISIBLE')] == 'TRUE';

        if(!isVisible){
            return html;
        }

        if(field.profile.DATA[0][_t.profile.NAMES.indexOf('EDITABLE')] == 'TRUE'){
            switch(typeOfEditor){
                case 'text':
                    html = '<div data-type="'+typeOfEditor+'" class="fn-field '+required+'" data-column="'+field.name+'"><label>'+nameRu+': <span class="required-star">*</span></label><input type="text" class="fn-control" data-column="'+field.name+'" value="'+field.value+'" /></div>';
                    break;
                case 'textarea':
                    html = '<div data-type="'+typeOfEditor+'" class="fn-field '+required+'" data-column="'+field.name+'"><label>'+nameRu+': <span class="required-star">*</span></label><textarea class="fn-control" data-column="'+field.name+'" value="'+field.value+'"></textarea></div>';
                    break;
                case 'checkbox':
                    var checkedClass = (field.value == 'TRUE')? 'checked': '';
                    html = '<div data-type="'+typeOfEditor+'" class="fn-field '+required+'" data-column="'+field.name+'"><div data-id="'+MB.Core.guid()+'" data-type="inline" class="fn-control checkbox-wrapper '+checkedClass+'" data-value="'+ field.value +'" data-column="'+field.name+'" ></div><label class="fn-checkbox-label">'+nameRu+' <span class="required-star">*</span></label></div>';
                    break;
                case 'select2':
                    html = '<div data-type="'+typeOfEditor+'" class="fn-field '+required+'" data-column="'+field.name+'"><label>'+nameRu+': <span class="required-star">*</span></label><div data-value="'+field.value+'" data-select-type="select2" data-column="'+field.name+'" class="fn-control fn-select3-wrapper"></div></div>';
                    break;
                case 'select2withEmptyValue':
                    html = '<div data-type="'+typeOfEditor+'" class="fn-field '+required+'" data-column="'+field.name+'"><label>'+nameRu+': <span class="required-star">*</span></label><div data-value="'+field.value+'" data-select-type="select2withEmptyValue" data-column="'+field.name+'" class="fn-control fn-select3-wrapper"></div></div>';
                    break;
                case 'select2FreeType':
                    html = '<div data-type="'+typeOfEditor+'" class="fn-field '+required+'" data-column="'+field.name+'"><label>'+nameRu+': <span class="required-star">*</span></label><div data-value="'+field.value+'" data-select-type="select2FreeType" data-column="'+field.name+'" class="fn-control fn-select3-wrapper"></div></div>';
                    break;
                case 'datetime':
                    html = '<div data-type="'+typeOfEditor+'" class="fn-field '+required+'" data-column="'+field.name+'"><label>'+nameRu+': <span class="required-star">*</span></label><input type="text" class="fn-control fn-datetime-wrapper" data-column="'+field.name+'" value="'+field.value+'" /></div>';
                    break;
                case 'colorpicker':
                    html = '<div data-type="'+typeOfEditor+'" class="fn-field '+required+'" data-column="'+field.name+'"><label>'+nameRu+': <span class="required-star">*</span></label><input type="text" class="fn-control fn-colorpicker-wrapper" data-column="'+field.name+'" value="'+field.value+'" /><div class="fn-colorpicker-state" style="background-color: '+field.value+'" ></div></div>';
                    break;
                case 'number':
                    html = '<div data-type="'+typeOfEditor+'" class="fn-field '+required+'" data-column="'+field.name+'"><label>'+nameRu+': <span class="required-star">*</span></label><input type="number" class="fn-control" data-column="'+field.name+'" value="'+field.value+'" /></div>';
                    break;
                default:
                    html = '<div data-type="'+typeOfEditor+'" class="fn-field '+required+'" data-column="'+field.name+'"><label>'+nameRu+': <span class="required-star">*</span></label><input type="text" class="fn-control" data-column="'+field.name+'" value="'+field.value+'" /></div>';
                    break;
            }
        }else{
            if(_t.activeId === 'new'){
                html = '';
            }else{
                html = '<div data-type="'+typeOfEditor+'" class="fn-field fn-readonly-field" data-column="'+field.name+'"><label>'+nameRu+':</label><div class="fn-readonly">'+field.value+'</div></div>';
            }
        }
        return html;

    };

    MB.FormN.prototype.getTemplate = function(callback){
        var _t = this;
        var url = "html/forms/" + _t.name + "_new/" + _t.name + ".html";
        var url2 = "html/forms/" + _t.name + "_new/" + _t.name + ".html";
        if(_t.activeId == 'new'){ //&& _t.profile['OBJECT_PROFILE']['CHILD_CLIENT_OBJECT'] != ''
            url = "html/forms/" + _t.name + "_new/" + _t.name +"_add"+ ".html";
        }else{
            url = "html/forms/" + _t.name + "_new/" + _t.name + ".html";
        }

        $.ajax({
            url:url,
            success: function(res, status, xhr){
                _t.template = res;
                if(typeof callback == 'function'){
                    callback();
                }
            },
            error: function(){
                $.ajax({
                    url:url2,
                    success: function(res, status, xhr){
                        _t.template = res;
                        if(typeof callback == 'function'){
                            callback();
                        }
                    }
                });
            }
        });
    };

    MB.FormN.prototype.getScript = function(callback){
        var _t = this;
        MB.Forms.justLoadedId = _t.id;
        if(_t.activeId == 'new' && _t.profile['OBJECT_PROFILE']['CHILD_CLIENT_OBJECT'] != ''){
            $.getScript( "html/forms/" + _t.name + "_new/" + _t.name +"_add" + ".js", function() {
                if(typeof callback == 'function'){
                    callback();
                }
            });
        }else{
            $.getScript( "html/forms/" + _t.name + "_new/" + _t.name + ".js", function() {
                if(typeof callback == 'function'){
                    callback();
                }
            });
        }

    };

    MB.FormN.prototype.createChildTables = function(name, callback){
        var _t = this;

        var childName = (name == '')? _t.profile['OBJECT_PROFILE']['CHILD_CLIENT_OBJECT']: name;

        var childObjectsWrapper = $('#mw-'+_t.modalId).find('.fn-child-objects-tabs-wrapper');
        var afterChildLoaded = $('#mw-'+_t.modalId).find('.afterChildLoaded');

        var tblInstances = [];

        var tabsTpl =   '<div class="tabsParent sc_tabulatorParent floated">'+
                            '<div class="tabsTogglersRow sc_tabulatorToggleRow">'+
                                '{{#tabs}}' +
                                '<div class="tabToggle sc_tabulatorToggler {{opened}}" dataitem="{{dataitem}}">'+
                                    '<span class="childObjectTabTitle" data-name="{{name}}" data-item="{{dataitem}}">{{{tab_title}}}</span>'+
                                '</div>'+
                                '{{/tabs}}' +
                            '</div>'+

                            '<div class="ddRow sc_tabulatorDDRow">'+
                                '{{#tabContents}}' +
                                '<div class="tabulatorDDItem noMinHeight noMaxHeight sc_tabulatorDDItem {{opened}}" dataitem="{{dataitem}}">'+
                                    '<div class="childObjectWrapper" data-item="{{dataitem}}"></div>'+
                                '</div>'+
                                '{{/tabContents}}' +
                            '</div>'+
                        '</div>';

        var singleTabTpl =   '<div class="tabsParent sc_tabulatorParent floated">'+
                                '<div class="ddRow sc_tabulatorDDRow">'+
                                '{{#tabContents}}' +
                                '<div class="tabulatorDDItem noMinHeight noMaxHeight sc_tabulatorDDItem {{opened}}" dataitem="{{dataitem}}">'+
                                '<div class="childObjectWrapper" data-item="{{dataitem}}"></div>'+
                                '</div>'+
                                '{{/tabContents}}' +
                                '</div>'+
                                '</div>';


        if(childName != ''){
            if(_t.activeId == 'new'){
                if(typeof callback == 'function'){
                    callback();
                }
                return;
            }
            var childsArr = childName.split(',');
            var childTbl = undefined;
            var mO = {
                tabs:[],
                tabContents: []
            };
            for(var i in childsArr){
                var chld = childsArr[i];

                childTbl = new MB.TableN({
                    id: MB.Core.guid(),
                    name: chld,
                    parentObject: _t,
                    parent_id: (_t.activeId == 'new')? 'new' : (isNaN(+_t.data.DATA[0][_t.data.NAMES.indexOf(_t.profile['OBJECT_PROFILE']['PRIMARY_KEY'])]))? "'" + _t.data.DATA[0][_t.data.NAMES.indexOf(_t.profile['OBJECT_PROFILE']['PRIMARY_KEY'])] + "'": _t.data.DATA[0][_t.data.NAMES.indexOf(_t.profile['OBJECT_PROFILE']['PRIMARY_KEY'])]
                });

                mO.tabs.push({
                    opened: (i == 0)? 'opened': '',
                    dataitem: i,
                    tab_title: '<i class="fa fa-spin fa-spinner"></i>',
                    name: chld
                });

                mO.tabContents.push({
                    opened: (i == 0)? 'opened': '',
                    dataitem: i
                });

                tblInstances.push(childTbl);
            }

            if(childsArr.length == 1){
                childObjectsWrapper.html(Mustache.to_html(singleTabTpl, mO));
            }else{
                childObjectsWrapper.html(Mustache.to_html(tabsTpl, mO));
            }



            uiTabs();
            var idx = 0;
            var tabsTitlesArr = [];
            var tabsTitlesWrappers = childObjectsWrapper.find('.childObjectTabTitle');

            var toCreateArray = [];

            function tryCallback(idx){
                if(idx == toCreateArray.length -1){
                    afterChildLoaded.animate({
                        opacity: 1
                    }, 500);
                    if(typeof callback == 'function'){
                        callback();
                        console.log('как будто бы отрисовал..');
                    }
                }
            }

            function syncCreateTables(item){
                var instance = item.instance;
                var wrapper = item.wrapper;
                var currIdx = parseInt(item.idx);

                instance.create(wrapper, function(tblInstance){
                    _t.tblInstances.push(tblInstance);
                    if(childsArr.length == 1){
                        tblInstance.ct_instance.wrapper.parents('.sc_tabulatorParent').find('.ct-environment-header').html(tblInstance.profile['OBJECT_PROFILE']['CLIENT_OBJECT_NAME']);
                    }else{
                        tblInstance.ct_instance.wrapper.parents('.sc_tabulatorParent').find('.childObjectTabTitle[data-name="'+tblInstance.name+'"]').html(tblInstance.profile['OBJECT_PROFILE']['CLIENT_OBJECT_NAME']);
                    }
                    for(var k in toCreateArray){
                        var t = toCreateArray[k];
                        if(t.idx == toCreateArray.length -1){
                            tryCallback(currIdx);
                        }else{
                            if(currIdx == toCreateArray[k].idx){
                                console.log('Go Go next', toCreateArray[0], toCreateArray[1], currIdx+1);
                                syncCreateTables(toCreateArray[currIdx+1]);
                            }
                        }
                    }
                });
            }


            for(var i in tblInstances){
                var inst = tblInstances[i];
                var instWrapper = childObjectsWrapper.find('.childObjectWrapper[data-item="'+i+'"]');
                var to = {
                    instance: inst,
                    wrapper: instWrapper,
                    idx: i
                };
                toCreateArray.push(to);
                if(idx == _t.tblInstances.length){
                    console.log(toCreateArray);
                    syncCreateTables(toCreateArray[0]);
                }
                idx++;
//
//                continue;
//
//                inst.create(instWrapper, function(tblInstance){
//                    _t.tblInstances.push(tblInstance);
//                    if(childsArr.length == 1){
//                        tblInstance.ct_instance.wrapper.parents('.sc_tabulatorParent').find('.ct-environment-header').html(tblInstance.profile['OBJECT_PROFILE']['CLIENT_OBJECT_NAME']);
//                    }else{
//                        tblInstance.ct_instance.wrapper.parents('.sc_tabulatorParent').find('.childObjectTabTitle[data-name="'+tblInstance.name+'"]').html(tblInstance.profile['OBJECT_PROFILE']['CLIENT_OBJECT_NAME']);
//                    }
//                    if(idx == _t.tblInstances.length){
//                        afterChildLoaded.animate({
//                            opacity: 1
//                        }, 500);
//                        if(typeof callback == 'function'){
//                            callback();
//                            console.log('как будто бы отрисовал..');
//                        }
//                    }
//                });
//                idx++;
            }
//            return;
//
//            var child = undefined;
//            var childWrapper = $('#mw-'+_t.modalId).find('.childObjectWrapper');
//
//
//            if(childName.length > 0){
//                child = new MB.TableN({
//                    id: MB.Core.guid(),
//                    name: childName,
//                    parentObject: _t,
//                    parent_id: _t.data.DATA[0][_t.data.NAMES.indexOf(_t.profile['OBJECT_PROFILE']['PRIMARY_KEY'])]
//                }).create(childWrapper, function(tblInstance){
//                        _t.tblInstance = tblInstance;
//                        afterChildLoaded.animate({
//                            opacity: 1
//                        }, 500);
//                        if(typeof callback == 'function'){
//                            callback();
//                            console.log('как будто бы отрисовал..');
//                        }
//                    });
//            }
        }else{
            if(typeof callback == 'function'){
                callback();
            }
        }
    };

    MB.FormN.prototype.insertNativeValues = function(html){
        var _t = this;
        var fieldsArr = [];
        var keywordsArr = [];

        function populateArrays(tpl){
            var start = tpl.indexOf('{+{');
            var end = tpl.indexOf('}+}');
            var keyword = tpl.substr(start+3, ((end-3) - start));

            if(start != -1){
                keywordsArr.push(keyword);
                tpl = tpl.replace('{+{'+keyword+'}+}', '{-{'+keyword+'}-}');
            }
            for(var i in _t.fields){
                var fld = _t.fields[i];
                if(fld.name == keyword){
                    fieldsArr.push(fld);
                }
            }
            if(start != -1){
                populateArrays(tpl);
            }
        }

        populateArrays(html);

        for(var k in fieldsArr){
            var fld = fieldsArr[k];
            var name = fld.name;
            for(var h in keywordsArr){
                var kw = keywordsArr[h];
                if(name == kw){
                    html = html.replace('{+{'+kw+'}+}', fld.value);
                }
            }
        }

        function checkUnfilled(){
            var cutStart = html.indexOf('{+{');
            var cutEnd = html.indexOf('}+}');
            var keyword = html.substr(cutStart + 3, cutEnd - (cutStart+3));
            html = html.replace('{+{'+ keyword + '}+}', ' - ');
            if(html.indexOf('{+{') > -1){
                checkUnfilled();
            }
        }

        if(html.indexOf('{+{') > -1){
            checkUnfilled();
        }

        return html;
    };

    MB.FormN.prototype.createContent = function(callback){
        var _t = this;
        _t.fields = [];
        _t.modalId = _t.id;
        var mObj = {};

        if(_t.activeId === 'new'){
            for(var k in _t.profile.DATA){
                var kItem = _t.profile.DATA[k];
                var kName = kItem[_t.profile.NAMES.indexOf('COLUMN_NAME')];
                mObj[kName] = _t.createField(_t.populateFieldByName(kName));
            }
        }else{
            var names = _t.data.NAMES;
            for(var i in _t.data.DATA[0]){
                var item = _t.data.DATA[0][i];
                var name = names[i];
                mObj[name] = _t.createField(_t.populateFieldByName(name));
            }
        }

        _t.position = (_t.position == 'shift')? 'shift': 'center';

        if(_t.wasNew && _t.newSaved){
            var modal = MB.Core.modalWindows.windows.getWindow(_t.modalId);
            var wrapper = modal.wrapper;
            wrapper.find('.mw-content-inner').html(_t.insertNativeValues(Mustache.to_html(_t.template, mObj)));
            if(typeof callback == 'function'){
                callback();
            }
        }else{
            MB.Core.modalWindows.init({
                wrapper :          undefined,
                className :        'orderModal',
                wrapId :           _t.modalId,
                resizable :        true,
                title :            (_t.activeId === 'new')? 'Создать '+ _t.profile['OBJECT_PROFILE']['CLIENT_OBJECT_NAME'].toLowerCase() : _t.profile['OBJECT_PROFILE']['CLIENT_OBJECT_NAME']+' № '+_t.activeId,
                status :           'Зарезервирован',
                content :          _t.insertNativeValues(Mustache.to_html(_t.template, mObj)),
                bottomButtons :    undefined,
                startPosition :    _t.position,
                draggable :        true,
                top :              0,
                left :             0,
                waitForPosition :  undefined,
                active :           true,
                inMove :           false,
                minHeight :        700,
                minWidth :         1300,
                activeHeaderElem : undefined,
                footerButton :     undefined,
                contentHeight :    0
            }).render(function(){

            });

            if(typeof callback == 'function'){
                //console.log('END- ', new Date(), new Date().getMilliseconds());
                callback();
            }
        }
    };

    MB.FormN.prototype.reload = function(callback){
        var _t = this;
        if(_t.activeId !== 'new'){

            if(_t.wasNew && _t.newSaved){
                _t.getData(function(){
                    _t.getTemplate(function(){
                        _t.createContent(function(){
                            _t.createChildTables('', function(){
                                _t.initControllers(function(){
                                    _t.getScript(function(){
                                        _t.populateLowerButtons();
                                        _t.setHandlers(function(){
                                            _t.wasNew = false;
                                            _t.newSaved = false;

                                            var modalWrapper = $('#mw-'+_t.id);
                                            var modalTitle = modalWrapper.find('.mw-title');
                                            var newTitle = _t.profile['OBJECT_PROFILE']['CLIENT_OBJECT_NAME']+' № '+_t.activeId;
                                            modalTitle.html('<span class="mw-count-title-length">'+newTitle+'</span><div class="mw-title-hint">'+newTitle+'</div>');

                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            }else{
                _t.getData(function(){
                    _t.getScript(function(){
                        _t.populateLowerButtons();
                    });
                    for(var i in _t.data.DATA[0]){
                        var name = _t.data.NAMES[i];
                        var modalWrapper = $('#mw-'+_t.id);
                        var modalTitle = modalWrapper.find('.mw-title');
                        var fWrap = (modalWrapper.find('.fn-field[data-column="'+name+'"]').length > 0)? modalWrapper.find('.fn-field[data-column="'+name+'"]') : modalWrapper.find('.form-ro-block[data-column="'+name+'"]');
                        var type = fWrap.attr('data-type');
                        var insert = undefined;
                        var fld = _t.populateFieldByName(name);
                        var newTitle = _t.profile['OBJECT_PROFILE']['CLIENT_OBJECT_NAME']+' № '+_t.activeId;
                        modalTitle.html('<span class="mw-count-title-length">'+newTitle+'</span><div class="mw-title-hint">'+newTitle+'</div>');

                        if(fWrap.hasClass('fn-readonly-field') || fWrap.hasClass('form-ro-block')){
                            insert = (fWrap.find('.fn-readonly').length > 0) ? fWrap.find('.fn-readonly') : fWrap.find('.form-ro-value');
                            insert.html(fld.value);
                        }else{
                            switch(type){
                                case 'text':
                                    insert = fWrap.find('input[type="text"].fn-control');
                                    //insert.val(fld.value);
                                    insert.attr('value', fld.value);

                                    break;
                                case 'textarea':
                                    insert = fWrap.find('textarea.fn-control');
                                    insert.val(fld.value);
                                    break;
                                case 'checkbox':
                                    insert = fWrap.find('.fn-control.checkbox-wrapper');
                                    MB.Core.checkboxes.getItem(insert.data('id')).setValue(fld.value == 'TRUE');
                                    break;
                                case 'select2':
                                    insert = MB.Core.select3.list.getSelect(fWrap.find('.select3-wrapper').attr('id'));
                                    insert.value.name = fld.value;
                                    insert.value.id = fld.selValue;
                                    insert.setValue();
                                    break;
                                case 'select2withEmptyValue':
                                    insert = MB.Core.select3.list.getSelect(fWrap.find('.select3-wrapper').attr('id'));
                                    insert.value.name = fld.value;
                                    insert.value.id = fld.selValue;
                                    insert.setValue();
                                    break;
                                case 'select2FreeType':
                                    insert = MB.Core.select3.list.getSelect(fWrap.find('.select3-wrapper').attr('id'));
                                    insert.value.name = fld.value;
                                    insert.value.id = fld.selValue;
                                    insert.setValue();
                                    break;
                                case 'datetime':
                                    insert = fWrap.find('input[type="text"].fn-control');
                                    insert.val(fld.value);
                                    break;
                                case 'number':
                                    insert = fWrap.find('input[type="number"].fn-control');
                                    insert.val(fld.value);
                                    break;
                                default:
                                    insert = fWrap.find('input[type="text"].fn-control');
                                    insert.val(fld.value);
                                    break;
                            }
                            _t.changes = [];
                            _t.enableSaveButton();
                        }
                    }
                    if(_t.tblInstances.length > 0){
                        for(var ins in _t.tblInstances){
                            _t.tblInstances[ins].reload(function(){
                                $(_t).trigger('update');
                                if(typeof callback == 'function'){
                                    callback();
                                }
                            });
                        }
                    }else{
                        $(_t).trigger('update');
                        if(typeof callback == 'function'){
                            callback();
                        }
                    }
                });
            }



        }else{
            $(_t).trigger('update');
            if(typeof callback == 'function'){
                callback();
            }
        }

    };

    MB.FormN.prototype.makeOperation = function(operationName, callback){
        var _t = this;
        var totalOk = 0;
        var totalErr = 0;
        var primaryKeys = _t.profile['OBJECT_PROFILE']['PRIMARY_KEY'].split(',');

        var o = {
            command: 'operation',
            object: operationName
        };

        for(var k in primaryKeys){
            o[primaryKeys[k]] = _t.data.DATA[0][_t.data.NAMES.indexOf(primaryKeys[k])];
        }

        socketQuery(o, function(res){
            res = JSON.parse(res);
            var toastrInfo = res.results[0]['toastr'];
            if(res['code'] == 0){
                totalOk ++;
            }else{
                totalErr ++;
            }
            toastr[toastrInfo['type']](toastrInfo['message']);
            _t.reload(function(){
                if(typeof callback == 'function'){
                    callback();
                }
            });
        });
    };

    MB.FormN.prototype.enableSaveButton = function(){
        var _t = this;
        var wrapper = $('#mw-'+_t.id);
        var saveBtn = wrapper.find('.mw-save-form');

        saveBtn.addClass('disabled');

        if(_t.tblInstances.length > 0){
            var totalChanged = 0;
            for(var ins in _t.tblInstances){
                if(_t.changes.length > 0 || _t.tblInstances[ins].ct_instance.changes.length > 0){
                    totalChanged++;
                }
            }
            if(totalChanged > 0){
                saveBtn.removeClass('disabled');
            }
        }else{
            if(_t.changes.length > 0){
                saveBtn.removeClass('disabled');
            }
        }

    };

    MB.FormN.prototype.addChange = function(change){
        var _t = this;

        if(!change.type || !change.column_name){
            return;
        }

        if(_t.changes.length > 0){
            var isSame = 0;
            for(var i in _t.changes){
                var ch = _t.changes[i];
                if(ch.column_name == change.column_name){
                    if(change.type.indexOf('select2') != -1){
                        ch.value.selValue = change.value.selValue;
                        ch.value.value = change.value.value;
                    }else{
                        ch.value.value = change.value.value;
                    }
                    isSame++;
                }
            }
            if(isSame == 0){
                _t.changes.push(change);
            }
        }else{
            _t.changes.push(change);
        }
        _t.enableSaveButton();
        console.log(_t.changes);

    };

    MB.FormN.prototype.setHandlers = function(callback){
        var _t = this;
        var wrapper = $('#mw-'+_t.id);
        var modalWindow = MB.Core.modalWindows.windows.getWindow(_t.id);

        if(_t.activeId == 'new'){
            for(var pd in _t.profile.DATA){
                var item = _t.profile.DATA[pd];
                if(item[_t.profile.NAMES.indexOf('TYPE_OF_EDITOR')] == 'checkbox'){
                    var chO = {
                        column_name: item[_t.profile.NAMES.indexOf('COLUMN_NAME')],
                        type: 'checkbox',
                        value: {
                            value: 'FALSE',
                            selValue: ''
                        }
                    };
                    _t.addChange(chO);
                }
            }
        }

        wrapper.find('.mw-save-form').off('click').on('click', function(){

            if($(this).hasClass('disabled')){return;}
            if(_t.tblInstances.length > 0){

                if(_t.changes.length > 0){
                    _t.save(function(){
                        _t.reload();
                    });
                }

                //console.log('saveMe', _t.tblInstances);

                for(var ins in _t.tblInstances){
                    if(_t.tblInstances[ins].ct_instance.changes.length > 0){
                        _t.tblInstances[ins].save(function(){
                            _t.tblInstances[ins].reload();
                            _t.reload();
                        });
                    }
                }
            }else{
                if(_t.changes.length > 0){
                    if(_t.changes.length > 0){
                        _t.save(function(){
                            _t.reload();
                        });
                    }
                }
            }


        });

        wrapper.find('input.fn-control').off('input').on('input', function(){
            var block = $(this).parents('.fn-field').eq(0);
            var columnName = block.attr('data-column');
            var type = block.attr('data-type');
            var chO = {
                column_name: columnName,
                type: type,
                value: {
                    value: $(this).val(),
                    selValue: ''
                }
            };
            _t.addChange(chO);
        });

        wrapper.find('.fn-control.checkbox-wrapper').each(function(index, elem){
            var block = $(elem).parents('.fn-field').eq(0);
            var id = $(elem).data('id');
            var columnName = block.data('column');
            var type = block.data('type');
            var chkInstance = $(MB.Core.checkboxes.getItem(id)).off('toggleCheckbox').on('toggleCheckbox', function(){
                console.log(this);
                var chO = {
                    column_name: columnName,
                    type: type,
                    value: {
                        value: (this.value)? "TRUE":"FALSE",
                        selValue: ''
                    }
                };
                _t.addChange(chO);
            });
        });

        wrapper.find('textarea.fn-control').off('input').on('input', function(){
            var block = $(this).parents('.fn-field').eq(0);
            var columnName = block.attr('data-column');
            var type = block.attr('data-type');
            var chO = {
                column_name: columnName,
                type: type,
                value: {
                    value: $(this).val(),
                    selValue: ''
                }
            };
            _t.addChange(chO);
        });

        wrapper.find('.fn-control.fn-datetime-wrapper').each(function(index, elem){
            $(elem).datetimepicker({
                format: "dd.mm.yyyy hh:ii",
                autoclose: true,
                todayHighlight: true,
                minuteStep: 10,
                keyboardNavigation: false,
                todayBtn: true,
                firstDay: 1,
                weekStart: 1,
                language: "ru"
            }).off('changeDate').on('changeDate', function(){
                var chO = {
                    column_name: $(elem).attr('data-column'),
                    type: $(elem).parents('.fn-field').eq(0).attr('data-type'),
                    value: {
                        value: $(elem).val(),
                        selValue: ''
                    }
                };
                _t.addChange(chO);
            });
        });

        wrapper.find('.fn-control.fn-select3-wrapper').each(function(index, elem){
            var selectId = $(elem).find('.select3-wrapper').attr('id');
            var selectInstance = MB.Core.select3.list.getSelect(selectId);
            $(selectInstance).on('changeVal', function(e, was, now){ //.off('changeVal')

                function getLovReturnToColumn(columnName){
                    for(var i in _t.profile.DATA){
                        var item = _t.profile.DATA[i];
                        if(item[_t.profile.NAMES.indexOf('COLUMN_NAME')] == columnName){
                            return (item[_t.profile.NAMES.indexOf('LOV_RETURN_TO_COLUMN')] != "")? item[_t.profile.NAMES.indexOf('LOV_RETURN_TO_COLUMN')] : item[_t.profile.NAMES.indexOf('COLUMN_NAME')];
                        }
                    }
                }

                var chO = {
                    column_name: getLovReturnToColumn($(elem).attr('data-column')),
                    type: $(elem).parents('.fn-field').eq(0).attr('data-type'),
                    value: {
                        value: now.id,
                        selValue: now.id
                    }
                };
                _t.addChange(chO);
            });
        });

        wrapper.find('.fn-control.fn-colorpicker-wrapper').each(function(index, elem){
            var block = $(elem).parents('.fn-field').eq(0);
            var type = block.attr('data-type');
            var columnName = block.attr('data-column');
            var stateView = $(elem).parents('.fn-field').find('.fn-colorpicker-state');
            var colorValue = undefined;
            var colorPickerInstance = $(elem).colorpicker();
            colorPickerInstance.off('changeColor').on('changeColor', function(e){
                colorValue = e.color.toHex();
                stateView.css('backgroundColor', colorValue);

                var chO = {
                    column_name: columnName,
                    type: type,
                    value: {
                        value: colorValue,
                        selValue: ''
                    }
                };
                _t.addChange(chO);
            });
            $(elem).off('input').on('input', function(){
                stateView.css('backgroundColor', $(elem).val());
            });
            stateView.off('click').on('click', function(){
                colorPickerInstance.colorpicker('show');
            });
        });



//        $(modalWindow).on('close', function(){
//            console.log('close', modalWindow.wrapId);
//        });
//        $(modalWindow).on('collapse', function(){
//            console.log('collapse', modalWindow.wrapId);
//        });
//        $(modalWindow).on('activate', function(){
//            console.log('activate', modalWindow.wrapId);
//        });
//        $(modalWindow).on('fullscreen', function(){
//            console.log('fullscreen', modalWindow.wrapId);
//        });
        $(modalWindow).off('close').on('close', function(){
            for(var i in _t.tblInstances){
                var id = _t.tblInstances[i].id;
                MB.Tables.removeTable(id);
            }
            MB.Forms.removeForm(_t.id);
        });

        if(typeof callback == 'function'){
            callback();
        }
    };

    MB.FormN.prototype.returnStringWithoutSpaces = function(str){
        return str.replace(/(^\s*)|(\s*)$/g, '');
    };

    MB.FormN.prototype.save = function(callback){
        var _t = this;
        var chs = _t.changes;
        var totalSaved = 0;
        var totalError = 0;
        function finishSave(){
            if(totalError == 0){
                _t.changes = [];
            }
            _t.enableSaveButton();
            var modalInstance = MB.Core.modalWindows.windows.getWindow(_t.modalId);
            $(_t).trigger('update');
            if(typeof callback == 'function'){
                callback();
            }
        }

        function populateParams(){
            var result = {};
            for(var i in chs){
                var ch = chs[i];

                result[ch.column_name] = _t.returnStringWithoutSpaces(ch.value.value);
            }
            if(_t.activeId === 'new'){
                for(var k in _t.profile['OBJECT_PROFILE']['PRIMARY_KEY'].split(',')){
                    var key = _t.profile['OBJECT_PROFILE']['PRIMARY_KEY'].split(',')[k];
                    result[key] = '';
                }

            }else{
                for(var k in _t.profile['OBJECT_PROFILE']['PRIMARY_KEY'].split(',')){
                    var key = _t.profile['OBJECT_PROFILE']['PRIMARY_KEY'].split(',')[k];
                    result[key] = _t.data.DATA[0][_t.data.NAMES.indexOf(key)];
                }
            }

            return result;
        }

        var sObj = {};

        if(_t.activeId === 'new'){
            sObj = {
                command: 'new',
                object: _t.profile['OBJECT_PROFILE']['OBJECT_COMMAND'],
                sid: MB.User.sid,
                params: populateParams()
            };
        }else{
            sObj = {
                command: 'modify',
                object: _t.profile['OBJECT_PROFILE']['OBJECT_COMMAND'],
                sid: MB.User.sid,
                params: populateParams()
            };
        }

        socketQuery(sObj, function(res){
            res = JSON.parse(res);
            var results = res.results[0];

            if(_t.activeId === 'new'){
                if(results["code"] == 0){
                    _t.newSaved = true;
                    _t.activeId = results['id'];
                }
            }

            if(results["code"] == 0){
                totalSaved +=1;
            }else{
                totalError +=1;
            }
            var tosatrObj = results['toastr'];
            toastr[tosatrObj['type']](tosatrObj['message']);
            console.log(results["message"]);
            finishSave();
        });
    };

    MB.FormN.prototype.populateLowerButtons = function(){
        var _t = this;
        var formWrapper = $('#mw-'+_t.id);
        var buttonsWrapper = formWrapper.find('.lower-buttons-wrapper');
        if(!buttonsWrapper || !_t.lowerButtons){
            return;
        }
        var tpl = '{{#buttons}}<div class="nb btn btnDouble fn-lower-button {{disabledClass}} {{color}}" data-name="{{name}}">{{#disabled}}<i class="fa {{icon}}"></i>{{/disabled}}<div class="paddRL7 {{#disabled}}btnDoubleInner{{/disabled}}">{{title}}</div></div>{{/buttons}}';
        for(var i in _t.lowerButtons){
            var btn = _t.lowerButtons[i];
            btn.disabledClass = (btn.disabled())? 'disabled': '';
            btn.disabled = !btn.disabled();
        }
        var mO = {
            buttons: _t.lowerButtons
        };
        buttonsWrapper.html(Mustache.to_html(tpl, mO));

        var $btns = buttonsWrapper.find('.fn-lower-button');
        $btns.each(function(idx, elem){
            $(elem).off('click').on('click', function(){
                var name = $(elem).data('name');
                if(!$(elem).hasClass('disabled')){
                    for(var k in _t.lowerButtons){
                        if(_t.lowerButtons[k].name == name){
                            _t.lowerButtons[k].callback();
                        }
                    }
                }
            });
        });
    };


    //---


    MB.FormN.prototype.getProfileByColumnName = function(column_name){
        var _t = this;
        for(var i in _t.profile.DATA){
            var cell = _t.profile.DATA[i];
            if(cell[_t.profile.NAMES.indexOf('COLUMN_NAME')] == column_name){
                return cell;
            }
        }
    };

    MB.FormN.prototype.getDependsOfValueByColumnName = function(column_name, rowIndex){
        var _t = this;
        var value = (_t.data == 'new')? '' : _t.data.DATA[0][_t.data.NAMES.indexOf(column_name)];
        if(value == undefined){
            return 'NULL';
        }

        var response = '';
        response = (value.length > 0)? "'" + value + "'": 'NULL' ;
        for(var i in _t.changes){
            var ch = _t.changes[i];
            if(ch.column_name == column_name){
                response = "'" + ch.value.selValue + "'";
            }
        }
        console.log((response == 'NULL' || response == '' || !response)? 'NULL' : response);
        return (response == 'NULL' || response == '' || !response)? 'NULL' : response;
    };

    MB.FormN.prototype.getDependWhereForSelect = function(column_name, rowIndex){
        var _t = this;
        var lov_where = _t.getProfileByColumnName(column_name)[_t.profile.NAMES.indexOf('LOV_WHERE')];

        function removeSpaces(str){
            if(typeof str == 'string'){
                return str.replace(/\s+/g, '');
            }else{
                return str;
            }
        }

        function rec(str){
            var open = str.indexOf('[:');
            var close = str.indexOf(':]');
            if(open == -1 || close == -1){
                return str;
            }else{
                var key = removeSpaces(str.substr(open+2, close - (open+2)));
                var newString = str.substr(0,open) + '[|' + _t.getDependsOfValueByColumnName(key, rowIndex) + '|]' + str.substr(close+2);
                return rec(newString);
            }
        }

        var result = rec(lov_where);
        result = result.replaceAll('[|', '');
        result = result.replaceAll('|]', '');

        console.log(result);

        return result;

    };

}());



