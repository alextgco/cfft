var MBOOKER = MBOOKER || {};

MBOOKER.App = {};
MBOOKER.Classes = {};
MBOOKER.Fn = {};
MBOOKER.Fn = {};
MBOOKER.Map = {};
MBOOKER.Menu = {};
MBOOKER.Modals = {};
MBOOKER.Pages = {};
MBOOKER.Settings = {};
MBOOKER.UserData = {};

MBOOKER.Pages.activePage = "index";
MBOOKER.Pages.loadedPages = ["index"];
MBOOKER.Pages.typeOfActivePage = "content";
MBOOKER.Pages.pages = {};
MBOOKER.Pages.pages.contents = {};
MBOOKER.Pages.pages.tables = {};

MBOOKER.Modals.activeModal = null;
MBOOKER.Modals.loadedModals = [];
MBOOKER.Modals.typeOfActiveModal = null;
MBOOKER.Modals.modals = {};
MBOOKER.Modals.modals.contents = {};
MBOOKER.Modals.modals.forms = {};
MBOOKER.Modals.modals.tables = {};

$.cookie("language", "Rus", {expires:7});

if ($.fn.datetimepicker) {
    $.fn.datetimepicker.defaults = {
      maskInput: true,           // disables the text input mask
      pickDate: true,            // disables the date picker
      pickTime: true,            // disables de time picker
      pick12HourFormat: false,   // enables the 12-hour format time picker
      pickSeconds: true,         // disables seconds in the time picker
      startDate: "2014-01-01",      // set a minimum date
      endDate: Infinity          // set a maximum date
    };

}

/*  Отладочные функции    */
function log(s){
    window.console.log(s);
}

/*  КОНЕЦ Отладочные функции    */

/*   Подключение модулей   */
    // $("body").prepend('<div id="for_alert"></div>');
    // $("#for_alert").load("assets/js/alert/alert.html");
/*   КОНЕЦ Подключение модулей   */


MBOOKER.Fn.getScript = function (url) {
    var script = document.createElement('script');
    script.src = url;
    document.getElementsByTagName('head')[0].appendChild(script);
}; 

MBOOKER.Fn.require = function (url) {
    var script = document.createElement('script');
    script.src = url;
    document.getElementsByTagName('head')[0].appendChild(script);
}; 

// Object.prototype.countObj = function (obj) {
//     return Object.keys(obj).length;
// };

MBOOKER.Fn.countObj = function (obj) {
	return Object.keys(obj).length;
};

MBOOKER.Fn.getClientWidth = function(){
    return (window.innerWidth ? window.innerWidth : (document.documentElement.clientWidth ? document.documentElement.clientWidth : document.body.offsetWidth));
};
MBOOKER.Fn.getClientHeight = function(){
    return (window.innerHeight ? window.innerHeight : (document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.offsetHeight));
};

var o = {
    "NAMES": ["ADDR_ID","ADDR","STATUS","OBJVERSION"],
    "DATA":[ 
        ["1","115054","ACTIVE","20140113150734"], 
        ["2","ул.","ACTIVE","20140113150932"], 
        ["102","улица","ACTIVE","20140113150319"] 
    ], 
    "INFO": {"ROWS_COUNT":"3","VIEW":"HALL_ADDRESSES"}
};

MBOOKER.Fn.sendQuery = function (obj, callback) {
    var o = obj.subcommand;
    delete obj.subcommand;
    obj.object = o;
    var xml = "";
    var url = "/cgi-bin/b2cJ";
    xml = "p_xml=<query>";
    if (typeof obj === "object") {
        if (obj.hasOwnProperty("command")) {
            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    if (i === "params") {
                        if (typeof obj[i] === "object") {
                            for (var j in obj.params) {
                                xml += "<" + j + ">" + obj.params[j] + "</" + j + ">";
                            }
                        }
                    } else {
                        xml += "<" + i + ">" + obj[i] + "</" + i + ">";
                    }              
                }
            }    
        } else {
            toastr.error("В обекте не передан обязательный параметр command", "Ошибка");
        }        
    } else {
        toastr.error("Не передали объект в sendQuery", "MBOOKER.Fn.sendQuery");
    }
    xml += "</query>";
    $.getJSON( url, xml, function (response, textStatus, jqXHR) {
        if (textStatus === "success") {
            if (response && typeof response === "object") {
                if (response.hasOwnProperty("RC")) {
                    var rc = parseInt(response.RC);
                    if (rc === 0) {
                        if(typeof callback == "function"){callback(response);}
                    } else if (rc === -2) {
                        toastr.error("Ваша сессия не актульна, зайдите на сайт пожалуйста заново", "MBOOKER.Fn.sendQuery");
                        setTimeout(
                            function () {
                                $.removeCookie("sid")
                                document.location.href = "login.html";                                
                            }
                        , 3000);
                    } else {
                        toastr.error("Ошибка: " + response.RC + ": " + response.MESSAGE, "MBOOKER.Fn.sendQuery");
                        if(typeof callback == "function"){callback(response);}
                    }
                } else if (response.hasOwnProperty("DATA")) {
                    if (Array.prototype.isPrototypeOf(response.DATA)) {
                        if(typeof callback == "function"){callback(response);}
                    } else {
                        toastr.error("'DATA' не массив! :(", "MBOOKER.Fn.sendQuery");
                    }
                } else {
                    if(typeof callback == "function"){callback(response);}
                }
            }
        } else {
            toastr.error("Статус ответа не success, значит надо смотреть консоль :)", "MBOOKER.Fn.sendQuery");
        }
    });
};

