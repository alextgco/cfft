(function() {
    window.log = function(s) {
        var log;
        log = console.log;
        return log.call(console, s);
    };

    $.cookie("language", "Rus", {
        expires: 7
    });

    if ($.fn.datetimepicker) {
        $.fn.datetimepicker.defaults = {
            maskInput: true,
            pickDate: true,
            pickTime: true,
            pick12HourFormat: false,
            pickSeconds: true,
            startDate: "2014-01-01",
            endDate: Infinity
        };
    }

    $('.username').html($.cookie('userfullname'));

    $('#changePack').on("click", function() {
        return printQuery({
            command: "CHANGE_PACK"
        });
    });

    $(".clear-all-sessions").on("click", function() {
        var obj;
        obj = {
            command: "clear_all_sessions"
        };
        return MB.Core.sendQuery(obj, function(response) {});
    });

    $('#clientScreen_showAfisha').on("click", function() {
        var fromDate, initAfisha, toDate;
        fromDate = $('#clientScreenWidget-content input[name="start"]').val();
        toDate = $('#clientScreenWidget-content input[name="end"]').val();
        initAfisha = function() {
            toClientscreen({
                type: 'list',
                fromDate: fromDate,
                toDate: toDate
            });
            if (MB.Core.cSreenWindow !== void 0) {
                MB.Core.cSreenWindow.window.onbeforeunload = function() {
                    return MB.Core.cSreenWindow = void 0;
                };
            }
        };
        if (MB.Core.cSreenWindow === void 0) {
            MB.Core.cSreenWindow = window.open(MB.Core.doc_root + "clientscreenview");
            return MB.Core.cSreenWindow.window.onload = function() {
                window.setTimeout((function() {
                    initAfisha();
                }), 300);
            };
        } else {
            return initAfisha();
        }
    });

    $('#clientScreen_closeOrder').on('click', function() {
        toClientscreen({
            type: 'closeOrder'
        });
        if (MB.Core.cSreenWindow !== void 0) {
            return MB.Core.cSreenWindow.window.onbeforeunload = function() {
                return MB.Core.cSreenWindow = void 0;
            };
        }
    });

    $("#open_action_14").on("click", function() {
        log("clicked");
        return MB.Core.switchModal({
            type: "content",
            filename: "one_action",
            id: MB.Core.guid(),
            params: {
                action_id: 14
            }
        });
    });

    $("#open_fundZones_30").on("click", function() {
        return MB.Core.switchModal({
            type: "content",
            filename: "fundZones",
            id: MB.Core.guid(),
            params: {
                hall_scheme_id: 30
            }
        });
    });

    $("#open_priceZones_30").on("click", function() {
        var o;
        return o = {
            name: "priceZones",
            hall_scheme_id: 30
        };
    });

    $(".synchronize").on("click", function() {
        var o;
        o = {
            command: "operation",
            object: "synchronize",
            sid: $.cookie("sid")
        };
        return MB.Core.sendQuery(o, function(a) {});
    });

    (function($, global, undefined_) {
        var MB, toastr;
        MB = MB || {};
        String.prototype.bool = function() {
            return /^(true|TRUE|True)$/i.test(this);
        };
        toastr = toastr || null;
        if (toastr) {
            toastr.options = {
                closeButton: true,
                debug: false,
                positionClass: "toast-bottom-right",
                onclick: null,
                showDuration: "1000",
                hideDuration: "1000",
                timeOut: "10000",
                extendedTimeOut: "1000",
                showEasing: "swing",
                hideEasing: "linear",
                showMethod: "fadeIn",
                hideMethod: "fadeOut"
            };
        }
        MB.User = {};
        MB.User.sid = $.cookie("sid");
        MB.O = {};
        MB.O.tables = {};
        MB.O.contents = {};
        MB.O.forms = {};
        MB.Core = {};
        MB.Core.getUserGuid = function() {
            var pGuid;
            pGuid = MB.Core.guid();
            if (!localStorage.getItem('printerGuid')) {
                localStorage.setItem('printerGuid', pGuid);
            } else {
                pGuid = localStorage.getItem('printerGuid');
            }
            return pGuid;
        };
        MB.Core.parseFormat = function(resold) {
            var key, key2, key3, key4, key5, resnew, value, value2, value3, _ref, _ref1;
            resnew = {};
            if (resold.hasOwnProperty("results")) {
                if (resold.results[0].hasOwnProperty("data")) {
                    _ref = resold.results[0];
                    for (key in _ref) {
                        value = _ref[key];
                        switch (key) {
                            case "data":
                                resnew.DATA = value;
                                break;
                            case "data_columns":
                                resnew.NAMES = value;
                                break;
                            case "data_info":
                                resnew.INFO = {
                                    ROWS_COUNT: value.rows_count,
                                    VIEW_NAME: value.view_name
                                };
                                break;
                            case "extra_data":
                                for (key2 in value) {
                                    value2 = value[key2];
                                    switch (key2) {
                                        case "object_profile":
                                            resnew.OBJECT_PROFILE = {};
                                            for (key3 in value2) {
                                                value3 = value2[key3];
                                                key4 = key3.toUpperCase();
                                                switch (key3) {
                                                    case "prepare_insert":
                                                        resnew.OBJECT_PROFILE[key4] = {
                                                            DATA: value3.data,
                                                            NAMES: value3.data_columns
                                                        };
                                                        break;
                                                    default:
                                                        resnew.OBJECT_PROFILE[key4] = value3;
                                                }
                                            }
                                            break;
                                        default:
                                            key5 = key2.toUpperCase();
                                            resnew[key5] = value2;
                                    }
                                }
                        }
                    }
                } else {
                    _ref1 = resold.results[0];
                    for (key in _ref1) {
                        value = _ref1[key];
                        key2 = key.toUpperCase();
                        switch (key) {
                            case "toastr":
                                resnew.TOAST_TYPE = value.type;
                                resnew.MESSAGE = value.message;
                                resnew.TITLE = value.title;
                                break;
                            case "code":
                                resnew.RC = value;
                                break;
                            default:
                                resnew[key2] = value;
                        }
                    }
                }
            }
            return resnew;
        };
        MB.Core.randomnumber = function() {
            return Math.floor(Math.random() * (1000000 - 0 + 1)) + 0;
        };
        MB.Core.guid = function() {
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxxx".replace(/[xy]/g, function(c) {
                var r, v;
                r = Math.random() * 16 | 0;
                v = (c === "x" ? r : r & 0x3 | 0x8);
                return v.toString(16);
            }).toUpperCase();
        };
        MB.Core.sendQuery = function(options, callback) {
            if ((options != null) && typeof options === "object" && (options.command != null)) {
                if (options.sid == null) {
                    options.sid = MB.User.sid;
                }
                if (location.hash === "#show_log") {
                    options.hash = location.hash;
                }
            }

            return socketQuery(options, function(result) {
                var JSONstring, key, key2, key3, key4, key5, res, ress, userInfo, value, value2, value3, _ref, _ref1, _ref2;
                res = JSON.parse(result);
                ress = {};
                if (res.results != null) {
                    if (res.results[0].data != null) {
                        _ref = res.results[0];
                        for (key in _ref) {
                            value = _ref[key];
                            switch (key) {
                                case "data":
                                    ress.DATA = value;
                                    break;
                                case "data_columns":
                                    ress.NAMES = value;
                                    break;
                                case "data_info":
                                    ress.INFO = {
                                        ROWS_COUNT: value.rows_count,
                                        VIEW_NAME: value.view_name
                                    };
                                    break;
                                case "extra_data":
                                    _ref1 = res.results[0][key];
                                    for (key2 in _ref1) {
                                        value2 = _ref1[key2];
                                        if (key2 === "object_profile") {
                                            ress.OBJECT_PROFILE = {};
                                            for (key3 in value2) {
                                                value3 = value2[key3];
                                                key4 = key3.toUpperCase();
                                                if (key3 === "prepare_insert" || key3 === "rmb_menu") {
                                                    ress.OBJECT_PROFILE[key4] = {
                                                        DATA: value3.data,
                                                        NAMES: value3.data_columns
                                                    };
                                                } else {
                                                    ress.OBJECT_PROFILE[key4] = value3;
                                                }
                                            }
                                        } else {
                                            key5 = key2.toUpperCase();
                                            ress[key5] = value2;
                                        }
                                    }
                            }
                        }
                    } else {
                        _ref2 = res.results[0];
                        for (key in _ref2) {
                            value = _ref2[key];
                            key2 = key.toUpperCase();
                            switch (key) {
                                case "toastr":
                                    ress.TOAST_TYPE = value.type;
                                    ress.MESSAGE = value.message;
                                    ress.TITLE = value.title;
                                    break;
                                case "code":
                                    ress.RC = value;
                                    break;
                                default:
                                    ress[key2] = value;
                            }
                        }
                    }
                }
                console.log(ress);
                if (ress.RC != null) {
                    if (parseInt(ress.RC) === 0) {
                        if (ress.TICKET_PACK_USER_INFO) {
                            JSONstring = ress.TICKET_PACK_USER_INFO;
                            userInfo = new userInfoClass({
                                JSONstring: JSONstring
                            }).userInfo_Refresh();
                        }
                        if (typeof callback === "function") {
                            return callback(ress);
                        }
                    } else if (parseInt(ress.RC) === -2) {
                        if (toastr) {
                            toastr[ress.TOAST_TYPE](ress.MESSAGE);
                        } else {
                            console.warn("Ваша сессия не актульна, зайдите на сайт пожалуйста заново, MB.Core.sendQuery");
                        }
                        return setTimeout((function() {
                            //$.removeCookie("sid");
                            //return document.location.href = "login.html";
                        }), 3000);
                    } else {
                        if (typeof callback === "function") {
                            return callback(ress);
                        }
                    }
                } else {
                    if (typeof callback === "function") {
                        return callback(ress);
                    }
                }
            });
        };
        MB.Core.makeQuery = function(options, callback) {
            var key, xml;
            xml = "<query>";
            if (options && typeof options === "object" && options.object && options.command) {
                if (options.hasOwnProperty("params")) {
                    for (key in options.params) {
                        xml += "<" + key + ">" + options.params[key] + "</" + key + ">";
                    }
                    delete options.params;
                }
                for (key in options) {
                    xml += "<" + key + ">" + options[key] + "</" + key + ">";
                }
                xml += "</query>";
            }
            return xml;
        };
        MB.Core.getClientWidth = function() {
            if (window.innerWidth) {
                return window.innerWidth;
            } else {
                if (document.documentElement.clientWidth) {
                    return document.documentElement.clientWidth;
                } else {
                    return document.body.offsetWidth;
                }
            }
        };
        MB.Core.getClientHeight = function() {
            if (window.innerHeight) {
                return window.innerHeight;
            } else {
                if (document.documentElement.clientHeight) {
                    return document.documentElement.clientHeight;
                } else {
                    return document.body.offsetHeight;
                }
            }
        };
        MB.User.activepage = "content_index";
        MB.User.loadedpages = ["content_index"];
        MB.Core.$pageswrap = $(".page-content-wrapper");
        MB.Core.switchPage = function(options) {
            var content, modalmini, report, table;
            if (options.type) {
                if (options.type === "table" && options.name) {
                    if (MB.Table.hasloaded(options.name)) {
                        if (options.where !== "") {
                            MB.O.tables[options.name].constructorWhere = options.where;
                        }
                        MB.O.tables[options.name].reload("data");
                        return MB.Table.show("page", options.name);
                    } else {
                        table = new MB.Table({
                            world: "page",
                            name: options.name,
                            where: options.where || ""
                        });
                        return table.create(function() {
                            return table.showit();
                        });
                    }
                } else if (options.type === "content" && options.filename) {
                    if (MB.Content.hasloaded(options.filename)) {
                        return MB.Content.find(options.filename).showit();
                    } else {
                        content = new MB.Content({
                            world: "page",
                            filename: options.filename
                        });
                        return content.create(function() {
                            content.showit();
                            return content.init();
                        });
                    }
                } else if (options.type === "modalmini" && options.name) {
                    modalmini = new MB.modalmini({
                        objectname: options.name,
                        world: "page",
                        pageswrap: MB.Core.$pageswrap
                    });
                    return modalmini.init();
                } else if (options.type === "report" && options.name) {
                    report = new MB.reportClass({
                        objectname: options.name,
                        world: "page",
                        pageswrap: MB.Core.$pageswrap
                    });
                    return report.init();
                }
            }
        };
        MB.Core.cloneObj = function(obj) {
            var key, temp;
            if ((obj == null) || typeof obj !== "object") {
                return obj;
            }
            temp = {};
            for (key in obj) {
                temp[key] = MB.Core.cloneObj(obj[key]);
            }
            return temp;
        };
        MB.Core.ModalMiniContent = function(obj) {
            var ModalBody, ModalDiv, ModalHeader, key, _fn;
            ModalDiv = $(obj.selector);
            ModalHeader = ModalDiv.find(".modal-header");
            ModalBody = ModalDiv.find(".modal-body");
            ModalHeader.html(obj.title);
            ModalBody.html(obj.content);
            $(".modal-footer").html("");
            _fn = function(key) {
                var html, val;
                val = obj["buttons"][key];
                html = "";
                html += "<button type=\"button\" class=\"btn " + val["color"] + " btn_" + key + "\" " + val["dopAttr"] + ">" + val["label"] + "</button>";
                $(".modal-footer").append(html);
                return $(".btn_" + key).click(function() {
                    return val.callback();
                });
            };
            for (key in obj["buttons"]) {
                _fn(key);
            }
            if (obj.modalType !== undefined) {
                ModalDiv.find(".modal-dialog").addClass(obj.modalType);
            }
            if (obj.modalWidth !== undefined) {
                ModalDiv.find(".modal-dialog").css("width", obj.modalWidth);
            }
            if (obj.css !== undefined) {
                ModalDiv.find(".modal-dialog").css(obj.css);
            }
            return ModalDiv.modal("show");
        };
        MB.Modal = {};
        MB.Modal.activemodal = null;
        MB.Modal.modalsqueue = [];
        MB.Modal.loadedmodals = [];
        MB.Modal.countmodals = 0;
        MB.Modal.opened = false;
        MB.Modal.$wrapper = $(".modal-content-wrapper");
        MB.Modal.$container = $(".bt-menu");
        MB.Modal.$modalslist = $(".modals-list");
        MB.Modal.itemsinit = function() {
            return MB.Modal.$modalslist.on("click", "li", function(e) {
                var $target, content, iscross, newObj, object, type;
                $target = $(e.target);
                object = $(this).data("object");
                type = $(this).data("type");
                iscross = $target.hasClass("cross");
                if (iscross) {
                    if (MB.O.forms.hasOwnProperty(MB.Modal.activemodal)) {
                        if (MB.O.forms[MB.Modal.activemodal].parentobject != null) {
                            MB.O.tables[MB.O.forms[MB.Modal.activemodal].parentobject].reload("data");
                        }
                    }
                    if (MB.Modal.countmodals === 1) {
                        if (type === "content") {
                            content = MB.Content.find(object);
                            if (content.onClose != null) {
                                content.onClose();
                            }
                        }
                        MB.Modal.closefull();
                        return MB.Modal.$modalslist.off("click");
                    } else if (MB.Modal.countmodals > 1) {
                        if (MB.Modal.activemodal !== object) {
                            if (type === "content") {
                                content = MB.Content.find(object);
                                if (content.onClose != null) {
                                    content.onClose();
                                }
                            }
                            MB.Modal.loadedmodals.splice(MB.Modal.loadedmodals.indexOf(object), 1);
                            MB.Modal.modalsqueue.splice(MB.Modal.modalsqueue.indexOf(object), 1);
                            if (MB.Modal.lastmodal === object) {
                                MB.Modal.lastmodal = "closed";
                            }
                            MB.Modal.countmodals--;
                            delete MB.O[type + "s"][object];
                            return MB.Modal.remove(object);
                        } else if (MB.Modal.activemodal === object) {
                            if (MB.Modal.modalsqueue.indexOf(object) === (MB.Modal.countmodals - 1)) {
                                MB.Modal.hide(MB.Modal.activemodal);
                                MB.Modal.activemodal = MB.Modal.modalsqueue[MB.Modal.modalsqueue.indexOf(object) - 1];
                                MB.Modal.show(MB.Modal.activemodal);
                                MB.Modal.activateitem(MB.Modal.activemodal);
                                newObj = MB.Content.find(MB.Modal.activemodal);
                                if (newObj.type === "content") {
                                    if (newObj.onFocus != null) {
                                        newObj.onFocus();
                                    }
                                }
                                if (type === "content") {
                                    content = MB.Content.find(object);
                                    if (content.onClose != null) {
                                        content.onClose();
                                    }
                                }
                                MB.Modal.loadedmodals.splice(MB.Modal.loadedmodals.indexOf(object), 1);
                                MB.Modal.modalsqueue.splice(MB.Modal.modalsqueue.indexOf(object), 1);
                                MB.Modal.countmodals--;
                                delete MB.O[type + "s"][object];
                                return MB.Modal.remove(object);
                            } else {
                                MB.Modal.hide(MB.Modal.activemodal);
                                MB.Modal.activemodal = MB.Modal.modalsqueue[MB.Modal.modalsqueue.indexOf(object) + 1];
                                MB.Modal.show(MB.Modal.activemodal);
                                MB.Modal.activateitem(MB.Modal.activemodal);
                                newObj = MB.Content.find(MB.Modal.activemodal);
                                if (newObj.type === "content") {
                                    if (newObj.onFocus != null) {
                                        newObj.onFocus();
                                    }
                                }
                                if (type === "content") {
                                    content = MB.Content.find(object);
                                    if (content.onClose != null) {
                                        content.onClose();
                                    }
                                }
                                MB.Modal.loadedmodals.splice(MB.Modal.loadedmodals.indexOf(object), 1);
                                MB.Modal.modalsqueue.splice(MB.Modal.modalsqueue.indexOf(object), 1);
                                MB.Modal.countmodals--;
                                delete MB.O[type + "s"][object];
                                return MB.Modal.remove(object);
                            }
                        }
                    }
                } else {
                    if (type === "content") {
                        content = MB.Content.find(object);
                        if (content.onFocus != null) {
                            if (MB.Modal.activemodal !== object) {
                                MB.Modal.hide(MB.Modal.activemodal);
                                MB.Modal.activemodal = object;
                                MB.Modal.show(object);
                                MB.Modal.activateitem(object);
                                return content.onFocus();
                            }
                        } else {
                            MB.Modal.hide(MB.Modal.activemodal);
                            MB.Modal.activemodal = object;
                            MB.Modal.show(object);
                            return MB.Modal.activateitem(object);
                        }
                    } else {
                        if (MB.Modal.activemodal !== object) {
                            MB.Modal.hide(MB.Modal.activemodal);
                            MB.Modal.activemodal = object;
                            MB.Modal.show(object);
                            return MB.Modal.activateitem(object);
                        }
                    }
                }
            });
        };
        MB.Modal.closefull = function() {
            var i, key, l;
            if ($("#modal_" + MB.Modal.activemodal + "_wrapper .edited").length > 0) {
                return bootbox.dialog({
                    message: "Вы уверены что хотите выйти из формы не сохранив изменения?",
                    title: "Есть не сохраннные изменения",
                    buttons: {
                        success: {
                            label: "Да",
                            assName: "green",
                            callback: function() {
                                var i, key, l;
                                i = 0;
                                l = MB.Modal.modalsqueue.length;
                                while (i < l) {
                                    for (key in MB.O) {
                                        if (MB.O[key].hasOwnProperty(MB.Modal.modalsqueue[i])) {
                                            delete MB.O[key][MB.Modal.modalsqueue[i]];
                                        }
                                    }
                                    i++;
                                }
                                MB.Modal.$wrapper.empty();
                                MB.Modal.$modalslist.empty();
                                MB.Modal.loadedmodals = [];
                                MB.Modal.modalsqueue = [];
                                MB.Modal.activemodal = null;
                                MB.Modal.countmodals = 0;
                                classie.remove(document.getElementById("bt-menu"), "bt-menu-open");
                                return MB.Modal.opened = false;
                            }
                        },
                        danger: {
                            label: "Нет",
                            className: "red",
                            callback: function() {}
                        }
                    }
                });
            } else {
                i = 0;
                l = MB.Modal.modalsqueue.length;
                while (i < l) {
                    for (key in MB.O) {
                        if (MB.O[key].hasOwnProperty(MB.Modal.modalsqueue[i])) {
                            delete MB.O[key][MB.Modal.modalsqueue[i]];
                        }
                    }
                    i++;
                }
                MB.Modal.$wrapper.empty();
                MB.Modal.$modalslist.empty();
                MB.Modal.loadedmodals = [];
                MB.Modal.modalsqueue = [];
                MB.Modal.activemodal = null;
                MB.Modal.countmodals = 0;
                classie.remove(document.getElementById("bt-menu"), "bt-menu-open");
                return MB.Modal.opened = false;
            }
        };
        MB.Modal.open = function(callback) {
            classie.add(document.getElementById("bt-menu"), "bt-menu-open");
            MB.Modal.opened = true;
            MB.Modal.itemsinit();
            return setTimeout(callback(), 350);
        };
        MB.Modal.remove = function(name) {
            MB.Modal.$wrapper.find("#modal_" + name + "_wrapper").remove();
            return MB.Modal.$container.find(".modals-list").find("[data-object='" + name + "']").remove();
        };
        MB.Modal.hide = function(name) {
            return MB.Modal.$wrapper.find("#modal_" + name + "_wrapper").hide();
        };
        MB.Modal.close = function(name) {
            $("#modal_" + name + "_wrapper .edited").length > 0;
            MB.Modal.remove(name);
            MB.Modal.activemodal = MB.Modal.modalsqueue[MB.Modal.modalsqueue.indexOf(name) - 1];
            MB.Modal.show(MB.Modal.activemodal);
            MB.Modal.activateitem(MB.Modal.activemodal);
            return MB.Modal.countmodals--;
        };
        MB.Modal.show = function(name) {
            return MB.Modal.$wrapper.find("#modal_" + name + "_wrapper").show();
        };
        MB.Modal.additem = function(name, type) {
            var html, object;
            object = MB.O[type + "s"][name];
            html = "<li data-type='" + type + "' data-object='" + (object.id || object.name) + "'><i class='cross fa fa-times-circle'></i>" + (object.label || object.filename || object.profile.general.objectname || object.profile.general.tablename) + "</li>";
            return MB.Modal.$container.find(".modals-list").append(html);
        };
        MB.Modal.activateitem = function(name) {
            MB.Modal.$modalslist.find(".activateitem").removeClass(".activeitem");
            return MB.Modal.$modalslist.find("[data-object='" + name + "']").addClass("activeitem");
        };
        MB.Core.switchModal = function(options) {
            var content, form, table;
            if (options.type) {
                if (options.type === "form" && options.name) {
                    if (MB.Modal.opened) {
                        if (MB.Modal.countmodals === 1) {
                            if (MB.Modal.activemodal === options.name) {
                                return toastr.info("Это уже открыто", "Информация");
                            } else {
                                form = new MB.Form(options);
                                return form.create(function() {
                                    MB.Modal.hide(MB.Modal.activemodal);
                                    MB.Modal.activemodal = options.name;
                                    MB.Modal.show(options.name);
                                    MB.Modal.additem(options.name, options.type);
                                    MB.Modal.activateitem(options.name);
                                    MB.Modal.loadedmodals.push(options.name);
                                    MB.Modal.modalsqueue.push(options.name);
                                    return MB.Modal.countmodals++;
                                });
                            }
                        } else if (MB.Modal.countmodals > 1) {
                            if (MB.Modal.activemodal === options.name) {
                                return toastr.info("Это уже открыто", "Информация");
                            } else if (MB.Form.hasloaded(options.name)) {
                                MB.Modal.hide(MB.Modal.activemodal);
                                MB.Modal.activemodal = options.name;
                                MB.Modal.show(options.name);
                                return MB.Modal.activateitem(options.name);
                            } else {
                                form = new MB.Form(options);
                                return form.create(function() {
                                    MB.Modal.hide(MB.Modal.activemodal);
                                    MB.Modal.activemodal = options.name;
                                    MB.Modal.show(options.name);
                                    MB.Modal.additem(options.name, options.type);
                                    MB.Modal.activateitem(options.name);
                                    MB.Modal.loadedmodals.push(options.name);
                                    MB.Modal.modalsqueue.push(options.name);
                                    return MB.Modal.countmodals++;
                                });
                            }
                        }
                    } else {
                        return MB.Modal.open(function() {
                            form = new MB.Form(options);
                            MB.Modal.activemodal = options.name;
                            return form.create(function() {
                                MB.Modal.activemodal = options.name;
                                MB.Modal.show(options.name);
                                MB.Modal.additem(options.name, options.type);
                                MB.Modal.activateitem(options.name);
                                MB.Modal.loadedmodals.push(options.name);
                                MB.Modal.modalsqueue.push(options.name);
                                return MB.Modal.countmodals++;
                            });
                        });
                    }
                } else if (options.type === "table") {
                    if (MB.Modal.opened) {
                        if (MB.Modal.countmodals === 1) {
                            if (MB.Modal.activemodal === options.name) {
                                return toastr.info("Эта таблица сейчас открыта", "Информация");
                            } else {
                                table = new MB.Table({
                                    world: "modal",
                                    name: options.name,
                                    params: options.params
                                });
                                return table.create(function() {
                                    MB.Modal.hide(MB.Modal.activemodal);
                                    MB.Modal.activemodal = options.name;
                                    MB.Modal.show(options.name);
                                    MB.Modal.additem(options.name, options.type);
                                    MB.Modal.activateitem(options.name);
                                    MB.Modal.loadedmodals.push(options.name);
                                    MB.Modal.modalsqueue.push(options.name);
                                    return MB.Modal.countmodals++;
                                });
                            }
                        } else if (MB.Modal.countmodals > 1) {
                            if (MB.Modal.activemodal === options.name) {
                                return toastr.info("Эта таблица сейчас открыта", "Информация");
                            } else if (MB.Form.hasloaded(options.name)) {
                                MB.Modal.hide(MB.Modal.activemodal);
                                MB.Modal.lastmodal = MB.Modal.activemodal;
                                MB.Modal.activemodal = options.name;
                                MB.Modal.show(options.name);
                                return MB.Modal.activateitem(options.name);
                            } else {
                                table = new MB.Table({
                                    world: "modal",
                                    name: options.name,
                                    params: options.params
                                });
                                return table.create(function() {
                                    MB.Modal.hide(MB.Modal.activemodal);
                                    MB.Modal.activemodal = options.name;
                                    MB.Modal.show(options.name);
                                    MB.Modal.additem(options.name, options.type);
                                    MB.Modal.activateitem(options.name);
                                    MB.Modal.loadedmodals.push(options.name);
                                    MB.Modal.modalsqueue.push(options.name);
                                    return MB.Modal.countmodals++;
                                });
                            }
                        }
                    } else {
                        return MB.Modal.open(function() {
                            table = new MB.Table({
                                world: "modal",
                                name: options.name,
                                params: options.params
                            });
                            return table.create(function() {
                                MB.Modal.activemodal = options.name;
                                MB.Modal.show(options.name);
                                MB.Modal.additem(options.name, options.type);
                                MB.Modal.activateitem(options.name);
                                MB.Modal.loadedmodals.push(options.name);
                                MB.Modal.modalsqueue.push(options.name);
                                return MB.Modal.countmodals++;
                            });
                        });
                    }
                } else if (options.type === "content" && options.filename) {
                    if (MB.Modal.opened) {
                        console.log("modal is opened");
                        if (options.params.newerGuid != null) {
                            console.log("options.params.newerGuid != null (" + options.params.newerGuid + ")");
                            if (MB.Modal.loadedmodals.indexOf(options.params.newerGuid) > -1) {
                                console.log("MB.Modal.loadedmodals.indexOf(options.params.newerGuid) > -1");
                                MB.Modal.hide(MB.Modal.activemodal);
                                MB.Modal.lastmodal = MB.Modal.activemodal;
                                MB.Modal.activemodal = options.params.newerGuid;
                                MB.Modal.show(options.params.newerGuid);
                                return MB.Modal.activateitem(options.params.newerGuid);
                            } else {
                                console.log("not MB.Modal.loadedmodals.indexOf(options.params.newerGuid) > -1");
                                content = new MB.Content({
                                    world: "modal",
                                    filename: options.filename,
                                    id: options.params.newerGuid,
                                    params: options.params
                                });
                                return content.create(function() {
                                    MB.Modal.hide(MB.Modal.activemodal);
                                    MB.Modal.activemodal = content.id;
                                    MB.Modal.show(content.id);
                                    MB.Modal.additem(content.id, options.type);
                                    MB.Modal.activateitem(content.id);
                                    MB.Modal.loadedmodals.push(content.id);
                                    MB.Modal.modalsqueue.push(content.id);
                                    MB.Modal.countmodals++;
                                    return content.init();
                                });
                            }
                        } else {
                            console.log("options.params.newerGuid == null");
                            content = new MB.Content({
                                world: "modal",
                                filename: options.filename,
                                id: MB.Core.guid(),
                                params: options.params
                            });
                            return content.create(function() {
                                MB.Modal.hide(MB.Modal.activemodal);
                                MB.Modal.activemodal = content.id;
                                MB.Modal.show(content.id);
                                MB.Modal.additem(content.id, options.type);
                                MB.Modal.activateitem(content.id);
                                MB.Modal.loadedmodals.push(content.id);
                                MB.Modal.modalsqueue.push(content.id);
                                MB.Modal.countmodals++;
                                return content.init();
                            });
                        }
                    } else {
                        console.log("modal was closed");
                        return MB.Modal.open(function() {
                            content = new MB.Content({
                                world: "modal",
                                filename: options.filename,
                                id: MB.Core.guid(),
                                params: options.params
                            });
                            return content.create(function() {
                                MB.Modal.activemodal = content.id;
                                MB.Modal.show(content.id);
                                MB.Modal.additem(content.id, options.type);
                                MB.Modal.activateitem(content.id);
                                MB.Modal.loadedmodals.push(content.id);
                                MB.Modal.modalsqueue.push(content.id);
                                MB.Modal.countmodals++;
                                return content.init();
                            });
                        });
                    }
                }
            }
        };
        MB.Core.makepagewrap = function(name) {
            return "<div id='page_" + name + "_wrapper' class='page-item' style='display:none'></div>";
        };
        MB.Core.makemodalwrap = function(name) {
            return "<div id='modal_" + name + "_wrapper' class='modal-item' style='display:none'></div>";
        };
        window.sendQuery2 = function(req, cb) {
            socket2.emit("query", req);
            return socket2.on("sendQuery2Response", function(res) {
                var key, key2, key3, key4, key5, ress, value, value2, value3, _ref, _ref1, _ref2;
                ress = {};
                if (res.results != null) {
                    if (res.results[0].data != null) {
                        _ref = res.results[0];
                        for (key in _ref) {
                            value = _ref[key];
                            switch (key) {
                                case "data":
                                    ress.DATA = value;
                                    break;
                                case "data_columns":
                                    ress.NAMES = value;
                                    break;
                                case "data_info":
                                    ress.INFO = {
                                        ROWS_COUNT: value.rows_count,
                                        VIEW_NAME: value.view_name
                                    };
                                    break;
                                case "extra_data":
                                    _ref1 = res.results[0][key];
                                    for (key2 in _ref1) {
                                        value2 = _ref1[key2];
                                        if (key2 === "object_profile") {
                                            ress.OBJECT_PROFILE = {};
                                            for (key3 in value2) {
                                                value3 = value2[key3];
                                                key4 = key3.toUpperCase();
                                                if (key3 === "prepare_insert") {
                                                    ress.OBJECT_PROFILE[key4] = {
                                                        DATA: value3.data,
                                                        NAMES: value3.data_columns
                                                    };
                                                } else {
                                                    ress.OBJECT_PROFILE[key4] = value3;
                                                }
                                            }
                                        } else {
                                            key5 = key2.toUpperCase();
                                            ress[key5] = value2;
                                        }
                                    }
                            }
                        }
                    } else {
                        _ref2 = res.results[0];
                        for (key in _ref2) {
                            value = _ref2[key];
                            key2 = key.toUpperCase();
                            switch (key) {
                                case "toastr":
                                    ress.TOAST_TYPE = value.type;
                                    ress.MESSAGE = value.message;
                                    ress.TITLE = value.title;
                                    break;
                                case "code":
                                    ress.RC = value;
                                    break;
                                default:
                                    ress[key2] = value;
                            }
                        }
                    }
                }
                console.log(ress);
                return cb(ress);
            });
        };
        MB.Core.jsonToObj = function(obj) {
            var i, index, objIndex, obj_true;
            i = void 0;
            index = void 0;
            objIndex = void 0;
            obj_true = void 0;
            obj_true = {};
            objIndex = {};
            if (obj["DATA"] !== undefined) {
                for (i in obj["DATA"]) {
                    for (index in obj["NAMES"]) {
                        if (obj_true[i] === undefined) {
                            obj_true[i] = {};
                        }
                        obj_true[i][obj["NAMES"][index]] = obj["DATA"][i][index];
                    }
                }
            } else if (obj["data"] !== undefined) {
                for (i in obj["data"]) {
                    if (obj["names"] !== undefined) {
                        for (index in obj["names"]) {
                            if (obj_true[i] === undefined) {
                                obj_true[i] = {};
                            }
                            obj_true[i][obj["names"][index]] = obj["data"][i][index];
                        }
                    } else if (obj["data_columns"] !== undefined) {
                        for (index in obj["data_columns"]) {
                            if (obj_true[i] === undefined) {
                                obj_true[i] = {};
                            }
                            obj_true[i][obj["data_columns"][index]] = obj["data"][i][index];
                        }
                    }
                }
            }
            return obj_true;
        };
        MB.Core.renderOrderPaymentType = function(obj) {
            var html;
            obj = MB.Core.jsonToObj(obj);
            html = "<div class=\"form_order_mini-content-wrapper\"></div> <div class=\"row\"> <div class=\"col-md-4 col-md-offset-8 StrOrderAmount\"> Мест " + obj[0]["COUNT_TO_PAY_TICKETS"] + " билетов " + obj[0]["TICKETS_COUNT"] + " на сумму <input value=\"" + obj[0]["TOTAL_ORDER_AMOUNT"] + "\" size=\"5\" disabled class=\"orderAmount\" /> <form class=\"formOrderMini\" role=\"form\"> <div class=\"form-group\"> <div class=\"left\"> <div id=\"btnOrderAmount_CASH\" class=\"btn blue pull-left btnOrderAmount\"><i class=\"fa fa-money\"></i></div> <div class=\"pull-left text\">Оплата наличными</div> </div> <input type=\"text\" class=\"pull-left\" id=\"\" name=\"CASH_AMOUNT\" placeholder=\"0\" size=\"5\" /> <div class=\"clearfix\"></div> </div> <div class=\"form-group\"> <div class=\"left\"> <div id=\"btnOrderAmount_CARD\" class=\"btn blue pull-left btnOrderAmount\"><i class=\"fa fa-credit-card\"></i></div> <div class=\"pull-left text\">Оплата банковской картой</div> </div> <input type=\"text\" class=\"pull-left\" id=\"\" name=\"CARD_AMOUNT\" placeholder=\"0\" size=\"5\"> <div class=\"clearfix\"></div> </div> <div class=\"form-group\"> <div class=\"left\"> <div id=\"btnOrderAmount_GIFT_CARD\" class=\"btn blue pull-left btnOrderAmount\"><i class=\"fa fa-gift\"></i> </div> <div class=\"pull-left text\">Оплата подарочной картой</div> </div> <input type=\"text\" class=\"pull-left\" id=\"\" name=\"GIFT_CARD_AMOUNT\" placeholder=\"0\" size=\"5\"> <div class=\"clearfix\"></div> </div> </form> </div> </div>";
            return html;
        };
        MB.Core.sendQueryForObj = function(o, callback) {
            return MB.Core.sendQuery(o, function(res) {
                if (parseInt(res.RC) === 0) {
                    console.log("toastr", toastr);
                    window.toastr.success(res.MESSAGE, "Ок");
                    return callback(res);
                } else {
                    return window.toastr.error(res.MESSAGE, "");
                }
            });
        };
        MB.Core.helper = {};
        return window.MB = MB;
    })(jQuery, window, undefined);

}).call(this);