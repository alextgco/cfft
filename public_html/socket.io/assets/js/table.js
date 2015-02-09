(function() {
  var MB,
    __hasProp = {}.hasOwnProperty;

  MB = window.MB || {};

  MB.Table = function(options) {
    var instance, key, value, _ref;
    instance = this;
    instance.name = options.name || MB.Core.guid();
    instance.world = options.world || "page";
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
    i = selectedRowsInterval[0];
    ids = [];
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
      object: "user_object_profile",
      client_object: instance.name,
      sid: MB.User.sid
    };
    return MB.Core.sendQuery(o, function(res) {
      return callback(res);
    });
  };

  MB.Table.prototype.getdata = function(callback) {
    var arr, arrWhere, defaultWhere, filterWhere, instance, k, key, o, parentWhere, value, where, _ref;
    instance = this;
    arrWhere = [];
    where = "";
    defaultWhere = instance.profile.general.where;
    filterWhere = "";
    parentWhere = "";
    if (instance.parentkeyvalue) {
      parentWhere += instance.profile.general.parentkey + " = '" + instance.parentkeyvalue + "'";
    }
    if (Object.keys(instance.profile.general.filterWhere).length > 0) {
      arr = [];
      _ref = instance.profile.general.filterWhere;
      for (key in _ref) {
        value = _ref[key];
        if (value.type === "equal") {
          arr.push("" + key + " = '" + value.value + "'");
        } else if (value.type === "daterange") {
          arr.push("" + key + " >= to_date('" + value.start + "', 'DD.MM.YYYY')");
          arr.push("" + key + " <= to_date('" + value.end + "', 'DD.MM.YYYY')");
        } else if (value.type === "notIn") {
          k = key.substr(0, key.length - 1);
          arr.push("" + k + " not in " + value.value);
        }
      }
      filterWhere = arr.join(" and ");
    }
    if (defaultWhere) {
      arrWhere.push(defaultWhere);
    }
    if (filterWhere) {
      arrWhere.push(filterWhere);
    }
    if (parentWhere) {
      arrWhere.push(parentWhere);
    }
    if (arrWhere.length > 0) {
      if (arrWhere.length === 1) {
        where = arrWhere[0];
      } else {
        where = arrWhere.join(" and ");
      }
    }
    o = {
      command: "get",
      object: instance.profile.general.getobject,
      where: where,
      order_by: instance.profile.general.orderby,
      client_object: instance.name,
      rows_max_num: instance.profile.general.rowsmaxnum,
      page_no: instance.profile.general.pageno,
      sid: MB.User.sid
    };
    return MB.Core.sendQuery(o, function(res) {
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
    instance.profile.columns.align = parsedprofile.ALIGN;
    instance.profile.columns.columnsclient = parsedprofile.NAME;
    instance.profile.columns.columnsdb = parsedprofile.COLUMN_NAME;
    instance.profile.columns.editability = parsedprofile.EDITABLE;
    instance.profile.columns.keys = parsedprofile.PRIMARY_KEY;
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
    instance.profile.columns.filterTypeRu = parsedprofile.FILTER_TYPE_RU;
    instance.profile.columns.filterObject = parsedprofile.FILTER_COMMAND;
    instance.profile.columns.filterQueryColumns = parsedprofile.FILTER_COLUMNS;
    instance.profile.general.where = parsedprofile.DEFAULT_WHERE;
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
    return $(".modals-list").append("<li data-type='table' data-object='" + instance.name + "'><i class='cross fa fa-times-circle'></i>" + instance.profile.general.tablename + "</li>");
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
    }
  };

  MB.Table.prototype.makenewrow = function(callback) {
    var instance;
    instance = this;
    instance.$container.find(".handsontable").handsontable("getInstance").alter("insert_row", 0, 1, "addd");
    return callback();
  };

  MB.Table.prototype.initTable = function(callback) {
    var $handsontable, config, instance;
    instance = this;
    config = {
      autoWrapCol: true,
      autoWrapRow: true,
      rowHeaders: true,
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
      columns: (function() {
        var columns;
        columns = [];
        instance.profile.columns.columnsdb.forEach(function(value, i, array) {
          var column, editor;
          if (instance.profile.columns.visibility[i].bool()) {
            if (instance.profile.general.modifycommand.bool()) {
              if (!instance.profile.columns.editability[i].bool()) {
                column = {
                  data: instance.profile.columns.columnsdb[i],
                  readOnly: true
                };
              } else {
                editor = instance.profile.columns.editor[i];
                if (editor === "text" || editor === "number") {
                  column = {
                    type: "text",
                    data: instance.profile.columns.columnsdb[i]
                  };
                } else if (editor === "select2") {
                  (function(i) {
                    var j;
                    j = i;
                    return column = {
                      type: "autocomplete",
                      data: instance.profile.columns.columnsdb[j],
                      source: function(query, process) {
                        var o;
                        o = {
                          command: "get",
                          object: instance.profile.columns.references[j],
                          sid: MB.User.sid,
                          columns: instance.profile.columns.refcolumns[j]
                        };
                        return $.ajax({
                          url: "/cgi-bin/b2cJ/",
                          dataType: "json",
                          data: {
                            p_xml: MB.Core.makeQuery(o)
                          },
                          success: function(response) {
                            var list, _i, _len, _ref;
                            instance.data.dropdownsData[instance.profile.columns.columnsdb[j]] = response;
                            list = [];
                            _ref = response.DATA;
                            for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
                              value = _ref[i];
                              list.push(value[1]);
                            }
                            process(list);
                          }
                        });
                      },
                      strict: true
                    };
                  })(i);
                } else if (editor === "select2withEmptyValue") {
                  (function(i) {
                    var j;
                    j = i;
                    return column = {
                      type: "autocomplete",
                      data: instance.profile.columns.columnsdb[j],
                      source: function(query, process) {
                        var o;
                        o = {
                          command: "get",
                          object: instance.profile.columns.references[j],
                          sid: MB.User.sid,
                          columns: instance.profile.columns.refcolumns[j]
                        };
                        return $.ajax({
                          url: "/cgi-bin/b2cJ/",
                          dataType: "json",
                          data: {
                            p_xml: MB.Core.makeQuery(o)
                          },
                          success: function(response) {
                            var list, _i, _len, _ref;
                            instance.data.dropdownsData[instance.profile.columns.columnsdb[j]] = response;
                            if (!(instance.data.dropdownsData[instance.profile.columns.columnsdb[j]].DATA[0][0] === "" && instance.data.dropdownsData[instance.profile.columns.columnsdb[j]].DATA[0][0] === "")) {
                              instance.data.dropdownsData[instance.profile.columns.columnsdb[j]].DATA.unshift(["", ""]);
                            }
                            list = [];
                            _ref = response.DATA;
                            for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
                              value = _ref[i];
                              list.push(value[1]);
                            }
                            process(list);
                          }
                        });
                      },
                      strict: true
                    };
                  })(i);
                } else if (editor === "checkbox") {
                  column = {
                    data: instance.profile.columns.columnsdb[i],
                    type: "checkbox",
                    checkedTemplate: "TRUE",
                    uncheckedTemplate: "FALSE"
                  };
                } else if (editor === "datetime") {
                  column = {
                    data: instance.profile.columns.columnsdb[i],
                    type: "date",
                    dateFormat: "mm/dd/yy"
                  };
                } else if (editor === "password") {
                  column = {
                    data: instance.profile.columns.columnsdb[i],
                    type: "password",
                    hashSymbol: "&#9632;"
                  };
                }
              }
            } else {
              column = {
                data: instance.profile.columns.columnsdb[i],
                readOnly: true
              };
            }
            return columns.push(column);
          }
        });
        return columns;
      })(),
      data: (function() {
        var data;
        data = [];
        instance.data.data.forEach(function(value, i, array) {
          var rowObject;
          rowObject = {};
          instance.profile.columns.columnsdb.forEach(function(value2, i2, array2) {
            if (instance.profile.columns.visibility[i2].bool()) {
              rowObject[value2] = array[i][array2.indexOf(value2)];
              return rowObject.rowStatus = "justRow";
            }
          });
          return data.push(rowObject);
        });
        return data;
      })(),
      colHeaders: (function() {
        var colHeaders, i, value, _i, _len, _ref;
        colHeaders = [];
        _ref = instance.profile.columns.columnsclient;
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          value = _ref[i];
          if (instance.profile.columns.visibility[i].bool()) {
            colHeaders.push(value);
          }
        }
        return colHeaders;
      })(),
      dataSchema: function() {
        var i, o, value, _i, _len, _ref;
        o = {};
        _ref = instance.profile.general.prepareInsert.NAMES;
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          value = _ref[i];
          o[value] = instance.profile.general.prepareInsert.DATA[i];
        }
        return o;
      },
      afterChange: function(changes, source) {
        var $handsontable, colHeaders, dropdownIndex, editor, guid, handsontableInstance, i, index, isReturnColumnVisible, newVal, objversion, oldVal, primaryKeyId, prop, row, rowStatus, val, value, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _len6, _len7, _len8, _m, _n, _o, _p, _q, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
        console.log(arguments);
        switch (source) {
          case "loadData":
            return console.log("loadData");
          case "edit":
            row = changes[0][0];
            prop = changes[0][1];
            oldVal = changes[0][2];
            newVal = changes[0][3];
            console.log("prop: " + prop);
            if (prop === "rowStatus") {
              return console.log("rowStatus");
            } else if (prop === "guid") {
              return console.log("guid");
            } else if (prop !== "guid" && prop !== "rowStatus") {
              console.log("not guid and not rowStatus");
              $handsontable = instance.$container.find(".handsontable");
              handsontableInstance = $handsontable.handsontable("getInstance");
              rowStatus = handsontableInstance.getDataAtRowProp(row, "rowStatus");
              console.log(rowStatus);
              if (rowStatus === "addingRow") {
                index = instance.profile.columns.columnsdb.indexOf(prop);
                editor = instance.profile.columns.editor[index];
                if (editor === "select2" || editor === "select2withEmptyValue") {
                  colHeaders = handsontableInstance.getColHeader();
                  isReturnColumnVisible = false;
                  for (i = _i = 0, _len = colHeaders.length; _i < _len; i = ++_i) {
                    value = colHeaders[i];
                    if ((handsontableInstance.colToProp(i)) === instance.profile.columns.returnscolumn[index]) {
                      isReturnColumnVisible = true;
                    }
                  }
                  if (isReturnColumnVisible) {
                    dropdownIndex = null;
                    _ref = instance.data.dropdownsData[prop].DATA;
                    for (i = _j = 0, _len1 = _ref.length; _j < _len1; i = ++_j) {
                      value = _ref[i];
                      val = $.trim(value[1]);
                      if (val === newVal) {
                        dropdownIndex = i;
                      }
                    }
                    return handsontableInstance.setDataAtRowProp(row, instance.profile.columns.returnscolumn[index], instance.data.dropdownsData[prop].DATA[dropdownIndex][0]);
                  } else {
                    guid = handsontableInstance.getDataAtRowProp(row, "guid");
                    dropdownIndex = null;
                    _ref1 = instance.data.dropdownsData[prop].DATA;
                    for (i = _k = 0, _len2 = _ref1.length; _k < _len2; i = ++_k) {
                      value = _ref1[i];
                      val = $.trim(value[1]);
                      if (val === newVal) {
                        dropdownIndex = i;
                      }
                    }
                    return instance.addingStorage[guid][instance.data.dropdownsData[prop].NAMES[0]] = instance.data.dropdownsData[prop].DATA[dropdownIndex][0];
                  }
                } else {
                  guid = handsontableInstance.getDataAtRowProp(row, "guid");
                  return instance.addingStorage[guid][prop] = newVal;
                }
              } else if (rowStatus === "justRow") {
                instance.editingStorage = instance.editingStorage || {};
                primaryKeyId = instance.data.data[row][instance.data.names.indexOf(instance.profile.general.primarykey)];
                objversion = instance.data.data[row][instance.data.names.indexOf("OBJVERSION")];
                instance.editingStorage[primaryKeyId] = {
                  command: "modify",
                  object: instance.profile.general.object,
                  sid: MB.User.sid
                };
                instance.editingStorage[primaryKeyId][instance.profile.general.primarykey] = primaryKeyId;
                instance.editingStorage[primaryKeyId]["OBJVERSION"] = objversion;
                index = instance.profile.columns.columnsdb.indexOf(prop);
                editor = instance.profile.columns.editor[index];
                if (editor === "select2" || editor === "select2withEmptyValue") {
                  colHeaders = handsontableInstance.getColHeader();
                  isReturnColumnVisible = false;
                  for (i = _l = 0, _len3 = colHeaders.length; _l < _len3; i = ++_l) {
                    value = colHeaders[i];
                    if ((handsontableInstance.colToProp(i)) === instance.profile.columns.returnscolumn[index]) {
                      isReturnColumnVisible = true;
                    }
                  }
                  if (isReturnColumnVisible) {
                    dropdownIndex = null;
                    _ref2 = instance.data.dropdownsData[prop].DATA;
                    for (i = _m = 0, _len4 = _ref2.length; _m < _len4; i = ++_m) {
                      value = _ref2[i];
                      val = $.trim(value[1]);
                      if (val === newVal) {
                        dropdownIndex = i;
                      }
                    }
                    return handsontableInstance.setDataAtRowProp(row, instance.profile.columns.returnscolumn[index], instance.data.dropdownsData[prop].DATA[dropdownIndex][0]);
                  } else {
                    dropdownIndex = null;
                    _ref3 = instance.data.dropdownsData[prop].DATA;
                    for (i = _n = 0, _len5 = _ref3.length; _n < _len5; i = ++_n) {
                      value = _ref3[i];
                      val = $.trim(value[1]);
                      if (val === newVal) {
                        dropdownIndex = i;
                      }
                    }
                    console.log(instance.profile.columns.returnscolumn[index]);
                    instance.editingStorage[primaryKeyId][instance.profile.columns.returnscolumn[index]] = instance.data.dropdownsData[prop].DATA[dropdownIndex][0];
                    return delete instance.editingStorage[primaryKeyId][prop];
                  }
                } else {
                  return instance.editingStorage[primaryKeyId][prop] = newVal;
                }
              } else if (rowStatus === "editedRow") {
                index = instance.profile.columns.columnsdb.indexOf(prop);
                editor = instance.profile.columns.editor[index];
                if (editor === "select2" || editor === "select2withEmptyValue") {
                  colHeaders = handsontableInstance.getColHeader();
                  isReturnColumnVisible = false;
                  for (i = _o = 0, _len6 = colHeaders.length; _o < _len6; i = ++_o) {
                    value = colHeaders[i];
                    if ((handsontableInstance.colToProp(i)) === instance.profile.columns.returnscolumn[index]) {
                      isReturnColumnVisible = true;
                    }
                  }
                  if (isReturnColumnVisible) {
                    dropdownIndex = null;
                    _ref4 = instance.data.dropdownsData[prop].DATA;
                    for (i = _p = 0, _len7 = _ref4.length; _p < _len7; i = ++_p) {
                      value = _ref4[i];
                      val = $.trim(value[1]);
                      if (val === newVal) {
                        dropdownIndex = i;
                      }
                    }
                    return handsontableInstance.setDataAtRowProp(row, instance.profile.columns.returnscolumn[index], instance.data.dropdownsData[prop].DATA[dropdownIndex][0]);
                  } else {
                    dropdownIndex = null;
                    _ref5 = instance.data.dropdownsData[prop].DATA;
                    for (i = _q = 0, _len8 = _ref5.length; _q < _len8; i = ++_q) {
                      value = _ref5[i];
                      val = $.trim(value[1]);
                      if (val === newVal) {
                        dropdownIndex = i;
                      }
                    }
                    instance.editingStorage[primaryKeyId][instance.data.dropdownsData[prop].NAMES[0]] = instance.data.dropdownsData[prop].DATA[dropdownIndex][0];
                    return delete instance.editingStorage[primaryKeyId][prop];
                  }
                }
              }
            }
        }
      },
      afterCreateRow: function(index, ammount) {
        var $handsontable, guid, handsontableInstance, i, parent, value, _i, _len, _ref;
        $handsontable = instance.$container.find(".handsontable");
        handsontableInstance = $handsontable.handsontable("getInstance");
        guid = MB.Core.guid();
        handsontableInstance.setDataAtRowProp(index, "rowStatus", "addingRow");
        handsontableInstance.setDataAtRowProp(index, "guid", guid);
        instance.addingStorage = instance.addingStorage || {};
        instance.addingStorage[guid] = {
          command: "new",
          object: instance.profile.general.object,
          sid: MB.User.sid
        };
        _ref = instance.profile.general.prepareInsert.NAMES;
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          value = _ref[i];
          instance.addingStorage[guid][value] = instance.profile.general.prepareInsert.DATA[i];
        }
        if (instance.parentobject != null) {
          parent = MB.O.forms[instance.parentobject];
          return instance.addingStorage[guid][parent.profile.general.primarykey] = parent.activeId;
        }
      },
      contextMenu: {
        callback: function(key, options) {
          if (key === "openInModal") {
            return MB.Table.createOpenInModalContextMenuItem(instance, key, options);
          }
        },
        items: {
          openInModal: {
            name: "Открыть в форме ...",
            disabled: function() {
              var $handsontable, disableStatus, handsontableInstance, i, row, selectedRowsInterval;
              disableStatus = false;
              if (instance.profile.general.juniorobject === "") {
                disableStatus = true;
              } else {
                $handsontable = instance.$container.find(".handsontable");
                handsontableInstance = $handsontable.handsontable("getInstance");
                selectedRowsInterval = MB.Table.getSelectedRowsInterval(handsontableInstance);
                i = selectedRowsInterval[0];
                while (i <= selectedRowsInterval[1]) {
                  row = instance.data.data[i];
                  if (row === "newrow") {
                    disableStatus = true;
                  }
                  i++;
                }
              }
              return disableStatus;
            }
          }
        }
      }
    };
    $handsontable = instance.$container.find(".handsontable");
    $handsontable.handsontable(config);
    return callback();
  };

  MB.Table.prototype.updateTable = function(callback) {
    var $handsontable, config, handsontableInstance, instance;
    instance = this;
    config = {
      data: (function() {
        var column, data, i, ii, rowObject, value, _i, _j, _len, _len1, _ref, _ref1;
        data = [];
        _ref = instance.data.data;
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          value = _ref[i];
          rowObject = {};
          _ref1 = instance.profile.columns.columnsdb;
          for (ii = _j = 0, _len1 = _ref1.length; _j < _len1; ii = ++_j) {
            column = _ref1[ii];
            rowObject[column] = instance.data.data[i][instance.profile.columns.columnsdb.indexOf(column)];
            rowObject.rowStatus = "justRow";
          }
          data.push(rowObject);
        }
        return data;
      })()
    };
    $handsontable = instance.$container.find(".handsontable");
    handsontableInstance = $handsontable.handsontable("getInstance");
    handsontableInstance.updateSettings(config);
    return callback();
  };

  MB.Table.prototype.updateview = function(part, callback) {
    var instance;
    instance = this;
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
    var html, instance;
    instance = this;
    html = "";
    html += "<div class='row'><div class='col-md-12'><div class='portlet box blue'>";
    html += htmls.header;
    html += "<div class='portlet-body'>";
    html += htmls.toppanel;
    html += "<div class='row'>";
    html += htmls.table;
    html += "</div>";
    html += "</div></div></div></div>";
    return callback(html);
  };

  MB.Table.prototype.makeheader = function(callback) {
    var html, i, instance, l, numberOfPages, pageNumber;
    instance = this;
    html = "";
    pageNumber = parseInt(instance.profile.general.pageno);
    numberOfPages = Math.ceil(instance.data.info.ROWS_COUNT / instance.profile.general.rowsmaxnum);
    html += "<div class='portlet-title'> <div class='caption'> <i class='fa fa-globe'></i>" + instance.profile.general.tablename + "</div> <div class='tools'> <a href='#portlet-config' data-toggle='modal' class='config'></a> <a href='javascript:;' class='reload'></a> </div> <div class='actions'>";
    if (numberOfPages > 1) {
      html += "<div class='pagination'> Страница № <a href='#' class='btn default switchPreviousPage'> <i class='fa fa-arrow-left'></i> </a> <input type='text' class='form-control'> <a href='#' class='btn default switchNextPage'> <i class='fa fa-arrow-right'></i> </a> из " + numberOfPages + "</div>";
    }
    if (instance.profile.general.newcommand.bool()) {
      html += "<a href='#' class='btn btn-primary create_button'> <i class='fa fa-plus'></i> Создать </a>";
      html += "<a href='#' class='btn btn-primary create_button'> <i class='fa fa-copy'></i> Дублировать </a>";
    }
    if (instance.profile.general.removecommand.bool()) {
      html += "<a href='#' class='btn red delete_button'> <i class='fa fa-times'></i> Удалить </a>";
    }
    if (instance.profile.general.modifycommand.bool() || instance.profile.general.newcommand.bool()) {
      html += "<a href='#' class='btn green save_button'> <i class='fa fa-save'></i> Сохранить </a>";
    }
    html += "<div class='btn-group'> <a class='btn green' href='#' data-toggle='dropdown'> <i class='fa fa-cogs'></i> Tools <i class='fa fa-angle-down'></i> </a> <ul class='dropdown-menu pull-right'> <li> <a href='#'> <i class='fa fa-pencil'></i> Export to Excel </a> </li> <li class='divider'> </li> <li> <a href='#'> <i class='i'></i> More action </a> </li> </ul> </div>";
    html += "<div class='btn-group'> <a class='btn green' href='#' data-toggle='dropdown'> Columns <i class='fa fa-angle-down'></i> </a> <div class='dropdown-menu hold-on-click dropdown-checkboxes pull-right columns_toggler'>";
    i = 0;
    l = instance.profile.columns.columnsdb.length;
    while (i < l) {
      if (instance.profile.columns.visibility[i] === "TRUE") {
        html += "<label><input type='checkbox' data-column='" + instance.profile.columns.columnsdb[i] + "' checked>" + instance.profile.columns.columnsdb[i] + "</label>";
      } else {
        html += "<label><input type='checkbox' data-column='" + instance.profile.columns.columnsdb[i] + "'>" + instance.profile.columns.columnsdb[i] + "</label>";
      }
      i++;
    }
    html += "</div></div></div></div>";
    return callback(html);
  };

  MB.Table.prototype.maketoppanel = function(callback) {
    var html, i, instance, value, _i, _len, _ref;
    instance = this;
    html = "<div class='row'><div class='col-md-12'><div class='top-panel'><div class='row'>";
    _ref = instance.profile.columns.columnsdb;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      value = _ref[i];
      if (instance.profile.columns.filterType[i] !== "") {
        html += "<div class='col-md-2'> <div class='form-group'> <label>" + instance.profile.columns.columnsclient[i] + "</label> <div> <input type='text' class='form-control filter' data-filter-field='" + value + "'> </div></div></div>";
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
    var instance;
    instance = this;
    if (part === "init") {
      instance.$container.find(".top-panel input.filter").each(function(i, el) {
        var field, filterType;
        field = $(el).data("filter-field");
        filterType = instance.profile.columns.filterType[instance.profile.columns.columnsdb.indexOf(field)];
        switch (filterType) {
          case "select2":
            return $(el).select2({
              placeholder: "Выберите",
              ajax: {
                url: "/cgi-bin/b2cJ",
                dataType: "json",
                data: function(term, page) {
                  var columns, index, object, options;
                  field = $(el).data("filter-field");
                  index = instance.profile.columns.columnsdb.indexOf(field);
                  object = instance.profile.columns.filterObject[index];
                  columns = instance.profile.columns.filterQueryColumns[index];
                  options = {
                    command: "get",
                    object: object,
                    columns: columns,
                    sid: MB.User.sid
                  };
                  return {
                    p_xml: MB.Core.makeQuery(options)
                  };
                },
                results: function(data, page) {
                  return {
                    results: MB.Table.parseforselect2data(data)
                  };
                }
              }
            });
          case "daterange":
            return $(el).daterangepicker({
              format: "DD.MM.YYYY",
              showDropdowns: true,
              showWeekNumbers: true,
              singleDatePicker: true
            }, function(start, end) {
              if (instance.profile.general.filterWhere[field] != null) {
                instance.profile.general.filterWhere[field].start = start.format("DD.MM.YYYY");
                instance.profile.general.filterWhere[field].end = end.format("DD.MM.YYYY");
                return instance.reload("data");
              } else {
                instance.profile.general.filterWhere[field] = {
                  type: "daterange",
                  start: start.format("DD.MM.YYYY"),
                  end: end.format("DD.MM.YYYY")
                };
                return instance.reload("data");
              }
            });
        }
      });
      instance.$container.find(".filter").on("change", function(e) {
        var field, filterType, val;
        field = e.target.dataset.filterField;
        filterType = instance.profile.columns.filterType[instance.profile.columns.columnsdb.indexOf(field)];
        val = e.val;
        switch (filterType) {
          case "select2":
            instance.profile.general.filterWhere[field] = {
              type: "equal",
              value: val
            };
            return instance.reload("data");
        }
      });
      instance.$container.find(".xls-converter").on("click", function(e) {
        var o;
        o = {
          command: "get",
          object: instance.profile.general.getobject,
          order_by: instance.profile.general.orderby,
          client_object: instance.name,
          page_no: instance.profile.general.pageno,
          sid: MB.User.sid
        };
        return MB.Core.sendQuery(o, function(res) {
          var cell, csv, i, ii, name, pom, row, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
          csv = "";
          _ref = res.NAMES;
          for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            name = _ref[i];
            csv += name + ";";
          }
          csv += "\n";
          _ref1 = res.DATA;
          for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
            row = _ref1[i];
            for (ii = _k = 0, _len2 = row.length; _k < _len2; ii = ++_k) {
              cell = row[ii];
              csv += res.DATA[i][ii] + ";";
            }
          }
          csv += "\n";
          pom = document.createElement("a");
          pom.setAttribute("href", "data:text/csv;charset=windows-1251," + encodeURI(csv));
          pom.setAttribute("download", "test.csv");
          return pom.click();
        });
      });
      instance.$container.on("click", ".portlet-title", function(e) {
        var $target, column, state;
        $target = $(e.target);
        if ($target.hasClass("reload")) {
          return instance.reload("data");
        } else if ($target.prop("tagName" === "LABEL" && $target.closest(".columns_toggler").length > 0)) {
          state = $target.find("input").prop("checked");
          column = $target.find("input").data("column");
          if (state) {
            return instance.$container.find("table [data-column='" + column + "']").hide();
          } else {
            return instance.$container.find("table [data-column='" + column + "']").show();
          }
        }
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
      instance.$container.on("click", ".portlet-title a", function(e) {
        var $handsontable, $target, addingNodesCount, callbacksCounter, da, deletingNodesCount, editingNodesCount, endRow, handsontableInstance, id, key, nodesCount, objversion, row, selectedRowsInterval, val, _ref, _ref1, _ref2, _results, _results1, _results2;
        $target = $(this);
        if ($target.hasClass("switchNextPage")) {
          val = $target.parent().find("input").val();
          val++;
          $target.parent().find("input").val(val);
          instance.profile.general.pageno = val;
          return instance.reload("data");
        } else if ($target.hasClass("switchPreviousPage")) {
          val = $target.parent().find("input").val();
          val--;
          $target.parent().find("input").val(val);
          instance.profile.general.pageno = val;
          return instance.reload("data");
        } else if ($target.hasClass("create_button")) {
          return instance.updatemodel("addrow", {}, function() {
            return instance.updateview("addrow", function() {});
          });
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
                  if ((parseInt(res.RC)) === 0) {
                    callbacksCounter++;
                    toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE);
                    if (callbacksCounter === nodesCount) {
                      instance.reload("data");
                      delete instance.addingStorage;
                      return delete instance.editingStorage;
                    }
                  } else {
                    toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE);
                    instance.reload("data");
                    delete instance.addingStorage;
                    return delete instance.editingStorage;
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
                  if ((parseInt(res.RC)) === 0) {
                    callbacksCounter++;
                    toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE);
                    if (callbacksCounter === nodesCount) {
                      instance.reload("data");
                      delete instance.addingStorage;
                      return delete instance.editingStorage;
                    }
                  } else {
                    toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE);
                    instance.reload("data");
                    delete instance.addingStorage;
                    return delete instance.editingStorage;
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
                if ((parseInt(res.RC)) === 0) {
                  callbacksCounter++;
                  toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE);
                  if (callbacksCounter === addingNodesCount) {
                    instance.reload("data");
                    return delete instance.addingStorage;
                  }
                } else {
                  toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE);
                  instance.reload("data");
                  return delete instance.addingStorage;
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
                if ((parseInt(res.RC)) === 0) {
                  callbacksCounter++;
                  toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE);
                  if (callbacksCounter === editingNodesCount) {
                    instance.reload("data");
                    return delete instance.editingStorage;
                  }
                } else {
                  toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE);
                  instance.reload("data");
                  return delete instance.editingStorage;
                }
              }));
            }
            return _results1;
          }
        } else if ($target.hasClass("delete_button")) {
          da = confirm("Вы уверены что хотите удалить эти данные?");
          if (da) {
            $handsontable = instance.$container.find(".handsontable");
            handsontableInstance = $handsontable.handsontable("getInstance");
            selectedRowsInterval = MB.Table.getSelectedRowsInterval(handsontableInstance);
            row = selectedRowsInterval[0];
            endRow = selectedRowsInterval[1];
            instance.deletingStorage = {};
            while (row <= endRow) {
              id = instance.data.data[row][instance.data.names.indexOf(instance.profile.general.primarykey)];
              objversion = instance.data.data[row][instance.data.names.indexOf("OBJVERSION")];
              instance.deletingStorage[id] = {
                command: "remove",
                object: instance.profile.general.object,
                sid: MB.User.sid
              };
              instance.deletingStorage[id][instance.profile.general.primarykey] = id;
              instance.deletingStorage[id]["OBJVERSION"] = objversion;
              row++;
            }
            deletingNodesCount = Object.keys(instance.deletingStorage).length;
            callbacksCounter = 0;
            _ref2 = instance.deletingStorage;
            _results2 = [];
            for (key in _ref2) {
              row = _ref2[key];
              _results2.push(MB.Core.sendQuery(row, function(res) {
                if ((parseInt(res.RC)) === 0) {
                  callbacksCounter++;
                  toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE);
                  if (callbacksCounter === deletingNodesCount) {
                    instance.reload("data");
                    return delete instance.deletingStorage;
                  }
                } else {
                  toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE);
                  instance.reload("data");
                  return delete instance.deletingStorage;
                }
              }));
            }
            return _results2;
          }
        } else if ($target.hasClass("restore_button")) {
          instance.$container.find(".editingrow").each(function(i, el) {
            $(el).find("a").each(function(i2, el2) {
              return $(el2).editable("destroy");
            });
            return $(el).removeClass("editingrow").addClass("justrow");
          });
          instance.$container.find(".addingrow").remove();
          instance.addingStorage = null;
          return instance.editingStorage = null;
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


  /*
  
  
   * if instance.editingStorage[primaryKeyId]?
  					 * 						console.log 9
  					 * 						instance.editingStorage[primaryKeyId][instance.profile.columns.returnscolumn[index]] = newVal
  					 * 					else
  					 * 						console.log 10
  					 * 						objversion = instance.data.data[row][instance.data.names.indexOf "OBJVERSION"]
  					 * 						instance.editingStorage[primaryKeyId] =
  					 * 							command: "modify"
  					 * 							object: instance.profile.general.object
  					 * 							sid: MB.User.sid
  					 * 						instance.editingStorage[primaryKeyId][instance.profile.general.primarykey] = primaryKeyId
  					 * 						instance.editingStorage[primaryKeyId][instance.profile.columns.returnscolumn[index]] = newVal
  					 * 						instance.editingStorage[primaryKeyId]["OBJVERSION"] = objversion
  					 * 				else
  					 * 					console.log 11
  					 * 					# yep
  					 * 					if instance.editingStorage[primaryKeyId]?
  					 * 						console.log 12
  					 * 						instance.editingStorage[primaryKeyId][instance.profile.columns.returnscolumn[index]] = instance.data.data[row][instance.profile.columns.columnsdb.indexOf instance.profile.columns.returnscolumn[index]]
  					 * 					else
  					 * 						console.log 13
  					 * 						objversion = instance.data.data[row][instance.data.names.indexOf "OBJVERSION"]
  					 * 						instance.editingStorage[primaryKeyId] =
  					 * 							command: "modify"
  					 * 							object: instance.profile.general.object
  					 * 							sid: MB.User.sid
  					 * 						instance.editingStorage[primaryKeyId][instance.profile.general.primarykey] = primaryKeyId
  					 * 						dropdownIndex = null
  					 * 						for value, i in instance.data.dropdownsData[prop].DATA
  					 * 							dropdownIndex = i if (value.indexOf(newVal)) > -1
  					 * 						instance.editingStorage[primaryKeyId][instance.profile.columns.returnscolumn[index]] = instance.data.dropdownsData[prop].DATA[dropdownIndex][0]
  					 * 						instance.editingStorage[primaryKeyId]["OBJVERSION"] = objversion
  					 * 	rowStatus = handsontableInstance.getDataAtRowProp row, "rowStatus"
  					 * 	switch rowStatus
  					 * 		when "justRow"
  					 * 			handsontableInstance.setDataAtRowProp row, "rowStatus", "editedRow"
  					 * 			instance.editingStorage = instance.editingStorage or {}
  					 * 			primaryKeyId = instance.data.data[row][instance.data.names.indexOf instance.profile.general.primarykey]
  					 * 			if instance.editingStorage[primaryKeyId]?
  					 * 				instance.editingStorage[primaryKeyId][prop] = newVal
  					 * 				return do handsontableInstance.render
  					 * 			else
  					 * 				objversion = instance.data.data[row][instance.data.names.indexOf "OBJVERSION"]
  					 * 				instance.editingStorage[primaryKeyId] =
  					 * 					command: "modify"
  					 * 					object: instance.profile.general.object
  					 * 					sid: MB.User.sid
  					 * 				instance.editingStorage[primaryKeyId][instance.profile.general.primarykey] = primaryKeyId
  					 * 				instance.editingStorage[primaryKeyId][prop] = newVal
  					 * 				instance.editingStorage[primaryKeyId]["OBJVERSION"] = objversion
  					 * 				return do handsontableInstance.render
  					 * 		when "addingRow"
  					 * 			guid = handsontableInstance.getDataAtRowProp row, "guid"
  					 * 			instance.addingStorage[guid][prop] = newVal
  
  
  
  
  
  
  
  
  								when "editedRow"
   */

}).call(this);
