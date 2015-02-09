var MB = MB || {};

MB.Table = function (options) {
    var instance = this;
    instance.name   = options.name || MB.Core.guid();
    instance.world  = options.world || "page";
    if (options.params) {
        for (var key in options.params) {
            instance[key] = options.params[key];
        }
    }
};

MB.Table.parseprofile = function (data, callback) {
    var parsedprofile = {};
    for (var key in data.OBJECT_PROFILE) {
        parsedprofile[key] = data.OBJECT_PROFILE[key];
    }
    for (var i = 0, l = data.NAMES.length; i < l; i++) {
        parsedprofile[data.NAMES[i]] = [];
        for (var ii = 0, ll = data.DATA.length; ii < ll; ii++) {
            parsedprofile[data.NAMES[i]].push(data.DATA[ii][i]);
        }
    }
    callback(parsedprofile);
};

MB.Table.hasloaded = function (name) {
    if (MB.O.tables.hasOwnProperty(name)) {
        return true;
    } else {
        return false;
    }
};

MB.Table.find = function (name) {
    return MB.O.tables[name];
};

MB.Table.show = function (area, name) {
    var table = MB.O.tables[name];
    var query = "#" + area + "_" + MB.User["active" + area] + "_wrapper";
    $(query).hide();
    query = "#" + area + "_" + name + "_wrapper";
    $(query).show();
    MB.User.activepage = table.name;
    MB.User.loadedpages.push(table.name);
};

MB.Table.parseforselect2data = function (res) {
    var data = [];
    if (res.NAMES.length !== 2) {
        console.log("В parseforselect2data приходит не 2 колонки!");
        return;
    } else {
        for (var i = 0, l = res.DATA.length; i < l; i++) {
            data.push({id: res.DATA[i][0], text: res.DATA[i][1]});
        }
        return data;
    }
};

MB.Table.fn = MB.Table.prototype;
MB.Table.fn.parent = MB.Table.prototype.constructor;

