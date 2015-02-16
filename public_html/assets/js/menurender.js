(function(){
    MB = MB || {};
    MB.Core = MB.Core || {};
    MB.Core.Menu = {};
//    MB.Core.Menu.populateMenu = function(){
//        var o = {
//            command: "get",
//            object: "menu_for_user",
//            sid: MB.User.sid
//        };
//        socketQuery(o,function(res){
//            res = JSON.parse(res);
//            var html = '';
//            var tpl =   '{{#menuItems}}<li class="{{isStart}} {{isActive}}">' +
//                            '<a href="#">' +
//                                '<i class="fa {{icon}}"></i>' +
//                                '<span class="title">{{title}}</span>' +
//                            '</a>' +
//                            '{{#isSubMenu}}' +
//                                '<ul class="sub-menu">' +
//                                '{{#subMenu}}' +
//                                    '<li></li>' +
//                                '{{/subMenu}}' +
//                                '</ul>'+
//                            '{{/isSubMenu}}' +
//                        '</li>{{/menuItems}}';
//
//
//            var obj = {
//                menuItems : [
//                    {
//                        isStart: 'start',
//                        isActive: 'active',
//                        icon: 'fa-times',
//                        title: 'Олололо',
//                        isSubMenu: true,
//                        subMenu: [
//
//                        ]
//                    }
//                ]
//            };
//
//            MB.Core.Menu.data = jsonToObj(res['results'][0]);
//            console.log(MB.Core.Menu.data);
//
//            var mObj = {
//                menuItems: []
//            };
//
//            function rec(obj){
//                for(var i in obj){
//                    var item = MB.Core.Menu.data[i];
//                    var tmpObj = {
//
//                    };
//
//
//                    mObj.menuItems.push();
//                }
//            }
//            rec(MB.Core.Menu.data);
//
//
//        });
//    };

    //MB.Core.Menu.populateMenu();

})();

