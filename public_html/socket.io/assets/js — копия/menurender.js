// var MBOOKER = MBOOKER || {};
MBOOKER.UserData.sid = $.cookie("sid");
// MBOOKER.sid = 5;

MBOOKER.Menu.createMenu = function () {

    MBOOKER.Fn.sendQuery({command:"get", subcommand:"menu_for_user", sid: MBOOKER.UserData.sid}, function (response) {
        var html = "", mainMenuObj = {}, menuItemObj = {}, subMenuObj = {}, MENU = {}, count = 0, count2 = 0, count3 = 0, translate, html = "";
        var names = response.NAMES;
        var data = response.DATA;
        var colsNum = names.length;
        var rowsNum = data.length;
        var MenuTypeIndex = names.indexOf("MENU_TYPE");
        var MenuItemIndex = names.indexOf("MENU_ITEM");
        var IconIndex = names.indexOf("ICON");
        var clientObjectIndex = names.indexOf("CLIENT_OBJECT");
        var NameIndex = names.indexOf("NAME");
        var ParentMenuIndex = names.indexOf("PARENT_MENU");
        for (var i = 0; i < rowsNum; i++) {
            if (data[i][MenuTypeIndex] === "MAIN_MENU") {
                mainMenuObj[data[i][MenuItemIndex]] = {
                    "NAME": data[i][NameIndex],
                    "ITEMS": {},
                    "ICON": data[i][IconIndex]
                };                
            }
            else if (data[i][MenuTypeIndex] === "ITEM") {
                if (menuItemObj.hasOwnProperty(data[i][MenuItemIndex])) {
                    menuItemObj[data[i][MenuItemIndex]]["PARENT_MENU"].push(data[i][ParentMenuIndex]);
                } else {
                    menuItemObj[data[i][MenuItemIndex]] = {
                        "NAME": data[i][NameIndex],
                        "PARENT_MENU": [data[i][ParentMenuIndex]],
                        "CLIENT_OBJECT": data[i][clientObjectIndex]
                    };
                }
            }
            else if (data[i][MenuTypeIndex] === "SUB_MENU") {
                if (subMenuObj.hasOwnProperty(data[i][MenuItemIndex])) {
                    subMenuObj[data[i][MenuItemIndex]]["PARENT_MENU"].push(data[i][ParentMenuIndex]);
                } else {
                    subMenuObj[data[i][MenuItemIndex]] = {
                        "NAME": data[i][NameIndex],
                        "PARENT_MENU": [data[i][ParentMenuIndex]]
                    };
                }
            }
        }
        MENU = mainMenuObj;
        for (var i in subMenuObj) {
            var subMenu = i;
            var subMenuRu = subMenuObj[subMenu]["NAME"];
            var subMenuParents = subMenuObj[subMenu]["PARENT_MENU"];
            for (var j = subMenuParents.length - 1; j >= 0; j--) {
                MENU[subMenuParents[j]]["ITEMS"][subMenu] = {
                    "NAME": subMenuRu,
                    "ITEMS": {}
                };
            }
        }
        for (var i in menuItemObj) {
            for (var j = 0; j < menuItemObj[i]["PARENT_MENU"].length; j++) {
                for (var k in MENU) {
                    if (menuItemObj[i]["PARENT_MENU"].indexOf(k) === -1) {
                        for (var l in MENU[k]["ITEMS"]) {
                            if (typeof MENU[k]["ITEMS"][l] === "object") { // значит это сабменюха
                                if (menuItemObj[i]["PARENT_MENU"].indexOf(l) === -1) {

                                } else {
                                    MENU[k]["ITEMS"][l]["ITEMS"][i] = {
                                        "NAME": menuItemObj[i]["NAME"],
                                        "CLIENT_OBJECT": menuItemObj[i]["CLIENT_OBJECT"]
                                    }
                                }
                            }
                        }
                    } else {
                        MENU[k]["ITEMS"][i] = {
                            "NAME": menuItemObj[i]["NAME"],
                            "CLIENT_OBJECT": menuItemObj[i]["CLIENT_OBJECT"]
                        }
                    }
                }
            };
        }
        MBOOKER.Menu.menuObj = MENU; 
        var counter = 0;
        var countMENU = MBOOKER.Fn.countObj(MENU);
        for (var i in MENU) {
            if (counter === 0) {
                html += "<li class='start active'>\n";
            } else if (counter === countMENU) {
                html += "<li class='last'>\n";
            } else {
                html += "<li>\n"; 
            }   
            html += "\t<a href='#' onclick='return false;'>\n";
            html += "\t\t<i class='fa fa-" + MENU[i]["ICON"] + "'></i>\n";
            html += "\t\t<span class='title'>" + MENU[i]["NAME"] + "</span>\n"; 
            html += "\t\t<span class='selected'></span>\n";  
            html += "\t\t<span class='arrow'></span>\n";                            
            html += "\t</a>\n";
            html += "\t<ul class='sub-menu'>\n";
            for (var j in MENU[i]["ITEMS"]) {
                if (MENU[i]["ITEMS"][j].hasOwnProperty("CLIENT_OBJECT")) {
                    if (MENU[i]["ITEMS"][j]["CLIENT_OBJECT"] && typeof MENU[i]["ITEMS"][j]["CLIENT_OBJECT"] === "string") {
                        html += "\t\t<li id='" + j + "' data-objectname='" + MENU[i]["ITEMS"][j]["CLIENT_OBJECT"] + "' class='menu-item'><a href='#' onclick='return false;'><i class='fa fa-shopping-cart'></i>" + MENU[i]["ITEMS"][j]["NAME"] + "</a></li>\n";
                    } else {
                        html += "\t\t<li id='" + j + "' class='menu-item'><a href='#' onclick='return false;'><i class='fa fa-shopping-cart'></i>" + MENU[i]["ITEMS"][j]["NAME"] + "</a></li>\n";
                    }
                } else if (MENU[i]["ITEMS"][j].hasOwnProperty("ITEMS")) {
                    html += "\t\t<li>\n";
                    html += "\t\t\t<a href='#' onclick='return false;'>" + MENU[i]["ITEMS"][j]["NAME"] + "<span class='arrow'></span></a>\n";
                    html += "\t\t\t<ul class='sub-menu'>\n";
                    for (var k in MENU[i]["ITEMS"][j]["ITEMS"]) {
                        if (MENU[i]["ITEMS"][j]["ITEMS"][k]["CLIENT_OBJECT"] && typeof MENU[i]["ITEMS"][j]["ITEMS"][k]["CLIENT_OBJECT"] === "string") {
                            html += "\t\t<li id='" + k + "' data-objectname='" + MENU[i]["ITEMS"][j]["ITEMS"][k]["CLIENT_OBJECT"] + "' class='menu-item'><a href='#' onclick='return false;'><i class='fa fa-shopping-cart'></i>" + MENU[i]["ITEMS"][j]["ITEMS"][k]["NAME"] + "</a></li>\n";
                        } else {
                            html += "\t\t<li id='" + k + "' class='menu-item'><a href='#' onclick='return false;'><i class='fa fa-shopping-cart'></i>" + MENU[i]["ITEMS"][j]["ITEMS"][k]["NAME"] + "</a></li>\n";
                        }
                    } 
                    html += "\t\t\t</ul>\n";
                    html += "\t\t</li>\n";
                }
            }
            html += "\t</ul>\n";  
            html += "</li>\n";
            counter++;                 
        }
        $(".page-sidebar-menu").append(html);
        $(".page-sidebar-menu").on("click", ".menu-item", function () {
            var objectname = $(this).data("objectname");
            var pagetype = objectname.substr(0, objectname.indexOf("_"));
            if (pagetype === "content") {
                MB.Core.switchPage({type:"content", filename: objectname.substr(objectname.indexOf("_") + 1, objectname.length - 1)});
            }  else if (pagetype === "table") {
                MB.Core.switchPage({type:"table", name: objectname});
            } else if (pagetype === "modalmini") {
                MB.Core.switchPage({type:"modalmini", name: objectname});
            }
        });
    });
};
MBOOKER.Menu.createMenu();


        // $(".menu-item").each(function (i, el) {
        //     $(el).on("click", function () {
        //         var objectname = $(this).data("objectname");
        //         var pageType = objectname.substr(0, objectname.indexOf("_"));
        //         if(pageType === "content"){
        //             MB.Core.switchPage({type:"content", filename: objectname});
        //         }
        //         else if(pageType == "modalmini") {
        //             MB.Core.switchPage({type:"modalminiobject", objectname:objectname});
        //         }
        //         else if (pageType === "table") {
        //             MB.Core.switchPage({type:"table", name: objectname});
        //         } 
        //         else if (pageType === "form") {
        //             MB.Core.switchModal({type:"form", objectname:objectname});    
        //         }
                
        //         // var type = "content"
        //         // for (var key in MBOOKER.Settings.tablesSettings) {
        //         //     if (MBOOKER.Settings.tablesSettings.hasOwnProperty(page)) {
        //         //         type = "table"
        //         //     } 
        //         // }
        //         // if (type === "content") {
        //         //     MBOOKER.Fn.switchPage(type, {name: page});
        //         // } else {
        //         //     MBOOKER.Fn.switchPage(type, {subcommand: page});
        //         // }

        
            // else if(pagetype == "modalmini") {
            //     MB.Core.switchPage({type:"modalminiobject", objectname:objectname});
            // } 
        //     });
        // });

            // var type = "content"
            // for (var key in MBOOKER.Settings.tablesSettings) {
            //     if (MBOOKER.Settings.tablesSettings.hasOwnProperty(page)) {
            //         type = "table"
            //     } 
            // }
            // if (type === "content") {
            //     MBOOKER.Fn.switchPage(type, {name: page});
            // } else {
            //     MBOOKER.Fn.switchPage(type, {subcommand: page});
//             // } 

// else if (pagetype === "form") {
//                 MB.Core.switchModal({type:"form", objectname:objectname});    
//             }