MB.Table.fn.create = function (callback) {
    var instance = this;     
    instance.makedir(function () {
        instance.makecontainer(function () {
            instance.getprofile(function (res) {
                instance.updatemodel("profile", res, function () {
                    instance.getdata(function (res) {
                        instance.updatemodel("data", res, function () {
                            instance.updateview("init", function () {
                                instance.updatecontroller("init", function () {
                                    callback();
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};

MB.Table.fn.getCell = function (rowid, cellname) {
    var instance = this;
    return instance.$container.find("tbody tr[data-row='" + rowid + "']").find("[data-column='" + cellname + "']").find("a").text();
};

MB.Table.fn.makedir = function (callback) {
    var instance = this;
    MB.O.tables[instance.name] = instance;
    callback();
};

MB.Table.fn.makecontainer = function (callback) {
    var instance = this;
    var $worldcontainer = $("." + instance.world + "-content-wrapper");
    var $container = $("<div id='" + instance.world + "_" + instance.name + "_wrapper' class='" + instance.world + "-item'></div>")
    $worldcontainer.append($container);
    instance.$worldcontainer = $worldcontainer;
    instance.$container = $container;
    callback();
};

MB.Table.fn.getprofile = function (callback) {
    var instance = this;
    var o = {
        command: "get",
        object: "user_object_profile",
        client_object: instance.name,
        sid: MB.User.sid
    };  
    MB.Core.sendQuery(o, function (res) {
        callback(res);
    });
};

MB.Table.fn.getdata = function (callback) {
    var instance = this;
    var where = "";
    if (instance.parentkeyvalue) {
        if (instance.profile.general.where) {
            where += instance.profile.general.parentkey + " = '" + instance.parentkeyvalue + "' and " + instance.profile.general.where;
        } else {
            where += instance.profile.general.parentkey + " = '" + instance.parentkeyvalue + "'";
        }
    } else {
        where += instance.profile.general.where;
    }
    if (instance.profile.general.where !== "") {}
    var o = {
        command:        "get",
        object:         instance.profile.general.object,
        where:          where,
        // where:          instance.profile.general.where + (instance.primarykeyvalue ? "  "),
        order_by:       instance.profile.general.orderby,
        client_object:  instance.name,
        rows_max_num:   instance.profile.general.rowsmaxnum,
        page_no:        instance.profile.general.pageno,        
        sid:            MB.User.sid
    };  
    MB.Core.sendQuery(o, function (res) {
        callback(res);
    });
};

MB.Table.fn.distributeprofile = function (parsedprofile, callback) {
    var instance = this;
    instance.profile = {};
    instance.profile.general = {};
    instance.profile.columns = {};
    instance.profile.general.rowsmaxnum     = parsedprofile.ROWS_MAX_NUM;
    instance.profile.general.primarykey     = parsedprofile.PRIMARY_KEY;
    instance.profile.general.parentkey      = parsedprofile.PARENT_KEY;
    instance.profile.general.orderby        = parsedprofile.DEFAULT_ORDER_BY;
    instance.profile.general.object         = parsedprofile.OBJECT_COMMAND;
    instance.profile.general.tablename      = parsedprofile.CLIENT_OBJECT_NAME;
    instance.profile.general.where          = instance.where || parsedprofile.DEFAULT_WHERE;
    instance.profile.general.newcommand     = parsedprofile.NEW_COMMAND;
    instance.profile.general.removecommand  = parsedprofile.REMOVE_COMMAND;
    instance.profile.general.juniorobject   = parsedprofile.OPEN_FORM_CLIENT_OBJECT;
    instance.profile.general.modifycommand  = parsedprofile.MODIFY_COMMAND;
    instance.profile.general.custom         = parsedprofile.ADDITIONAL_FUNCTIONALITY;
    instance.profile.general.pageno         = 1;
    instance.profile.columns.align          = parsedprofile.ALIGN;
    instance.profile.columns.columnsclient  = parsedprofile.NAME;
    instance.profile.columns.columnsdb      = parsedprofile.COLUMN_NAME;
    instance.profile.columns.editability    = parsedprofile.EDITABLE;
    instance.profile.columns.keys           = parsedprofile.PRIMARY_KEY;
    instance.profile.columns.editor         = parsedprofile.TYPE_OF_EDITOR;
    instance.profile.columns.visibility     = parsedprofile.VISIBLE;
    instance.profile.columns.width          = parsedprofile.WIDTH;
    instance.profile.columns.refclientobj   = parsedprofile.REFERENCE_CLIENT_OBJECT;
    instance.profile.columns.returnscolumn  = parsedprofile.LOV_RETURN_COLUMN;
    instance.profile.columns.refcolumns     = parsedprofile.LOV_COLUMNS;
    instance.profile.columns.references     = parsedprofile.LOV_COMMAND;
    callback();
};

MB.Table.fn.distributedata = function (data, callback) {
    var instance = this;
    instance.data = {};
    instance.data.data = data.DATA;
    instance.data.names = data.NAMES;
    instance.data.info = data.INFO;
    callback();
}; 

MB.Table.fn.removemodallistitem = function () {
    var instance = this;
    console.log(5);
    console.log($("[data-object='" + instance.name + "']"));
    $(".modals-list").find("[data-object='" + instance.name + "']").remove();
};

MB.Table.fn.closeit = function () {
    var instance = this;
    if (instance.world === "page") {
        var query = "#page_" + instance.name + "_wrapper";
        $(query).hide();
    } else {
        var query = "#modal_" + instance.name + "_wrapper";
        $(query).hide();
        instance.removemodallistitem();
    }
};

MB.Table.fn.createmodallistitem = function () {
    var instance = this;
    $(".modals-list").append("<li data-type='table' data-object='" + instance.name + "'><i class='cross fa fa-times-circle'></i>" + instance.profile.general.tablename + "</li>");
};

MB.Table.fn.showit = function (init) {
    var instance = this;
    if (instance.world === "page") {
        var query = "#page_" + MB.User.activepage + "_wrapper";
        $(query).hide();
        var query = "#page_" + instance.name + "_wrapper";
        $(query).show();   
        MB.User.activepage = instance.name;
        MB.User.loadedpages.push(instance.name);  
    } else {
        var query = "#modal_" + MB.User.activemodal + "_wrapper";
        $(query).hide();
        var query = "#modal_" + instance.name + "_wrapper";
        $(query).show(); 
        if (init) {
            instance.createmodallistitem();  
        }  
        MB.User.activemodal = instance.name;
        MB.User.loadedmodals.push(instance.name);     
    }
};

MB.Table.fn.updatemodel = function (part, data, callback) {
    var instance = this;
    if (part === "profile") {
        MB.Table.parseprofile(data, function (parsedprofile) {
            instance.distributeprofile(parsedprofile, function () {
                callback();
            });
        });
    } else if (part === "data") {
        instance.distributedata(data, function () {
            callback();
        });
    } 
};

MB.Table.fn.makenewrow = function (callback) {
    var instance = this;
    var row = MB.Core.guid();
    var html = "<tr class='addingrow new' data-row='" + row + "'>";
    html += "<td><div class='checker'><span><input type='checkbox'></span></div></td>";
    var primarykeyindex = instance.data.names.indexOf(instance.profile.general.primarykey);
    for (var i = 0, l = instance.data.names.length; i < l; i++) {
        if (instance.profile.columns.editability[i].bool()) {
            html += "<td data-visibility='" + instance.profile.columns.visibility[i] + "' data-row='" + row + "'  data-column='" + instance.profile.columns.columnsdb[i] + "' data-editor='" + instance.profile.columns.editor[i] + "' data-reference='" + instance.profile.columns.references[i] + "' data-refcolumns='" + instance.profile.columns.refcolumns[i] + "' data-returnscolumn='" + instance.profile.columns.returnscolumn[i] + "'><a href='#' ></a></td>";
        } else {
            html += "<td data-visibility='" + instance.profile.columns.visibility[i] + "' data-row='" + row + "'  data-column='" + instance.profile.columns.columnsdb[i] + "'></td>";
        }
    }
    html += "</tr>";
    instance.$container.find("tbody").prepend(html);
    callback();
};

MB.Table.fn.makepagination = function (callback) {
    var instance    = this,
        html        = "",
        pageno      = parseInt(instance.profile.general.pageno),
        pagecount   = Math.ceil(instance.data.info.ROWS_COUNT / (instance.profile.general.rowsmaxnum ? instance.profile.general.rowsmaxnum : 10));
    if (pageno === 1) {
        html += "<li class='prev disabled'><a href='#' title='Prev'><i class='fa fa-angle-left'></i></a></li>";
    } else {
        html += "<li class='prev'><a href='#' title='Prev'><i class='fa fa-angle-left'></i></a></li>";
    }
    for (var i = 1, l = pagecount + 1; i < l; i++) {
        if (i === pageno) {
            html += "<li class='active'><a href='#'>" + i + "</a></li>";
        } else {
            html += "<li><a href='#'>" + i + "</a></li>";
        } 
    }
    if (pageno === pagecount) {
        html += "<li class='next disabled'><a href='#' title='Next'><i class='fa fa-angle-right'></i></a></li>";
    } else {
        html += "<li class='next'><a href='#' title='Next'><i class='fa fa-angle-right'></i></a></li>";
    }
    if (callback) {callback(html);} else {return html;}
};

MB.Table.fn.updateview = function (part, callback) {
    var instance = this;
    if (part === "init") {    
        instance.makeheader(function (header) {  
            instance.maketoppanel(function (toppanel) {
                instance.maketable(function (table) {
                    instance.makebottompanel(function (bottompanel) {
                        instance.concathtml({
                            header: header,
                            toppanel: toppanel,
                            table: table,
                            bottompanel: bottompanel
                        }, function (concatedhtml) {
                            instance.loadhtml({"init": concatedhtml}, function () {
                                callback();
                            });
                        });
                    });
                });           
            });
        });
    } else if (part === "data") {
        instance.maketable(function (table) {
            instance.loadhtml({"data": table}, function () {
                callback();
            });
        }); 
    } else if (part === "data pagination") {
        instance.maketable(function (table) {
            instance.makepagination(function (pagination) {
                instance.loadhtml({
                    data: table,
                    pagination: pagination
                }, function () {
                    callback();
                });
            }); 
        }); 
    } else if (part === "addrow") {
        instance.makenewrow(function () {
            callback();
        });
    }
};

MB.Table.fn.loadhtml = function (options, callback) {
    var instance = this;
    var query = "#" + instance.world + "_" + instance.name + "_wrapper";
    for (var key in options) {
        if (key === "init") {
            $(query).html(options[key]);
            callback();
        } else if (key === "data") {
            $(query).find(".table-scrollable").html(options[key]);
            callback();
        } else if (key === "pagination") {
            $(query).find(".pagination").empty().html(options[key]);
            callback();
        }
    }
};

MB.Table.fn.concathtml = function (htmls, callback) {
    var instance = this;
    var html = "";
    html += "<div class='row'><div class='col-md-12'><div class='portlet box blue'>";
    html += htmls.header;
    html += "<div class='portlet-body'>";
    html += htmls.toppanel;
    html += "<div class='table-scrollable'>";
    html += htmls.table;
    html += "</div>";
    html += htmls.bottompanel;
    html += "</div></div></div></div>";
    callback(html);
}; 

MB.Table.fn.makeheader = function (callback) {
    var instance = this;
    var html = "";
    html += "<div class='portlet-title'><div class='caption'><i class='fa fa-globe'></i>" + instance.profile.general.tablename + "</div><div class='tools'><a href='javascript:;' class='collapse'></a><a href='#portlet-config' data-toggle='modal' class='config'></a><a href='javascript:;' class='reload'></a><a href='javascript:;' class='remove'></a></div><div class='actions'><div class='btn-group'><a class='btn default' href='#' data-toggle='dropdown'> Columns <i class='fa fa-angle-down'></i></a><div class='dropdown-menu hold-on-click dropdown-checkboxes pull-right column_toggler'>";
    for (var i = 0, l = instance.profile.columns.columnsdb.length; i < l; i++) {
        if (instance.profile.columns.visibility[i] === "TRUE") {
            html += "<label><div class='checker'><span class='checked'><input type='checkbox' checked='' data-column='0'></span></div>" + instance.profile.columns.columnsdb[i] + "</label>";
        } else {
            html += "<label><div class='checker'><span><input type='checkbox' checked='' data-column='0'></span></div>" + instance.profile.columns.columnsdb[i] + "</label>";
        }
    }
    html += "</div></div></div></div>";
    callback(html);
};

MB.Table.fn.maketoppanel = function (callback) {
    var instance = this;
    var html = "";
    callback(html);
};

MB.Table.fn.makethead = function (callback) {
    var instance = this;
    var html = "";
    html += "<thead><tr>";
    html += "<th style='width:30px;' class='rows-check-toggler'><div class='checker'><span class=''><input type='checkbox'></span></div></th>";
    for (var i = 0, l = instance.profile.columns.columnsdb.length; i < l; i++) {
            html += "<th data-column='" + instance.profile.columns.columnsdb[i] + "' data-visibility='" + instance.profile.columns.visibility[i] + "'>" + instance.profile.columns.columnsclient[i] + "</th>";      
        }
    html += "</tr></thead>";
    callback(html);
};

MB.Table.fn.maketable = function (callback) {
    var instance = this;
    var html = "";
    instance.makethead(function (thead) {
        instance.maketbody(function (tbody) {
            html += "<table class='table table-striped table-bordered table-hover' id='" + instance.name + "'>";
            html += thead;
            html += tbody;
            html += "</table>";
            callback(html);
        });
    });
}; 

MB.Table.fn.maketbody = function (callback) {
    var instance = this;
    var html = "<tbody>";
    var primarykeyindex = instance.data.names.indexOf(instance.profile.general.primarykey);
    for (var i = 0, l = instance.data.data.length; i < l; i++) {
        html += "<tr class='justrow' data-row='" + instance.data.data[i][primarykeyindex] + "'>";
        html += "<td><div class='checker'><span><input type='checkbox'></span></div></td>";
        for (var ii = 0, ll = instance.data.names.length; ii < ll; ii++) {
            if (instance.profile.columns.editability[ii].bool()) {
                html += "<td data-visibility='" + instance.profile.columns.visibility[ii] + "' data-row='" + instance.data.data[i][primarykeyindex] + "'  data-column='" + instance.profile.columns.columnsdb[ii] + "' data-editor='" + instance.profile.columns.editor[ii] + "' data-reference='" + instance.profile.columns.references[ii] + "' data-refcolumns='" + instance.profile.columns.refcolumns[ii] + "' data-returnscolumn='" + instance.profile.columns.returnscolumn[ii] + "'><a href='#' >" + instance.data.data[i][ii] + "</a></td>";
            } else {
                html += "<td data-visibility='" + instance.profile.columns.visibility[ii] + "' data-row='" + instance.data.data[i][primarykeyindex] + "'  data-column='" + instance.profile.columns.columnsdb[ii] + "'>" + instance.data.data[i][ii] + "</td>";
            }
        }
        html += "</tr>";
    }
    html += "</tbody>";
    callback(html);
};

MB.Table.fn.makebottompanel = function (callback) {
    var instance = this;
    var html = "";
    html += "<div class='row bottom-panel'><div class='col-md-6'>";
    html += "<div class='btn-group'>";
    html += "<button type='button' class='btn btn-default create_button'><i class='fa fa-plus'></i> Создать</button>";
    html += "<button type='button' class='btn btn-default edit_button'><i class='fa fa-pencil'></i> Редактировать</button>";
    html += "<button type='button' class='btn btn-default save_button'><i class='fa fa-floppy-o'></i> Сохранить</button>";
    html += "<button type='button' class='btn btn-default restore_button'><i class='fa fa-undo'></i> Отменить</button>";
    html += "<button type='button' class='btn btn-default delete_button'><i class='fa fa-times'></i> Удалить</button>";
    html += "</div>";
    html += "</div><div class='col-md-6'>";
    html += "<div class='dataTables_paginate paging_bootstrap pull-right'><ul class='pagination' style='visibility: visible;'>";
    html += instance.makepagination();
    html += "</ul></div></div></div>";
    callback(html);
};

MB.Table.fn.reload = function (part, callback) {
    var instance = this;
    if (part === "data") {
        instance.getdata(function (res) {
            instance.updatemodel("data", res, function () {
                instance.updateview("data", function () {
                    if (callback) {callback();}
                });
            });
        });   
    } else if (part === "data pagination") {
        instance.getdata(function (res) {
            instance.updatemodel("data", res, function () {
                instance.updateview("data pagination", function () {
                    if (callback) {callback();}
                });
            });
        }); 
    } else if (part === "all") {

    }
};

MB.Table.fn.updatecontroller = function (part, callback) {
    var instance = this;   
    if (part === "init") {
        instance.contextmenu = {
            "openselectedrowwithmodal": {
                name: "Открыть форму ...",
                callback: function (key, options) {
                    var arr = [];
                    if (instance.$container.find(".selectedrow").length > 0) {
                        instance.$container.find(".selectedrow").each(function (i, el)  { 
                            var row = $(el).data("row"); 
                            arr.push(row); 
                        });
                        MB.Core.switchModal({ 
                            type: "form", 
                            ids: arr, 
                            name: instance.profile.general.juniorobject, 
                            params: { 
                                parentobject: instance.name 
                            } 
                        });
                    } else {
                        var row = options.$trigger.data("row");
                        arr.push(row);
                        MB.Core.switchModal({ 
                            type: "form", 
                            ids: arr, 
                            name: instance.profile.general.juniorobject 
                        });  
                    } 
                }
            }
        };
        var query = "#" + instance.world + "_" + instance.name + "_wrapper table tbody tr";
        $.contextMenu("destroy", query);
        $.contextMenu({
            selector: query,
            items: instance.contextmenu
        });
        instance.$container.on("click", ".portlet-title", function (e) { 
            var $target = $(e.target);  
            if ($target.hasClass("reload")) {
                instance.reload("data");
            } 
        });
        instance.$container.find(".table-scrollable").on({
            click: function (e) {
                var $targettr = $(e.target).closest("tr");
                var targetstatus = $targettr.attr("class");
                if (targetstatus === "justrow") {
                    $targettr.removeClass("justrow").addClass("selectedrow");
                } else if (targetstatus === "selectedrow") {
                    $targettr.removeClass("selectedrow").addClass("justrow");
                } 
            }
        }); 
        instance.$container.on("click", ".bottom-panel button", function (e) {
            var $target = $(this);
            if ($target.hasClass("create_button")) {
                instance.updateview("addrow", function () {
                    $(".addingrow.new").find("a").each(function (i, el) {
                        var editor = $(el).parent().data("editor");
                        if (editor === "text" || editor === "number") {
                            $(el).editable({
                                showbuttons: false,
                                type: editor,
                                onblur: "submit",
                                emptytext: "Нет данных",
                                success: function (response, newValue) {
                                    var column = $(el).parent().data("column");
                                    var row = $(el).parent().data("row");
                                    instance.addingStorage = instance.addingStorage || {};
                                    if (instance.addingStorage.hasOwnProperty(row)) {
                                        instance.addingStorage[row][column] = newValue;
                                    } else {
                                        instance.addingStorage[row] = {
                                            "command": "new",
                                            "object": instance.profile.general.object,
                                            "sid": MB.User.sid
                                        };
                                        instance.addingStorage[row][column] = newValue;
                                    }                                   
                                }
                            });
                        } else if (editor === "select2") {
                            var reference = $(el).parent().data("reference");
                            var refcolumns = $(el).parent().data("refcolumns");
                            var returnscolumn = $(el).parent().data("returnscolumn");
                            var options = {
                                command: "get",
                                object: reference,
                                columns: refcolumns,
                                sid: MB.User.sid
                            };
                            $(el).editable({
                                showbuttons: false,
                                emptytext: "Нет данных",
                                type: "select2",
                                onblur: "submit",
                                select2: {
                                    placeholder: "Нет данных",
                                    ajax: {
                                        url: "http://192.168.1.101/cgi-bin/b2cJ",
                                        dataType: "json",
                                        data: function (term, page) {
                                            return { p_xml: MB.Core.makeQuery(options) };
                                        },
                                        results: function (data, page) {
                                            return { results: MB.Table.parseforselect2data(data) };
                                        }
                                    }
                                },
                                success: function (response, newValue) {
                                    var column = returnscolumn;
                                    var row = $(el).parent().data("row");
                                    instance.addingStorage = instance.addingStorage || {};
                                    if (instance.addingStorage.hasOwnProperty(row)) {
                                        instance.addingStorage[row][column] = newValue;
                                    } else {
                                        instance.addingStorage[row] = {
                                            "command": "new",
                                            "object": instance.profile.general.object,
                                            "sid": MB.User.sid
                                        };
                                        instance.addingStorage[row][column] = newValue;
                                    }
                                }
                            });
                        }     
                    });
                    if (instance.profile.general.parentkey && instance.parentkeyvalue) {
                        $(".addingrow.new").find("[data-column='" + instance.profile.general.parentkey + "']").html(instance.parentkeyvalue);
                        instance.addingStorage = instance.addingStorage || {};
                        var row = $(".addingrow.new").data("row");
                        var column = instance.profile.general.parentkey;
                        instance.addingStorage[row] = {
                            "command": "new",
                            "object": instance.profile.general.object,
                            "sid": MB.User.sid
                        };
                        instance.addingStorage[row][column] = instance.parentkeyvalue;
                    }
                    $(".addingrow.new").removeClass("new");
                });
            } else if ($target.hasClass("edit_button")) {
                instance.$container.find(".selectedrow").each(function (i, el) {
                    $(el).removeClass("selectedrow").addClass("editingrow");
                });
                instance.$container.find(".editingrow a").each(function (i, el) {
                    var editor = $(el).parent().data("editor");
                    if (editor === "text" || editor === "number") {
                        $(el).editable({
                            type: "text",
                            showbuttons: false,
                            emptytext: "Нет данных",
                            onblur: "submit",
                            success: function (response, newValue) {
                                var column = $(el).parent().data("column");
                                var row = $(el).parent().data("row");
                                instance.editingStorage = instance.editingStorage || {};
                                if (instance.editingStorage.hasOwnProperty(row)) {
                                    instance.editingStorage.row[column] = newValue;
                                } else {
                                    instance.editingStorage[row] = {
                                        "command": "modify",
                                        "object": instance.profile.general.object,
                                        "sid": MB.User.sid
                                    };
                                    instance.editingStorage[row]["OBJVERSION"] = $(el).parent().parent().find("[data-column='OBJVERSION']").text();
                                    instance.editingStorage[row][instance.profile.general.primarykey] = row;
                                    instance.editingStorage[row][column] = newValue;
                                }                                   
                            }
                        });
                    } else if (editor === "select2") {
                        var text = $(el).text();
                        var reference = $(el).parent().data("reference");
                        var refcolumns = $(el).parent().data("refcolumns");
                        var returnscolumn = $(el).parent().data("returnscolumn");
                        var options = {
                            command: "get",
                            object: reference,
                            columns: refcolumns,
                            sid: MB.User.sid
                        };
                        $(el).editable({
                            showbuttons: false,
                            emptytext: "Нет данных",
                            type: "select2",
                            onblur: "submit",
                            select2: {
                                placeholder: text,
                                ajax: {
                                    url: "http://192.168.1.101/cgi-bin/b2cJ",
                                    dataType: "json",
                                    data: function (term, page) {
                                        return { p_xml: MB.Core.makeQuery(options) };
                                    },
                                    results: function (data, page) {
                                        return { results: MB.Table.parseforselect2data(data) };
                                    }
                                }
                            },
                            success: function (response, newValue) {
                                var column = returnscolumn;
                                var row = $(el).parent().data("row");
                                instance.editingStorage = instance.editingStorage || {};
                                if (instance.editingStorage.hasOwnProperty(row)) {
                                    instance.editingStorage[row][column] = newValue;
                                } else {
                                    instance.editingStorage[row] = {
                                        "command": "modify",
                                        "object": instance.profile.general.object,
                                        "sid": MB.User.sid
                                    };
                                    instance.editingStorage[row]["OBJVERSION"] = $(el).parent().parent().find("[data-column='OBJVERSION']").text();
                                    instance.editingStorage[row][instance.profile.general.primarykey] = row;
                                    instance.editingStorage[row][column] = newValue;
                                }
                            }
                        });
                    }
                }); 
            } else if ($target.hasClass("save_button")) {
                if (instance.addingStorage && instance.editingStorage) {
                    var addingandeditingnodescount = Object.keys(instance.addingStorage).length + Object.keys(instance.editingStorage).length;
                    var callbackcounter = 0;
                    for (var key in instance.addingStorage) {
                        MB.Core.sendQuery(instance.addingStorage[key], function (res) {
                            if (parseInt(res.RC) ===  0) {
                                callbackcounter++;
                                toastr.success(res.MESSAGE, "Успешная опреция");
                                if (callbackcounter === addingandeditingnodescount) {
                                    instance.reload("data");
                                    instance.addingStorage = null;
                                    instance.editingStorage = null;
                                }
                            }
                        });
                    }
                    for (var key in instance.editingStorage) {
                        MB.Core.sendQuery(instance.editingStorage[key], function (res) {
                            if (parseInt(res.RC) ===  0) {
                                callbackcounter++;
                                toastr.success(res.MESSAGE, "Успешная опреция");
                                if (callbackcounter === addingandeditingnodescount) {
                                    instance.reload("data");
                                    instance.addingStorage = null;
                                    instance.editingStorage = null;
                                }
                            }
                        });
                    }
                } else if (instance.addingStorage) {
                    var addingnodescount = Object.keys(instance.addingStorage).length;
                    var callbackcounter = 0;
                    for (var key in instance.addingStorage) {
                        MB.Core.sendQuery(instance.addingStorage[key], function (res) {
                            if (parseInt(res.RC) ===  0) {
                                callbackcounter++;
                                toastr.success(res.MESSAGE, "Успешная опреция");
                                if (callbackcounter === addingnodescount) {
                                    instance.reload("data");
                                    instance.addingStorage = null;
                                }
                            }
                        });
                    }
                } else if (instance.editingStorage) {
                    var edingnodescount = Object.keys(instance.editingStorage).length;
                    var callbackcounter = 0;
                    for (var key in instance.editingStorage) {
                        MB.Core.sendQuery(instance.editingStorage[key], function (res) {
                            if (parseInt(res.RC) ===  0) {
                                callbackcounter++;
                                toastr.success(res.MESSAGE, "Успешная опреция");
                                if (callbackcounter === edingnodescount) {
                                    instance.reload("data");
                                    instance.editingStorage = null;
                                }
                            }
                        });
                    }
                }
            } else if ($target.hasClass("delete_button")) {
                var yes = confirm("Вы уверены что хотите удалить эти данные?");
                if (yes) {
                    instance.$container.find(".selectedrow").each(function (i, el) {
                        $(el).find("a").each(function (i, el) {
                            var column = $(el).parent().data("column");
                            var row = $(el).parent().data("row");
                            instance.deletingStorage = instance.deletingStorage || {};
                            instance.deletingStorage[row] = {
                                "command": "remove",
                                "object": instance.profile.general.object,
                                "sid": MB.User.sid
                            };
                            instance.deletingStorage[row]["OBJVERSION"] = $(el).parent().parent().find("[data-column='OBJVERSION']").text();
                            instance.deletingStorage[row][instance.profile.general.primarykey] = row;
                        });
                    });
                    var deletingnodescount = Object.keys(instance.deletingStorage).length;
                    var callbackcounter = 0;
                    for (var key in instance.deletingStorage) {
                        MB.Core.sendQuery(instance.deletingStorage[key], function (res) {
                            console.log(res.RC);
                            if (parseInt(res.RC) ===  0) {
                                callbackcounter++;
                                toastr.info(res.MESSAGE, "Информация");
                                if (callbackcounter === deletingnodescount) {
                                    instance.reload("data");
                                    instance.deletingStorage = {};
                                }
                            } else {
                                instance.reload("data");
                                instance.deletingStorage = {};
                            }
                        });
                    }
                }
            } else if ($target.hasClass("restore_button")) {
                instance.$container.find(".editingrow").each(function (i, el) {
                    $(el).find("a").each(function (i2, el2) {
                        $(el2).editable("destroy");
                    });
                    $(el).removeClass("editingrow").addClass("justrow");
                });
                instance.$container.find(".addingrow").remove();
                instance.addingStorage = null;
                instance.editingStorage = null;
            }     
        });
        instance.$container.on("click", ".bottom-panel .pagination li", function (e) {
            var $targetli = $(e.target).parent();
            if ($targetli.hasClass("disabled") || $targetli.hasClass("active")) {
                return;
            } else if ($targetli.hasClass("prev")) {
                instance.profile.general.pageno -= 1;
                instance.reload("data pagination");
            } else if ($targetli.parent().hasClass("next")) {
                instance.profile.general.pageno += 1;
                instance.reload("data pagination");
            } else {
                var v = $targetli.find("a").text();
                instance.profile.general.pageno = v;
                instance.reload("data pagination");
            }
        });
        if (instance.profile.general.custom.bool()) {
            $.getScript( "html/tables/require/" + instance.name + ".js", function (data, status, xhr) {
                instance.custom(function () {
                    callback();
                });
            });
        } else {
            callback();    
        }
    }
}; 