(function() {
  var MB,
    __hasProp = {}.hasOwnProperty;

  MB = window.MB || {};

  MB.Table = function(options) {
    var instance, key, value, _ref;
    console.log(options);
    instance = this;
    instance.name = options.name || MB.Core.guid();
    instance.world = options.world || "page";
    instance.constructorWhere = options.where || "";
    if (options.params) {
      _ref = options.params;
      for (key in _ref) {
        value = _ref[key];
        instance[key] = value;
      }
    }
  };

  MB.Table.getSelectedRowsInterval = function(handsontableInstance) {
    var arr, end, start;
    arr = handsontableInstance.getSelected();
    if (arr[0] > arr[2]) {
      start = arr[2];
      end = arr[0];
    } else {
      start = arr[0];
      end = arr[2];
    }
    return [start, end];
  };

  MB.Table.createOpenInModalContextMenuItem = function(instance, key, options) {
    var $handsontable, handsontableInstance, i, id, ids, selectedRowsInterval;
    $handsontable = instance.$container.find(".handsontable");
    handsontableInstance = $handsontable.handsontable("getInstance");
    selectedRowsInterval = MB.Table.getSelectedRowsInterval(handsontableInstance);
    ids = [];
    i = selectedRowsInterval[0];
    while (i <= selectedRowsInterval[1]) {
      id = instance.data.data[i][instance.data.names.indexOf(instance.profile.general.primarykey)];
      ids.push(id);
      ++i;
    }
    if (ids.length > 0) {
      return MB.Core.switchModal({
        type: "form",
        ids: ids,
        name: instance.profile.general.juniorobject,
        params: {
          parentobject: instance.name
        }
      });
    }
  };

  MB.Table.createOpenInModalContextMenuItem2 = function(instance, key, options, params) {
    var $handsontable, handsontableInstance, i, id, ids, selectedRowsInterval;
    $handsontable = instance.$container.find(".handsontable");
    handsontableInstance = $handsontable.handsontable("getInstance");
    selectedRowsInterval = MB.Table.getSelectedRowsInterval(handsontableInstance);
    ids = [];
    i = selectedRowsInterval[0];
    while (i <= selectedRowsInterval[1]) {
      id = instance.data.data[i][instance.data.names.indexOf(instance.profile.general.primarykey)];
      ids.push(id);
      ++i;
    }
    if (ids.length > 0) {
      return MB.Core.switchModal({
        type: "form",
        ids: ids,
        name: instance.profile.general.juniorobject,
        isNewModal: true,
        params: {
          parentobject: instance.name
        }
      });
    }
  };

  MB.Table.helpers = {
    calculateDiscountToPrice: function(handsontableInstance, row, prop, newVal, instance) {
      var TicketStatus, nominalPrice, value;
      TicketStatus = instance.data.data[row][instance.data.names.indexOf("STATUS")];
      if (TicketStatus === "RESERVED" || TicketStatus === "TO_PAY") {
        nominalPrice = instance.data.data[row][instance.data.names.indexOf("NOMINAL_PRICE")];
        value = nominalPrice - nominalPrice * (newVal / 100);
        handsontableInstance.setDataAtRowProp(row, "PRICE", value, "discountToPrice");
      }
    },
    calculatePriceToDiscount: function(handsontableInstance, row, prop, newVal, instance) {
      var TicketStatus, nominalPrice, value;
      TicketStatus = instance.data.data[row][instance.data.names.indexOf("STATUS")];
      if (TicketStatus === "RESERVED" || TicketStatus === "TO_PAY") {
        nominalPrice = instance.data.data[row][instance.data.names.indexOf("NOMINAL_PRICE")];
        value = (nominalPrice - newVal) / 10;
        handsontableInstance.setDataAtRowProp(row, "DISCOUNT", value, "priceToDiscount");
      }
    }
  };

  MB.Table.parseprofile = function(data, callback) {
    var i, ii, key, name, parsedProfile, row, value, _i, _j, _len, _len1, _ref, _ref1, _ref2;
    parsedProfile = {};
    _ref = data.OBJECT_PROFILE;
    for (key in _ref) {
      value = _ref[key];
      parsedProfile[key] = value;
    }
    _ref1 = data.NAMES;
    for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
      name = _ref1[i];
      parsedProfile[name] = [];
      _ref2 = data.DATA;
      for (ii = _j = 0, _len1 = _ref2.length; _j < _len1; ii = ++_j) {
        row = _ref2[ii];
        parsedProfile[name].push(data.DATA[ii][i]);
      }
    }
    return callback(parsedProfile);
  };

  MB.Table.hasloaded = function(name) {
    if (MB.O.tables.hasOwnProperty(name)) {
      return true;
    } else {
      return false;
    }
  };

  MB.Table.find = function(name) {
    return MB.O.tables[name];
  };

  MB.Table.show = function(area, name) {
    var query, table;
    table = MB.O.tables[name];
    $(".page-item").hide();
    query = "#" + area + "_" + name + "_wrapper";
    $(query).show();
    MB.User.activepage = table.name;
    return MB.User.loadedpages.push(table.name);
  };

  MB.Table.parseforselect2data = function(res) {
    var data, i, value, _i, _len, _ref;
    data = [];
    if (res.NAMES.length !== 2) {
      alert("В parseforselect2data приходит не 2 колонки!");
    } else {
      _ref = res.DATA;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        value = _ref[i];
        data.push({
          id: res.DATA[i][0],
          text: res.DATA[i][1]
        });
      }
    }
    return data;
  };

  MB.Table.prototype.create = function(callback) {
    var instance;
    instance = this;
    return instance.makedir(function() {
      return instance.makecontainer(function() {
        return instance.getprofile(function(res) {
          return instance.updatemodel("profile", res, function() {
            return instance.getdata(function(res) {
              return instance.updatemodel("data", res, function() {
                return instance.updateview("init", function() {
                  return instance.updatecontroller("init", function() {
                    return callback();
                  });
                });
              });
            });
          });
        });
      });
    });
  };

  MB.Table.prototype.makedir = function(callback) {
    var instance;
    instance = this;
    MB.O.tables[instance.name] = instance;
    return callback();
  };

  MB.Table.prototype.makecontainer = function(callback) {
    var $container, $worldcontainer, instance;
    instance = this;
    $worldcontainer = $("." + instance.world + "-content-wrapper");
    $container = $("<div id='" + instance.world + "_" + instance.name + "_wrapper' class='" + instance.world + "-item'></div>");
    $worldcontainer.find('#' + instance.world + '_' + instance.name + '_wrapper.' + instance.world + '-item').remove();
    $worldcontainer.append($container);
    instance.$worldcontainer = $worldcontainer;
    instance.$container = $container;
    return callback();
  };

  MB.Table.prototype.getprofile = function(callback) {
    var instance, o;
    instance = this;
    o = {
      command: "get",
      object: "user_profile",
      client_object: instance.name
    };
    return MB.Core.sendQuery(o, function(res) {
      if ((res.RC != null) && parseInt(res.RC) !== 0) {
        toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE);
      }
      return callback(res);
    });
  };

  MB.Table.prototype.getdata = function(callback, all) {
    var constructorWhere, defaultWhere, filterWhere, general, i, instance, k, key, keytype, o, parentWhere, resultWhereArr, resultWhereString, value, _columns, _i, _len, _ref, _ref1;
    instance = this;
    general = instance.profile.general;
    _columns = instance.profile.columns;
    defaultWhere = general.where ? [general.where] : [];
    filterWhere = [];
    if (Object.keys(general.filterWhere).length > 0) {
      _ref = general.filterWhere;
      for (key in _ref) {
        value = _ref[key];
        switch (value.type) {
          case "equal":
            filterWhere.push("" + key + " = '" + value.value + "'");
            break;
          case "notIn":
            k = key.substr(0, key.length - 1);
            filterWhere.push("" + k + " not in" + value.value);
            break;
          case "daterange":
            if (value.start != null) {
              filterWhere.push("" + key + " >= to_date('" + value.start + "', 'DD.MM.YYYY')");
            }
            if (value.end != null) {
              filterWhere.push("" + key + " <= to_date('" + value.end + "', 'DD.MM.YYYY')");
            }
            break;
          case "not equal":
            filterWhere.push("" + key + " != " + value.value);
            break;
          case "grater than or equal":
            filterWhere.push("" + key + " >= '" + value.value + "'");
            break;
          case "less than or equal":
            filterWhere.push("" + key + " <= '" + value.value + "'");
            break;
          case "like":
            filterWhere.push("" + key + " like '%" + value.value + "%'");
        }
      }
    }
    parentWhere = [];
    _ref1 = _columns.keytypes;
    for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
      keytype = _ref1[i];
      if (keytype === "PARENT_KEY") {
        value = instance.parent.data.data[0][instance.parent.data.names.indexOf(_columns.columnsdb[i])];
        parentWhere.push("" + _columns.columnsdb[i] + " = '" + value + "'");
      }
    }
    constructorWhere = instance.constructorWhere ? [instance.constructorWhere] : [];
    resultWhereArr = [].concat(defaultWhere, filterWhere, parentWhere, constructorWhere);
    resultWhereString = "";
    if (resultWhereArr.length) {
      if (resultWhereArr.length > 1) {
        resultWhereString = resultWhereArr.join(" and ");
      } else {
        resultWhereString = resultWhereArr[0];
      }
    }
    o = {
      command: "get",
      object: general.getobject,
      where: resultWhereString,
      order_by: general.orderby,
      client_object: instance.name,
      sid: MB.User.sid
    };
    if (!all) {
      o.page_no = general.pageno;
      o.rows_max_num = general.rowsmaxnum;
    }
    return MB.Core.sendQuery(o, function(res) {
      if ((res.RC != null) && parseInt(res.RC) !== 0) {
        toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE);
      }
      return callback(res);
    });
  };

  MB.Table.prototype.distributeprofile = function(parsedprofile, callback) {
    var instance;
    instance = this;
    instance.profile = {};
    instance.profile.general = {};
    instance.profile.columns = {};
    instance.profile.general.prepareInsert = parsedprofile.PREPARE_INSERT;
    instance.profile.general.rowsmaxnum = parsedprofile.ROWS_MAX_NUM;
    instance.profile.general.primarykey = parsedprofile.PRIMARY_KEY;
    instance.profile.general.parentkey = parsedprofile.PARENT_KEY;
    instance.profile.general.orderby = parsedprofile.DEFAULT_ORDER_BY;
    instance.profile.general.object = parsedprofile.OBJECT_COMMAND;
    instance.profile.general.getobject = parsedprofile.GET_OBJECT_COMMAND;
    instance.profile.general.tablename = parsedprofile.CLIENT_OBJECT_NAME;
    instance.profile.general.newcommand = parsedprofile.NEW_COMMAND;
    instance.profile.general.removecommand = parsedprofile.REMOVE_COMMAND;
    instance.profile.general.juniorobject = parsedprofile.OPEN_FORM_CLIENT_OBJECT;
    instance.profile.general.modifycommand = parsedprofile.MODIFY_COMMAND;
    instance.profile.general.custom = parsedprofile.ADDITIONAL_FUNCTIONALITY;
    instance.profile.general.pageno = 1;
    instance.profile.general.rmbmenu = parsedprofile.RMB_MENU;
    instance.profile.columns.align = parsedprofile.ALIGN;
    instance.profile.columns.columnsclient = parsedprofile.NAME;
    instance.profile.columns.columnsdb = parsedprofile.COLUMN_NAME;
    instance.profile.columns.insertability = parsedprofile.INSERTABLE;
    instance.profile.columns.editability = parsedprofile.EDITABLE;
    instance.profile.columns.keytypes = parsedprofile.KEY_TYPE;
    instance.profile.columns.editor = parsedprofile.TYPE_OF_EDITOR;
    instance.profile.columns.visibility = parsedprofile.VISIBLE;
    instance.profile.columns.width = parsedprofile.WIDTH;
    instance.profile.columns.refclientobj = parsedprofile.REFERENCE_CLIENT_OBJECT;
    instance.profile.columns.returnscolumn = parsedprofile.LOV_RETURN_TO_COLUMN;
    instance.profile.columns.refcolumns = parsedprofile.LOV_COLUMNS;
    instance.profile.columns.references = parsedprofile.LOV_COMMAND;
    instance.profile.columns.refwhere = parsedprofile.LOV_WHERE;
    instance.profile.columns.acwhere = parsedprofile.AC_WHERE;
    instance.profile.columns.acreturnscolumns = parsedprofile.AC_RETURN_TO_COLUMN;
    instance.profile.columns.accolumns = parsedprofile.AC_COLUMNS;
    instance.profile.columns.accommands = parsedprofile.AC_COMMAND;
    instance.profile.columns.filterType = parsedprofile.FILTER_TYPE;
    instance.profile.columns.filterLabel = parsedprofile.FILTER_LABEL;
    instance.profile.columns.filterObject = parsedprofile.FILTER_COMMAND;
    instance.profile.columns.filterQueryColumns = parsedprofile.FILTER_COLUMNS;
    instance.profile.general.where = parsedprofile.DEFAULT_WHERE;
    instance.profile.columns.changeActionNames = parsedprofile.COLUMN_CHANGE_ACTION_NAME;
    instance.profile.columns.requirable = parsedprofile.REQUIRED;
    instance.profile.columns.querable = parsedprofile.QUERABLE;
    instance.profile.general.filterWhere = {};
    return callback();
  };

  MB.Table.prototype.distributedata = function(data, callback) {
    var instance;
    instance = this;
    instance.data = {};
    instance.data.data = data.DATA;
    instance.data.names = data.NAMES;
    instance.data.info = data.INFO;
    instance.data.dropdownsData = {};
    return callback();
  };

  MB.Table.prototype.removemodallistitem = function() {
    var instance;
    instance = this;
    return $(".modals-list").find("[data-object='" + instance.name + "']").remove();
  };

  MB.Table.prototype.closeit = function() {
    var instance, query;
    instance = this;
    if (instance.world === "page") {
      query = "#page_" + instance.name + "_wrapper";
      return $query.hide();
    } else {
      query = "#modal_" + instance.name + "_wrapper";
      $query.hide();
      return instance.removemodallistitem();
    }
  };

  MB.Table.prototype.createmodallistitem = function() {
    var instance;
    instance = this;
    return $(".modals-list").append("<li data-type='table' data-object='" + instance.name + "'> <i class='cross fa fa-times-circle'></i>" + instance.profile.general.tablename + " </li>");
  };

  MB.Table.prototype.showit = function(init) {
    var instance, query;
    instance = this;
    if (instance.world === "page") {
      query = "#page_" + MB.User.activepage + "_wrapper";
      $(query).hide();
      query = "#page_" + instance.name + "_wrapper";
      $(query).show();
      MB.User.activepage = instance.name;
      return MB.User.loadedpages.push(instance.name);
    } else {
      query = "#modal_" + MB.User.activemodal + "_wrapper";
      $(query).hide();
      query = "#modal_" + instance.name + "_wrapper";
      $(query).show();
      if (init) {
        instance.createmodallistitem();
      }
      MB.User.activemodal = instance.name;
      return MB.User.loadedmodals.push(instance.name);
    }
  };

  MB.Table.NewRow = function() {
    return "newrow";
  };

  MB.Table.prototype.updatemodel = function(part, data, callback) {
    var instance;
    instance = this;
    if (part === "profile") {
      return MB.Table.parseprofile(data, function(parsedprofile) {
        return instance.distributeprofile(parsedprofile, function() {
          return callback();
        });
      });
    } else if (part === "data") {
      return instance.distributedata(data, function() {
        return callback();
      });
    } else if (part === "addrow") {
      instance.data.data.unshift(MB.Table.NewRow());
      return callback();
    } else if (part === "duplicateRow") {
      instance.data.data.unshift(MB.Table.NewRow());
      return callback();
    }
  };

  MB.Table.prototype.makenewrow = function(callback) {
    var $handsontable, handsontableInstance, instance;
    instance = this;
    $handsontable = instance.$container.find(".handsontable");
    handsontableInstance = $handsontable.handsontable("getInstance");
    handsontableInstance.alter("insert_row", 0, 1);
    return callback();
  };

  MB.Table.prototype.initTable = function(callback) {
    var $container, $handsontable, config, general, handsontableInstance, i, instance, makeSelect2Column, processChange, value, _columns, _data, _fn, _i, _len, _ref;
    instance = this;
    general = instance.profile.general;
    _columns = instance.profile.columns;
    _data = instance.data;
    $container = instance.$container;
    $handsontable = $container.find(".handsontable");
    handsontableInstance = $handsontable.handsontable("getInstance");
    makeSelect2Column = function(i, doesSelect2WithEmptyValue) {
      var column;
      column = {
        type: "autocomplete",
        data: _columns.columnsdb[i],
        strict: true,
        source: function(query, process) {
          var likecolumn, refwherecolumn, refwherevalue, request, row, where;
          request = {
            command: "get",
            object: _columns.references[i],
            columns: _columns.refcolumns[i],
            sid: MB.User.sid
          };
          where = "";
          if (_columns.refcolumns[i]) {
            likecolumn = (_columns.refcolumns[i].split(","))[1];
            if (query !== "") {
              if (where === "") {
                where = "upper(" + likecolumn + ") like upper('%" + query + "%')";
              } else {
                where += " and upper(" + likecolumn + ") like upper('%" + query + "%')";
              }
            }
          }
          if (_columns.refwhere[i]) {
            $handsontable = instance.$container.find(".handsontable");
            handsontableInstance = $handsontable.handsontable("getInstance");
            refwherecolumn = _columns.refwhere[i];
            row = this.row;
            refwherevalue = instance.data.data[row][instance.data.names.indexOf(refwherecolumn)];
            if (where === "") {
              where = "" + refwherecolumn + " = '" + refwherevalue + "'";
            } else {
              where += " and " + refwherecolumn + " = '" + refwherevalue + "'";
            }
          }
          request.where = where;
          return $.ajax({
            url: "/cgi-bin/b2e/",
            dataType: "json",
            data: {
              request: MB.Core.makeQuery(request)
            },
            success: function(response) {
              var dropdown, list, value, _i, _len, _ref;
              response = MB.Core.parseFormat(response);
              _columns = instance.profile.columns;
              _data = instance.data;
              _data.dropdownsData[_columns.columnsdb[i]] = response;
              dropdown = _data.dropdownsData[_columns.columnsdb[i]];
              if (doesSelect2WithEmptyValue) {
                dropdown.DATA.unshift(["", ""]);
              }
              list = [];
              _ref = dropdown.DATA;
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                value = _ref[_i];
                list.push(value[1]);
              }
              process(list);
            }
          });
        }
      };
      return column;
    };
    processChange = function(changes) {
      var command, editor, i, mode, newVal, oldVal, prop, propIndex, returnsColumn, returnsColumnIndex, returnsValue, row, rowStatus, storage, storageProp, storageRow, storageValue, value, _general, _i, _len, _ref;
      row = changes[0][0];
      prop = changes[0][1];
      oldVal = changes[0][2];
      newVal = changes[0][3];
      _general = instance.profile.general;
      _columns = instance.profile.columns;
      _data = instance.data;
      $handsontable = $container.find(".handsontable");
      handsontableInstance = $handsontable.handsontable("getInstance");
      propIndex = _columns.columnsdb.indexOf(prop);
      rowStatus = handsontableInstance.getDataAtRowProp(row, "rowStatus");
      editor = _columns.editor[propIndex];
      switch (editor) {
        case "select2":
        case "select2withEmptyValue":
          returnsColumn = _columns.returnscolumn[propIndex];
          if (returnsColumn) {
            if ((editor === "select2withEmptyValue" || editor === "select2") && newVal === "") {
              returnsValue = newVal;
            } else {
              _ref = _data.dropdownsData[prop].DATA;
              for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
                value = _ref[i];
                if (value[1] === newVal) {
                  returnsValue = value[0];
                }
              }
            }
            returnsColumnIndex = _columns.columnsdb.indexOf(returnsColumn);
            if (_columns.visibility[returnsColumnIndex].bool()) {
              handsontableInstance.setDataAtRowProp(row, returnsColumn, returnsValue, "setValueToTheReturnsColumn");
            }
            prop = returnsColumn;
          } else {
            returnsValue = newVal;
          }
          break;
        default:
          returnsValue = newVal;
      }
      switch (rowStatus) {
        case "addingRow":
          mode = "create";
          break;
        case "editedRow":
          mode = "update";
          break;
        case "justRow":
          mode = "update";
          handsontableInstance.setDataAtRowProp(row, "rowStatus", "editedRow", "changeRowStatus");
      }
      command = (function() {
        switch (false) {
          case mode !== "create":
            return "new";
          case mode !== "update":
            return "modify";
          case mode !== "delete":
            return "remove";
        }
      })();
      storage = (function() {
        switch (false) {
          case mode !== "create":
            return "addingStorage";
          case mode !== "update":
            return "editingStorage";
          case mode !== "delete":
            return "deletingStorage";
        }
      })();
      storageRow = (function() {
        switch (false) {
          case mode !== "create":
            return handsontableInstance.getDataAtRowProp(row, "guid");
          default:
            return _data.data[row][_data.names.indexOf(_general.primarykey)];
        }
      })();
      storageProp = prop;
      storageValue = returnsValue;
      if (instance[storage] == null) {
        instance[storage] = {};
      }
      if (instance[storage][storageRow] == null) {
        instance[storage][storageRow] = {
          command: command,
          object: _general.object
        };
        switch (mode) {
          case "update":
          case "delete":
            instance[storage][storageRow].objversion = _data.data[row][_data.names.indexOf("OBJVERSION")];
            instance[storage][storageRow][_general.primarykey] = _data.data[row][_data.names.indexOf(_general.primarykey)];
        }
        if (instance.parent != null) {
          instance[storage][storageRow][MB.O.forms[instance.parent.name].profile.general.primarykey] = instance.parent.activeId;
        }
      }
      return instance[storage][storageRow][storageProp] = storageValue;
    };
    config = {
      autoWrapCol: true,
      autoWrapRow: true,
      columnSorting: true,
      enterBeginsEditing: false,
      fillHandle: false,
      manualColumnMove: true,
      manualColumnResize: true,
      multiSelect: true,
      outsideClickDeselects: false,
      undo: true,
      stretchH: "all",
      currentRowClassName: "currentRow",
      currentColClassName: "currentCol",
      afterChange: function(changes, source) {
        console.log("afterChangeEvent", arguments);
        switch (source) {
          case "loadData":
            break;
          case "changeRowStatus":
            break;
          case "changeRowGuid":
            break;
          case "setValueToTheReturnsColumn":
            break;
          case "edit":
          case "paste":
          case "duplicateInsertion":
            return processChange(changes);
        }
      },
      rowHeaders: function(i) {
        var rowStatus;
        $handsontable = instance.$container.find(".handsontable");
        handsontableInstance = $handsontable.handsontable("getInstance");
        rowStatus = handsontableInstance.getDataAtRowProp(i, "rowStatus");
        return "<div class='rowStatusMarker " + rowStatus + "'>" + (i + 1) + "</div>";
      },
      columns: (function() {
        var column, columnEditor, columns, doesColumnUpdatable, doesColumnVisible, doesTableUpdatable, i, i2, instanceVisSettings, isTablesInLs, value, value2, _i, _j, _len, _len1, _ref, _ref1;
        columns = [];
        doesTableUpdatable = general.modifycommand.bool();
        _ref = _columns.columnsdb;
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          value = _ref[i];
          columnEditor = _columns.editor[i];
          isTablesInLs = JSON.parse(localStorage.getItem('tables')) != null;
          instanceVisSettings = false;
          if (isTablesInLs) {
            _ref1 = JSON.parse(localStorage.getItem('tables'));
            for (i2 = _j = 0, _len1 = _ref1.length; _j < _len1; i2 = ++_j) {
              value2 = _ref1[i2];
              if (value2.name === instance.name) {
                instanceVisSettings = value2;
              }
            }
          }
          if (instanceVisSettings && instanceVisSettings.visibility) {
            doesColumnVisible = instanceVisSettings.visibility[value];
          } else {
            doesColumnVisible = _columns.visibility[i].bool();
          }
          doesColumnUpdatable = _columns.editability[i].bool();
          if (doesColumnVisible) {
            if (doesTableUpdatable && doesColumnUpdatable) {
              switch (columnEditor) {
                case "text":
                  column = {
                    type: "text",
                    data: value
                  };
                  break;
                case "number":
                  column = {
                    type: "text",
                    data: value
                  };
                  break;
                case "colorpicker":
                  column = {
                    type: "colorpicker",
                    data: value,
                    isColorpicker: "TRUE"
                  };
                  break;
                case "password":
                  column = {
                    type: "text",
                    data: value
                  };
                  break;
                case "datetime":
                  column = {
                    type: "datetime",
                    data: value
                  };
                  break;
                case "checkbox":
                  column = {
                    type: "checkbox",
                    data: value,
                    checkedTemplate: "TRUE",
                    uncheckedTemplate: "FALSE"
                  };
                  break;
                case "select2":
                  (function(i) {
                    return column = makeSelect2Column(i, false);
                  })(i);
                  break;
                case "select2withEmptyValue":
                  (function(i) {
                    return column = makeSelect2Column(i, true);
                  })(i);
              }
            } else {
              switch (columnEditor) {
                case "checkbox":
                  column = {
                    type: "checkbox",
                    data: value,
                    checkedTemplate: "TRUE",
                    uncheckedTemplate: "FALSE",
                    readOnly: true
                  };
                  break;
                default:
                  column = {
                    type: "text",
                    data: value,
                    readOnly: true
                  };
              }
            }
          } else {
            continue;
          }
          columns.push(column);
        }
        return columns;
      })(),
      data: (function() {
        var data, i, i2, lsT, lsTable, rowObject, tableInLs, val, value, value2, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
        _columns = instance.profile.columns;
        data = [];
        _data = instance.data;
        tableInLs = false;
        if (JSON.parse(localStorage.getItem('tables'))) {
          _ref = JSON.parse(localStorage.getItem('tables'));
          for (lsT = _i = 0, _len = _ref.length; _i < _len; lsT = ++_i) {
            lsTable = _ref[lsT];
            if (lsTable.name === instance.name) {
              tableInLs = lsTable.visibility;
            }
          }
        }
        _ref1 = _data.data;
        for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
          value = _ref1[i];
          rowObject = {};
          _ref2 = _columns.columnsdb;
          for (i2 = _k = 0, _len2 = _ref2.length; _k < _len2; i2 = ++_k) {
            value2 = _ref2[i2];
            if (tableInLs !== false) {
              if (tableInLs[value2]) {
                if (_columns.editor[i2] === "checkbox") {
                  val = value[_columns.columnsdb.indexOf(value2)];
                  if (val === "") {
                    val = "FALSE";
                  }
                  rowObject[value2] = val;
                  rowObject.rowStatus = "justRow";
                } else {
                  rowObject[value2] = value[_columns.columnsdb.indexOf(value2)];
                  rowObject.rowStatus = "justRow";
                }
              }
            } else {
              if (_columns.visibility[i2].bool()) {
                if (_columns.editor[i2] === "checkbox") {
                  val = value[_columns.columnsdb.indexOf(value2)];
                  if (val === "") {
                    val = "FALSE";
                  }
                  rowObject[value2] = val;
                  rowObject.rowStatus = "justRow";
                } else {
                  rowObject[value2] = value[_columns.columnsdb.indexOf(value2)];
                  rowObject.rowStatus = "justRow";
                }
              }
            }
          }
          data.push(rowObject);
        }
        return data;
      })(),
      colHeaders: (function() {
        var colHeaders, i, lsT, lsTabIN, lsTabInnerName, lsTable, totalNo, value, _i, _j, _len, _len1, _ref, _ref1, _ref2;
        colHeaders = [];
        totalNo = true;
        if (JSON.parse(localStorage.getItem('tables'))) {
          _ref = JSON.parse(localStorage.getItem('tables'));
          for (lsT = _i = 0, _len = _ref.length; _i < _len; lsT = ++_i) {
            lsTable = _ref[lsT];
            if (lsTable.name === instance.name) {
              _ref1 = lsTable.visibility;
              for (lsTabInnerName in _ref1) {
                lsTabIN = _ref1[lsTabInnerName];
                if (lsTabIN) {
                  colHeaders.push(_columns.columnsclient[_columns.columnsdb.indexOf(lsTabInnerName)]);
                  totalNo = false;
                }
              }
            }
          }
        }
        if (totalNo) {
          _ref2 = _columns.columnsclient;
          for (i = _j = 0, _len1 = _ref2.length; _j < _len1; i = ++_j) {
            value = _ref2[i];
            if (_columns.visibility[i].bool() && _columns.requirable[i].bool()) {
              colHeaders.push("" + value + "<span class='redStar'>*</span>");
            } else if (_columns.visibility[i].bool()) {
              colHeaders.push(value);
            }
          }
        }
        return colHeaders;
      })(),
      afterCreateRow: function(index, ammount) {
        var guid, i, value, _i, _len, _ref, _results;
        $handsontable = instance.$container.find(".handsontable");
        handsontableInstance = $handsontable.handsontable("getInstance");
        guid = MB.Core.guid();
        handsontableInstance.setDataAtRowProp(index, "rowStatus", "addingRow", "changeRowStatus");
        handsontableInstance.setDataAtRowProp(index, "guid", guid, "changeRowGuid");
        _ref = general.prepareInsert.NAMES;
        _results = [];
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          value = _ref[i];
          _results.push(handsontableInstance.setDataAtRowProp(index, value, general.prepareInsert.DATA[i]));
        }
        return _results;
      }
    };
    config.contextMenu = {};
    config.contextMenu.items = {};
    config.contextMenu.items.openInModal = {
      disabled: function() {
        var disableStatus, row, rowEnd, rowStatus, selectedRowsInterval;
        $handsontable = instance.$container.find(".handsontable");
        handsontableInstance = $handsontable.handsontable("getInstance");
        disableStatus = false;
        if (instance.profile.general.juniorobject === "") {
          disableStatus = true;
        } else {
          selectedRowsInterval = MB.Table.getSelectedRowsInterval(handsontableInstance);
          row = selectedRowsInterval[0];
          rowEnd = selectedRowsInterval[1];
          while (row <= rowEnd) {
            rowStatus = handsontableInstance.getDataAtRowProp(row, "rowStatus");
            if (rowStatus === "addingRow") {
              disableStatus = true;
            }
            row++;
          }
        }
        return disableStatus;
      },
      name: "Открыть в форме ..."
    };
    _ref = instance.profile.general.rmbmenu.DATA;
    _fn = function(value, i) {
      if (value[instance.profile.general.rmbmenu.NAMES.indexOf("RMB_MENU_TYPE")] === "SEND_COMMAND") {
        return config.contextMenu.items[value[instance.profile.general.rmbmenu.NAMES.indexOf("RMB_MENU_ITEM_ID")]] = {
          name: value[instance.profile.general.rmbmenu.NAMES.indexOf("RMB_MENU_LABEL")],
          disabled: function() {
            var keyword2, selectedRows;
            handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
            selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
            keyword2 = value[instance.profile.general.rmbmenu.NAMES.indexOf('IS_DISABLED_COLUMN')];
            if (keyword2 === "") {
              return false;
            } else {
              return instance.data.data[selectedRows[0]][instance.data.names.indexOf(keyword2)] === "TRUE";
            }
          }
        };
      } else {
        return config.contextMenu.items[value[instance.profile.general.rmbmenu.NAMES.indexOf("RMB_MENU_ITEM_ID")]] = {
          name: value[instance.profile.general.rmbmenu.NAMES.indexOf("RMB_MENU_LABEL")],
          disabled: function() {
            var getTotalRows, keyword, result, selectedRows;
            handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
            selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
            keyword = value[instance.profile.general.rmbmenu.NAMES.indexOf('WHERE_COLUMNS')];
            getTotalRows = function(arr) {
              var result;
              result = true;
              i = arr[0];
              while (i < arr[1]) {
                if (instance.data.data[i][instance.data.names.indexOf(keyword)] === "") {
                  result = false;
                }
                i++;
              }
              return result;
            };
            if (selectedRows[0] === selectedRows[1]) {
              return result = instance.data.data[selectedRows[0]][instance.data.names.indexOf(keyword)] === "";
            } else {
              return result = getTotalRows(selectedRows);
            }
          }
        };
      }
    };
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      value = _ref[i];
      _fn(value, i);
    }
    config.contextMenu.callback = function(key, options) {
      var g, gValue, k, paramsArr, paramsObj, selectedRows, _j, _k, _len1, _len2, _ref1;
      _ref1 = instance.profile.general.rmbmenu.DATA;
      for (g = _j = 0, _len1 = _ref1.length; _j < _len1; g = ++_j) {
        gValue = _ref1[g];
        if (gValue[instance.profile.general.rmbmenu.NAMES.indexOf("RMB_MENU_ITEM_ID")] === key) {
          value = gValue;
        }
      }
      handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
      selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
      if (key === "openInModal") {
        return MB.Table.createOpenInModalContextMenuItem(instance, key, options);
      } else {
        if (value[instance.profile.general.rmbmenu.NAMES.indexOf("RMB_MENU_TYPE")] === "SEND_COMMAND") {
          paramsArr = value[instance.profile.general.rmbmenu.NAMES.indexOf("SEND_ATTRIBUTE")].replace(RegExp(" ", "g"), "").split(",");
          paramsObj = {};
          for (_k = 0, _len2 = paramsArr.length; _k < _len2; _k++) {
            k = paramsArr[_k];
            paramsObj[k] = instance.data.data[selectedRows[0]][instance.data.names.indexOf(k)];
          }
          if (value[instance.profile.general.rmbmenu.NAMES.indexOf("SEND_WITH_ALERT")] === "TRUE") {
            bootbox.dialog({
              message: value[instance.profile.general.rmbmenu.NAMES.indexOf("SEND_ALERT")],
              title: "Подтверждение",
              buttons: {
                success: {
                  label: "Да",
                  className: "green",
                  callback: function() {
                    return MB.Core.sendQuery({
                      command: value[instance.profile.general.rmbmenu.NAMES.indexOf("SEND_OPERATION")],
                      Object: value[instance.profile.general.rmbmenu.NAMES.indexOf("SEND_OBJECT")],
                      sid: MB.User.sid,
                      params: paramsObj
                    }, function(res) {
                      return toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE);
                    });
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
            MB.Core.sendQuery({
              command: value[instance.profile.general.rmbmenu.NAMES.indexOf("SEND_OPERATION")],
              Object: value[instance.profile.general.rmbmenu.NAMES.indexOf("SEND_OBJECT")],
              sid: MB.User.sid,
              params: paramsObj
            }, function(res) {
              return toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE);
            });
          }
        } else {
          if (key === value[instance.profile.general.rmbmenu.NAMES.indexOf("RMB_MENU_ITEM_ID")]) {
            MB.Core.switchPage({
              type: "table",
              name: value[instance.profile.general.rmbmenu.NAMES.indexOf("OPEN_CLIENT_OBJECT")],
              where: "" + value[instance.profile.general.rmbmenu.NAMES.indexOf('WHERE_COLUMNS')] + " = " + instance.data.data[options.start._row][instance.data.names.indexOf(value[instance.profile.general.rmbmenu.NAMES.indexOf('WHERE_COLUMNS')])]
            });
          }
        }
      }
    };
    $handsontable = instance.$container.find(".handsontable");
    $handsontable.handsontable(config);
    callback();
    return instance.reload("data");
  };

  MB.Table.prototype.updateTable = function(callback) {
    var $handsontable, config, handsontableInstance, instance, makeSelect2Column, _columns;
    instance = this;
    _columns = instance.profile.columns;
    makeSelect2Column = function(i, doesSelect2WithEmptyValue) {
      var column;
      column = {
        type: "autocomplete",
        data: _columns.columnsdb[i],
        strict: true,
        source: function(query, process) {
          var $handsontable, handsontableInstance, likecolumn, refwherecolumn, refwherevalue, request, row, where;
          request = {
            command: "get",
            object: _columns.references[i],
            columns: _columns.refcolumns[i],
            sid: MB.User.sid
          };
          where = "";
          if (_columns.refcolumns[i]) {
            likecolumn = (_columns.refcolumns[i].split(","))[1];
            if (query !== "") {
              if (where === "") {
                where = "upper(" + likecolumn + ") like upper('%" + query + "%')";
              } else {
                where += " and upper(" + likecolumn + ") like upper('%" + query + "%')";
              }
            }
          }
          if (_columns.refwhere[i]) {
            $handsontable = instance.$container.find(".handsontable");
            handsontableInstance = $handsontable.handsontable("getInstance");
            refwherecolumn = _columns.refwhere[i];
            row = this.row;
            refwherevalue = instance.data.data[row][instance.data.names.indexOf(refwherecolumn)];
            if (where === "") {
              where = "" + refwherecolumn + " = '" + refwherevalue + "'";
            } else {
              where += " and " + refwherecolumn + " = '" + refwherevalue + "'";
            }
          }
          request.where = where;
          return MB.Core.sendQuery(request, function(response) {
            var dropdown, list, value, _data, _i, _len, _ref;
            _columns = instance.profile.columns;
            _data = instance.data;
            _data.dropdownsData[_columns.columnsdb[i]] = response;
            dropdown = _data.dropdownsData[_columns.columnsdb[i]];
            if (doesSelect2WithEmptyValue) {
              dropdown.DATA.unshift(["", ""]);
            }
            list = [];
            _ref = dropdown.DATA;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              value = _ref[_i];
              list.push(value[1]);
            }
            process(list);
          });
        }
      };
      return column;
    };
    config = {
      columns: (function() {
        var column, columnEditor, columns, doesColumnUpdatable, doesColumnVisible, doesTableUpdatable, general, i, i2, instanceVisSettings, isTablesInLs, value, value2, _i, _j, _len, _len1, _ref, _ref1;
        general = instance.profile.general;
        columns = [];
        doesTableUpdatable = general.modifycommand.bool();
        _ref = _columns.columnsdb;
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          value = _ref[i];
          columnEditor = _columns.editor[i];
          isTablesInLs = JSON.parse(localStorage.getItem('tables')) != null;
          instanceVisSettings = false;
          if (isTablesInLs) {
            _ref1 = JSON.parse(localStorage.getItem('tables'));
            for (i2 = _j = 0, _len1 = _ref1.length; _j < _len1; i2 = ++_j) {
              value2 = _ref1[i2];
              if (value2.name === instance.name) {
                instanceVisSettings = value2;
              }
            }
          }
          if (instanceVisSettings && instanceVisSettings.visibility) {
            doesColumnVisible = instanceVisSettings.visibility[value];
          } else {
            doesColumnVisible = _columns.visibility[i].bool();
          }
          doesColumnUpdatable = _columns.editability[i].bool();
          if (doesColumnVisible) {
            if (doesTableUpdatable && doesColumnUpdatable) {
              switch (columnEditor) {
                case "text":
                  column = {
                    type: "text",
                    data: value
                  };
                  break;
                case "number":
                  column = {
                    type: "text",
                    data: value
                  };
                  break;
                case "colorpicker":
                  column = {
                    type: "colorpicker",
                    data: value,
                    isColorpicker: "TRUE"
                  };
                  break;
                case "password":
                  column = {
                    type: "text",
                    data: value
                  };
                  break;
                case "datetime":
                  column = {
                    type: "datetime",
                    data: value
                  };
                  break;
                case "checkbox":
                  column = {
                    type: "checkbox",
                    data: value,
                    checkedTemplate: "TRUE",
                    uncheckedTemplate: "FALSE"
                  };
                  break;
                case "select2":
                  (function(i) {
                    return column = makeSelect2Column(i, false);
                  })(i);
                  break;
                case "select2withEmptyValue":
                  (function(i) {
                    return column = makeSelect2Column(i, true);
                  })(i);
              }
            } else {
              switch (columnEditor) {
                case "checkbox":
                  column = {
                    type: "checkbox",
                    data: value,
                    checkedTemplate: "TRUE",
                    uncheckedTemplate: "FALSE",
                    readOnly: true
                  };
                  break;
                default:
                  column = {
                    type: "text",
                    data: value,
                    readOnly: true
                  };
              }
            }
          } else {
            continue;
          }
          columns.push(column);
        }
        return columns;
      })(),
      colHeaders: (function() {
        var colHeaders, i, lsT, lsTabIN, lsTabInnerName, lsTable, totalNo, value, _i, _j, _len, _len1, _ref, _ref1, _ref2;
        _columns = instance.profile.columns;
        colHeaders = [];
        totalNo = true;
        if (JSON.parse(localStorage.getItem('tables'))) {
          _ref = JSON.parse(localStorage.getItem('tables'));
          for (lsT = _i = 0, _len = _ref.length; _i < _len; lsT = ++_i) {
            lsTable = _ref[lsT];
            if (lsTable.name === instance.name) {
              _ref1 = lsTable.visibility;
              for (lsTabInnerName in _ref1) {
                lsTabIN = _ref1[lsTabInnerName];
                if (lsTabIN) {
                  colHeaders.push(_columns.columnsclient[_columns.columnsdb.indexOf(lsTabInnerName)]);
                  totalNo = false;
                }
              }
            }
          }
        }
        if (totalNo) {
          _ref2 = _columns.columnsclient;
          for (i = _j = 0, _len1 = _ref2.length; _j < _len1; i = ++_j) {
            value = _ref2[i];
            if (_columns.visibility[i].bool() && _columns.requirable[i].bool()) {
              colHeaders.push("" + value + "<span class='redStar'>*</span>");
            } else if (_columns.visibility[i].bool()) {
              colHeaders.push(value);
            }
          }
        }
        console.log(colHeaders);
        return colHeaders;
      })(),
      data: (function() {
        var data, i, i2, lsT, lsTable, rowObject, tableInLs, val, value, value2, _data, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
        _columns = instance.profile.columns;
        data = [];
        _data = instance.data;
        tableInLs = false;
        if (JSON.parse(localStorage.getItem('tables'))) {
          _ref = JSON.parse(localStorage.getItem('tables'));
          for (lsT = _i = 0, _len = _ref.length; _i < _len; lsT = ++_i) {
            lsTable = _ref[lsT];
            if (lsTable.name === instance.name) {
              tableInLs = lsTable.visibility;
            }
          }
        }
        _ref1 = _data.data;
        for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
          value = _ref1[i];
          rowObject = {};
          _ref2 = _columns.columnsdb;
          for (i2 = _k = 0, _len2 = _ref2.length; _k < _len2; i2 = ++_k) {
            value2 = _ref2[i2];
            if (tableInLs !== false) {
              if (tableInLs[value2]) {
                if (_columns.editor[i2] === "checkbox") {
                  val = value[_columns.columnsdb.indexOf(value2)];
                  if (val === "") {
                    val = "FALSE";
                  }
                  rowObject[value2] = val;
                  rowObject.rowStatus = "justRow";
                } else {
                  rowObject[value2] = value[_columns.columnsdb.indexOf(value2)];
                  rowObject.rowStatus = "justRow";
                }
              }
            } else {
              if (_columns.visibility[i2].bool()) {
                if (_columns.editor[i2] === "checkbox") {
                  val = value[_columns.columnsdb.indexOf(value2)];
                  if (val === "") {
                    val = "FALSE";
                  }
                  rowObject[value2] = val;
                  rowObject.rowStatus = "justRow";
                } else {
                  rowObject[value2] = value[_columns.columnsdb.indexOf(value2)];
                  rowObject.rowStatus = "justRow";
                }
              }
            }
          }
          data.push(rowObject);
        }
        console.log(data);
        return data;
      })()
    };
    $handsontable = instance.$container.find(".handsontable");
    handsontableInstance = $handsontable.handsontable("getInstance");
    handsontableInstance.updateSettings(config);
    return callback();
  };

  MB.Table.prototype.updateview = function(part, callback) {
    var $paginationWrapper, $tmpPage, $totalPages, dataCount, instance, maxRowsCount, tmpPageNo, totalValue;
    instance = this;
    tmpPageNo = instance.profile.pageno;
    dataCount = instance.data.info.ROWS_COUNT;
    maxRowsCount = instance.profile.general.rowsmaxnum;
    $paginationWrapper = instance.$container.find('.pagination');
    $tmpPage = $paginationWrapper.find('input.form-control');
    $totalPages = $paginationWrapper.find('.totalPages');
    if (Math.ceil(dataCount / maxRowsCount) <= 1) {
      $tmpPage.val('1');
    }
    totalValue = function() {
      console.log(dataCount, maxRowsCount);
      if (Math.ceil(dataCount / maxRowsCount) > 1) {
        return '/ ' + Math.ceil(dataCount / maxRowsCount);
      } else {
        return '';
      }
    };
    $totalPages.html(totalValue);
    if (part === "init") {
      return instance.makeheader(function(header) {
        return instance.maketoppanel(function(toppanel) {
          return instance.maketable(function(table) {
            return instance.concathtml({
              header: header,
              toppanel: toppanel,
              table: table
            }, function(concatedhtml) {
              return instance.loadhtml({
                init: concatedhtml
              }, function() {
                return instance.initTable(function() {
                  var innerInput;
                  innerInput = '<input  type="text" class="colorPInTable"/>';
                  return callback();
                });
              });
            });
          });
        });
      });
    } else if (part === "data") {
      return instance.maketable(function(table) {
        return instance.loadhtml({
          data: table
        }, function() {
          instance.updateTable(function() {});
          return callback();
        });
      });
    } else if (part === "data pagination") {
      return instance.maketable(function(table) {
        return instance.makepagination(function(pagination) {
          return instance.loadhtml({
            data: table,
            pagination: pagination
          }, function() {
            return callback();
          });
        });
      });
    } else if (part === "addrow") {
      return instance.makenewrow(function() {
        return callback();
      });
    } else if (part === "duplicateRow") {
      return instance.makenewrow(function() {
        return callback();
      });
    }
  };

  MB.Table.prototype.loadhtml = function(options, callback) {
    var instance, key, query, value, _results;
    instance = this;
    query = "#" + instance.world + "_" + instance.name + "_wrapper";
    _results = [];
    for (key in options) {
      value = options[key];
      if (key === "init") {
        $(query).html(options[key]);
        $(query).find(".pagination input").val(1);
        _results.push(callback());
      } else if (key === "data") {
        _results.push(callback());
      } else if (key === "pagination") {
        $(query).find(".pagination").empty().html(options[key]);
        _results.push(callback());
      } else {
        _results.push(callback());
      }
    }
    return _results;
  };

  MB.Table.prototype.concathtml = function(htmls, callback) {
    var columns, html, i, instance, optionslist, value, _i, _len, _ref;
    instance = this;
    columns = instance.profile.columns;
    optionslist = "";
    _ref = columns.querable;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      value = _ref[i];
      if (value.bool()) {
        optionslist += "<option value='" + columns.columnsdb[i] + "'>" + columns.columnsclient[i] + " (" + columns.columnsdb[i] + ")</option>";
      }
    }
    html = "";
    html += "<div class='row'> <div class='col-md-12'> <div class='portlet box blue'>";
    html += htmls.header;
    html += "<div class='portlet-body'>";
    html += htmls.toppanel;
    html += "<div class='row'>";
    html += htmls.table;
    html += "</div>";
    html += "<div class='modal fade' id='" + instance.name + "-searchmodal' tabindex='-1' role='basic' aria-hidden='true'> <div class='modal-dialog'> <div class='modal-content'> <div class='modal-header'> <button type='button' class='close' data-dismiss='modal' aria-hidden='true'></button> <h4 class='modal-title'>Поиск</h4> </div> <div class='modal-body'> <div class='filter row'> <div class='col-md-4'> <select class='form-control'> " + optionslist + " </select> </div> <div class='col-md-3'> <select class='form-control'> <option value='equal'>(==) Равно</option> <option value='not equal'>(!=) Не равно</option> <option value='grater than or equal'>(>=) Больше или равно</option> <option value='less than or equal'>(<=) Меньше или равно</option> <option value='like'>(%) Любое значение</option> </select> </div> <div class='col-md-4'> <input type='text' class='form-control'> </div> <div class='col-md-1'> <button type='button' class='close removefilter'></button> </div> </div> </div> <div class='modal-footer'> <button type='button' class='btn default resetfilters'>Сбросить фильтры</button> <button type='button' class='btn default addfilter'>Добавить фильтр</button> <button type='button' class='btn blue google'>Найти</button> <button type='button' class='btn default' data-dismiss='modal'>Закрыть</button> </div> </div> </div> </div>";
    return callback(html);
  };

  MB.Table.prototype.makeheader = function(callback) {
    var filtersExists, html, i, instance, l, lsT, lsTabIN, lsTabInnerName, lsTable, numberOfPages, pageNumber, querablesExists, totalNo, value, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3;
    instance = this;
    html = "";
    pageNumber = parseInt(instance.profile.general.pageno);
    numberOfPages = Math.ceil(instance.data.info.ROWS_COUNT / instance.profile.general.rowsmaxnum);
    html += "<div class='portlet-title'> <div class='caption'> <i class='fa fa-globe'></i>" + instance.profile.general.tablename + "</div> <div class='tools'> <a href='#portlet-config' data-toggle='modal' class='config'></a> <a href='javascript:;' class='reload'></a> </div> <div class='actions'>";
    if (numberOfPages > 1) {
      html += "<div class='pagination'> Стр. <a href='#' class='btn default switchPreviousPage'> <i class='fa fa-angle-left'></i> </a> <input type='text' class='form-control' disabled > <a href='#' class='btn default switchNextPage'> <i class='fa fa-angle-right'></i> </a> <span class='totalPages'>/ " + numberOfPages + "</span> </div>";
    }
    filtersExists = false;
    _ref = instance.profile.columns.filterType;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      value = _ref[i];
      if (instance.profile.columns.filterType[i] !== "") {
        filtersExists = true;
      }
    }
    if (instance.constructorWhere !== "") {
      filtersExists = true;
    }
    if (filtersExists) {
      html += "<a href='#' class='btn btn-primary reset_filters'> <i class='fa fa-filter'></i> </a>";
    }
    _ref1 = instance.profile.columns.querable;
    for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
      value = _ref1[i];
      if (value !== "") {
        querablesExists = true;
      }
    }
    if (querablesExists) {
      html += "<a class='btn default' data-toggle='modal' href='#" + instance.name + "-searchmodal'> <i class='fa fa-search'></i> </a>";
      instance.querablesExists = querablesExists;
    }
    if (instance.profile.general.newcommand.bool()) {
      html += "<a href='#' class='btn btn-primary create_button'> <i class='fa fa-plus'></i> Создать </a>";
      if (instance.profile.general.juniorobject) {
        html += "<a href='#' class='btn btn-primary create_in_form_button'> <i class='fa fa-plus'></i> Создать в форме </a>";
      }
      html += "<a href='#' class='btn btn-primary duplicate_button'> <i class='fa fa-copy'></i> Дублировать </a>";
    }
    if (instance.profile.general.removecommand.bool()) {
      html += "<a href='#' class='btn red delete_button'> <i class='fa fa-times'></i> Удалить </a>";
    }
    if (instance.profile.general.modifycommand.bool() || instance.profile.general.newcommand.bool()) {
      html += "<a href='#' class='btn green save_button'> <i class='fa fa-save'></i> Сохранить </a>";
    }
    html += "<div class='btn-group'> <a class='btn green' href='#' data-toggle='dropdown'> <i class='fa fa-cogs'></i> Доп. функции <i class='fa fa-angle-down'></i> </a> <ul class='dropdown-menu pull-right'> <li> <a href='#' class='xls-converter'> <i class='fa fa-pencil'></i> Export to Excel </a> </li> <li> <a href='#' class='send_exel_to_email'> <i class='fa fa-pencil'></i> Send excel to email </a> </li> <li class='divider'></li> <li> <a href='#'> <i class='i'></i> More action </a> </li> </ul> </div>";
    html += "<div class='btn-group'> <a class='btn green' href='#' data-toggle='dropdown'> Колонки <i class='fa fa-angle-down'></i> </a> <div class='dropdown-menu hold-on-click dropdown-checkboxes pull-right columns_toggler'>";
    totalNo = true;
    if (JSON.parse(localStorage.getItem('tables'))) {
      _ref2 = JSON.parse(localStorage.getItem('tables'));
      for (lsT = _k = 0, _len2 = _ref2.length; _k < _len2; lsT = ++_k) {
        lsTable = _ref2[lsT];
        if (lsTable.name === instance.name) {
          _ref3 = lsTable.visibility;
          for (lsTabInnerName in _ref3) {
            lsTabIN = _ref3[lsTabInnerName];
            if (lsTabIN) {
              html += "<label><input type='checkbox' data-column='" + lsTabInnerName + "' checked>" + instance.profile.columns.columnsclient[instance.profile.columns.columnsdb.indexOf(lsTabInnerName)] + "</label>";
            } else {
              html += "<label><input type='checkbox' data-column='" + lsTabInnerName + "'>" + instance.profile.columns.columnsclient[instance.profile.columns.columnsdb.indexOf(lsTabInnerName)] + "</label>";
            }
            totalNo = false;
          }
        }
      }
    }
    if (totalNo) {
      i = 0;
      l = instance.profile.columns.columnsdb.length;
      while (i < l) {
        if (instance.profile.columns.visibility[i] === "TRUE") {
          html += "<label><input type='checkbox' data-column='" + instance.profile.columns.columnsdb[i] + "' checked>" + instance.profile.columns.columnsclient[i] + "</label>";
        } else {
          html += "<label><input type='checkbox' data-column='" + instance.profile.columns.columnsdb[i] + "'>" + instance.profile.columns.columnsclient[i] + "</label>";
        }
        i++;
      }
    }
    html += "</div></div></div></div>";
    return callback(html);
  };

  MB.Table.prototype.maketoppanel = function(callback) {
    var columns, filterType, html, i, instance, value, _i, _len, _ref;
    instance = this;
    columns = instance.profile.columns;
    html = "<div class='row'><div class='col-md-12'><div class='top-panel'><div class='row'>";
    _ref = columns.columnsdb;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      value = _ref[i];
      filterType = columns.filterType[i];
      switch (filterType) {
        case "daterange":
          html += "<div class='col-md-3'> <div class='form-group'> <div> <label>" + columns.filterLabel[i] + "</label> </div> <div class='row filterContainer' data-column='" + value + "' data-filterType='" + filterType + "'> <div class='col-md-6'> <div class='input-group'> <span class='input-group-addon'>С:</span> <input type='text' class='form-control' data-side='start'> </div> </div> <div class='col-md-6'> <div class='input-group'> <span class='input-group-addon'>По:</span> <input type='text' class='form-control' data-side='end'> </div> </div> </div> </div> </div>";
          break;
        case "select2":
          html += "<div class='col-md-2'> <div class='form-group'> <label>" + columns.filterLabel[i] + "</label> <div class='filterContainer' data-column='" + value + "' data-filterType='" + filterType + "'> <input type='text' class='form-control filter'> </div> </div> </div>";
      }
    }
    html += "</div></div></div></div>";
    return callback(html);
  };

  MB.Table.prototype.maketable = function(callback) {
    var html, instance;
    instance = this;
    html = "<div class='col-md-12'><div class='handsontable'></div></div>";
    return callback(html);
  };

  MB.Table.prototype.reload = function(part, callback) {
    var instance;
    instance = this;
    if (part === "data") {
      return instance.getdata(function(res) {
        return instance.updatemodel("data", res, function() {
          return instance.updateview("data", function() {
            if (callback) {
              return callback();
            }
          });
        });
      });
    } else if (part === "data pagination") {
      return instance.getdata(function(res) {
        return instance.updatemodel("data", res, function() {
          return instance.updateview("data pagination", function() {
            if (callback) {
              return callback();
            }
          });
        });
      });
    } else {
      return part === "all";
    }
  };

  MB.Table.prototype.updatecontroller = function(part, callback) {
    var $searchmodal, instance;
    instance = this;
    if (part === "init") {
      $searchmodal = instance.$container.find("#" + instance.name + "-searchmodal");
      $searchmodal.find(".modal-body").on("click", function(e) {
        var $target;
        $target = $(e.target);
        if ($target.hasClass("removefilter")) {
          return $target.parents(".filter").remove();
        }
      });
      $searchmodal.find(".modal-footer").on("click", "button", function(e) {
        var $target, button, columns, counter, countfilters, filtercount, i, key, optionslist, value, _i, _len, _ref, _ref1;
        columns = instance.profile.columns;
        $target = $(e.target);
        if ($target.hasClass("google")) {
          button = "google";
        } else if ($target.hasClass("addfilter")) {
          button = "addfilter";
        } else if ($target.hasClass("resetfilters")) {
          button = "resetfilters";
        }
        switch (button) {
          case "addfilter":
            optionslist = "";
            _ref = columns.querable;
            for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
              value = _ref[i];
              if (value.bool()) {
                optionslist += "<option value='" + columns.columnsdb[i] + "'>" + columns.columnsclient[i] + " (" + columns.columnsdb[i] + ")</option>";
              }
            }
            return $searchmodal.find(".modal-body").append("<div class='filter row'> <div class='col-md-4'> <select class='form-control'> " + optionslist + " </select> </div> <div class='col-md-3'> <select class='form-control'> <option value='equal'>(==) Равно</option> <option value='not equal'>(!=) Не равно</option> <option value='grater than or equal'>(>=) Больше или равно</option> <option value='less than or equal'>(<=) Меньше или равно</option> <option value='like'>(%) Любое значение</option> </select> </div> <div class='col-md-4'> <input type='text' class='form-control'> </div> <div class='col-md-1'> <button type='button' class='close removefilter'></button> </div> </div>");
          case "resetfilters":
            countfilters = 0;
            _ref1 = instance.profile.general.filterWhere;
            for (key in _ref1) {
              value = _ref1[key];
              if ((value.flag != null) && value.flag === "searchmodal") {
                countfilters++;
                delete instance.profile.general.filterWhere[key];
              }
            }
            if (countfilters > 0) {
              instance.reload("data");
              return $searchmodal.find(".filter").each(function(i, el) {
                var $filter;
                $filter = $(el);
                if (i !== 0) {
                  return $(el).remove();
                } else {
                  return $filter.find("input").val("");
                }
              });
            }
            break;
          case "google":
            counter = 0;
            filtercount = $searchmodal.find(".filter").length;
            return $searchmodal.find(".filter").each(function(i, el) {
              var $filter, field, filtertype;
              $filter = $(el);
              field = $filter.find("select").eq(0).val();
              filtertype = $filter.find("select").eq(1).val();
              value = $filter.find("input").val();
              instance.profile.general.filterWhere[field] = {
                type: filtertype,
                value: value,
                flag: "searchmodal"
              };
              counter++;
              if (filtercount === counter) {
                return instance.reload("data");
              }
            });
        }
      });
      instance.$container.on("click", ".reset_filters", function(e) {
        var $st, countWhere, filterType, key, keys, value, _ref, _ref1;
        if (instance.name === "table_order") {
          countWhere = Object.keys(instance.profile.general.filterWhere).length;
          if (countWhere === 0) {
            $st = instance.$container.find(".top-panel .statusToggler");
            $st.prop("checked", true);
            instance.profile.general.filterWhere["STATUS2"] = {
              type: "notIn",
              value: "('CANCELED', 'RETURNED', 'RETURNED_REALIZATION', 'DEFECTIVE')"
            };
            return instance.reload("data");
          } else if (countWhere === 1) {
            key = Object.keys(instance.profile.general.filterWhere)[0];
            if (key === "STATUS2") {

            } else {
              filterType = instance.profile.general.filterWhere[key].$filterContainer.data("filtertype");
              if (filterType === "select2") {
                instance.profile.general.filterWhere[key].$filterContainer.find("input.filter").select2("val", "");
                delete instance.profile.general.filterWhere[key];
              } else if (filterType === "daterange") {
                instance.profile.general.filterWhere[key].$filterContainer.find("input").each(function(i, el) {
                  return $(el).val("");
                });
                delete instance.profile.general.filterWhere[key];
              }
              $st = instance.$container.find(".top-panel .statusToggler");
              $st.prop("checked", true);
              instance.profile.general.filterWhere["STATUS2"] = {
                type: "notIn",
                value: "('CANCELED', 'RETURNED', 'RETURNED_REALIZATION', 'DEFECTIVE')"
              };
              return instance.reload("data");
            }
          } else if (countWhere > 1) {
            keys = Object.keys(instance.profile.general.filterWhere);
            if (keys.indexOf("STATUS2" === -1)) {
              $st = instance.$container.find(".top-panel .statusToggler");
              $st.prop("checked", true);
              instance.profile.general.filterWhere["STATUS2"] = {
                type: "notIn",
                value: "('CANCELED', 'RETURNED', 'RETURNED_REALIZATION', 'DEFECTIVE')"
              };
            }
            _ref = instance.profile.general.filterWhere;
            for (key in _ref) {
              value = _ref[key];
              if (key === "STATUS2") {
                continue;
              } else {
                filterType = value.$filterContainer.data("filtertype");
                if (filterType === "select2") {
                  value.$filterContainer.find("input.filter").select2("val", "");
                  delete instance.profile.general.filterWhere[key];
                } else if (filterType === "daterange") {
                  value.$filterContainer.find("input").each(function(i, el) {
                    return $(el).val("");
                  });
                  delete instance.profile.general.filterWhere[key];
                }
              }
            }
            return instance.reload("data");
          }
        } else {
          _ref1 = instance.profile.general.filterWhere;
          for (key in _ref1) {
            value = _ref1[key];
            filterType = value.$filterContainer.data("filtertype");
            if (filterType === "select2") {
              value.$filterContainer.find("input.filter").select2("val", "");
              delete instance.profile.general.filterWhere[key];
            } else if (filterType === "daterange") {
              value.$filterContainer.find("input").each(function(i, el) {
                return $(el).val("");
              });
              delete instance.profile.general.filterWhere[key];
            }
          }
          if (instance.constructorWhere !== "") {
            instance.constructorWhere = "";
          }
          return instance.reload("data");
        }
      });
      instance.$container.find(".filterContainer").each(function(i, el) {
        var column, filterType;
        filterType = $(el).data("filtertype");
        column = $(el).data("column");
        switch (filterType) {
          case "daterange":
            return $(el).find("input").each(function(ii, ell) {
              var side;
              side = $(ell).data("side");
              return $(ell).datepicker({
                format: "dd.mm.yyyy",
                weekStart: 1,
                firstDay: 1
              }).on("changeDate", function(e) {
                var val;
                val = $(ell).val();
                if (instance.profile.general.filterWhere[column] != null) {
                  if (side === "start") {
                    instance.profile.general.filterWhere[column].start = val;
                  } else {
                    instance.profile.general.filterWhere[column].end = val;
                  }
                } else {
                  instance.profile.general.filterWhere[column] = {
                    $filterContainer: $(el),
                    type: "daterange"
                  };
                  if (side === "start") {
                    instance.profile.general.filterWhere[column].start = val;
                  } else {
                    instance.profile.general.filterWhere[column].end = val;
                  }
                }
                instance.reload("data");
                return $(this).datepicker("hide");
              });
            });
          case "select2":
            return $(el).find("input").select2({
              placeholder: "Выберите",
              ajax: {
                url: "/cgi-bin/b2e",
                dataType: "json",
                data: function(term, page) {
                  var columns, index, object, options;
                  index = instance.profile.columns.columnsdb.indexOf(column);
                  object = instance.profile.columns.filterObject[index];
                  columns = instance.profile.columns.filterQueryColumns[index];
                  options = {
                    command: "get",
                    object: "select2_for_query",
                    column_name: column,
                    view_name: instance.data.info.VIEW_NAME,
                    sid: MB.User.sid
                  };
                  if (term) {
                    options.where = "upper(" + column + ") like upper('%" + term + "%')";
                  }
                  return {
                    request: MB.Core.makeQuery(options)
                  };
                },
                results: function(data, page) {
                  data = MB.Core.parseFormat(data);
                  return {
                    results: MB.Table.parseforselect2data(data)
                  };
                }
              }
            }).on("change", function(e) {
              var val;
              val = e.val;
              instance.profile.general.filterWhere[column] = {
                $filterContainer: $(el),
                type: "equal",
                value: val
              };
              return instance.reload("data");
            });
        }
      });
      instance.$container.find(".xls-converter").on("click", function(e) {
        var vis;
        vis = instance.profile.columns.visibility;
        return instance.getdata(function(data) {
          var html, k1, k2, k3, th, trD, trs;
          th = "<tr>";
          for (k1 in data.NAMES) {
            if (vis[k1] === "FALSE") {
              continue;
            }
            th += "<td>" + data.NAMES[k1] + "</td>";
          }
          th += "</tr>";
          trs = "";
          for (k2 in data.DATA) {
            trD = data.DATA[k2];
            trs += "<tr>";
            for (k3 in trD) {
              if (vis[k3] === "FALSE") {
                continue;
              }
              trs += "<td>" + trD[k3] + "</td>";
            }
            trs += "</tr>";
          }
          html = "<table><tbody>" + th + trs + "</tbody></table>";
          return window.open("data:application/vnd.ms-excel," + "﻿" + encodeURIComponent(html), "_self");
        }, true);
      });
      instance.$container.find('.send_exel_to_email').on("click", function(e) {
        var filterWhere, general, k, key, value, _ref;
        console.log(instance, instance.profile.general.filterWhere);
        filterWhere = [];
        if (instance.profile.general.filterWhere) {
          general = {};
          general.filterWhere = instance.profile.general.filterWhere;
          _ref = general.filterWhere;
          for (key in _ref) {
            value = _ref[key];
            switch (value.type) {
              case "equal":
                filterWhere.push("" + key + " = '" + value.value + "'");
                break;
              case "notIn":
                k = key.substr(0, key.length - 1);
                filterWhere.push("" + k + " not in" + value.value);
                break;
              case "daterange":
                if (value.start != null) {
                  filterWhere.push("" + key + " >= to_date('" + value.start + "', 'DD.MM.YYYY')");
                }
                if (value.end != null) {
                  filterWhere.push("" + key + " <= to_date('" + value.end + "', 'DD.MM.YYYY')");
                }
                break;
              case "not equal":
                filterWhere.push("" + key + " != " + value.value);
                break;
              case "grater than or equal":
                filterWhere.push("" + key + " >= '" + value.value + "'");
                break;
              case "less than or equal":
                filterWhere.push("" + key + " <= '" + value.value + "'");
                break;
              case "like":
                filterWhere.push("" + key + " like '%" + value.value + "%'");
            }
          }
        }
        return MB.Core.sendQuery({
          command: 'operation',
          object: 'send_excel_to_email',
          sid: MB.User.sid,
          params: {
            where: filterWhere.join(' and '),
            CLIENT_OBJECT: instance.name,
            VIEW_NAME: instance.data.info.VIEW_NAME,
            getObject: instance.profile.general.getobject
          }
        }, function(res) {
          return toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE);
        });
      });
      instance.$container.on("click", ".portlet-title", function(e) {
        var $handsontable, $target, column, data, dataProp, handsontableInstance, i, lsT, lsTable, lsTableObj, needAlert, notFound, parseVisibility, state, tempLsTables, value, _i, _j, _len, _len1;
        $target = $(e.target);
        if ($target.hasClass("reload")) {
          $handsontable = instance.$container.find(".handsontable");
          handsontableInstance = $handsontable.handsontable("getInstance");
          dataProp = handsontableInstance.getDataAtProp("rowStatus");
          data = handsontableInstance.getData();
          needAlert = false;
          for (i = _i = 0, _len = data.length; _i < _len; i = ++_i) {
            value = data[i];
            if (value.rowStatus === "addingRow" || value.rowStatus === "duplicatedRow" || value.rowStatus === "editedRow") {
              needAlert = true;
            }
          }
          if (needAlert) {
            return bootbox.dialog({
              message: "Есть несохраненные изменения. Вы уверены что хотите продолжить?",
              title: "Подтверждение обновления таблицы",
              buttons: {
                success: {
                  label: "Да",
                  className: "green",
                  callback: function() {
                    return instance.reload("data");
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
            return instance.reload("data");
          }
        } else if (($target.prop("tagName")) === "LABEL" || ($target.prop("tagName")) === "INPUT") {
          $handsontable = instance.$container.find(".handsontable");
          handsontableInstance = $handsontable.handsontable("getInstance");
          $target = $(e.target);
          !(state = $target.find("input").prop("checked"));
          column = $target.find("input").data("column");
          console.log("columns_toggler", state);
          parseVisibility = function() {
            var visibilityObject, _j, _len1, _ref;
            visibilityObject = {};
            _ref = instance.profile.columns.columnsdb;
            for (i = _j = 0, _len1 = _ref.length; _j < _len1; i = ++_j) {
              value = _ref[i];
              if (value === column) {
                visibilityObject[column] = !state;
              } else {
                visibilityObject[value] = instance.$container.find('div.columns_toggler input[type="checkbox"][data-column="' + value + '"]').attr('checked') === "checked";
              }
            }
            return visibilityObject;
          };
          lsTableObj = {
            name: instance.name,
            visibility: parseVisibility()
          };
          tempLsTables = JSON.parse(localStorage.getItem("tables"));
          notFound = true;
          if (tempLsTables) {
            for (lsT = _j = 0, _len1 = tempLsTables.length; _j < _len1; lsT = ++_j) {
              lsTable = tempLsTables[lsT];
              if (lsTable.name === instance.name) {
                lsTable.visibility = {};
                lsTable.visibility = lsTableObj.visibility;
                notFound = false;
              }
            }
          }
          if (notFound) {
            if (tempLsTables == null) {
              tempLsTables = [];
            }
            tempLsTables.push(lsTableObj);
          }
          localStorage.tables = JSON.stringify(tempLsTables);
          handsontableInstance.render();
          return instance.reload('data');
        }

        /*else console.log $target.prop "tagName" */

        /*else if $target.prop "tagName" is "INPUT"
        				alert 88888888
         */
      });
      instance.$container.find(".table-scrollable").on({
        click: function(e) {
          var $targettr, targetstatus;
          $targettr = $(e.target).closest("tr");
          targetstatus = $targettr.attr("class");
          if (targetstatus === "justrow") {
            return $targettr.removeClass("justrow").addClass("selectedrow");
          } else {
            if (targetstatus === "selectedrow") {
              return $targettr.removeClass("selectedrow").addClass("justrow");
            }
          }
        }
      });
      instance.$container.find(".handsontable").on("click", function(e) {
        var $target, data, row;
        $target = $(e.target);
        if ($target.hasClass("row-checker")) {
          row = $target.data("row");
          data = instance.$container.find(".handsontable").handsontable("getInstance").getData();
          if (data[row].rowStatus === "justRow") {
            return instance.$container.find(".handsontable").handsontable("getInstance").setDataAtRowProp(+row, "rowStatus", "selectedRow");
          } else {
            if (data[row].rowStatus === "selectedRow") {
              return instance.$container.find(".handsontable").handsontable("getInstance").setDataAtRowProp(+row, "rowStatus", "justRow");
            }
          }
        }
      });
      instance.$container.on("click", ".portlet-title a", function(e) {
        var $handsontable, $target, addingNodesCount, addingObject, callbacksCounter, data, editingNodesCount, editor, handsontableInstance, i, key, nodesCount, numberOfPages, pageNumber, returnsColumn, returnsColumnIndex, row, rowStatus, selectedRowsInterval, val, value, _i, _len, _ref, _ref1, _ref2, _results, _results1;
        $target = $(this);
        if ($target.hasClass("switchNextPage")) {
          val = $target.parent().find("input").val();
          pageNumber = parseInt(instance.profile.general.pageno);
          numberOfPages = Math.ceil(instance.data.info.ROWS_COUNT / instance.profile.general.rowsmaxnum);
          if (parseInt(val) === numberOfPages) {
            return;
          }
          val++;
          $target.parent().find("input").val(val);
          instance.profile.general.pageno = val;
          return instance.reload("data");
        } else if ($target.hasClass("switchPreviousPage")) {
          val = $target.parent().find("input").val();
          if (parseInt(val) === 1) {
            return;
          }
          val--;
          $target.parent().find("input").val(val);
          instance.profile.general.pageno = val;
          return instance.reload("data");
        } else if ($target.hasClass("create_button")) {
          return instance.updatemodel("addrow", {}, function() {
            return instance.updateview("addrow", function() {});
          });
        } else if ($target.hasClass("create_in_form_button")) {
          return MB.Core.switchModal({
            type: "form",
            ids: ["new"],
            name: instance.profile.general.juniorobject,
            params: {
              mode: "add",
              parentobject: instance.name
            }
          });
        } else if ($target.hasClass("lets_query")) {

        } else if ($target.hasClass("save_button")) {
          if ((instance.addingStorage != null) && (instance.editingStorage != null)) {
            addingNodesCount = Object.keys(instance.addingStorage).length;
            editingNodesCount = Object.keys(instance.editingStorage).length;
            nodesCount = addingNodesCount + editingNodesCount;
            callbacksCounter = 0;
            (function() {
              var key, row, _ref, _results;
              _ref = instance.addingStorage;
              _results = [];
              for (key in _ref) {
                if (!__hasProp.call(_ref, key)) continue;
                row = _ref[key];
                _results.push(MB.Core.sendQuery(row, function(res) {
                  callbacksCounter++;
                  toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE);
                  if (callbacksCounter === nodesCount) {
                    delete instance.addingStorage;
                    delete instance.editingStorage;
                    return instance.reload("data");
                  }
                }));
              }
              return _results;
            })();
            return (function() {
              var key, row, _ref, _results;
              _ref = instance.editingStorage;
              _results = [];
              for (key in _ref) {
                if (!__hasProp.call(_ref, key)) continue;
                row = _ref[key];
                _results.push(MB.Core.sendQuery(row, function(res) {
                  callbacksCounter++;
                  toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE);
                  if (callbacksCounter === nodesCount) {
                    delete instance.addingStorage;
                    delete instance.editingStorage;
                    return instance.reload("data");
                  }
                }));
              }
              return _results;
            })();
          } else if (instance.addingStorage != null) {
            addingNodesCount = Object.keys(instance.addingStorage).length;
            callbacksCounter = 0;
            _ref = instance.addingStorage;
            _results = [];
            for (key in _ref) {
              if (!__hasProp.call(_ref, key)) continue;
              row = _ref[key];
              _results.push(MB.Core.sendQuery(row, function(res) {
                callbacksCounter++;
                toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE);
                if (callbacksCounter === addingNodesCount) {
                  delete instance.addingStorage;
                  return instance.reload("data");
                }
              }));
            }
            return _results;
          } else if (instance.editingStorage != null) {
            editingNodesCount = Object.keys(instance.editingStorage).length;
            callbacksCounter = 0;
            _ref1 = instance.editingStorage;
            _results1 = [];
            for (key in _ref1) {
              if (!__hasProp.call(_ref1, key)) continue;
              row = _ref1[key];
              _results1.push(MB.Core.sendQuery(row, function(res) {
                callbacksCounter++;
                toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE);
                if (callbacksCounter === editingNodesCount) {
                  delete instance.editingStorage;
                  return instance.reload("data");
                }
              }));
            }
            return _results1;
          }
        } else if ($target.hasClass("delete_button")) {
          return bootbox.dialog({
            message: "Вы уверены что хотите удалить эти данные?",
            title: "Подтверждение удаления",
            buttons: {
              success: {
                label: "Да",
                className: "green",
                callback: function() {
                  var $handsontable, addingCache, deletingNodesCount, handsontableInstance, objversion, primaryKeyId, rowEnd, rowStatus, selectedRowsInterval, _ref2, _results2;
                  instance.deletingStorage = {};
                  $handsontable = instance.$container.find(".handsontable");
                  handsontableInstance = $handsontable.handsontable("getInstance");
                  selectedRowsInterval = MB.Table.getSelectedRowsInterval(handsontableInstance);
                  row = selectedRowsInterval[0];
                  rowEnd = selectedRowsInterval[1];
                  addingCache = [];
                  while (row <= rowEnd) {
                    rowStatus = handsontableInstance.getDataAtRowProp(row, "rowStatus");
                    if (rowStatus === "justRow" || rowStatus === "editedRow") {
                      primaryKeyId = instance.data.data[row][instance.data.names.indexOf(instance.profile.general.primarykey)];
                      objversion = instance.data.data[row][instance.data.names.indexOf("OBJVERSION")];
                      instance.deletingStorage[primaryKeyId] = {
                        command: "remove",
                        object: instance.profile.general.object,
                        sid: MB.User.sid
                      };
                      instance.deletingStorage[primaryKeyId]["OBJVERSION"] = objversion;
                      instance.deletingStorage[primaryKeyId][instance.profile.general.primarykey] = primaryKeyId;
                      row++;
                    } else if (rowStatus === "addingRow") {
                      addingCache.push(row);
                      row++;
                    }
                  }
                  if (addingCache.length > 0) {
                    if (addingCache.length === 1) {
                      handsontableInstance.alter("remove_row", addingCache[0], addingCache[0]);
                    } else if (addingCache.length > 1) {
                      handsontableInstance.alter("remove_row", addingCache[0], addingCache.length);
                    }
                  }
                  deletingNodesCount = Object.keys(instance.deletingStorage).length;
                  callbacksCounter = 0;
                  if (deletingNodesCount > 0) {
                    _ref2 = instance.deletingStorage;
                    _results2 = [];
                    for (key in _ref2) {
                      if (!__hasProp.call(_ref2, key)) continue;
                      row = _ref2[key];
                      _results2.push(MB.Core.sendQuery(row, function(res) {
                        callbacksCounter++;
                        toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE);
                        if (callbacksCounter === deletingNodesCount) {
                          delete instance.deletingStorage;
                          return instance.reload("data");
                        }
                      }));
                    }
                    return _results2;
                  }
                }
              },
              danger: {
                label: "Нет",
                className: "red",
                callback: function() {}
              }
            }
          });
        } else if ($target.hasClass("duplicate_button")) {
          $handsontable = instance.$container.find(".handsontable");
          handsontableInstance = $handsontable.handsontable("getInstance");
          selectedRowsInterval = MB.Table.getSelectedRowsInterval(handsontableInstance);
          if (selectedRowsInterval[0] === selectedRowsInterval[1]) {
            data = handsontableInstance.getData();
            row = selectedRowsInterval[0];
            rowStatus = handsontableInstance.getDataAtRowProp(row, "rowStatus");
            if (rowStatus === "justRow") {
              addingObject = {};
              data = instance.data.data[row];
              _ref2 = instance.profile.columns.columnsdb;
              for (i = _i = 0, _len = _ref2.length; _i < _len; i = ++_i) {
                value = _ref2[i];
                if (instance.profile.columns.insertability[i].bool()) {
                  if (instance.data.data[row][i] !== "") {
                    editor = instance.profile.columns.editor[i];
                    switch (editor) {
                      case "select2":
                        returnsColumn = instance.profile.columns.returnscolumn[i];
                        if (returnsColumn !== "") {
                          addingObject[value] = instance.data.data[row][i];
                          returnsColumnIndex = instance.profile.columns.columnsdb.indexOf(returnsColumn);
                          addingObject[returnsColumn] = instance.data.data[row][returnsColumnIndex];
                        } else {
                          addingObject[value] = instance.data.data[row][i];
                        }
                        break;
                      case "select2withEmptyValue":
                        returnsColumn = instance.profile.columns.returnscolumn[i];
                        if (returnsColumn !== "") {
                          addingObject[value] = instance.data.data[row][i];
                          returnsColumnIndex = instance.profile.columns.columnsdb.indexOf(returnsColumn);
                          addingObject[returnsColumn] = instance.data.data[row][returnsColumnIndex];
                        } else {
                          addingObject[value] = instance.data.data[row][i];
                        }
                        break;
                      default:
                        addingObject[value] = instance.data.data[row][i];
                    }
                  }
                }
              }
              return instance.updatemodel("addrow", {}, function() {
                return instance.updateview("addrow", function() {
                  var _results2;
                  _results2 = [];
                  for (key in addingObject) {
                    value = addingObject[key];
                    _results2.push(handsontableInstance.setDataAtRowProp(0, key, value, "duplicateInsertion"));
                  }
                  return _results2;
                });
              });
            }
          }
        }
      });
      instance.$container.on("click", ".bottom-panel .pagination li", function(e) {
        var $targetli, v;
        $targetli = $(e.target).parent();
        if ($targetli.hasClass("disabled" || $targetli.hasClass("active"))) {

        } else if ($targetli.hasClass("prev")) {
          instance.profile.general.pageno -= 1;
          return instance.reload("data pagination");
        } else if ($targetli.parent().hasClass("next")) {
          instance.profile.general.pageno += 1;
          return instance.reload("data pagination");
        } else {
          v = $targetli.find("a").text();
          instance.profile.general.pageno = v;
          return instance.reload("data pagination");
        }
      });
      if (instance.profile.general.custom.bool()) {
        $.getScript("html/tables/require/" + instance.name + ".js", function(data, status, xhr) {
          return instance.custom(function() {
            return callback();
          });
        });
      } else {
        return callback();
      }
    }
  };

}).call(this);
