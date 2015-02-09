(function() {
  MBOOKER.UserData.sid = $.cookie("sid");

  MBOOKER.Menu.createMenu = function() {
    return MBOOKER.Fn.sendQuery({
      command: "get",
      subcommand: "menu_for_user",
      sid: MBOOKER.UserData.sid
    }, function(response) {
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
        } else if (data[i][MenuTypeIndex] === "ITEM") {
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
      MBOOKER.Menu.menuObj = MENU;
      counter = 0;
      countMENU = MBOOKER.Fn.countObj(MENU);
      for (i in MENU) {
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
      $(".page-sidebar-menu").append(html);
      return $(".page-sidebar-menu").on("click", ".menu-item", function() {
        var objectname, pagetype;
        $(document).scrollTop(0);
        objectname = $(this).data("objectname");
        pagetype = objectname.substr(0, objectname.indexOf("_"));
        if (pagetype === "content") {
          return MB.Core.switchPage({
            type: "content",
            filename: objectname.substr(objectname.indexOf("_") + 1, objectname.length - 1)
          });
        } else if (pagetype === "table") {
          return MB.Core.switchPage({
            type: "table",
            name: objectname
          });
        } else if (pagetype === "modalmini") {
          return MB.Core.switchPage({
            type: "modalmini",
            name: objectname
          });
        }
      });
    });
  };

  MBOOKER.Menu.createMenu();

}).call(this);