MBOOKER.Fn.jsonToObj = function(obj){
    var obj_true = {};
    var objIndex = {};
    for (i in obj['DATA']){
        for(var index in obj['NAMES']){
            if(obj_true[i] == undefined){obj_true[i] = {};}
            obj_true[i][obj['NAMES'][index]] = obj['DATA'][i][index];
        }
    }
    return obj_true;
}

MBOOKER.Fn.createWrapperHTML = function (area, type, nameOrSubcommand) {
    if (area && type && nameOrSubcommand && typeof area === "string" && typeof type === "string" && typeof nameOrSubcommand === "string") {
        if (area === "modal") {
            return "<div id='modal_" + type + "_" + nameOrSubcommand + "_wrapper' class='modal-content' style='display:none'></div>";
        } else if (area === "page") {
            return "<div id='page_" + type + "_" + nameOrSubcommand + "_wrapper' class='page-content' style='display:none;position:relative'></div>";
        }
    }
};

MBOOKER.Fn.getContentEnvironment = function (name) {
    if (MBOOKER.App.contentArea === "page") {
        return MBOOKER.Pages.pages.contents[name];
    } else if (MBOOKER.App.contentArea === "modal") {
        return MBOOKER.Modals.modals.contents[name];
    } else {
        return 1;
    }
};

MBOOKER.Fn.getEnv = function (name) {
    if (MBOOKER.App.contentArea === "page") {
        return MBOOKER.Pages.pages.contents[name];
    } else if (MBOOKER.App.contentArea === "modal") {
        return MBOOKER.Modals.modals.contents[name];
    }
};

MBOOKER.Fn.switchPage = function (type, obj) {
    if (type && obj && typeof type === "string" && typeof obj === "object") {
        if (type === "content" && obj.name && typeof obj.name === "string") {
            if (MBOOKER.Pages.activePage === obj.name) {
                console.log("Это сейчас открыто");
            } else if (MBOOKER.Pages.loadedPages.indexOf(obj.name) === -1) {
                var content = new MBOOKER.Classes.Content("page", obj);
                MBOOKER.Pages.pages.contents[obj.name] = content;
                MBOOKER.Pages.pages.contents[obj.name].init();
                MBOOKER.Pages.activePage = obj.name;
                MBOOKER.Pages.loadedPages.push(obj.name);  
                MBOOKER.Pages.typeOfActivePage = type;  
                MBOOKER.App.contentArea = "page";
            } else if (MBOOKER.Pages.loadedPages.indexOf(obj.name) !== -1) {
                MBOOKER.Pages.pages.contents[obj.name].show();
                MBOOKER.Pages.activePage = obj.name;
            }                                  
        } else if (type === "table" && obj.subcommand && typeof obj.subcommand === "string") {
            if (MBOOKER.Pages.activePage === obj.subcommand) {
                console.log("Это сейчас открыто");
            } else if (MBOOKER.Pages.loadedPages.indexOf(obj.subcommand) === -1) {
                var table = new MB.Table({objectname: "table_hall_addresses"});
                table.init();
                // MBOOKER.Pages.pages.tables[obj.subcommand] = table;
                // MBOOKER.Pages.pages.tables[obj.subcommand].rows = {};
                // MBOOKER.Pages.pages.tables[obj.subcommand].init(function () {
                //     MBOOKER.Pages.activePage = obj.subcommand;
                //     MBOOKER.Pages.loadedPages.push(obj.subcommand); 
                //     MBOOKER.Pages.typeOfActivePage = type;                    
                // });
            } else if (MBOOKER.Pages.loadedPages.indexOf(obj.subcommand) !== -1) {
                MBOOKER.Pages.pages.tables[obj.subcommand].showTable();
                MBOOKER.Pages.activePage = obj.subcommand;
            } 
        }
    }
};

MBOOKER.Fn.switchModal = function (type, obj) {
    if (MBOOKER.Modals.activeModal && MBOOKER.Modals.loadedModals[0]) {}
    else {
        classie.add( document.getElementById( 'bt-menu' ), 'bt-menu-open' );
    }
    if (type && obj && typeof type === "string" && typeof obj === "object") {
        if (type === "content" && obj.name && typeof obj.name === "string") {
            if (MBOOKER.Modals.activeModal === obj.name) {
                console.log("Это сейчас открыто");
            } else if (MBOOKER.Modals.loadedModals.indexOf(obj.name) === -1) {
                var content = new MBOOKER.Classes.Content("modal", obj);
                MBOOKER.Modals.modals.contents[obj.name] = content;
                MBOOKER.Modals.modals.contents[obj.name].init();
                MBOOKER.Modals.activeModal = obj.name;
                MBOOKER.Modals.loadedModals.push(obj.name);  
                MBOOKER.Modals.typeOfActiveModal = type;
                MBOOKER.App.contentArea = "modal";
                // var content = new MBOOKER.Classes.Content("modal", obj);
                // MBOOKER.Pages.pages.contents[obj.name] = content;
                // MBOOKER.Pages.pages.contents[obj.name].init();
                // MBOOKER.Pages.activePage = obj.name;
                // MBOOKER.Pages.loadedPages.push(obj.name);  
                // MBOOKER.Pages.typeOfActivePage = type;  
            } else if (MBOOKER.Modals.loadedModals.indexOf(obj.name) !== -1) {

            }
        } 
    }        
};






$(".clear-all-sessions").on("click", function () {
    var obj = {
        command: "clear_all_sessions"
    };
    MBOOKER.Fn.sendQuery(obj, function (response) {
        console.log(response);
    });
});

