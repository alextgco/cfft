(function() {
  var MB;

  MB = MB || {};

  MB.Form = function(options) {
    var instance, key, _results;
    instance = this;
    instance.name = options.name || MB.Core.guid();
    instance.world = options.world || "modal";
    instance.ids = options.ids;
    instance.activeId = options.ids[0];
    if (options.params) {
      _results = [];
      for (key in options.params) {
        _results.push(instance[key] = options.params[key]);
      }
      return _results;
    }
  };

  MB.Form.parseprofile = function(data, callback) {
    var i, ii, key, l, ll, parsedprofile;
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
    instance = this;
    return instance.$container.find("[data-column='" + field + "'] input").val();
  };

  MB.Form.fn.hidecontrols = function() {
    var instance;
    instance = this;
    return instance.$container.find(".control-buttons").hide();
  };

  MB.Form.fn.showcontrols = function() {
    var instance;
    instance = this;
    return instance.$container.find(".control-buttons").show();
  };

  MB.Form.fn.makedir = function(callback) {
    var instance;
    instance = this;
    MB.O.forms[instance.name] = instance;
    return callback();
  };

  MB.Form.fn.makecontainer = function(callback) {
    var $container, $worldcontainer, instance;
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
    instance = this;
    html = "";
    html += "<div class='row'><div class='col-md-12'><div class='portlet box grey'><div class='form-portlet-title portlet-title'><div class='caption'><i class='fa fa-reorder'></i><span><span></div><div class='tools'><a href='javascript:;' class='reload'></a></div><div class='actions'><a href='#' class='btn blue btn-sm'><i class='fa fa-plus icon-black'></i> Создать</a><a href='#' class='btn default btn-sm'><i class='fa fa-copy icon-black'></i> Дублировать</a><a href='#' class='btn green btn-sm'><i class='fa fa-save icon-black'></i> Сохранить</a><a href='#' class='btn red btn-sm'><i class='fa fa-times icon-black'></i> Удалить</a></div></div><div class='portlet-body'></div></div></div></div><div class='row'><div class='col-md-12'>";
    html += "<div class='btn-group control-buttons btn-group-solid'>";
    html += (instance.profile.general.newcommand.bool() ? "<button type='button' class='btn blue form-create-button'><i class='fa fa-plus'></i> Создать</button>" : "<button type='button' disabled class='btn disabled blue form-create-button'><i class='fa fa-plus'></i> Создать</button>");
    html += "<button type='button' class='btn default form-duplicate-button'><i class='fa fa-copy'></i>  Дублировать</button>";
    html += "<button type='button' class='btn green form-save-button'><i class='fa fa-save'></i>  Сохранить</button>";
    html += (instance.profile.general.removecommand.bool() ? "<button type='button' class='btn red form-delete-button'><i class='fa fa-times'></i> Удалить</button>" : "<button type='button' disabled class='btn red disabled form-delete-button'><i class='fa fa-minus'></i> Удалить</button>");
    html += "</div></div></div>";
    instance.$container.html(html);
    return callback();
  };

  MB.Form.fn.loadhtml = function(callback) {
    var instance, url;
    instance = this;
    url = "html/forms/" + instance.name + "/" + instance.name + ".html";
    instance.url = url;
    return instance.$container.find(".portlet-body").load(url, function(res, status, xhr) {
      return callback();
    });
  };

  MB.Form.fn.getprofile = function(callback) {
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

  MB.Form.fn.getdata = function(id, callback) {
    var instance, o;
    instance = this;
    o = {
      command: "get",
      object: instance.profile.general.object,
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
    instance = this;
    instance.profile = {};
    instance.profile.general = {};
    instance.profile.columns = {};
    instance.profile.general.rowsmaxnum = parsedprofile.ROWS_MAX_NUM;
    instance.profile.general.primarykey = parsedprofile.PRIMARY_KEY;
    instance.profile.general.orderby = parsedprofile.DEFAULT_ORDER_BY;
    instance.profile.general.object = parsedprofile.OBJECT_COMMAND;
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
    instance.profile.columns.returnscolumn = parsedprofile.LOV_RETURN_COLUMN;
    instance.profile.columns.refcolumns = parsedprofile.LOV_COLUMNS;
    instance.profile.columns.references = parsedprofile.LOV_COMMAND;
    instance.profile.columns.selectwhere = parsedprofile.LOV_WHERE;
    return callback();
  };

  MB.Form.fn.distributedata = function(data, callback) {
    var instance;
    instance = this;
    instance.data = {};
    instance.data.data = data.DATA;
    instance.data.names = data.NAMES;
    instance.data.info = data.INFO;
    return callback();
  };

  MB.Form.fn.updatemodel = function(part, data, callback) {
    var instance;
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
    instance = this;
    if (part === "init") {
      if (instance.profile.general.modifycommand.bool()) {
        i = 0;
        l = instance.data.names.length;
        while (i < l) {
          (function(i) {
            var $fieldwrapper, active, editor, html, i2, isprimary, l2, refcolumns, reference, returnscolumn, text, ticketstatus;
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
                html = "<div class='make-switch' data-on-label='<i class=\"fa fa-check icon-white\"></i>' data-off-label='<i class=\"fa fa-times\"></i>'> <input type='checkbox' checked class='toggle'/></div>";
                return $fieldwrapper.html(html);
              } else if (editor === "number" && !isprimary) {
                if (instance.profile.columns.editability[i].bool()) {
                  $fieldwrapper.html("<input type='text' class='form-control field'>");
                } else {
                  $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
                }
                return $fieldwrapper.find("input").val(instance.data.data[0][i]);
              } else if (editor === "datetime" && !isprimary) {
                if (instance.profile.columns.editability[i].bool()) {
                  $fieldwrapper.html("<input type='text' readonly class='form-control field'>");
                  $fieldwrapper.find("input").val(instance.data.data[0][i]);
                  return $fieldwrapper.find("input").datetimepicker({
                    format: "dd.mm.yyyy hh.ii.00",
                    todayBtn: true,
                    autoclose: true
                  });
                } else {
                  $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
                  $fieldwrapper.find("input").val(instance.data.data[0][i]);
                  return ticketstatus = ($(options.$trigger[0]).find("[data-column='STATUS'] a").length > 0 ? $(options.$trigger[0]).find("[data-column='STATUS'] a").text() : $(options.$trigger[0]).find("[data-column='STATUS']").text());
                }
              } else if (editor === "select2" && !isprimary) {
                if (instance.profile.columns.editability[i].bool()) {
                  refcolumns = instance.profile.columns.refcolumns[i];
                  reference = instance.profile.columns.references[i];
                  returnscolumn = instance.profile.columns.returnscolumn[i];
                  text = instance.data.data[0][i];
                  $fieldwrapper.html("<input type='hidden' class='select2input field' data-returnscolumn='" + returnscolumn + "'>");
                  return $fieldwrapper.find("input").select2({
                    placeholder: text,
                    ajax: {
                      url: "http://192.168.1.101/cgi-bin/b2cJ",
                      dataType: "json",
                      data: function(term, page) {
                        var options;
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
                          results: MB.Table.parseforselect2data(data)
                        };
                      }
                    }
                  });
                } else {
                  $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
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
                  if (instance.ids[i2] === instance.activeId) {
                    active += "<option value='" + instance.ids[i2] + "'>" + instance.ids[i2] + "</option>";
                  } else {
                    html += "<option value='" + instance.ids[i2] + "'>" + instance.ids[i2] + "</option>";
                  }
                  i2++;
                }
                return $fieldwrapper.find("select").html(active + html);
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
      if (instance.profile.general.modifycommand.bool()) {
        i = 0;
        l = instance.data.names.length;
        while (i < l) {
          (function(i) {
            var $fieldwrapper, active, editor, html, i2, isprimary, l2, refcolumns, reference, returnscolumn, text;
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
              } else if (editor === "number" && !isprimary) {
                if (instance.profile.columns.editability[i].bool()) {
                  $fieldwrapper.html("<input type='text' class='form-control field'>");
                } else {
                  $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
                }
                return $fieldwrapper.find("input").val(instance.data.data[0][i]);
              } else if (editor === "datetime" && !isprimary) {
                if (instance.profile.columns.editability[i].bool()) {
                  $fieldwrapper.html("<input type='text' readonly class='form-control field'>");
                  $fieldwrapper.find("input").val(instance.data.data[0][i]);
                  return $fieldwrapper.find("input").datetimepicker({
                    format: "dd.mm.yyyy hh.ii.00",
                    todayBtn: true,
                    autoclose: true
                  });
                } else {
                  $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
                  return $fieldwrapper.find("input").val(instance.data.data[0][i]);
                }
              } else if (editor === "select2" && !isprimary) {
                if (instance.profile.columns.editability[i].bool()) {
                  $fieldwrapper.find("input").val(instance.data.data[0][i]);
                  refcolumns = instance.profile.columns.refcolumns[i];
                  reference = instance.profile.columns.references[i];
                  returnscolumn = instance.profile.columns.returnscolumn[i];
                  text = instance.data.data[0][i];
                  $fieldwrapper.html("<input type='hidden' class='select2input field' data-returnscolumn='" + returnscolumn + "'>");
                  return $fieldwrapper.find("input").select2({
                    placeholder: text,
                    ajax: {
                      url: "http://192.168.1.101/cgi-bin/b2cJ",
                      dataType: "json",
                      data: function(term, page) {
                        var options;
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
                          results: MB.Table.parseforselect2data(data)
                        };
                      }
                    }
                  });
                } else {
                  $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
                  return $fieldwrapper.find("input").val(instance.data.data[0][i]);
                }
              } else if (isprimary) {
                $fieldwrapper.html("<select class='id-toggler form-control'></select>");
                html = "";
                active = "";
                i2 = 0;
                l2 = instance.ids.length;
                while (i2 < l2) {
                  if (instance.ids[i2] === instance.activeId) {
                    active += "<option value='" + instance.ids[i2] + "'>" + instance.ids[i2] + "</option>";
                  } else {
                    html += "<option value='" + instance.ids[i2] + "'>" + instance.ids[i2] + "</option>";
                  }
                  i2++;
                }
                return $fieldwrapper.find("select").html(active + html);
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
      } else {
        i = 0;
        l = instance.data.names.length;
        while (i < l) {
          (function(i) {
            var $fieldwrapper, active, editor, html, i2, isprimary, l2;
            $fieldwrapper = instance.$container.find(".column-wrapper[data-column='" + instance.data.names[i] + "']");
            isprimary = $fieldwrapper.hasClass("primarykey");
            if ($fieldwrapper.length > 0) {
              editor = instance.profile.columns.editor[i];
              if (editor === "text" && !isprimary) {
                $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
                return $fieldwrapper.find("input").val(instance.data.data[0][i]);
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
                  if (instance.ids[i2] === instance.activeId) {
                    active += "<option value='" + instance.ids[i2] + "'>" + instance.ids[i2] + "</option>";
                  } else {
                    html += "<option value='" + instance.ids[i2] + "'>" + instance.ids[i2] + "</option>";
                  }
                  i2++;
                }
                return $fieldwrapper.find("select").html(active + html);
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
      }
    } else if (part === "add") {
      if (instance.profile.general.modifycommand.bool()) {
        if (!(instance.$container.find(".id-toggler").find("option[value='new']").length > 0)) {
          selectedrows = instance.$container.find(".id-toggler").html();
          instance.$container.find(".id-toggler").html("<option value='new'>Новый</option>" + selectedrows);
        }
        i = 0;
        l = instance.data.names.length;
        while (i < l) {
          (function(i) {
            var $fieldwrapper, editor, isprimary, refcolumns, reference, returnscolumn, text;
            $fieldwrapper = instance.$container.find(".column-wrapper[data-column='" + instance.data.names[i] + "']");
            isprimary = $fieldwrapper.hasClass("primarykey");
            if ($fieldwrapper.length > 0) {
              editor = instance.profile.columns.editor[i];
              if (editor === "text" && !isprimary) {
                if (instance.profile.columns.editability[i].bool()) {
                  return $fieldwrapper.html("<input type='text' class='form-control field'>");
                } else {
                  return $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
                }
              } else if (editor === "number" && !isprimary) {
                if (instance.profile.columns.editability[i].bool()) {
                  return $fieldwrapper.html("<input type='text' class='form-control field'>");
                } else {
                  return $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
                }
              } else if (editor === "datetime" && !isprimary) {
                if (instance.profile.columns.editability[i].bool()) {
                  $fieldwrapper.html("<input type='text' readonly class='form-control field'>");
                  $fieldwrapper.find("input").val(instance.data.data[0][i]);
                  return $fieldwrapper.find("input").datetimepicker({
                    format: "dd.mm.yyyy hh.ii.00",
                    todayBtn: true,
                    autoclose: true
                  });
                } else {
                  return $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
                }
              } else if (editor === "select2" && !isprimary) {
                if (instance.profile.columns.editability[i].bool()) {
                  refcolumns = instance.profile.columns.refcolumns[i];
                  reference = instance.profile.columns.references[i];
                  returnscolumn = instance.profile.columns.returnscolumn[i];
                  text = instance.data.data[0][i];
                  $fieldwrapper.html("<input type='hidden' class='select2input field' data-returnscolumn='" + returnscolumn + "'>");
                  return $fieldwrapper.find("input").select2({
                    placeholder: "Нет выбранных значений",
                    ajax: {
                      url: "http://192.168.1.101/cgi-bin/b2cJ",
                      dataType: "json",
                      data: function(term, page) {
                        var options;
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
                          results: MB.Table.parseforselect2data(data)
                        };
                      }
                    }
                  });
                } else {
                  return $fieldwrapper.html("<input type='text' disabled class='form-control field'>");
                }
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
            var $fieldwrapper, editor, isprimary;
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
    instance = this;
    $form = instance.$container;
    if (part === "init") {
      $form.find(".portlet-title").on("click", function(e) {
        var $target;
        $target = $(e.target);
        if ($target.hasClass("reload")) {
          return instance.reload("data");
        }
      });
      $(".select2input").each(function(i, el) {
        return $(this).on("change", function(e) {
          var column, id;
          instance.$container.find("[data-column='" + $(this).data("returnscolumn") + "'] input").val(e.val);
          $(this).addClass("edited");
          id = instance.activeId;
          if (instance.addingStorage === undefined) {
            instance.editingStorage = instance.editingStorage || {};
            if (instance.editingStorage.hasOwnProperty(id)) {
              column = $(this).data("returnscolumn");
              instance.editingStorage[id][column] = e.val;
            } else {
              instance.editingStorage[id] = {
                command: "modify",
                object: instance.profile.general.object,
                sid: MB.User.sid
              };
              instance.editingStorage[id]["OBJVERSION"] = $form.find(".column-wrapper[data-column='OBJVERSION']").find("input").val();
              instance.editingStorage[id][instance.profile.general.primarykey] = id;
              column = $(this).data("returnscolumn");
              instance.editingStorage[id][column] = e.val;
            }
            return $form.find(".form-save-button").removeClass("disabled");
          } else {
            column = $(this).data("returnscolumn");
            return instance.addingStorage[column] = e.val;
          }
        });
      });
      $form.find(".id-toggler").off().on("change", function() {
        var $toggler, val;
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
                  var val;
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
              toastr.info("Запись создана удалена", res.MESSAGE);
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
                        toastr.info("Запись создана удалена", res.MESSAGE);
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
                        toastr.info("Запись создана удалена", res.MESSAGE);
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
        id = instance.activeId;
        if (instance.addingStorage === undefined) {
          instance.editingStorage = instance.editingStorage || {};
          if (instance.editingStorage.hasOwnProperty(id)) {
            $(".edited").each(function(i, el) {
              var column, tag;
              tag = $(el).prop("tagName");
              if (tag === "INPUT") {
                column = $(el).parent().data("column");
                instance.editingStorage[id][column] = $(el).val();
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
              var column, tag;
              tag = $(el).prop("tagName");
              if (tag === "INPUT") {
                column = $(el).parent().data("column");
                instance.editingStorage[id][column] = $(el).val();
              }
              return $(el).removeClass("edited");
            });
          }
          return MB.Core.sendQuery(instance.editingStorage[id], function(res) {
            if (parseInt(res.RC) === 0) {
              toastr.success("Данные успешно изменены", res.MESSAGE);
              delete instance.editingStorage;
              return instance.reload("data");
            }
          });
        } else if (instance.addingStorage) {
          $(".edited").each(function(i, el) {
            var column, tag;
            tag = $(el).prop("tagName");
            if (tag === "INPUT") {
              column = $(el).parent().data("column");
              instance.addingStorage[column] = $(el).val();
            }
            return $(el).removeClass("edited");
          });
          return MB.Core.sendQuery(instance.addingStorage, function(res) {
            if (parseInt(res.RC) === 0) {
              toastr.success(res.MESSAGE, "ОК");
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
      $form.find(".id-toggler").off().on("change", function() {
        var $toggler, val;
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
                  var val;
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
          var column, id;
          instance.$container.find("[data-column='" + $(this).data("returnscolumn") + "'] input").val(e.val);
          $(this).addClass("edited");
          id = instance.activeId;
          instance.editingStorage = instance.editingStorage || {};
          if (instance.editingStorage.hasOwnProperty(id)) {
            column = $(this).data("returnscolumn");
            instance.editingStorage[id][column] = e.val;
          } else {
            instance.editingStorage[id] = {
              command: "modify",
              object: instance.profile.general.object,
              sid: MB.User.sid
            };
            instance.editingStorage[id]["OBJVERSION"] = $form.find(".column-wrapper[data-column='OBJVERSION']").find("input").val();
            instance.editingStorage[id][instance.profile.general.primarykey] = id;
            column = $(this).data("returnscolumn");
            instance.editingStorage[id][column] = e.val;
          }
          return $form.find(".form-save-button").removeClass("disabled");
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
          var column;
          instance.$container.find("[data-column='" + $(this).data("returnscolumn") + "'] input").val(e.val);
          $(this).addClass("edited");
          column = $(this).data("returnscolumn");
          instance.addingStorage[column] = e.val;
          return $form.find(".form-save-button").removeClass("disabled");
        });
      });
    }
  };

  MB.Form.fn.reload = function(part) {
    var instance;
    instance = this;
    if (part === "data") {
      return instance.getdata(instance.activeId, function(res) {
        return instance.updatemodel("data", res, function() {
          return instance.updateview("data", function() {
            return instance.updatecontroller("data", function() {});
          });
        });
      });
    }
  };

  MB.Form.fn.init = function() {
    var instance;
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
    instance = this;
    return $(".modals-list").append("<li data-type='form' data-object='" + instance.name + "'><i class='cross fa fa-times-circle'></i>" + instance.profile.general.objectname + "</li>");
  };

  MB.Form.fn.showit = function(init) {
    var instance, query;
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