(function() {
	MB.Core.Menu = {};
	MB.Core.Menu.createMenu = function() {
		return MB.Core.sendQuery({
			command: "get",
			object: "menu_for_user",
			sid: MB.User.sid
		}, function(response) {
			if (response.RC!=0 && response.RC){
				console.log('Необходима авторизация');
				return;
			}
			var IconIndex, MENU, MenuItemIndex, MenuTypeIndex, NameIndex, ParentMenuIndex, clientObjectIndex, colsNum, count, count2, count3, countMENU, counter, data, html, i, j, k, l, mainMenuObj, menuItemObj, names, rowsNum, subMenu, subMenuObj, subMenuParents, subMenuRu, translate;
			html = "";
			mainMenuObj = {};
			menuItemObj = {};
			subMenuObj = {};
			MENU = {};
			count = 0;
			count2 = 0;
			count3 = 0;
			translate = void 0;
			html = "";
			names = response.NAMES;
			data = response.DATA;
			colsNum = names.length;
			rowsNum = data.length;
			MenuTypeIndex = names.indexOf("MENU_TYPE");
			MenuItemIndex = names.indexOf("MENU_ITEM");
			IconIndex = names.indexOf("ICON");
			clientObjectIndex = names.indexOf("CLIENT_OBJECT");
			NameIndex = names.indexOf("NAME");
			ParentMenuIndex = names.indexOf("PARENT_MENU");
			i = 0;
			while (i < rowsNum) {
				if (data[i][MenuTypeIndex] === "MAIN_MENU") {
					mainMenuObj[data[i][MenuItemIndex]] = {
						NAME: data[i][NameIndex],
						ITEMS: {},
						ICON: data[i][IconIndex]
					};
				} else if (data[i][MenuTypeIndex] === "ITEM" || data[i][MenuTypeIndex] === "REPORT") {
					if (menuItemObj.hasOwnProperty(data[i][MenuItemIndex])) {
						menuItemObj[data[i][MenuItemIndex]]["PARENT_MENU"].push(data[i][ParentMenuIndex]);
					} else {
						menuItemObj[data[i][MenuItemIndex]] = {
							NAME: data[i][NameIndex],
							PARENT_MENU: [data[i][ParentMenuIndex]],
							CLIENT_OBJECT: data[i][clientObjectIndex]
						};
					}
				} else if (data[i][MenuTypeIndex] === "SUB_MENU") {
					if (subMenuObj.hasOwnProperty(data[i][MenuItemIndex])) {
						subMenuObj[data[i][MenuItemIndex]]["PARENT_MENU"].push(data[i][ParentMenuIndex]);
					} else {
						subMenuObj[data[i][MenuItemIndex]] = {
							NAME: data[i][NameIndex],
							PARENT_MENU: [data[i][ParentMenuIndex]]
						};
					}
				}
				i++;
			}
			MENU = mainMenuObj;
			for (i in subMenuObj) {
				subMenu = i;
				subMenuRu = subMenuObj[subMenu]["NAME"];
				subMenuParents = subMenuObj[subMenu]["PARENT_MENU"];
				j = subMenuParents.length - 1;
				while (j >= 0) {
					MENU[subMenuParents[j]]["ITEMS"][subMenu] = {
						NAME: subMenuRu,
						ITEMS: {}
					};
					j--;
				}
			}
			for (i in menuItemObj) {
				j = 0;
				while (j < menuItemObj[i]["PARENT_MENU"].length) {
					for (k in MENU) {
						if (menuItemObj[i]["PARENT_MENU"].indexOf(k) === -1) {
							for (l in MENU[k]["ITEMS"]) {
								if (typeof MENU[k]["ITEMS"][l] === "object") {
									if (menuItemObj[i]["PARENT_MENU"].indexOf(l) !== -1) {
										MENU[k]["ITEMS"][l]["ITEMS"][i] = {
											NAME: menuItemObj[i]["NAME"],
											CLIENT_OBJECT: menuItemObj[i]["CLIENT_OBJECT"]
										};
									}
								}
							}
						} else {
							MENU[k]["ITEMS"][i] = {
								NAME: menuItemObj[i]["NAME"],
								CLIENT_OBJECT: menuItemObj[i]["CLIENT_OBJECT"]
							};
						}
					}
					j++;
				}
			}
			MB.Core.Menu.menuObj = MENU;
			counter = 0;
			// console.log("MENU", MENU);
			countMENU = Object.keys(MENU);
			// countMENU = MB.Core.Menu.countObj(MENU);


            console.log('Sa menu', MENU);

			for (i in MENU) {
				if (counter === 0) {
					html += "<li class='start active open'>\n"; //active
				} else if (counter === countMENU) {
					html += "<li class='last'>\n";
				} else {
					html += "<li>\n";
				}
				html += "\t<a href='#'>\n";
				html += "\t\t<i class='fa fa-" + MENU[i]["ICON"] + "'></i>\n";
				html += "\t\t<span class='title'>" + MENU[i]["NAME"] + "</span>\n";
				html += "\t</a>\n";
				html += "\t<ul class='sub-menu'>\n";
				for (j in MENU[i]["ITEMS"]) {
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
						for (k in MENU[i]["ITEMS"][j]["ITEMS"]) {
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
			$("#mainMenu").append(html);

//            (function(){
//                var mmWrapper = $('#mainMenu');
//                var listOfLis = mmWrapper.find('li');
//                listOfLis.off('click').on('click', function(e){
//
//                    var $t = $(this);
//
//                    if($t.children('.sub-menu').length > 0){
//                        if($t.children('.sub-menu').eq(0).hasClass('opened')){
//                            $t.children('.sub-menu').height('0').removeClass('opened');
//                        }else{
//                            $t.children('.sub-menu').height('auto').addClass('opened');
//                        }
//                    }
//                });
//            }());

			return $("#mainMenu").on("click", ".menu-item", function() {
                console.log('CLICK MENU ITEM', new Date(), new Date().getMilliseconds());
				var objectname, pagetype, liId;
				$(document).scrollTop(0);
				objectname = $(this).data("objectname");
                liId = $(this).attr('id');



				pagetype = objectname.substr(0, objectname.indexOf("_"));
				if (pagetype === "content") {
                    if(liId == 'menu_afisha'){
                        MB.Core.afisha.init();
                        return;
                    }
					return MB.Core.switchPage({
						type: "content",
						filename: objectname.substr(objectname.indexOf("_") + 1, objectname.length - 1)
					});
				} else if (pagetype === "table") {
                        MB.Core.spinner.start($('.page-content-wrapper'));
                        return MB.Core.switchPage({
                            type: "table",
                            name: objectname,
                            isNewTable: true
                        });
				} else if (pagetype === "modalmini") {
                    if(liId == 'menu_generate_repertuar'){
                        return MB.Core.switchPage({
                            isNew: true,
                            type: "modalmini",
                            name: objectname
                        });
                    }else{
                        return MB.Core.switchPage({
                            type: "modalmini",
                            name: objectname
                        });
                    }

				} else if (pagetype === "report") {
					return MB.Core.switchPage({
						type: "report",
						name: objectname
					});
				}
                return false;
			});
		});
	};

	MB.Core.Menu.createMenu();

}).call(this);