$("#open_action_14").on("click",function(){
   /* var  o = {
        name: "one_action",
        action_id: 14
    };

    MBOOKER.Fn.switchPage("content", o);*/

    log("clicked");
    MB.Core.switchModal({type:"content", filename:"one_action", id: MB.Core.guid(), params:{action_id:14}});
});
$("#open_fundZones_30").on("click",function(){

    MB.Core.switchModal({type:"content", filename:"fundZones", id: MB.Core.guid(), params:{hall_scheme_id:30}});
});

$("#open_priceZones_30").on("click",function(){
    var  o = {
        name: "priceZones",
        hall_scheme_id: 30
    };

    MBOOKER.Fn.switchPage("content", o);
});


$(".synchronize").on("click", function () {
    var o = {
        command: "operation",
        object: "synchronize",
        sid: $.cookie("sid")
    };
    MB.Core.sendQuery(o, function (a) {});
});






// MBOOKER.Fn.switchContent = function (page, isTable, callback) {
//     if (page && typeof page === "string") {
//         if (typeof isTable === "boolean") {
//             if (isTable) {
//                 if (MBOOKER.Pages.activePage === page) {
//                     callback();
//                 } else {
//                     if (MBOOKER.Pages.loadedPages.indexOf(page) === -1) {
//                         $("#" + MBOOKER.Pages.activePage + "_page").hide();
//                         var inside = '<div id="' + page + '_page" class="page-content" style="display:none;"><div id="' + page + '_table_wrapper"></div></div>';
//                         $(".page-content-wrapper").append(inside);
//                         MBOOKER.Pages.activePage = page;
//                         MBOOKER.Pages.loadedPages.push(page);
//                         $("#" + page + "_page").show();
//                         var o = {
//                             menuItemName: page
//                         };
//                         var table = new MBOOKER.Classes.Table(o);
//                         MBOOKER.Tables.tables[page] = table;
//                         MBOOKER.Tables.tables[page].rows = {};
//                         MBOOKER.Tables.tables[page].init();
//                         // MBOOKER.Fn.sendQuery({subcommand: page}, function (responsedData) {
//                         //  console.log(responsedData);
//                         // });
//                         callback();
//                     } else {
//                         $("#" + MBOOKER.Pages.activePage + "_page").hide();
//                         MBOOKER.Pages.activePage = page;
//                         MBOOKER.Pages.loadedPages.push(page);
//                         $("#" + page + "_page").show();
//                         callback();
//                     }
//                 }
//             } else {
//                 if (MBOOKER.Pages.activePage === page) {
//                     callback();
//                 } else {
//                     if (MBOOKER.Pages.loadedPages.indexOf(page) === -1) {
//                         $("#" + MBOOKER.Pages.activePage + "_page").hide();
//                         var inside = '<div id="' + page + '_page" class="page-content" style="display:none;"></div>';
//                         $(".page-content-wrapper").append(inside);
//                         MBOOKER.Pages.activePage = page;
//                         MBOOKER.Pages.loadedPages.push(page);
//                         // .load( url [, data ] [, complete(responseText, textStatus, XMLHttpRequest) ] )
//                         $("#" + MBOOKER.Pages.activePage + "_page").load("html/contents/" + page + "/" + page + ".html", function (response, textStatus, XMLHttpRequest) {
//                             $("#" + page + "_page").show();
//                             callback();
//                         });
//                     } else {

//                     }
//                 }
//             }
//         } else {
//             toastr.error("Параметр isTable не передан или не является булевым значением", "MBOOKER.Fn.switchContent");
//         }
//     } else {
//         toastr.error("Парметр page не передан или не является строкой", "MBOOKER.Fn.switchContent");
//     }
// };

// MBOOKER.Fn.sendQuery2 = function (obj, callback) {
//     // var o = obj.subcommand;
//     // delete obj.subcommand;
//     // obj.object = o;
//     var xml = "";
//     var url = "/cgi-bin/b2cJ";
//     xml = "p_xml=<query>";
//     if (typeof obj === "object") {
//         if (obj.hasOwnProperty("command")) {
//             for (var i in obj) {
//                 if (obj.hasOwnProperty(i)) {
//                     if (i === "params") {
//                         if (typeof obj[i] === "object") {
//                             for (var j in obj.params) {
//                                 xml += "<" + j + ">" + obj.params[j] + "</" + j + ">";
//                             }
//                         }
//                     } else {
//                         xml += "<" + i + ">" + obj[i] + "</" + i + ">";
//                     }              
//                 }
//             }    
//         } else {
//             toastr.error("В обекте не передан обязательный параметр command", "MBOOKER.Fn.sendQuery");
//         }        
//     } else {
//         toastr.error("Не передали объект в sendQuery", "MBOOKER.Fn.sendQuery");
//     }
//     xml += "</query>";
//     $.getJSON( url, xml, function (response, textStatus, jqXHR) {
//         if (textStatus === "success") {
//             if (response && typeof response === "object") {
//                 if (response.hasOwnProperty("RC")) {
//                     var rc = parseInt(response.RC);
//                     if (rc === 0) {
//                         callback(response);
//                     } else if (rc === -2) {
//                         toastr.error("Ваша сессия не актульна, зайдите на сайт пожалуйста заново", "MBOOKER.Fn.sendQuery");
//                         setTimeout(
//                             function () {
//                                 $.removeCookie("sid");
//                                 console.log("Ваша сессия не актульна, зайдите на сайт пожалуйста заново");
//                                 // document.location.href = "http://192.168.1.101/multibooker/login.html";                                
//                             }
//                         , 3000);
//                     } else {
//                         toastr.error("Ошибка: " + response.RC + ": " + response.MESSAGE, "MBOOKER.Fn.sendQuery");
//                     }
//                 } else if (response.hasOwnProperty("DATA")) {
//                     if (Array.prototype.isPrototypeOf(response.DATA)) {
//                         callback(response);
//                     } else {
//                         toastr.error("'DATA' не массив! :(", "MBOOKER.Fn.sendQuery");
//                     }
//                 } else {
//                     callback(response);
//                 }
//             }
//         } else {
//             toastr.error("Статус ответа не success, значит надо смотреть консоль :)", "MBOOKER.Fn.sendQuery");
//         }
//     });
// };






