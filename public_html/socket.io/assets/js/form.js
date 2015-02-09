(function() {
  (function() {
    var MB;
    MB = void 0;
    MB = window.MB;
    MB = MB || {};
    MB.Form = function(options) {
      var instance, key;
      instance = void 0;
      key = void 0;
      instance = this;
      instance.name = options.name || MB.Core.guid();
      instance.world = options.world || "modal";
      instance.ids = options.ids;
      instance.activeId = options.ids[0];
      if (options.params) {
        for (key in options.params) {
          instance[key] = options.params[key];
        }
      }
    };
    MB.Form.parseprofile = function(data, callback) {
      var i, ii, key, l, ll, parsedprofile;
      i = void 0;
      ii = void 0;
      key = void 0;
      l = void 0;
      ll = void 0;
      parsedprofile = void 0;
      parsedprofile = {};
      for (key in data.OBJECT_PROFILE) {
        parsedprofile[key] = data.OBJECT_PROFILE[key];
      }
      i = 0;
      l = data.NAMES.length;
      while (i < l) {
        parsedprofile[data.NAMES[i]] = [];
        ii = 0;
        ll = data.DATA.length;
        while (ii < ll) {
          parsedprofile[data.NAMES[i]].push(data.DATA[ii][i]);
          ii++;
        }
        i++;
      }
      return callback(parsedprofile);
    };
    MB.Form.parseforselect2data = function(res, option) {
      var data, i, value, _i, _len, _ref;
      data = void 0;
      i = void 0;
      value = void 0;
      _i = void 0;
      _len = void 0;
      _ref = void 0;
      data = [];
      if (res.NAMES.length !== 2) {
        console.log("В parseforselect2data приходит не 2 колонки!");
      } else {
        _ref = res.DATA;
        i = _i = 0;
        _len = _ref.length;
        while (_i < _len) {
          value = _ref[i];
          data.push({
            id: res.DATA[i][0],
            text: res.DATA[i][1]
          });
          i = ++_i;
        }
      }
      if ((option != null) && option === "empty") {
        data.unshift({
          id: " ",
          text: "Empty value"
        });
      }
      return data;
    };
    MB.Form.hasloaded = function(name) {
      return MB.O.forms.hasOwnProperty(name);
    };
    MB.Form.find = function(name) {
      return MB.O.forms[name];
    };
    MB.Form.fn = MB.Form.prototype;
    MB.Form.fn.parent = MB.Form.prototype.constructor;
    MB.Form.fn.getfielddata = function(field) {
      var instance;
      instance = void 0;
      instance = this;
      return instance.$container.find("[data-column='" + field + "'] input").val();
    };
    MB.Form.fn.hidecontrols = function() {
      var instance;
      instance = void 0;
      instance = this;
      return instance.$container.find(".control-buttons").hide();
    };
    MB.Form.fn.showcontrols = function() {
      var instance;
      instance = void 0;
      instance = this;
      return instance.$container.find(".control-buttons").show();
    };
    MB.Form.fn.makedir = function(callback) {
      var instance;
      instance = void 0;
      instance = this;
      MB.O.forms[instance.name] = instance;
      return callback();
    };
    MB.Form.fn.makecontainer = function(callback) {
      var $container, $worldcontainer, instance;
      $container = void 0;
      $worldcontainer = void 0;
      instance = void 0;
      instance = this;
      $worldcontainer = $("." + instance.world + "-content-wrapper");
      $container = $("<div id='" + instance.world + "_" + instance.name + "_wrapper' class='" + instance.world + "-item'></div>");
      $worldcontainer.append($container);
      instance.$worldcontainer = $worldcontainer;
      instance.$container = $container;
      return callback();
    };
    MB.Form.fn.makeportletcontainer = function(callback) {
      var html, instance;
      html = void 0;
      instance = void 0;
      instance = this;
      html = "";
      html += "<div class='row'><div class='col-md-12'><div class='portlet box grey'><div class='form-portlet-title portlet-title'><a href='#' class='bt-menu-trigger'><span>Menu</span></a><div class='caption'><i class='fa fa-reorder'></i><span></span></div>";
      html += "<div class='actions'>";
      html += (instance.profile.general.newcommand.bool() ? "<button type='button' class='btn blue form-create-button'><i class='fa fa-plus'></i> Создать</button>" : "");
      html += (instance.profile.general.newcommand.bool() ? "<button type='button' class='btn btn-primary form-create-button'><i class='fa fa-copy'></i> Дублировать</button>" : "");
      html += (instance.profile.general.newcommand.bool() || instance.profile.general.modifycommand.bool() ? "<button type='button' class='btn green form-save-button'><i class='fa fa-save'></i> Сохранить</button>" : "");
      html += (instance.profile.general.removecommand.bool() ? "<button type='button' class='btn red form-delete-button'><i class='fa fa-times'></i> Удалить</button>" : "");
      html += "<button class=\"btn dark tools reload\" style=\"margin-left: 15px;\"><i class=\"fa fa-refresh reload\"></i></button>";
      html += "</div></div><div class='portlet-body'></div></div></div></div><div class='row'><div class='col-md-12'>";
      html += "<div class='btn-group control-buttons btn-group-solid'>";
      html += "</div></div></div>";
      instance.$container.html(html);
      borderMenu();
      return callback();
    };
    MB.Form.fn.loadhtml = function(callback) {
      var instance, url;
      instance = void 0;
      url = void 0;
      instance = this;
      url = "html/forms/" + instance.name + "/" + instance.name + ".html";
      instance.url = url;
      return instance.$container.find(".portlet-body").load(url, function(res, status, xhr) {
        return callback();
      });
    };
    MB.Form.fn.getprofile = function(callback) {
      var instance, o;
      instance = void 0;
      o = void 0;
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
    MB.Form.fn.getdata = function(id, callback) {
      var instance, o;
      instance = void 0;
      o = void 0;
      instance = this;
      o = {
        command: "get",
        object: instance.profile.general.getobject,
        where: instance.profile.general.primarykey + " = " + "'" + id + "'",
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
    MB.Form.fn.distributeprofile = function(parsedprofile, callback) {
      var instance;
      instance = void 0;
      instance = this;
      instance.profile = {};
      instance.profile.general = {};
      instance.profile.columns = {};
      instance.profile.general.prepareInsert = parsedprofile.PREPARE_INSERT;
      instance.profile.general.rowsmaxnum = parsedprofile.ROWS_MAX_NUM;
      instance.profile.general.primarykey = parsedprofile.PRIMARY_KEY;
      instance.profile.general.orderby = parsedprofile.DEFAULT_ORDER_BY;
      instance.profile.general.object = parsedprofile.OBJECT_COMMAND;
      instance.profile.general.getobject = parsedprofile.GET_OBJECT_COMMAND;
      instance.profile.general.childobject = parsedprofile.CHILD_CLIENT_OBJECT;
      instance.profile.general.objectname = parsedprofile.CLIENT_OBJECT_NAME;
      instance.profile.general.where = parsedprofile.DEFAULT_WHERE;
      instance.profile.general.newcommand = parsedprofile.NEW_COMMAND;
      instance.profile.general.removecommand = parsedprofile.REMOVE_COMMAND;
      instance.profile.general.modifycommand = parsedprofile.MODIFY_COMMAND;
      instance.profile.general.pageno = 1;
      instance.profile.general.custom = parsedprofile.ADDITIONAL_FUNCTIONALITY;
      instance.profile.columns.align = parsedprofile.ALIGN;
      instance.profile.columns.clientnames = parsedprofile.NAME;
      instance.profile.columns.columnsdb = parsedprofile.COLUMN_NAME;
      instance.profile.columns.editability = parsedprofile.EDITABLE;
      instance.profile.columns.editor = parsedprofile.TYPE_OF_EDITOR;
      instance.profile.columns.visibility = parsedprofile.VISIBLE;
      instance.profile.columns.width = parsedprofile.WIDTH;
      instance.profile.columns.refclientobj = parsedprofile.REFERENCE_CLIENT_OBJECT;
      instance.profile.columns.returnscolumn = parsedprofile.LOV_RETURN_TO_COLUMN;
      instance.profile.columns.refcolumns = parsedprofile.LOV_COLUMNS;
      instance.profile.columns.references = parsedprofile.LOV_COMMAND;
      instance.profile.columns.selectwhere = parsedprofile.LOV_WHERE;
      instance.profile.columns.acwhere = parsedprofile.AC_WHERE;
      instance.profile.columns.acreturnscolumns = parsedprofile.AC_RETURN_TO_COLUMN;
      instance.profile.columns.accolumns = parsedprofile.AC_COLUMNS;
      instance.profile.columns.accommands = parsedprofile.AC_COMMAND;
      return callback();
    };
    MB.Form.fn.distributedata = function(data, callback) {
      var instance;
      instance = void 0;
      instance = this;
      instance.data = {};
      instance.data.data = data.DATA;
      instance.data.names = data.NAMES;
      instance.data.info = data.INFO;
      return callback();
    };
    MB.Form.fn.updatemodel = function(part, data, callback) {
      var instance;
      instance = void 0;
      instance = this;
      if (part === "profile") {
        return MB.Form.parseprofile(data, function(parsedprofile) {
          return instance.distributeprofile(parsedprofile, function() {
            return callback();
          });
        });
      } else if (part === "data") {
        return instance.distributedata(data, function() {
          return callback();
        });
      }
    };
    MB.Form.fn.create = function(callback) {
      var instance;
      instance = void 0;
      instance = this;
      return instance.makedir(function() {
        return instance.getprofile(function(res) {
          return instance.updatemodel("profile", res, function() {
            return instance.getdata(instance.activeId, function(res) {
              return instance.updatemodel("data", res, function() {
                return instance.makecontainer(function() {
                  return instance.makeportletcontainer(function() {
                    return instance.loadhtml(function() {
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
        });
      });
    };
    MB.Form.fn.updateview = function(part, callback) {
      var i, instance, l, selectedrows, table;
      i = void 0;
      instance = void 0;
      l = void 0;
      selectedrows = void 0;
      table = void 0;
      instance = this;
      if (part === "init") {
        if (instance.profile.general.modifycommand.bool()) {
          i = 0;
          l = instance.data.names.length;
          while (i < l) {
            (function(i) {
              var $fieldwrapper, active, editor, html, i2, isprimary, l2, refcolumns, reference, returnscolumn, text;
              $fieldwrapper = void 0;
              active = void 0;
              editor = void 0;
              html = void 0;
              i2 = void 0;
              isprimary = void 0;
              l2 = void 0;
              refcolumns = void 0;
              reference = void 0;
              returnscolumn = void 0;
              text = void 0;
              $fieldwrapper = instance.$container.find(".column-wrapper[data-column='" + instance.data.names[i] + "']");
              isprimary = $fieldwrapper.hasClass("primarykey");
              if ($fieldwrapper.length > 0) {
                editor = instance.profile.columns.editor[i];
                if (editor === "text" && !isprimary) {
                  if (instance.profile.columns.editability[i].bool()) {
                    $fieldwrapper.html("<input type='text' class='form-control field'>");
                  } else {
                    $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
                  }
                  return $fieldwrapper.find("input").val(instance.data.data[0][i]);
                } else if (editor === "checkbox" && !isprimary) {
                  if (instance.profile.columns.editability[i].bool()) {
                    if (instance.data.data[0][i].bool()) {
                      html = "<div class='make-switch' data-on-label='<i class=\"fa fa-check icon-white\"></i>' data-off-label='<i class=\"fa fa-times\"></i>'> <input type='checkbox' checked class='toggle'/></div>";
                    } else {
                      html = "<div class='make-switch' data-on-label='<i class=\"fa fa-check icon-white\"></i>' data-off-label='<i class=\"fa fa-times\"></i>'> <input type='checkbox' class='toggle'/></div>";
                    }
                    $fieldwrapper.html(html);
                    return $fieldwrapper.find(".make-switch")["bootstrapSwitch"]();
                  } else {
                    if (instance.data.data[0][i].bool()) {
                      html = "<div class='make-switch' data-on-label='<i class=\"fa fa-check icon-white\"></i>' data-off-label='<i class=\"fa fa-times\"></i>'> <input type='checkbox' checked class='toggle'/></div>";
                    } else {
                      html = "<div class='make-switch' data-on-label='<i class=\"fa fa-check icon-white\"></i>' data-off-label='<i class=\"fa fa-times\"></i>'> <input type='checkbox' class='toggle'/></div>";
                    }
                    return $fieldwrapper.html(html);
                  }
                } else if (editor === "number" && !isprimary) {
                  if (instance.profile.columns.editability[i].bool()) {
                    $fieldwrapper.html("<input type='text' class='form-control field'>");
                  } else {
                    $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
                  }
                  return $fieldwrapper.find("input").val(instance.data.data[0][i]);
                } else if (editor === "datetime" && !isprimary) {
                  if (instance.profile.columns.editability[i].bool()) {
                    $fieldwrapper.html("<input type='text'  class='form-control field'>");
                    $fieldwrapper.find("input").val(instance.data.data[0][i]);
                    log(instance.data.data[0][i]);
                    log("dd.mm.yyyy hh.ii.00");
                    $fieldwrapper.find("input").datetimepicker({
                      format: "dd.mm.yyyy hh:ii",
                      todayBtn: true,
                      autoclose: true
                    });
                    return $fieldwrapper.find("input").mask("99.99.9999 99:99");
                  } else {
                    $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
                    return $fieldwrapper.find("input").val(instance.data.data[0][i]);
                  }
                } else if (editor === "select2" && !isprimary) {
                  if (instance.profile.columns.editability[i].bool()) {
                    refcolumns = instance.profile.columns.refcolumns[i];
                    reference = instance.profile.columns.references[i];
                    returnscolumn = instance.profile.columns.returnscolumn[i];
                    text = instance.data.data[0][i];
                    html = (instance.profile.columns.accommands[i] ? "<input type='hidden' class='select2input field' data-accommand='" + instance.profile.columns.accommands[i] + "' data-accolumns='" + instance.profile.columns.accolumns[i] + "' data-acreturnscolumns='" + instance.profile.columns.acreturnscolumns[i] + "' data-returnscolumn='" + returnscolumn + "'>" : "<input type='hidden' class='select2input field' data-returnscolumn='" + returnscolumn + "'>");
                    $fieldwrapper.html(html);
                    return $fieldwrapper.find("input").select2({
                      placeholder: text,
                      allowClear: true,
                      ajax: {
                        url: "/cgi-bin/b2cJ",
                        dataType: "json",
                        data: function(term, page) {
                          var options;
                          options = void 0;
                          options = {
                            command: "get",
                            object: reference,
                            columns: refcolumns,
                            sid: MB.User.sid
                          };
                          if (instance.profile.columns.selectwhere[i]) {
                            options["where"] = instance.profile.columns.selectwhere[i] + " = " + (instance.getfielddata(instance.profile.columns.selectwhere[i]));
                          }
                          return {
                            p_xml: MB.Core.makeQuery(options)
                          };
                        },
                        results: function(data, page) {
                          return {
                            results: MB.Form.parseforselect2data(data)
                          };
                        }
                      }
                    });
                  } else {
                    return $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
                  }
                } else if (editor === "select2withEmptyValue" && !isprimary) {
                  if (instance.profile.columns.editability[i].bool()) {
                    refcolumns = instance.profile.columns.refcolumns[i];
                    reference = instance.profile.columns.references[i];
                    returnscolumn = instance.profile.columns.returnscolumn[i];
                    text = instance.data.data[0][i];
                    html = (instance.profile.columns.accommands[i] ? "<input type='hidden' class='select2input field' data-accommand='" + instance.profile.columns.accommands[i] + "' data-accolumns='" + instance.profile.columns.accolumns[i] + "' data-acreturnscolumns='" + instance.profile.columns.acreturnscolumns[i] + "' data-returnscolumn='" + returnscolumn + "'>" : "<input type='hidden' class='select2input field' data-returnscolumn='" + returnscolumn + "'>");
                    $fieldwrapper.html(html);
                    return $fieldwrapper.find("input").select2({
                      placeholder: text,
                      allowClear: true,
                      matcher: function(term, text, option) {
                        console.log(arguments);
                        return text;
                      },
                      ajax: {
                        url: "/cgi-bin/b2cJ",
                        dataType: "json",
                        data: function(term, page) {
                          var options;
                          options = void 0;
                          options = {
                            command: "get",
                            object: reference,
                            columns: refcolumns,
                            sid: MB.User.sid
                          };
                          if (instance.profile.columns.selectwhere[i]) {
                            options["where"] = instance.profile.columns.selectwhere[i] + " = " + (instance.getfielddata(instance.profile.columns.selectwhere[i]));
                          }
                          return {
                            p_xml: MB.Core.makeQuery(options)
                          };
                        },
                        results: function(data, page) {
                          return {
                            results: MB.Form.parseforselect2data(data, "empty")
                          };
                        }
                      }
                    });
                  } else {
                    return $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
                  }
                } else if (editor === "colorpicker" && !isprimary) {
                  if (instance.profile.columns.editability[i].bool()) {
                    $fieldwrapper.html("<input type='text' class='form-control field'>");
                    $fieldwrapper.find("input").colorpicker("setValue", instance.data.data[0][i]);
                    return $fieldwrapper.find("input").val(instance.data.data[0][i]);
                  } else {
                    $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
                    $fieldwrapper.find("input").colorpicker("setValue", instance.data.data[0][i]);
                    return $fieldwrapper.find("input").val(instance.data.data[0][i]);
                  }
                } else if (isprimary) {
                  $fieldwrapper.html("<select class='id-toggler form-control'></select>");
                  html = "";
                  active = "";
                  i2 = 0;
                  l2 = instance.ids.length;
                  while (i2 < l2) {
                    html += "<option value='" + instance.ids[i2] + "'>" + instance.ids[i2] + "</option>";
                    i2++;
                  }
                  return $fieldwrapper.find("select").html(html);
                }
              }
            })(i);
            i++;
          }
          instance.$container.find(".form-save-button").addClass("disabled");
          if (instance.profile.general.childobject) {
            table = new MB.Table({
              world: instance.name,
              name: instance.profile.general.childobject,
              params: {
                parentkeyvalue: instance.activeId,
                parentobject: instance.name,
                parentobjecttype: "form"
              }
            });
            table.create(function() {});
          }
          instance.$container.find(".form-portlet-title .caption span").html(instance.profile.general.objectname);
        } else {
          i = 0;
          l = instance.data.names.length;
          while (i < l) {
            (function(i) {
              var $fieldwrapper, active, editor, html, i2, isprimary, l2;
              $fieldwrapper = void 0;
              active = void 0;
              editor = void 0;
              html = void 0;
              i2 = void 0;
              isprimary = void 0;
              l2 = void 0;
              $fieldwrapper = instance.$container.find(".column-wrapper[data-column='" + instance.data.names[i] + "']");
              isprimary = $fieldwrapper.hasClass("primarykey");
              if ($fieldwrapper.length > 0) {
                editor = instance.profile.columns.editor[i];
                if (editor === "text" && !isprimary) {
                  $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
                  return $fieldwrapper.find("input").val(instance.data.data[0][i]);
                } else if (editor === "datetime" && !isprimary) {
                  $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
                  return $fieldwrapper.find("input").val(instance.data.data[0][i]);
                } else if (editor === "checkbox" && !isprimary) {
                  if (instance.data.data[0][i].bool()) {
                    html = "<div class='make-switch' data-on-label='<i class=\"fa fa-check icon-white\"></i>' data-off-label='<i class=\"fa fa-times\"></i>'> <input type='checkbox' checked class='toggle'/></div>";
                  } else {
                    html = "<div class='make-switch' data-on-label='<i class=\"fa fa-check icon-white\"></i>' data-off-label='<i class=\"fa fa-times\"></i>'> <input type='checkbox' class='toggle'/></div>";
                  }
                  return $fieldwrapper.html(html);
                } else if (editor === "number" && !isprimary) {
                  $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
                  return $fieldwrapper.find("input").val(instance.data.data[0][i]);
                } else if (editor === "select2" && !isprimary) {
                  $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
                  return $fieldwrapper.find("input").val(instance.data.data[0][i]);
                } else if (isprimary) {
                  $fieldwrapper.html("<select class='id-toggler form-control'></select>");
                  html = "";
                  active = "";
                  i2 = 0;
                  l2 = instance.ids.length;
                  while (i2 < l2) {
                    html += "<option value='" + instance.ids[i2] + "'>" + instance.ids[i2] + "</option>";
                    i2++;
                  }
                  return $fieldwrapper.find("select").html(html);
                }
              }
            })(i);
            i++;
          }
          instance.$container.find(".form-save-button").addClass("disabled");
          if (instance.profile.general.childobject) {
            table = new MB.Table({
              world: instance.name,
              name: instance.profile.general.childobject,
              params: {
                parentkeyvalue: instance.activeId,
                parentobject: instance.name,
                parentobjecttype: "form"
              }
            });
            table.create(function() {});
          }
          instance.$container.find(".form-portlet-title .caption span").html(instance.profile.general.objectname);
        }
      } else if (part === "data") {
        log("DATA");
        if (instance.profile.general.modifycommand.bool()) {
          i = 0;
          l = instance.data.names.length;
          while (i < l) {
            (function(i) {
              var $fieldwrapper, active, editor, html, i2, isprimary, l2, refcolumns, reference, returnscolumn, text;
              $fieldwrapper = void 0;
              active = void 0;
              editor = void 0;
              html = void 0;
              i2 = void 0;
              isprimary = void 0;
              l2 = void 0;
              refcolumns = void 0;
              reference = void 0;
              returnscolumn = void 0;
              text = void 0;
              $fieldwrapper = instance.$container.find(".column-wrapper[data-column='" + instance.data.names[i] + "']");
              isprimary = $fieldwrapper.hasClass("primarykey");
              if ($fieldwrapper.length > 0) {
                editor = instance.profile.columns.editor[i];
                if (editor === "text" && !isprimary) {
                  if (instance.profile.columns.editability[i].bool()) {
                    $fieldwrapper.html("<input type='text' class='form-control field'>");
                  } else {
                    $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
                  }
                  return $fieldwrapper.find("input").val(instance.data.data[0][i]);
                } else if (editor === "checkbox" && !isprimary) {
                  if (instance.profile.columns.editability[i].bool()) {
                    if (instance.data.data[0][i].bool()) {
                      html = "<div class='make-switch' data-on-label='<i class=\"fa fa-check icon-white\"></i>' data-off-label='<i class=\"fa fa-times\"></i>'> <input type='checkbox' checked class='toggle'/></div>";
                    } else {
                      html = "<div class='make-switch' data-on-label='<i class=\"fa fa-check icon-white\"></i>' data-off-label='<i class=\"fa fa-times\"></i>'> <input type='checkbox' class='toggle'/></div>";
                    }
                    $fieldwrapper.html(html);
                    return $fieldwrapper.find(".make-switch")["bootstrapSwitch"]();
                  } else {
                    if (instance.data.data[0][i].bool()) {
                      html = "<div class='make-switch' data-on-label='<i class=\"fa fa-check icon-white\"></i>' data-off-label='<i class=\"fa fa-times\"></i>'> <input type='checkbox' checked class='toggle'/></div>";
                    } else {
                      html = "<div class='make-switch' data-on-label='<i class=\"fa fa-check icon-white\"></i>' data-off-label='<i class=\"fa fa-times\"></i>'> <input type='checkbox' class='toggle'/></div>";
                    }
                    return $fieldwrapper.html(html);
                  }
                } else if (editor === "number" && !isprimary) {
                  if (instance.profile.columns.editability[i].bool()) {
                    $fieldwrapper.html("<input type='text' class='form-control field'>");
                  } else {
                    $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
                  }
                  return $fieldwrapper.find("input").val(instance.data.data[0][i]);
                } else if (editor === "datetime" && !isprimary) {
                  if (instance.profile.columns.editability[i].bool()) {
                    $fieldwrapper.html("<input type='text' class='form-control field'>");
                    $fieldwrapper.find("input").val(instance.data.data[0][i]);
                    $fieldwrapper.find("input").datetimepicker({
                      format: "dd.mm.yyyy hh:ii",
                      todayBtn: true,
                      autoclose: true
                    });
                    return $fieldwrapper.find("input").mask("99.99.9999 99:99");
                  } else {
                    $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
                    return $fieldwrapper.find("input").val(instance.data.data[0][i]);
                  }
                } else if (editor === "select2" && !isprimary) {
                  if (instance.profile.columns.editability[i].bool()) {
                    refcolumns = instance.profile.columns.refcolumns[i];
                    reference = instance.profile.columns.references[i];
                    returnscolumn = instance.profile.columns.returnscolumn[i];
                    text = instance.data.data[0][i];
                    html = (instance.profile.columns.accommands[i] ? "<input type='hidden' class='select2input field' data-accommand='" + instance.profile.columns.accommands[i] + "' data-accolumns='" + instance.profile.columns.accolumns[i] + "' data-acreturnscolumns='" + instance.profile.columns.acreturnscolumns[i] + "' data-returnscolumn='" + returnscolumn + "'>" : "<input type='hidden' class='select2input field' data-returnscolumn='" + returnscolumn + "'>");
                    $fieldwrapper.html(html);
                    return $fieldwrapper.find("input").select2({
                      placeholder: text,
                      allowClear: true,
                      ajax: {
                        url: "/cgi-bin/b2cJ",
                        dataType: "json",
                        data: function(term, page) {
                          var options;
                          options = void 0;
                          options = {
                            command: "get",
                            object: reference,
                            columns: refcolumns,
                            sid: MB.User.sid
                          };
                          if (instance.profile.columns.selectwhere[i]) {
                            options["where"] = instance.profile.columns.selectwhere[i] + " = " + (instance.getfielddata(instance.profile.columns.selectwhere[i]));
                          }
                          return {
                            p_xml: MB.Core.makeQuery(options)
                          };
                        },
                        results: function(data, page) {
                          return {
                            results: MB.Form.parseforselect2data(data)
                          };
                        }
                      }
                    });
                  } else {
                    return $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
                  }
                } else if (editor === "select2withEmptyValue" && !isprimary) {
                  if (instance.profile.columns.editability[i].bool()) {
                    refcolumns = instance.profile.columns.refcolumns[i];
                    reference = instance.profile.columns.references[i];
                    returnscolumn = instance.profile.columns.returnscolumn[i];
                    text = instance.data.data[0][i];
                    html = (instance.profile.columns.accommands[i] ? "<input type='hidden' class='select2input field' data-accommand='" + instance.profile.columns.accommands[i] + "' data-accolumns='" + instance.profile.columns.accolumns[i] + "' data-acreturnscolumns='" + instance.profile.columns.acreturnscolumns[i] + "' data-returnscolumn='" + returnscolumn + "'>" : "<input type='hidden' class='select2input field' data-returnscolumn='" + returnscolumn + "'>");
                    $fieldwrapper.html(html);
                    return $fieldwrapper.find("input").select2({
                      placeholder: text,
                      allowClear: true,
                      matcher: function(term, text, option) {
                        console.log(arguments);
                        return text;
                      },
                      ajax: {
                        url: "/cgi-bin/b2cJ",
                        dataType: "json",
                        data: function(term, page) {
                          var options;
                          options = void 0;
                          options = {
                            command: "get",
                            object: reference,
                            columns: refcolumns,
                            sid: MB.User.sid
                          };
                          if (instance.profile.columns.selectwhere[i]) {
                            options["where"] = instance.profile.columns.selectwhere[i] + " = " + (instance.getfielddata(instance.profile.columns.selectwhere[i]));
                          }
                          return {
                            p_xml: MB.Core.makeQuery(options)
                          };
                        },
                        results: function(data, page) {
                          return {
                            results: MB.Form.parseforselect2data(data, "empty")
                          };
                        }
                      }
                    });
                  } else {
                    return $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
                  }
                } else if (editor === "colorpicker" && !isprimary) {
                  if (instance.profile.columns.editability[i].bool()) {
                    $fieldwrapper.html("<input type='text' class='form-control field'>");
                    $fieldwrapper.find("input").colorpicker("setValue", instance.data.data[0][i]);
                    return $fieldwrapper.find("input").val(instance.data.data[0][i]);
                  } else {
                    $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
                    $fieldwrapper.find("input").colorpicker("setValue", instance.data.data[0][i]);
                    return $fieldwrapper.find("input").val(instance.data.data[0][i]);
                  }
                } else if (isprimary) {
                  $fieldwrapper.html("<select class='id-toggler form-control'></select>");
                  html = "";
                  active = "";
                  i2 = 0;
                  l2 = instance.ids.length;
                  while (i2 < l2) {
                    html += "<option value='" + instance.ids[i2] + "'>" + instance.ids[i2] + "</option>";
                    i2++;
                  }
                  return $fieldwrapper.find("select").html(html);
                }
              }
            })(i);
            i++;
          }
          instance.$container.find(".form-save-button").addClass("disabled");
          log("GOAL");
          log(instance);
          if (instance.profile.general.childobject) {
            log("if");
            table = new MB.Table({
              world: instance.name,
              name: instance.profile.general.childobject,
              params: {
                parentkeyvalue: instance.activeId,
                parentobject: instance.name,
                parentobjecttype: "form"
              }
            });
            table.create(log(table));
          }
          instance.$container.find(".form-portlet-title .caption span").html(instance.profile.general.objectname);
        } else {
          i = 0;
          l = instance.data.names.length;
          while (i < l) {
            (function(i) {
              var $fieldwrapper, active, editor, html, i2, isprimary, l2;
              $fieldwrapper = void 0;
              active = void 0;
              editor = void 0;
              html = void 0;
              i2 = void 0;
              isprimary = void 0;
              l2 = void 0;
              $fieldwrapper = instance.$container.find(".column-wrapper[data-column='" + instance.data.names[i] + "']");
              isprimary = $fieldwrapper.hasClass("primarykey");
              if ($fieldwrapper.length > 0) {
                editor = instance.profile.columns.editor[i];
                if (editor === "text" && !isprimary) {
                  $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
                  return $fieldwrapper.find("input").val(instance.data.data[0][i]);
                } else if (editor === "checkbox" && !isprimary) {
                  if (instance.data.data[0][i].bool()) {
                    html = "<div class='make-switch' data-on-label='<i class=\"fa fa-check icon-white\"></i>' data-off-label='<i class=\"fa fa-times\"></i>'> <input type='checkbox' checked class='toggle'/></div>";
                  } else {
                    html = "<div class='make-switch' data-on-label='<i class=\"fa fa-check icon-white\"></i>' data-off-label='<i class=\"fa fa-times\"></i>'> <input type='checkbox' class='toggle'/></div>";
                  }
                  return $fieldwrapper.html(html);
                } else if (editor === "number" && !isprimary) {
                  $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
                  return $fieldwrapper.find("input").val(instance.data.data[0][i]);
                } else if (editor === "datetime" && !isprimary) {
                  $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
                  return $fieldwrapper.find("input").val(instance.data.data[0][i]);
                } else if (editor === "select2" && !isprimary) {
                  $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
                  return $fieldwrapper.find("input").val(instance.data.data[0][i]);
                } else if (isprimary) {
                  $fieldwrapper.html("<select class='id-toggler form-control'></select>");
                  html = "";
                  active = "";
                  i2 = 0;
                  l2 = instance.ids.length;
                  while (i2 < l2) {
                    html += "<option value='" + instance.ids[i2] + "'>" + instance.ids[i2] + "</option>";
                    i2++;
                  }
                  return $fieldwrapper.find("select").html(html);
                }
              }
            })(i);
            i++;
          }
          instance.$container.find(".form-save-button").addClass("disabled");
          if (instance.profile.general.childobject) {
            table = new MB.Table({
              world: instance.name,
              name: instance.profile.general.childobject,
              params: {
                parentkeyvalue: instance.activeId,
                parentobject: instance.name,
                parentobjecttype: "form"
              }
            });
            table.create(function() {});
          }
          instance.$container.find(".form-portlet-title .caption span").html(instance.profile.general.objectname);
        }
      } else if (part === "add") {
        if (instance.profile.general.modifycommand.bool()) {
          if (!(instance.$container.find(".id-toggler").find("option[value='new']").length > 0)) {
            selectedrows = instance.$container.find(".id-toggler").html();
            instance.$container.find(".id-toggler").attr("disabled", true);
            instance.$container.find(".id-toggler").html("<option value='new'></option>" + selectedrows);
          }
          i = 0;
          l = instance.data.names.length;
          while (i < l) {
            (function(i) {
              var $fieldwrapper, editor, html, isprimary, refcolumns, reference, returnscolumn, text;
              $fieldwrapper = void 0;
              editor = void 0;
              html = void 0;
              isprimary = void 0;
              refcolumns = void 0;
              reference = void 0;
              returnscolumn = void 0;
              text = void 0;
              $fieldwrapper = instance.$container.find(".column-wrapper[data-column='" + instance.data.names[i] + "']");
              isprimary = $fieldwrapper.hasClass("primarykey");
              if ($fieldwrapper.length > 0) {
                editor = instance.profile.columns.editor[i];
                if (editor === "text" && !isprimary) {
                  if (instance.profile.columns.editability[i].bool()) {
                    $fieldwrapper.html("<input type='text' class='form-control field'>");
                  } else {
                    $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
                  }
                } else if (editor === "checkbox" && !isprimary) {
                  if (instance.profile.columns.editability[i].bool()) {
                    html = "<div class='make-switch' data-on-label='<i class=\"fa fa-check icon-white\"></i>' data-off-label='<i class=\"fa fa-times\"></i>'> <input type='checkbox' class='toggle'/></div>";
                    $fieldwrapper.html(html);
                    $fieldwrapper.find(".make-switch")["bootstrapSwitch"]();
                  } else {
                    html = "<div class='make-switch' data-on-label='<i class=\"fa fa-check icon-white\"></i>' data-off-label=\"<i class='fa fa-times\"></i>'> <input type='checkbox' class='toggle'/></div>";
                    $fieldwrapper.html(html);
                  }
                } else if (editor === "number" && !isprimary) {
                  if (instance.profile.columns.editability[i].bool()) {
                    $fieldwrapper.html("<input type='text' class='form-control field'>");
                  } else {
                    $fieldwrapper.html("<input type='text' class='form-control field'>");
                  }
                } else if (editor === "datetime" && !isprimary) {
                  if (instance.profile.columns.editability[i].bool()) {
                    $fieldwrapper.html("<input type='text' class='form-control field'>");
                    $fieldwrapper.find("input").val(instance.data.data[0][i]);
                    $fieldwrapper.find("input").datetimepicker({
                      format: "dd.mm.yyyy hh:ii",
                      todayBtn: true,
                      autoclose: true,
                      maskInput: true
                    });
                  } else {
                    $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
                  }
                } else if (editor === "select2" && !isprimary) {
                  if (instance.profile.columns.editability[i].bool()) {
                    refcolumns = instance.profile.columns.refcolumns[i];
                    reference = instance.profile.columns.references[i];
                    returnscolumn = instance.profile.columns.returnscolumn[i];
                    text = instance.data.data[0][i];
                    html = (instance.profile.columns.accommands[i] ? "<input type='hidden' class='select2input field' data-returnscolumn='" + returnscolumn + "'>" : "<input type='hidden' class='select2input field' data-accommand='" + instance.profile.columns.accommands[i] + "' data-accolumn='" + instance.profile.columns.accolumns[i] + "' data-acreturnscolumns='' data-returnscolumn='" + returnscolumn + "'>");
                    $fieldwrapper.html(html);
                    $fieldwrapper.find("input").select2({
                      placeholder: "Нет выбранных значений",
                      allowClear: true,
                      ajax: {
                        url: "/cgi-bin/b2cJ",
                        dataType: "json",
                        data: function(term, page) {
                          var options;
                          options = void 0;
                          options = {
                            command: "get",
                            object: reference,
                            columns: refcolumns,
                            sid: MB.User.sid
                          };
                          if (instance.profile.columns.selectwhere[i]) {
                            options["where"] = instance.profile.columns.selectwhere[i] + " = " + (instance.getfielddata(instance.profile.columns.selectwhere[i]));
                          }
                          return {
                            p_xml: MB.Core.makeQuery(options)
                          };
                        },
                        results: function(data, page) {
                          return {
                            results: MB.Form.parseforselect2data(data)
                          };
                        }
                      }
                    });
                  } else {
                    $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
                  }
                }
                if ((instance.profile.general.prepareInsert.NAMES.indexOf(instance.data.names[i])) > -1) {
                  console.log(instance.profile.general.prepareInsert.DATA[instance.profile.general.prepareInsert.NAMES.indexOf(instance.data.names[i])]);
                  $fieldwrapper.find("input").val(instance.profile.general.prepareInsert.DATA[instance.profile.general.prepareInsert.NAMES.indexOf(instance.data.names[i])]);
                  instance.addingStorage[instance.data.names[i]] = instance.profile.general.prepareInsert.DATA[instance.profile.general.prepareInsert.NAMES.indexOf(instance.data.names[i])];
                  return instance.$container.find(".form-save-button").removeClass("disabled");
                }
              }
            })(i);
            i++;
          }
        } else {
          if (!(instance.$container.find(".id-toggler").find("option[value='new']").length > 0)) {
            selectedrows = instance.$container.find(".id-toggler").html();
            instance.$container.find(".id-toggler").html("<option value='new'>Новый</option>" + selectedrows);
          }
          i = 0;
          l = instance.data.names.length;
          while (i < l) {
            (function(i) {
              var $fieldwrapper, editor, html, isprimary;
              $fieldwrapper = void 0;
              editor = void 0;
              html = void 0;
              isprimary = void 0;
              $fieldwrapper = instance.$container.find(".column-wrapper[data-column='" + instance.data.names[i] + "']");
              isprimary = $fieldwrapper.hasClass("primarykey");
              if ($fieldwrapper.length > 0) {
                editor = instance.profile.columns.editor[i];
                if (editor === "text" && !isprimary) {
                  return $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
                } else if (editor === "number" && !isprimary) {
                  return $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
                } else if (editor === "datetime" && !isprimary) {
                  return $fieldwrapper.html("<input type='text' disabled class='form-control'>");
                } else if (editor === "checkbox" && !isprimary) {
                  if (instance.data.data[0][i].bool()) {
                    html = "<div class='make-switch' data-on-label='<i class=\"fa fa-check icon-white\"></i>' data-off-label='<i class=\"fa fa-times\"></i>'> <input type='checkbox' checked class='toggle'/></div>";
                  } else {
                    html = "<div class='make-switch' data-on-label='<i class=\"fa fa-check icon-white\"></i>' data-off-label='<i class=\"fa fa-times\"></i>'> <input type='checkbox' class='toggle'/></div>";
                  }
                  return $fieldwrapper.html(html);
                } else {
                  if (editor === "select2" && !isprimary) {
                    return $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
                  }
                }
              }
            })(i);
            i++;
          }
        }
      }
      return callback();
    };
    MB.Form.fn.updatecontroller = function(part, callback) {
      var $form, instance;
      $form = void 0;
      instance = void 0;
      instance = this;
      $form = instance.$container;
      if (part === "init") {
        $form.find(".portlet-title").on("click", function(e) {
          var $target;
          $target = void 0;
          $target = $(e.target);
          if ($target.hasClass("reload")) {
            return instance.reload("data");
          }
        });
        $form.find(".make-switch").each(function(i, el) {
          return $(this).on("switch-change", function(e, data) {
            var currentvalue, val;
            currentvalue = void 0;
            val = void 0;
            currentvalue = instance.data.data[0][instance.data.names.indexOf($(this).closest(".column-wrapper").data("column"))];
            val = data.value;
            if (currentvalue.bool() === val) {
              $(this).find("input").removeClass("edited");
              if (instance.$container.find(".edited").length < 1) {
                $form.find(".form-save-button").addClass("disabled");
                return delete instance.editingStorage;
              }
            } else {
              $(this).find("input").addClass("edited");
              return $form.find(".form-save-button").removeClass("disabled");
            }
          });
        });
        $form.find(".select2input").each(function(i, el) {
          return $(this).on("change", function(e) {
            var accolumns, acobject, acreturnscolumns, column, id, o, where;
            accolumns = void 0;
            acobject = void 0;
            acreturnscolumns = void 0;
            column = void 0;
            id = void 0;
            o = void 0;
            where = void 0;
            if ($(this).val()) {
              if ($(this).data("accommand")) {
                acobject = $(this).data("accommand");
                accolumns = $(this).data("accolumns");
                acreturnscolumns = $(this).data("acreturnscolumns").split(",");
                where = $(this).data("returnscolumn") + " = '" + e.val + "'";
                o = {
                  command: "get",
                  object: acobject,
                  sid: MB.User.sid,
                  columns: accolumns,
                  where: where
                };
                MB.Core.sendQuery(o, function(res) {
                  var l, _results;
                  l = void 0;
                  _results = void 0;
                  i = 0;
                  l = acreturnscolumns.length;
                  _results = [];
                  while (i < l) {
                    instance.$container.find("[data-column='" + acreturnscolumns[i] + "'] input").val(res.DATA[0][i]);
                    _results.push(i++);
                  }
                  return _results;
                });
              }
              instance.$container.find("[data-column='" + $(this).data("returnscolumn") + "'] input").val(e.val);
              id = instance.activeId;
              if (instance.addingStorage == null) {
                instance.editingStorage = instance.editingStorage || {};
                if (instance.editingStorage.hasOwnProperty(id)) {
                  column = $(this).data("returnscolumn");
                  instance.editingStorage[id][column] = (e.val === " " ? "" : e.val);
                } else {
                  instance.editingStorage[id] = {
                    command: "modify",
                    object: instance.profile.general.object,
                    sid: MB.User.sid
                  };
                  instance.editingStorage[id]["OBJVERSION"] = $form.find(".column-wrapper[data-column='OBJVERSION']").find("input").val();
                  instance.editingStorage[id][instance.profile.general.primarykey] = id;
                  column = $(this).data("returnscolumn");
                  instance.editingStorage[id][column] = (e.val === " " ? "" : e.val);
                }
                return $form.find(".form-save-button").removeClass("disabled");
              } else {
                column = $(this).data("returnscolumn");
                return instance.addingStorage[column] = e.val;
              }
            } else {
              if (instance.$container.find(".edited").length < 1) {
                $form.find(".form-save-button").addClass("disabled");
                return delete instance.editingStorage;
              } else {
                column = $(this).data("returnscolumn");
                if (instance.editingStorage && instance.editingStorage[instance.activeId][column]) {
                  return delete instance.editingStorage[instance.activeId][column];
                }
              }
            }
          });
        });
        $form.find(".id-toggler").off().on("change", function() {
          var $toggler, val;
          $toggler = void 0;
          val = void 0;
          $toggler = $(this);
          if (instance.addingStorage && instance.$container.find(".edited").length > 0) {
            return bootbox.dialog({
              message: "Вы уверены что хотите перейти к другой записи не сохранив внесенные изменения?",
              title: "Есть не сохраннные изменения",
              buttons: {
                success: {
                  label: "Да",
                  assName: "green",
                  callback: function() {
                    val = void 0;
                    val = $toggler.val();
                    instance.activeId = val;
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
            val = $(this).val();
            instance.activeId = val;
            return instance.reload("data");
          }
        });
        $form.find("input[type='text']").each(function(i, el) {
          return $(el).bind({
            change: function() {
              $form.find(".form-save-button").removeClass("disabled");
              return $(el).addClass("edited");
            },
            keyup: function() {
              $form.find(".form-save-button").removeClass("disabled");
              return $(el).addClass("edited");
            }
          });
        });
        $form.find(".form-create-button").on("click", function(e) {
          $form.find(".form-delete-button").addClass("disabled");
          if (instance.$container.find(".edited").length > 0) {
            return bootbox.dialog({
              message: "Вы уверены что хотите создать еще новую запись не сохранив старую?",
              title: "Есть не сохраннные изменения",
              buttons: {
                success: {
                  label: "Да",
                  assName: "green",
                  callback: function() {
                    instance.addingStorage = {
                      command: "new",
                      object: instance.profile.general.object,
                      sid: MB.User.sid
                    };
                    return instance.updateview("add", function() {
                      return instance.updatecontroller("add", function() {});
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
            instance.addingStorage = {
              command: "new",
              object: instance.profile.general.object,
              sid: MB.User.sid
            };
            return instance.updateview("add", function() {
              return instance.updatecontroller("add", function() {});
            });
          }
        });
        $form.find(".form-delete-button").on("click", function(e) {
          if (instance.ids.length === 1) {
            instance.deletingStorage = {
              command: "remove",
              object: instance.profile.general.object,
              sid: MB.User.sid
            };
            instance.deletingStorage["OBJVERSION"] = $form.find(".column-wrapper[data-column='OBJVERSION']").find("input").val();
            instance.deletingStorage[instance.profile.general.primarykey] = instance.activeId;
            return MB.Core.sendQuery(instance.deletingStorage, function(res) {
              if (parseInt(res.RC) === 0) {
                toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE);
                MB.O.tables[instance.parentobject].reload("data");
                return MB.Modal.closefull();
              }
            });
          } else if (instance.ids.length > 1) {
            if (instance.$container.find(".edited").length > 0) {
              return bootbox.dialog({
                message: "Вы уверены что хотите удалить запись с несохраненными изменениями?",
                title: "Есть не сохраннные изменения",
                buttons: {
                  success: {
                    label: "Да",
                    assName: "green",
                    callback: function() {
                      var removed;
                      removed = void 0;
                      instance.deletingStorage = {
                        command: "remove",
                        object: instance.profile.general.object,
                        sid: MB.User.sid
                      };
                      instance.deletingStorage["OBJVERSION"] = $form.find(".column-wrapper[data-column='OBJVERSION']").find("input").val();
                      instance.deletingStorage[instance.profile.general.primarykey] = instance.activeId;
                      removed = instance.ids.splice(instance.ids.indexOf(instance.activeId), 1);
                      instance.activeId = instance.ids[0];
                      return MB.Core.sendQuery(instance.deletingStorage, function(res) {
                        if (parseInt(res.RC) === 0) {
                          toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE);
                          return instance.reload("data");
                        }
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
              return bootbox.dialog({
                message: "Вы уверены что хотите удалить запись?",
                title: "Удаление",
                buttons: {
                  success: {
                    label: "Да",
                    assName: "green",
                    callback: function() {
                      var removed;
                      removed = void 0;
                      instance.deletingStorage = {
                        command: "remove",
                        object: instance.profile.general.object,
                        sid: MB.User.sid
                      };
                      instance.deletingStorage["OBJVERSION"] = $form.find(".column-wrapper[data-column='OBJVERSION']").find("input").val();
                      instance.deletingStorage[instance.profile.general.primarykey] = instance.activeId;
                      removed = instance.ids.splice(instance.ids.indexOf(instance.activeId), 1);
                      instance.activeId = instance.ids[0];
                      return MB.Core.sendQuery(instance.deletingStorage, function(res) {
                        if (parseInt(res.RC) === 0) {
                          toastr.info(res.MESSAGE, "Информация");
                          return instance.reload("data");
                        }
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
            }
          }
        });
        $form.find(".form-save-button").on("click", function() {
          var id;
          id = void 0;
          id = instance.activeId;
          if (instance.addingStorage === undefined) {
            instance.editingStorage = instance.editingStorage || {};
            if (instance.editingStorage.hasOwnProperty(id)) {
              $(".edited").each(function(i, el) {
                var column, tag, type, val;
                column = void 0;
                tag = void 0;
                type = void 0;
                val = void 0;
                tag = $(el).prop("tagName");
                log(tag);
                log($(el).val());
                if (tag === "INPUT") {
                  type = $(el).attr("type");
                  if (type === "text") {
                    column = $(el).parent().data("column");
                    instance.editingStorage[id][column] = $(el).val();
                  } else if (type === "checkbox") {
                    val = $(el).prop("checked");
                    column = $(el).closest(".column-wrapper").data("column");
                    instance.editingStorage[id][column] = val.toString().toUpperCase();
                  } else if (type === "hidden") {
                    column = $(el).attr("data-returnscolumn");
                    instance.editingStorage[id][column] = $(el).val();
                  }
                }
                return $(el).removeClass("edited");
              });
            } else {
              instance.editingStorage[id] = {
                command: "modify",
                object: instance.profile.general.object,
                sid: MB.User.sid
              };
              instance.editingStorage[id]["OBJVERSION"] = $form.find(".column-wrapper[data-column='OBJVERSION']").find("input").val();
              instance.editingStorage[id][instance.profile.general.primarykey] = id;
              $(".edited").each(function(i, el) {
                var column, tag, type, val;
                column = void 0;
                tag = void 0;
                type = void 0;
                val = void 0;
                tag = $(el).prop("tagName");
                if (tag === "INPUT") {
                  type = $(el).attr("type");
                  if (type === "text") {
                    column = $(el).parent().data("column");
                    instance.editingStorage[id][column] = $(el).val();
                  } else if (type === "checkbox") {
                    val = $(el).prop("checked");
                    column = $(el).closest(".column-wrapper").data("column");
                    instance.editingStorage[id][column] = val.toString().toUpperCase();
                  } else if (type === "hidden") {
                    column = $(el).attr("data-returnscolumn");
                    instance.editingStorage[id][column] = $(el).val();
                  }
                }
                return $(el).removeClass("edited");
              });
            }
            return MB.Core.sendQuery(instance.editingStorage[id], function(res) {
              if (parseInt(res.RC) === 0) {
                toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE);
                delete instance.editingStorage;
                return instance.reload("data");
              }
            });
          } else if (instance.addingStorage) {
            $(".edited").each(function(i, el) {
              var column, tag, type, val;
              column = void 0;
              tag = void 0;
              type = void 0;
              val = void 0;
              tag = $(el).prop("tagName");
              if (tag === "INPUT") {
                type = $(el).attr("type");
                if (type === "text") {
                  column = $(el).parent().data("column");
                  instance.addingStorage[column] = $(el).val();
                } else if (type === "checkbox") {
                  val = $(el).prop("checked");
                  column = $(el).closest(".column-wrapper").data("column");
                  instance.addingStorage[column] = val.toString().toUpperCase();
                }
              }
              return $(el).removeClass("edited");
            });
            return MB.Core.sendQuery(instance.addingStorage, function(res) {
              if (parseInt(res.RC) === 0) {
                toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE);
                delete instance.addingStorage;
                instance.activeId = res.ID;
                instance.ids.push(res.ID);
                return instance.reload("data");
              }
            });
          }
        });
        if (instance.profile.general.custom.bool()) {
          return $.getScript("html/forms/" + instance.name + "/" + instance.name + ".js", function(data, status, xhr) {
            return instance.custom(function() {
              return callback();
            });
          });
        } else {
          return callback();
        }
      } else if (part === "data") {
        $form.find(".form-delete-button").removeClass("disabled");
        $form.find(".make-switch").each(function(i, el) {
          return $(this).on("switch-change", function(e, data) {
            var currentvalue, val;
            currentvalue = void 0;
            val = void 0;
            currentvalue = instance.data.data[0][instance.data.names.indexOf($(this).closest(".column-wrapper").data("column"))];
            val = data.value;
            if (currentvalue.bool() === val) {
              $(this).find("input").removeClass("edited");
              if (instance.$container.find(".edited").length < 1) {
                $form.find(".form-save-button").addClass("disabled");
                return delete instance.editingStorage;
              }
            } else {
              $(this).find("input").addClass("edited");
              return $form.find(".form-save-button").removeClass("disabled");
            }
          });
        });
        $form.find(".id-toggler").off().on("change", function() {
          var $toggler, val;
          $toggler = void 0;
          val = void 0;
          $toggler = $(this);
          if (instance.addingStorage && instance.$container.find(".edited").length > 0) {
            return bootbox.dialog({
              message: "Вы уверены что хотите перейти к другой записи не сохранив внесенные изменения?",
              title: "Есть не сохраннные изменения",
              buttons: {
                success: {
                  label: "Да",
                  assName: "green",
                  callback: function() {
                    val = void 0;
                    val = $toggler.val();
                    instance.activeId = val;
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
            val = $(this).val();
            instance.activeId = val;
            return instance.reload("data");
          }
        });
        $form.find("input[type='text']").each(function(i, el) {
          return $(el).bind({
            change: function() {
              $form.find(".form-save-button").removeClass("disabled");
              return $(el).addClass("edited");
            },
            keyup: function() {
              $form.find(".form-save-button").removeClass("disabled");
              return $(el).addClass("edited");
            }
          });
        });
        $form.find(".select2input").each(function(i, el) {
          return $(this).on("change", function(e) {
            var accolumns, acobject, acreturnscolumns, column, id, o, where;
            accolumns = void 0;
            acobject = void 0;
            acreturnscolumns = void 0;
            column = void 0;
            id = void 0;
            o = void 0;
            where = void 0;
            if ($(this).val()) {
              if ($(this).data("accommand")) {
                acobject = $(this).data("accommand");
                accolumns = $(this).data("accolumns");
                acreturnscolumns = $(this).data("acreturnscolumns").split(",");
                where = $(this).data("returnscolumn") + " = '" + e.val + "'";
                o = {
                  command: "get",
                  object: acobject,
                  sid: MB.User.sid,
                  columns: accolumns,
                  where: where
                };
                MB.Core.sendQuery(o, function(res) {
                  var l, _results;
                  l = void 0;
                  _results = void 0;
                  i = 0;
                  l = acreturnscolumns.length;
                  _results = [];
                  while (i < l) {
                    instance.$container.find("[data-column='" + acreturnscolumns[i] + "'] input").val(res.DATA[0][i]);
                    _results.push(i++);
                  }
                  return _results;
                });
              }
              instance.$container.find("[data-column='" + $(this).data("returnscolumn") + "'] input").val(e.val);
              id = instance.activeId;
              if (instance.addingStorage == null) {
                instance.editingStorage = instance.editingStorage || {};
                if (instance.editingStorage.hasOwnProperty(id)) {
                  column = $(this).data("returnscolumn");
                  instance.editingStorage[id][column] = (e.val === " " ? "" : e.val);
                } else {
                  instance.editingStorage[id] = {
                    command: "modify",
                    object: instance.profile.general.object,
                    sid: MB.User.sid
                  };
                  instance.editingStorage[id]["OBJVERSION"] = $form.find(".column-wrapper[data-column='OBJVERSION']").find("input").val();
                  instance.editingStorage[id][instance.profile.general.primarykey] = id;
                  column = $(this).data("returnscolumn");
                  instance.editingStorage[id][column] = (e.val === " " ? "" : e.val);
                }
                return $form.find(".form-save-button").removeClass("disabled");
              } else {
                column = $(this).data("returnscolumn");
                return instance.addingStorage[column] = e.val;
              }
            } else {
              if (instance.$container.find(".edited").length < 1) {
                $form.find(".form-save-button").addClass("disabled");
                return delete instance.editingStorage;
              } else {
                column = $(this).data("returnscolumn");
                if (instance.editingStorage && instance.editingStorage[instance.activeId][column]) {
                  return delete instance.editingStorage[instance.activeId][column];
                }
              }
            }
          });
        });
        if (instance.profile.general.custom.bool()) {
          return $.getScript("html/forms/" + instance.name + "/" + instance.name + ".js", function(data, status, xhr) {
            return instance.custom(function() {
              return callback();
            });
          });
        } else {
          return callback();
        }
      } else if (part === "add") {
        $form.find(".make-switch").each(function(i, el) {
          return $(this).on("switch-change", function(e, data) {
            var val;
            val = void 0;
            val = data.value;
            $(this).find("input").addClass("edited");
            return $form.find(".form-save-button").removeClass("disabled");
          });
        });
        $form.find("input[type='text']").each(function(i, el) {
          return $(el).bind({
            change: function() {
              $form.find(".form-save-button").removeClass("disabled");
              return $(el).addClass("edited");
            },
            keyup: function() {
              $form.find(".form-save-button").removeClass("disabled");
              return $(el).addClass("edited");
            }
          });
        });
        return $form.find(".select2input").each(function(i, el) {
          return $(this).on("change", function(e) {
            var accolumns, acobject, acreturnscolumns, column, id, o, where;
            accolumns = void 0;
            acobject = void 0;
            acreturnscolumns = void 0;
            column = void 0;
            id = void 0;
            o = void 0;
            where = void 0;
            if ($(this).val()) {
              if ($(this).data("accommand")) {
                acobject = $(this).data("accommand");
                accolumns = $(this).data("accolumns");
                acreturnscolumns = $(this).data("acreturnscolumns").split(",");
                where = $(this).data("returnscolumn") + " = '" + e.val + "'";
                o = {
                  command: "get",
                  object: acobject,
                  sid: MB.User.sid,
                  columns: accolumns,
                  where: where
                };
                MB.Core.sendQuery(o, function(res) {
                  var l, _results;
                  l = void 0;
                  _results = void 0;
                  i = 0;
                  l = acreturnscolumns.length;
                  _results = [];
                  while (i < l) {
                    instance.$container.find("[data-column='" + acreturnscolumns[i] + "'] input").val(res.DATA[0][i]);
                    _results.push(i++);
                  }
                  return _results;
                });
              }
              instance.$container.find("[data-column='" + $(this).data("returnscolumn") + "'] input").val(e.val);
              id = instance.activeId;
              if (instance.addingStorage == null) {
                instance.editingStorage = instance.editingStorage || {};
                if (instance.editingStorage.hasOwnProperty(id)) {
                  column = $(this).data("returnscolumn");
                  instance.editingStorage[id][column] = (e.val === " " ? "" : e.val);
                } else {
                  instance.editingStorage[id] = {
                    command: "modify",
                    object: instance.profile.general.object,
                    sid: MB.User.sid
                  };
                  instance.editingStorage[id]["OBJVERSION"] = $form.find(".column-wrapper[data-column='OBJVERSION']").find("input").val();
                  instance.editingStorage[id][instance.profile.general.primarykey] = id;
                  column = $(this).data("returnscolumn");
                  instance.editingStorage[id][column] = (e.val === " " ? "" : e.val);
                }
                return $form.find(".form-save-button").removeClass("disabled");
              } else {
                column = $(this).data("returnscolumn");
                return instance.addingStorage[column] = e.val;
              }
            } else {
              if (instance.$container.find(".edited").length < 1) {
                $form.find(".form-save-button").addClass("disabled");
                return delete instance.editingStorage;
              } else {
                column = $(this).data("returnscolumn");
                if (instance.editingStorage && instance.editingStorage[instance.activeId][column]) {
                  return delete instance.editingStorage[instance.activeId][column];
                }
              }
            }
          });
        });
      }
    };
    MB.Form.fn.reload = function(part) {
      var instance;
      log(part);
      instance = void 0;
      instance = this;
      if (part === "data") {
        instance.getdata(instance.activeId, function(res) {
          return instance.updatemodel("data", res, function() {
            return instance.updateview("data", function() {
              return instance.updatecontroller("data", function() {});
            });
          });
        });
      }
      if (part === "init") {
        return instance.getdata(instance.activeId, function(res) {
          return instance.updatemodel("init", res, function() {
            return instance.updateview("init", function() {
              return instance.updatecontroller("init", function() {});
            });
          });
        });
      }
    };
    MB.Form.fn.init = function() {
      var instance;
      instance = void 0;
      instance = this;
      return instance.loadhtml(function() {
        return instance.getdata(instance.activeId, function(res) {
          instance.updatemodel(res);
          instance.updateview("form");
          return instance.updatecontroller();
        });
      });
    };
    MB.Form.fn.createmodallistitem = function() {
      var instance;
      instance = void 0;
      instance = this;
      return $(".modals-list").append("<li data-type='form' data-object='" + instance.name + "'><i class='cross fa fa-times-circle'></i>" + instance.profile.general.objectname + "</li>");
    };
    return MB.Form.fn.showit = function(init) {
      var instance, query;
      instance = void 0;
      query = void 0;
      instance = this;
      query = "#modal_" + MB.User.activemodal + "_wrapper";
      $(query).hide();
      query = "#modal_" + instance.name + "_wrapper";
      $(query).show();
      if (init) {
        instance.createmodallistitem();
      }
      MB.User.activemodal = instance.name;
      return MB.User.loadedmodals.push(instance.name);
    };
  }).call(this);

}).call(this);