// MBOOKER.Classes.Table.prototype.render = function () {

// };
// console.log(toastr);
// $(document).ready(function () {
//     console.log(toastr);
// });


(function ($, global, undefined) {
    var MB = MB || {};

    // Resetting
    String.prototype.bool = function() {
        return (/^(true|TRUE|True)$/i).test(this);
    };

    toastr = toastr || null;
    if (toastr) {
        toastr.options = {
            "closeButton": true,
            "debug": false,
            "positionClass": "toast-bottom-right",
            "onclick": null,
            "showDuration": "1000",
            "hideDuration": "1000",
            "timeOut": "10000",
            "extendedTimeOut": "1000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
        }    
    }

    // User data
    MB.User = {};
    MB.User.sid = $.cookie("sid");
    // if (!MB.User.sid) {
    //     document.location.href = "login.html";
    // }

    // Object's model storage
    MB.O = {};
    MB.O.tables = {};
    MB.O.contents = {};
    MB.O.forms = {};
    
    // Core functions
    MB.Core = {};

    MB.Core.randomnumber = function () {
      return Math.floor(Math.random() * (1000000 - 0 + 1)) + 0;
    }

    MB.Core.guid = function () {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = Math.random()*16|0, v = c === "x" ? r : (r&0x3|0x8);
            return v.toString(16);
        }).toUpperCase();
    };

    MB.Core.sendQuery = function (options, callback) {
        var url = "/cgi-bin/b2cJ", xml = "<query>";
        if (options && typeof options === "object" && options.command) {
            if (options.hasOwnProperty("params")) {
                for (var key in options.params) {
                    xml += "<" + key + ">" + options.params[key] + "</" + key + ">";
                }
                delete options.params;
            }
            for (var key in options) {
                xml += "<" + key + ">" + options[key] + "</" + key + ">";
            }
            xml += "</query>";
        }        
        $.getJSON(url, {p_xml: xml}, function (res, status, xhr) {
            if (res && status && status === "success" && typeof res === "object") {
                if (res.hasOwnProperty("RC")) {
                    if (parseInt(res.RC) === 0) {
                        if(res.TICKET_PACK_USER_INFO){
                            var JSONstring = res.TICKET_PACK_USER_INFO;
                            var userInfo = new userInfoClass({JSONstring:JSONstring}).userInfo_Refresh();
                        }
                        if(typeof callback == "function"){callback(res);}
                    } else if (parseInt(res.RC) === -2) {
                        toastr ? toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE) : alert("Ваша сессия не актульна, зайдите на сайт пожалуйста заново, MB.Core.sendQuery");
                        setTimeout(function () {$.removeCookie("sid");document.location.href = "login.html";}, 3000);    
                    } else {
                        if(typeof callback == "function"){callback(res);}
                        toastr ? toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE) : alert("Ошибка: " + res.RC + ": " + res.MESSAGE + ", MB.Core.sendQuery");
                    }    
                } else {
                    if(typeof callback == "function"){callback(res);}
                }
            }
        });
    };

    MB.Core.makeQuery = function (options, callback) {
        var xml = "<query>";
        if (options && typeof options === "object" && options.object && options.command) {
            if (options.hasOwnProperty("params")) {
                for (var key in options.params) {
                    xml += "<" + key + ">" + options.params[key] + "</" + key + ">";
                }
                delete options.params;
            }
            for (var key in options) {
                xml += "<" + key + ">" + options[key] + "</" + key + ">";
            }
            xml += "</query>";
        }
        return xml;  
    };

    MB.User.activepage = "content_index";
    MB.User.loadedpages = ["content_index"];
    MB.Core.$pageswrap = $(".page-content-wrapper");

    MB.Core.switchPage = function (options) {
        if (options.type) {
            if (options.type === "table" && options.name) {
                if (MB.Table.hasloaded(options.name)) {
                    MB.O.tables[options.name].reload("data");
                    MB.Table.show("page", options.name);                    
                } else {
                    var table = new MB.Table({world: "page", name: options.name});
                    table.create(function () {
                        table.showit();
                    });
                }
            } else if (options.type === "content" && options.filename) {
                if (MB.Content.hasloaded(options.filename)) {
                    MB.Content.find(options.filename).showit();
                } else {
                    var content = new MB.Content({world: "page", filename: options.filename});
                    content.create(function () {
                        content.showit();
                        content.init();
                    });
                }
            } else if (options.type === "modalmini" && options.name){
                var modalmini = new MB.modalmini({objectname: options.name, world: "page",pageswrap:MB.Core.$pageswrap});
                modalmini.init();
                /*
                var content = new MB.Content({objectname: options.objectname, world: "page",pageswrap:MB.Core.$pageswrap});
                content.init();
                content.showit();
                MB.User.activepage = options.objectname;
                MB.User.loadedpages.push(options.objectname);
                */
            }
        }
    };

    MB.Core.jsonToObj = function(obj){
        var obj_true = {};
        var objIndex = {};
        for (i in obj['DATA']){
            for(var index in obj['NAMES']){
                if(obj_true[i] == undefined){obj_true[i] = {};}
                obj_true[i][obj['NAMES'][index]] = obj['DATA'][i][index];
            }
        }
        return obj_true;
    }

    MB.Modal = {};
    MB.Modal.activemodal     = null;
    MB.Modal.modalsqueue     = [];
    MB.Modal.loadedmodals    = [];
    MB.Modal.countmodals     = 0;
    MB.Modal.opened          = false;
    MB.Modal.$wrapper        = $(".modal-content-wrapper");
    MB.Modal.$container      = $(".bt-menu");
    MB.Modal.$modalslist     = $(".modals-list");

    MB.Modal.itemsinit = function () {
        MB.Modal.$modalslist.on("click", "li", function (e) {
            var $target = $(e.target),
                object  = $(this).data("object"),
                iscross = $target.hasClass("cross");
            if (iscross) {
                if (MB.Modal.countmodals === 1) {    
                    MB.Modal.closefull();
                } else if (MB.Modal.countmodals > 1) {
                    if (MB.Modal.activemodal === object) {
                        MB.Modal.remove(object);
                        MB.Modal.activemodal = MB.Modal.modalsqueue[(MB.Modal.modalsqueue.indexOf(object) - 1)];
                        MB.Modal.show(MB.Modal.activemodal);
                        MB.Modal.activateitem(MB.Modal.activemodal);
                        MB.Modal.countmodals--;
                    } else {
                        MB.Modal.remove(object); 
                        MB.Modal.countmodals--;
                    }
                }
            } else {
                if (!(MB.Modal.activemodal === object)) {
                    MB.Modal.hide(MB.Modal.activemodal);
                    MB.Modal.activemodal = object;
                    MB.Modal.show(object);
                    MB.Modal.activateitem(object);
                } 
            }
        });
    };

    MB.Modal.closefull = function () {
        if ($("#modal_" + MB.Modal.activemodal + "_wrapper .edited").length > 0) {
            bootbox.dialog({
                message: "Вы уверены что хотите выйти из формы не сохранив изменения?",
                title: "Есть не сохраннные изменения",
                buttons: {
                    success: {
                        label: "Да",
                        assName: "green",
                        callback: function() {
                            for (var i = 0, l = MB.Modal.modalsqueue.length; i < l; i++) {
                                for (var key in MB.O) {
                                    if (MB.O[key].hasOwnProperty(MB.Modal.modalsqueue[i])) {
                                        delete MB.O[key][MB.Modal.modalsqueue[i]];
                                    }
                                }
                            }
                            MB.Modal.$wrapper.empty();
                            MB.Modal.$modalslist.empty();
                            MB.Modal.loadedmodals = [];
                            MB.Modal.modalsqueue = [];
                            MB.Modal.activemodal = null;
                            MB.Modal.countmodals = 0;
                            classie.remove(document.getElementById('bt-menu'), 'bt-menu-open');
                            MB.Modal.opened = false;                    
                        }   
                    },
                    danger: {
                        label: "Нет",
                        className: "red",
                        callback: function() {
                            
                        }
                    },  
                }
            });
        } else {
            for (var i = 0, l = MB.Modal.modalsqueue.length; i < l; i++) {
                for (var key in MB.O) {
                    if (MB.O[key].hasOwnProperty(MB.Modal.modalsqueue[i])) {
                        delete MB.O[key][MB.Modal.modalsqueue[i]];
                    }
                }
            }
            MB.Modal.$wrapper.empty();
            MB.Modal.$modalslist.empty();
            MB.Modal.loadedmodals = [];
            MB.Modal.modalsqueue = [];
            MB.Modal.activemodal = null;
            MB.Modal.countmodals = 0;
            classie.remove(document.getElementById('bt-menu'), 'bt-menu-open');
            MB.Modal.opened = false;   
        }      
    };

    MB.Modal.open = function (callback) {
        classie.add(document.getElementById('bt-menu'), 'bt-menu-open');
        MB.Modal.opened = true;
        MB.Modal.itemsinit();
        setTimeout(callback(), 350);
    };

    MB.Modal.remove = function (name) {
        MB.Modal.$wrapper.find("#modal_" + name + "_wrapper").remove();
        MB.Modal.$container.find(".modals-list").find("[data-object='" + name + "']").remove();
    };

    MB.Modal.hide = function (name) {
        MB.Modal.$wrapper.find("#modal_" + name + "_wrapper").hide();
    };

    MB.Modal.close = function (name) {
        if ($("#modal_" + name + "_wrapper .edited").length > 0) {

        }
        MB.Modal.remove(name);
        MB.Modal.activemodal = MB.Modal.modalsqueue[(MB.Modal.modalsqueue.indexOf(name) - 1)];
        MB.Modal.show(MB.Modal.activemodal);
        MB.Modal.activateitem(MB.Modal.activemodal);
        MB.Modal.countmodals--;
    }

    MB.Modal.show = function (name) {
        MB.Modal.$wrapper.find("#modal_" + name + "_wrapper").show();
    };

    MB.Modal.additem = function (name, type) {
        var object = MB.O[type + "s"][name];
        var html = "<li data-object='" + (object.id || object.name) + "'><i class='cross fa fa-times-circle'></i>" + (object.label || object.filename || object.profile.general.objectname || object.profile.general.tablename) + "</li>";
        MB.Modal.$container.find(".modals-list").append(html);
    };

    MB.Modal.activateitem = function (name) {
        MB.Modal.$modalslist.find(".activateitem").removeClass(".activeitem");
        MB.Modal.$modalslist.find("[data-object='" + name + "']").addClass("activeitem");
    };

    MB.Core.switchModal = function (options) {
        if (options.type) {
            if (options.type === "form" && options.name) {
                if (MB.Modal.opened) {
                    if (MB.Modal.countmodals === 1) {
                        if (MB.Modal.activemodal === options.name) {
                            toastr.info("Это уже открыто", "Информация");
                        } else {
                            var form = new MB.Form(options);
                            form.create(function () {
                                MB.Modal.hide(MB.Modal.activemodal);
                                MB.Modal.activemodal = options.name;
                                MB.Modal.show(options.name);
                                MB.Modal.additem(options.name, options.type);
                                MB.Modal.activateitem(options.name);
                                MB.Modal.loadedmodals.push(options.name);
                                MB.Modal.modalsqueue.push(options.name);
                                MB.Modal.countmodals++;
                            });
                        }
                    } else if (MB.Modal.countmodals > 1) {
                        if (MB.Modal.activemodal === options.name) {
                            toastr.info("Это уже открыто", "Информация");
                        } else if (MB.Form.hasloaded(options.name)) {
                            MB.Modal.hide(MB.Modal.activemodal);
                            MB.Modal.activemodal = options.name;
                            MB.Modal.show(options.name);
                            MB.Modal.activateitem(options.name);
                        } else {
                            var form = new MB.Form(options);
                            form.create(function () {
                                MB.Modal.hide(MB.Modal.activemodal);
                                MB.Modal.activemodal = options.name;
                                MB.Modal.show(options.name);
                                MB.Modal.additem(options.name, options.type);
                                MB.Modal.activateitem(options.name);
                                MB.Modal.loadedmodals.push(options.name);
                                MB.Modal.modalsqueue.push(options.name);
                                MB.Modal.countmodals++;
                            });
                        }
                    }
                } else {
                    MB.Modal.open(function () {
                        var form = new MB.Form(options);
                        form.create(function () {
                            MB.Modal.activemodal = options.name;
                            MB.Modal.show(options.name);
                            MB.Modal.additem(options.name, options.type);
                            MB.Modal.activateitem(options.name);
                            MB.Modal.loadedmodals.push(options.name);
                            MB.Modal.modalsqueue.push(options.name);
                            MB.Modal.countmodals++;
                        });
                    });
                }
            } else if (options.type === "table") {
                if (MB.Modal.opened) {
                    if (MB.Modal.countmodals === 1) {
                        if (MB.Modal.activemodal === options.name) {
                            toastr.info("Эта таблица сейчас открыта", "Информация");
                        } else {
                            var table = new MB.Table({world: "modal", name: options.name, params: options.params});
                            table.create(function () {
                                MB.Modal.hide(MB.Modal.activemodal);
                                MB.Modal.activemodal = options.name;
                                MB.Modal.show(options.name);
                                MB.Modal.additem(options.name, options.type);
                                MB.Modal.activateitem(options.name);
                                MB.Modal.loadedmodals.push(options.name);
                                MB.Modal.modalsqueue.push(options.name);
                                MB.Modal.countmodals++;
                            });
                        }
                    } else if (MB.Modal.countmodals > 1) {
                        if (MB.Modal.activemodal === options.name) {
                            toastr.info("Эта таблица сейчас открыта", "Информация");
                        } else if (MB.Form.hasloaded(options.name)) {
                            MB.Modal.hide(MB.Modal.activemodal);
                            MB.Modal.lastmodal = MB.Modal.activemodal;
                            MB.Modal.activemodal = options.name;
                            MB.Modal.show(options.name);
                            MB.Modal.activateitem(options.name);
                        } else {
                            var table = new MB.Table({world: "modal", name: options.name, params: options.params});
                            table.create(function () {
                                MB.Modal.hide(MB.Modal.activemodal);
                                MB.Modal.activemodal = options.name;
                                MB.Modal.show(options.name);
                                MB.Modal.additem(options.name, options.type);
                                MB.Modal.activateitem(options.name);
                                MB.Modal.loadedmodals.push(options.name);
                                MB.Modal.modalsqueue.push(options.name);
                                MB.Modal.countmodals++;
                            });
                        }
                    }
                } else {
                    MB.Modal.open(function () {
                        var table = new MB.Table({world: "modal", name: options.name, params: options.params});
                        table.create(function () {
                            MB.Modal.activemodal = options.name;
                            MB.Modal.show(options.name);
                            MB.Modal.additem(options.name, options.type);
                            MB.Modal.activateitem(options.name);
                            MB.Modal.loadedmodals.push(options.name);
                            MB.Modal.modalsqueue.push(options.name);
                            MB.Modal.countmodals++;
                        });
                    });
                }
            } else if (options.type === "content" && options.filename) {
                if (MB.Modal.opened) {
                    var content = new MB.Content({world: "modal", filename: options.filename, id: (MB.Core.guid()), params: options.params});
                    content.create(function () {
                        content.init();
                        MB.Modal.hide(MB.Modal.activemodal);
                        MB.Modal.activemodal = content.id;
                        MB.Modal.show(content.id);
                        MB.Modal.additem(content.id, options.type);
                        MB.Modal.activateitem(content.id);
                        MB.Modal.loadedmodals.push(content.id);
                        MB.Modal.modalsqueue.push(content.id);
                        MB.Modal.countmodals++;
                    });
                } else {
                    MB.Modal.open(function () {
                        var content = new MB.Content({world: "modal", filename: options.filename, id: (MB.Core.guid()), params: options.params});
                        content.create(function () {
                            content.init();
                            MB.Modal.activemodal = content.id;
                            MB.Modal.show(content.id);
                            MB.Modal.additem(content.id, options.type);
                            MB.Modal.activateitem(content.id);
                            MB.Modal.loadedmodals.push(content.id);
                            MB.Modal.modalsqueue.push(content.id);
                            MB.Modal.countmodals++;
                        });
                    });
                }
            }
        }
    };

    MB.Core.makepagewrap = function (name) {
        return "<div id='page_" + name + "_wrapper' class='page-item' style='display:none'></div>";
    };

    MB.Core.makemodalwrap = function (name) {
        return "<div id='modal_" + name + "_wrapper' class='modal-item' style='display:none'></div>";
    };

    MB.Core.helper = {}

    window.MB = MB;
}(jQuery, window, undefined)); 
                // MB.Core.$pageswrap.append(MB.Core.makepagewrap(options.filename));
                // if (options.params) {
                //     var content = new MB.Content2({world: "modal", filename: options.filename, id: id, params: options.params});
                // } else {
                //     var content = new MB.Content2({world: "modal", filename: options.filename, id: id});
                // }
                // content.loadhtml(function () {
                //     content.showit();
                //     content.init();
                //     MB.User.activemodal = options.id;
                //     MB.User.loadedmodals.push(options.id);
                // }); 


                // if (MB.Content2.hasloaded(options.filename)) {
                //     MB.Content2.show(options.filename);
                // } else {
                //     var content = new MB.Content2(options);
                //     content.create(function () {
                //         content.show();
                //     });
                // }
                        // MB.Form.createcontainer(options.name, function () {
                        //     MB.Form.loadhtml(options.name, function () {
                        //         MB.Form.init(options.name, function () {
                                    
                        //         });
                        //     });    
                        // });


    // MB.Core.switchModal = function (options) {
    //     if (options && options.type) {
    //         if (options.type === "form" && options.ids && options.objectname) {
    //             if (MB.O.forms.hasOwnProperty(options.objectname)) {
    //                 MB.O.forms[options.objectname].reload();
    //                 MB.O.forms[options.objectname].showit();
    //                 MB.User.activemodal = options.objectname;
    //             } else {
    //                 classie.add(document.getElementById('bt-menu'), 'bt-menu-open');
    //                 MB.Core.$modalswrap.append(MB.Core.makemodalwrap(options.objectname));
    //                 var form = new MB.Form({objectname: options.objectname, world: "modal", ids: options.ids});
    //                 form.loadhtml(function () {
    //                     form.init();
    //                     form.showit();
    //                     MB.User.activemodal = options.objectname;
    //                     MB.User.loadedmodals.push(options.objectname);
    //                 });
    //             }
    //         } else if (options.type === "content" && options.filename && options.id) {
    //             if (MB.O.contents.hasOwnProperty(options.id)) {
    //                 MB.O.contents[options.id].showit();
    //                 MB.O.contents[options.id].reload();
    //                 MB.User.activemodal = options.id;
    //             } else {
    //                 classie.add(document.getElementById('bt-menu'), 'bt-menu-open');
    //                 var id = MB.Core.guid();
    //                 MB.Core.$modalswrap.append(MB.Core.makemodalwrap(id));
    //                 if (options.params) {
    //                     var content = new MB.Content2({world: "modal", filename: options.filename, id: id, params: options.params});
    //                 } else {
    //                     var content = new MB.Content2({world: "modal", filename: options.filename, id: id});
    //                 }
    //                 content.loadhtml(function () {
    //                     content.showit();
    //                     content.init();
    //                     MB.User.activemodal = options.id;
    //                     MB.User.loadedmodals.push(options.id);
    //                 });                    
    //             }
    //         } else if (options.type === "table" && options.objectname) {
    //             if (MB.User.activemodal) {
    //                 if (MB.Table.exists(options.objectname)) {
    //                     MB.O.tables[options.objectname].reload();
    //                     MB.O.tables[options.objectname].showit();
    //                     MB.User.activemodal = options.objectname;
    //                 } else {
    //                     MB.Core.$modalsswrap.append(MB.Core.makemodalwrap(options.objectname));
    //                     var table = new MB.Table({objectname: options.objectname, world: "modal"});
    //                     table.init();
    //                     table.showit();
    //                     MB.User.activemodal = options.objectname;
    //                     MB.User.loadedmodals.push(options.objectname);
    //                 }                    
    //             } else {
    //                 classie.add(document.getElementById('bt-menu'), 'bt-menu-open');
    //                 MB.Core.$modalsswrap.append(MB.Core.makemodalwrap(options.objectname));
    //                 var table = new MB.Table({objectname: options.objectname, world: "modal"});
    //                 table.init();
    //                 table.showit();
    //                 MB.User.activemodal = options.objectname;
    //                 MB.User.loadedmodals.push(options.objectname);
    //             }

    //         }
    //     }
    // };


    // MB.Core.switchPage = function (options) {
    //     if (options && options.type) {
    //         if (options.type === "tableobject" && options.objectname) {
    //             if (MB.Table.exists(options.objectname)) {
    //                 MB.O.tables[options.objectname].reload();
    //                 MB.O.tables[options.objectname].showit();
    //                 MB.User.activepage = options.objectname;
    //             } else {
    //                 MB.Core.$pageswrap.append(MB.Core.makepagewrap(options.objectname));
    //                 var table = new MB.Table({objectname: options.objectname, world: "page"});
    //                 table.init();
    //                 table.showit();
    //                 MB.User.activepage = options.objectname;
    //                 MB.User.loadedpages.push(options.objectname);
    //             }
    //         } else if (options.type === "contentobject" && options.objectname){
    //             var content = new MB.Content({objectname: options.objectname, world: "page",pageswrap:MB.Core.$pageswrap});
    //             content.init();
    //             content.showit();
    //             MB.User.activepage = options.objectname;
    //             MB.User.loadedpages.push(options.objectname);
    //         } else if (options.type === "modalminiobject" && options.objectname){
    //             var modalmini = new MB.modalmini({objectname: options.objectname, world: "page",pageswrap:MB.Core.$pageswrap});
    //             modalmini.init();
    //         }
    //     }
    // };


                // else if (options.type === "modalminiobject" && options.objectname){
            //     var modalmini = new MB.modalmini({objectname: options.objectname, world: "page",pageswrap:MB.Core.$pageswrap});
            //     modalmini.init();
            // }



                            // if (MB.Modal.opened) {
                //     if (MB.Modal.countmodals === 1) {
                //         if (MB.Modal.activemodal === ) {
                //             toastr.info("Это уже открыто", "MB.Core.switchModal");
                //         } else {
                //             var content = new MB.Content(options);
                //             content.create(function () {
                //                 MB.Modal.hide(MB.Modal.activemodal);
                //                 MB.Modal.lastmodal = MB.Modal.activemodal;
                //                 MB.Modal.activemodal = options.name;
                //                 MB.Modal.show(options.name);
                //                 MB.Modal.additem(options.name);
                //                 MB.Modal.activateitem(options.name);
                //                 MB.Modal.loadedmodals.push(options.name);
                //                 MB.Modal.countmodals++;
                //             });
                //         }
                //     } else if (MB.Modal.countmodals > 1) {
                //         if (MB.Modal.activemodal === options.name) {
                //             toastr.info("Это уже открыто", "MB.Core.switchModal");
                //         } else if (MB.Form.hasloaded(options.name)) {
                //             MB.Modal.hide(MB.Modal.activemodal);
                //             MB.Modal.lastmodal = MB.Modal.activemodal;
                //             MB.Modal.activemodal = options.name;
                //             MB.Modal.show(options.name);
                //             MB.Modal.activateitem(options.name);
                //         } else {
                //             var content = new MB.Content(options);
                //             content.create(function () {
                //                 MB.Modal.hide(MB.Modal.activemodal);
                //                 MB.Modal.lastmodal = MB.Modal.activemodal;
                //                 MB.Modal.activemodal = options.name;
                //                 MB.Modal.show(options.name);
                //                 MB.Modal.additem(options.name);
                //                 MB.Modal.activateitem(options.name);
                //                 MB.Modal.loadedmodals.push(options.name);
                //                 MB.Modal.countmodals++;
                //             });
                //         }
                //     }
                // } else {
                //     MB.Modal.open(function () {
                //         var content = new MB.Content(options);
                //         content.create(function () {
                //             MB.Modal.activemodal = options.name;
                //             MB.Modal.show(options.name);
                //             MB.Modal.additem(options.name);
                //             MB.Modal.activateitem(options.name);
                //             MB.Modal.loadedmodals.push(options.name);
                //             MB.Modal.countmodals++;
                //         });
                //     });
                // }


















                    
    //                 if (MB.Form.hasloaded(options.name)) {
    //                     MB.Modal.show(options.name);
    //                 } else {
    //                     var form = new MB.Form(options);
    //                     form.create(function () {
    //                         MB.Modal.hide(MB.Modal.activemodal);
    //                         MB.Modal.activemodal = options.name;
    //                         MB.Modal.show(MB.Modal.activemodal);
    //                         MB.Modal.additem(MB.Modal.activemodal);
    //                         MB.Modal.activateitem(options.name);
    //                     });
    //                 }
    //             } else {
    //                 MB.Core.openmodal(function () {

    //                 });
    //             }

    //                         MB.Modal.removeitem(MB.Modal.activemodal);
    //             if (MB.User.activemodal === null) {
    //                 MB.Core.openmodal(function () {
    //                     var form = new MB.Form(options);
    //                     form.create(function () {
    //                         form.showit("init");
    //                         MB.Core.switchModalInit();
    //                     });
    //                 });
    //             } else {
    //                 if (MB.Form.hasloaded(options.name)) {
    //                     MB.Form.show(options.name);
    //                 } else {
    //                     var form = new MB.Form(options);
    //                     form.create(function () {
    //                         form.showit("init");
    //                     });                        
    //                 }
    //             }
    //         } else if (options.type === "content" && options.filename) {
    //             if (MB.User.activemodal === null) {
    //                 MB.Core.openmodal(function () {
    //                     var id = MB.Core.guid();
    //                     var content = new MB.Content({world: "modal", filename: options.filename, id: id, params: options.params});
    //                     content.create(function () {
    //                         content.showit("init");
    //                         content.init();
    //                         MB.Core.switchModalInit();
    //                     }); 
    //                 });                    
    //             } else {
    //                 var id = MB.Core.guid();
    //                 var content = new MB.Content({world: "modal", filename: options.filename, id: id, params: options.params});
    //                 content.create(function () {
    //                     content.showit("init");
    //                     content.init();
    //                 });
    //             }
    //         } else if (options.type === "table" && options.name) {
    //             if (MB.User.activemodal === null) {
    //                 MB.Core.openmodal(function () {
    //                     if (MB.Table.hasloaded(options.name)) {
    //                         MB.Table.show("modal", options.name);                    
    //                     } else {
    //                         var table = new MB.Table({world: "modal", name: options.name, params: options.params});
    //                         table.create(function () {
    //                             table.showit("init");
    //                             MB.Core.switchModalInit();
    //                         });
    //                     }    
    //                 });
    //             } else {
    //                 if (MB.Table.hasloaded(options.name)) {
    //                     MB.Table.show("modal", options.name);                    
    //                 } else {
    //                     var table = new MB.Table({world: "modal", name: options.name, params: options.params});
    //                     table.create(function () {
    //                         table.showit("init");
    //                     });
    //                 }
    //             }
    //         }
    //     }
    // };