(->
  MB = undefined
  MB = window.MB
  MB = MB or {}
  MB.Form = (options) ->
    instance = undefined
    key = undefined
    instance = this
    instance.name = options.name or MB.Core.guid()
    instance.world = options.world or "modal"
    instance.ids = options.ids
    instance.activeId = options.ids[0]
    if options.params
      for key of options.params
        instance[key] = options.params[key]
    return

  MB.Form.parseprofile = (data, callback) ->
    i = undefined
    ii = undefined
    key = undefined
    l = undefined
    ll = undefined
    parsedprofile = undefined
    parsedprofile = {}
    for key of data.OBJECT_PROFILE
      parsedprofile[key] = data.OBJECT_PROFILE[key]
    i = 0
    l = data.NAMES.length
    while i < l
      parsedprofile[data.NAMES[i]] = []
      ii = 0
      ll = data.DATA.length
      while ii < ll
        parsedprofile[data.NAMES[i]].push data.DATA[ii][i]
        ii++
      i++
    callback parsedprofile

  MB.Form.parseforselect2data = (res, option) ->
    data = undefined
    i = undefined
    value = undefined
    _i = undefined
    _len = undefined
    _ref = undefined
    data = []
    if res.NAMES.length isnt 2
      console.log "В parseforselect2data приходит не 2 колонки!"
    else
      _ref = res.DATA
      i = _i = 0
      _len = _ref.length
      while _i < _len
        value = _ref[i]
        data.push
          id: res.DATA[i][0]
          text: res.DATA[i][1]

        i = ++_i
    if (option?) and option is "empty"
      data.unshift
        id: " "
        text: "Empty value"

    data

  MB.Form.hasloaded = (name) ->
    MB.O.forms.hasOwnProperty name

  MB.Form.find = (name) ->
    MB.O.forms[name]

  MB.Form.fn = MB.Form::
  MB.Form.fn.parent = MB.Form::constructor
  MB.Form.fn.getfielddata = (field) ->
    instance = undefined
    instance = this
    instance.$container.find("[data-column='" + field + "'] input").val()

  MB.Form.fn.hidecontrols = ->
    instance = undefined
    instance = this
    instance.$container.find(".control-buttons").hide()

  MB.Form.fn.showcontrols = ->
    instance = undefined
    instance = this
    instance.$container.find(".control-buttons").show()

  MB.Form.fn.makedir = (callback) ->
    instance = undefined
    instance = this
    MB.O.forms[instance.name] = instance
    callback()

  MB.Form.fn.makecontainer = (callback) ->
    $container = undefined
    $worldcontainer = undefined
    instance = undefined
    instance = this
    $worldcontainer = $("." + instance.world + "-content-wrapper")
    $container = $("<div id='" + instance.world + "_" + instance.name + "_wrapper' class='" + instance.world + "-item'></div>")
    $worldcontainer.append $container
    instance.$worldcontainer = $worldcontainer
    instance.$container = $container
    callback()

  MB.Form.fn.makeportletcontainer = (callback) ->
    html = undefined
    instance = undefined
    instance = this
    html = ""
    html += "<div class='row'><div class='col-md-12'><div class='portlet box grey'><div class='form-portlet-title portlet-title'><a href='#' class='bt-menu-trigger'><span>Menu</span></a><div class='caption'><i class='fa fa-reorder'></i><span></span></div>"
    html += "<div class='actions'>"
    html += ((if instance.profile.general.newcommand.bool() then "<button type='button' class='btn blue form-create-button'><i class='fa fa-plus'></i> Создать</button>" else ""))
    html += ((if instance.profile.general.newcommand.bool() then "<button type='button' class='btn btn-primary form-create-button'><i class='fa fa-copy'></i> Дублировать</button>" else ""))
    html += ((if instance.profile.general.newcommand.bool() or instance.profile.general.modifycommand.bool() then "<button type='button' class='btn green form-save-button'><i class='fa fa-save'></i> Сохранить</button>" else ""))
    html += ((if instance.profile.general.removecommand.bool() then "<button type='button' class='btn red form-delete-button'><i class='fa fa-times'></i> Удалить</button>" else ""))
    html += "<button class=\"btn dark tools reload\" style=\"margin-left: 15px;\"><i class=\"fa fa-refresh reload\"></i></button>"
    html += "</div></div><div class='portlet-body'></div></div></div></div><div class='row'><div class='col-md-12'>"
    html += "<div class='btn-group control-buttons btn-group-solid'>"
    html += "</div></div></div>"
    instance.$container.html html
    borderMenu()
    callback()

  MB.Form.fn.loadhtml = (callback) ->
    instance = undefined
    url = undefined
    instance = this
    url = "html/forms/" + instance.name + "/" + instance.name + ".html"
    instance.url = url
    instance.$container.find(".portlet-body").load url, (res, status, xhr) ->
      callback()


  MB.Form.fn.getprofile = (callback) ->
    instance = undefined
    o = undefined
    instance = this
    o =
      command: "get"
      object: "user_object_profile"
      client_object: instance.name
      sid: MB.User.sid

    MB.Core.sendQuery o, (res) ->
      callback res


  MB.Form.fn.getdata = (id, callback) ->
    instance = undefined
    o = undefined
    instance = this
    o =
      command: "get"
      object: instance.profile.general.getobject
      where: instance.profile.general.primarykey + " = " + "'" + id + "'"
      order_by: instance.profile.general.orderby
      client_object: instance.name
      rows_max_num: instance.profile.general.rowsmaxnum
      page_no: instance.profile.general.pageno
      sid: MB.User.sid

    MB.Core.sendQuery o, (res) ->
      callback res


  MB.Form.fn.distributeprofile = (parsedprofile, callback) ->
    instance = undefined
    instance = this
    instance.profile = {}
    instance.profile.general = {}
    instance.profile.columns = {}
    instance.profile.general.prepareInsert = parsedprofile.PREPARE_INSERT
    instance.profile.general.rowsmaxnum = parsedprofile.ROWS_MAX_NUM
    instance.profile.general.primarykey = parsedprofile.PRIMARY_KEY
    instance.profile.general.orderby = parsedprofile.DEFAULT_ORDER_BY
    instance.profile.general.object = parsedprofile.OBJECT_COMMAND
    instance.profile.general.getobject = parsedprofile.GET_OBJECT_COMMAND
    instance.profile.general.childobject = parsedprofile.CHILD_CLIENT_OBJECT
    instance.profile.general.objectname = parsedprofile.CLIENT_OBJECT_NAME
    instance.profile.general.where = parsedprofile.DEFAULT_WHERE
    instance.profile.general.newcommand = parsedprofile.NEW_COMMAND
    instance.profile.general.removecommand = parsedprofile.REMOVE_COMMAND
    instance.profile.general.modifycommand = parsedprofile.MODIFY_COMMAND
    instance.profile.general.pageno = 1
    instance.profile.general.custom = parsedprofile.ADDITIONAL_FUNCTIONALITY
    instance.profile.columns.align = parsedprofile.ALIGN
    instance.profile.columns.clientnames = parsedprofile.NAME
    instance.profile.columns.columnsdb = parsedprofile.COLUMN_NAME
    instance.profile.columns.editability = parsedprofile.EDITABLE
    instance.profile.columns.editor = parsedprofile.TYPE_OF_EDITOR
    instance.profile.columns.visibility = parsedprofile.VISIBLE
    instance.profile.columns.width = parsedprofile.WIDTH
    instance.profile.columns.refclientobj = parsedprofile.REFERENCE_CLIENT_OBJECT
    instance.profile.columns.returnscolumn = parsedprofile.LOV_RETURN_TO_COLUMN
    instance.profile.columns.refcolumns = parsedprofile.LOV_COLUMNS
    instance.profile.columns.references = parsedprofile.LOV_COMMAND
    instance.profile.columns.selectwhere = parsedprofile.LOV_WHERE
    instance.profile.columns.acwhere = parsedprofile.AC_WHERE
    instance.profile.columns.acreturnscolumns = parsedprofile.AC_RETURN_TO_COLUMN
    instance.profile.columns.accolumns = parsedprofile.AC_COLUMNS
    instance.profile.columns.accommands = parsedprofile.AC_COMMAND
    callback()

  MB.Form.fn.distributedata = (data, callback) ->
    instance = undefined
    instance = this
    instance.data = {}
    instance.data.data = data.DATA
    instance.data.names = data.NAMES
    instance.data.info = data.INFO
    callback()

  MB.Form.fn.updatemodel = (part, data, callback) ->
    instance = undefined
    instance = this
    if part is "profile"
      MB.Form.parseprofile data, (parsedprofile) ->
        instance.distributeprofile parsedprofile, ->
          callback()


    else if part is "data"
      instance.distributedata data, ->
        callback()


  MB.Form.fn.create = (callback) ->
    instance = undefined
    instance = this
    instance.makedir ->
      instance.getprofile (res) ->
        instance.updatemodel "profile", res, ->
          instance.getdata instance.activeId, (res) ->
            instance.updatemodel "data", res, ->
              instance.makecontainer ->
                instance.makeportletcontainer ->
                  instance.loadhtml ->
                    instance.updateview "init", ->
                      instance.updatecontroller "init", ->
                        callback()











  MB.Form.fn.updateview = (part, callback) ->
    i = undefined
    instance = undefined
    l = undefined
    selectedrows = undefined
    table = undefined
    instance = this
    if part is "init"
      if instance.profile.general.modifycommand.bool()
        i = 0
        l = instance.data.names.length
        while i < l
          ((i) ->
            $fieldwrapper = undefined
            active = undefined
            editor = undefined
            html = undefined
            i2 = undefined
            isprimary = undefined
            l2 = undefined
            refcolumns = undefined
            reference = undefined
            returnscolumn = undefined
            text = undefined
            $fieldwrapper = instance.$container.find(".column-wrapper[data-column='" + instance.data.names[i] + "']")
            isprimary = $fieldwrapper.hasClass("primarykey")
            if $fieldwrapper.length > 0
              editor = instance.profile.columns.editor[i]
              if editor is "text" and not isprimary
                if instance.profile.columns.editability[i].bool()
                  $fieldwrapper.html "<input type='text' class='form-control field'>"
                else
                  $fieldwrapper.html "<input type='text' disabled class='form-control field'>"
                $fieldwrapper.find("input").val instance.data.data[0][i]
              else if editor is "checkbox" and not isprimary
                if instance.profile.columns.editability[i].bool()
                  if instance.data.data[0][i].bool()
                    html = "<div class='make-switch' data-on-label='<i class=\"fa fa-check icon-white\"></i>' data-off-label='<i class=\"fa fa-times\"></i>'> <input type='checkbox' checked class='toggle'/></div>"
                  else
                    html = "<div class='make-switch' data-on-label='<i class=\"fa fa-check icon-white\"></i>' data-off-label='<i class=\"fa fa-times\"></i>'> <input type='checkbox' class='toggle'/></div>"
                  $fieldwrapper.html html
                  $fieldwrapper.find(".make-switch")["bootstrapSwitch"]()
                else
                  if instance.data.data[0][i].bool()
                    html = "<div class='make-switch' data-on-label='<i class=\"fa fa-check icon-white\"></i>' data-off-label='<i class=\"fa fa-times\"></i>'> <input type='checkbox' checked class='toggle'/></div>"
                  else
                    html = "<div class='make-switch' data-on-label='<i class=\"fa fa-check icon-white\"></i>' data-off-label='<i class=\"fa fa-times\"></i>'> <input type='checkbox' class='toggle'/></div>"
                  $fieldwrapper.html html
              else if editor is "number" and not isprimary
                if instance.profile.columns.editability[i].bool()
                  $fieldwrapper.html "<input type='text' class='form-control field'>"
                else
                  $fieldwrapper.html "<input type='text' disabled class='form-control field'>"
                $fieldwrapper.find("input").val instance.data.data[0][i]
              else if editor is "datetime" and not isprimary
                if instance.profile.columns.editability[i].bool()
                  $fieldwrapper.html "<input type='text' readonly class='form-control field'>"
                  $fieldwrapper.find("input").val instance.data.data[0][i]
                  $fieldwrapper.find("input").datetimepicker
                    format: "dd.mm.yyyy hh.ii.00"
                    todayBtn: true
                    autoclose: true

                else
                  $fieldwrapper.html "<input type='text' disabled class='form-control field'>"
                  $fieldwrapper.find("input").val instance.data.data[0][i]
              else if editor is "select2" and not isprimary
                if instance.profile.columns.editability[i].bool()
                  refcolumns = instance.profile.columns.refcolumns[i]
                  reference = instance.profile.columns.references[i]
                  returnscolumn = instance.profile.columns.returnscolumn[i]
                  text = instance.data.data[0][i]
                  html = ((if instance.profile.columns.accommands[i] then "<input type='hidden' class='select2input field' data-accommand='" + instance.profile.columns.accommands[i] + "' data-accolumns='" + instance.profile.columns.accolumns[i] + "' data-acreturnscolumns='" + instance.profile.columns.acreturnscolumns[i] + "' data-returnscolumn='" + returnscolumn + "'>" else "<input type='hidden' class='select2input field' data-returnscolumn='" + returnscolumn + "'>"))
                  $fieldwrapper.html html
                  $fieldwrapper.find("input").select2
                    placeholder: text
                    allowClear: true
                    ajax:
                      url: "/cgi-bin/b2cJ"
                      dataType: "json"
                      data: (term, page) ->
                        options = undefined
                        options =
                          command: "get"
                          object: reference
                          columns: refcolumns
                          sid: MB.User.sid

                        options["where"] = instance.profile.columns.selectwhere[i] + " = " + (instance.getfielddata(instance.profile.columns.selectwhere[i]))  if instance.profile.columns.selectwhere[i]
                        p_xml: MB.Core.makeQuery(options)

                      results: (data, page) ->
                        results: MB.Form.parseforselect2data(data)

                else
                  $fieldwrapper.html "<input type='text' disabled class='form-control field'>"
              else if editor is "select2withEmptyValue" and not isprimary
                if instance.profile.columns.editability[i].bool()
                  refcolumns = instance.profile.columns.refcolumns[i]
                  reference = instance.profile.columns.references[i]
                  returnscolumn = instance.profile.columns.returnscolumn[i]
                  text = instance.data.data[0][i]
                  html = ((if instance.profile.columns.accommands[i] then "<input type='hidden' class='select2input field' data-accommand='" + instance.profile.columns.accommands[i] + "' data-accolumns='" + instance.profile.columns.accolumns[i] + "' data-acreturnscolumns='" + instance.profile.columns.acreturnscolumns[i] + "' data-returnscolumn='" + returnscolumn + "'>" else "<input type='hidden' class='select2input field' data-returnscolumn='" + returnscolumn + "'>"))
                  $fieldwrapper.html html
                  $fieldwrapper.find("input").select2
                    placeholder: text
                    allowClear: true
                    matcher: (term, text, option) ->
                      console.log arguments
                      text

                    ajax:
                      url: "/cgi-bin/b2cJ"
                      dataType: "json"
                      data: (term, page) ->
                        options = undefined
                        options =
                          command: "get"
                          object: reference
                          columns: refcolumns
                          sid: MB.User.sid

                        options["where"] = instance.profile.columns.selectwhere[i] + " = " + (instance.getfielddata(instance.profile.columns.selectwhere[i]))  if instance.profile.columns.selectwhere[i]
                        p_xml: MB.Core.makeQuery(options)

                      results: (data, page) ->
                        results: MB.Form.parseforselect2data(data, "empty")

                else
                  $fieldwrapper.html "<input type='text' disabled class='form-control field'>"
              else if editor is "colorpicker" and not isprimary
                if instance.profile.columns.editability[i].bool()
                  $fieldwrapper.html "<input type='text' class='form-control field'>"
                  $fieldwrapper.find("input").colorpicker "setValue", instance.data.data[0][i]
                  $fieldwrapper.find("input").val instance.data.data[0][i]
                else
                  $fieldwrapper.html "<input type='text' disabled class='form-control field'>"
                  $fieldwrapper.find("input").colorpicker "setValue", instance.data.data[0][i]
                  $fieldwrapper.find("input").val instance.data.data[0][i]
              else if isprimary
                $fieldwrapper.html "<select class='id-toggler form-control'></select>"
                html = ""
                active = ""
                i2 = 0
                l2 = instance.ids.length
                while i2 < l2
                  html += "<option value='" + instance.ids[i2] + "'>" + instance.ids[i2] + "</option>"
                  i2++
                $fieldwrapper.find("select").html html
          ) i
          i++
        instance.$container.find(".form-save-button").addClass "disabled"
        if instance.profile.general.childobject
          table = new MB.Table(
            world: instance.name
            name: instance.profile.general.childobject
            params:
              parentkeyvalue: instance.activeId
              parentobject: instance.name
              parentobjecttype: "form"
          )
          table.create ->

        instance.$container.find(".form-portlet-title .caption span").html instance.profile.general.objectname
      else
        i = 0
        l = instance.data.names.length
        while i < l
          ((i) ->
            $fieldwrapper = undefined
            active = undefined
            editor = undefined
            html = undefined
            i2 = undefined
            isprimary = undefined
            l2 = undefined
            $fieldwrapper = instance.$container.find(".column-wrapper[data-column='" + instance.data.names[i] + "']")
            isprimary = $fieldwrapper.hasClass("primarykey")
            if $fieldwrapper.length > 0
              editor = instance.profile.columns.editor[i]
              if editor is "text" and not isprimary
                $fieldwrapper.html "<input type='text' disabled class='form-control field'>"
                $fieldwrapper.find("input").val instance.data.data[0][i]
              else if editor is "datetime" and not isprimary
                $fieldwrapper.html "<input type='text' disabled class='form-control field'>"
                $fieldwrapper.find("input").val instance.data.data[0][i]
              else if editor is "checkbox" and not isprimary
                if instance.data.data[0][i].bool()
                  html = "<div class='make-switch' data-on-label='<i class=\"fa fa-check icon-white\"></i>' data-off-label='<i class=\"fa fa-times\"></i>'> <input type='checkbox' checked class='toggle'/></div>"
                else
                  html = "<div class='make-switch' data-on-label='<i class=\"fa fa-check icon-white\"></i>' data-off-label='<i class=\"fa fa-times\"></i>'> <input type='checkbox' class='toggle'/></div>"
                $fieldwrapper.html html
              else if editor is "number" and not isprimary
                $fieldwrapper.html "<input type='text' disabled class='form-control field'>"
                $fieldwrapper.find("input").val instance.data.data[0][i]
              else if editor is "select2" and not isprimary
                $fieldwrapper.html "<input type='text' disabled class='form-control field'>"
                $fieldwrapper.find("input").val instance.data.data[0][i]
              else if isprimary
                $fieldwrapper.html "<select class='id-toggler form-control'></select>"
                html = ""
                active = ""
                i2 = 0
                l2 = instance.ids.length
                while i2 < l2
                  html += "<option value='" + instance.ids[i2] + "'>" + instance.ids[i2] + "</option>"
                  i2++
                $fieldwrapper.find("select").html html
          ) i
          i++
        instance.$container.find(".form-save-button").addClass "disabled"
        if instance.profile.general.childobject
          table = new MB.Table(
            world: instance.name
            name: instance.profile.general.childobject
            params:
              parentkeyvalue: instance.activeId
              parentobject: instance.name
              parentobjecttype: "form"
          )
          table.create ->

        instance.$container.find(".form-portlet-title .caption span").html instance.profile.general.objectname
    else if part is "data"
      log "DATA"
      if instance.profile.general.modifycommand.bool()
        i = 0
        l = instance.data.names.length
        while i < l
          ((i) ->
            $fieldwrapper = undefined
            active = undefined
            editor = undefined
            html = undefined
            i2 = undefined
            isprimary = undefined
            l2 = undefined
            refcolumns = undefined
            reference = undefined
            returnscolumn = undefined
            text = undefined
            $fieldwrapper = instance.$container.find(".column-wrapper[data-column='" + instance.data.names[i] + "']")
            isprimary = $fieldwrapper.hasClass("primarykey")
            if $fieldwrapper.length > 0
              editor = instance.profile.columns.editor[i]
              if editor is "text" and not isprimary
                if instance.profile.columns.editability[i].bool()
                  $fieldwrapper.html "<input type='text' class='form-control field'>"
                else
                  $fieldwrapper.html "<input type='text' disabled class='form-control field'>"
                $fieldwrapper.find("input").val instance.data.data[0][i]
              else if editor is "checkbox" and not isprimary
                if instance.profile.columns.editability[i].bool()
                  if instance.data.data[0][i].bool()
                    html = "<div class='make-switch' data-on-label='<i class=\"fa fa-check icon-white\"></i>' data-off-label='<i class=\"fa fa-times\"></i>'> <input type='checkbox' checked class='toggle'/></div>"
                  else
                    html = "<div class='make-switch' data-on-label='<i class=\"fa fa-check icon-white\"></i>' data-off-label='<i class=\"fa fa-times\"></i>'> <input type='checkbox' class='toggle'/></div>"
                  $fieldwrapper.html html
                  $fieldwrapper.find(".make-switch")["bootstrapSwitch"]()
                else
                  if instance.data.data[0][i].bool()
                    html = "<div class='make-switch' data-on-label='<i class=\"fa fa-check icon-white\"></i>' data-off-label='<i class=\"fa fa-times\"></i>'> <input type='checkbox' checked class='toggle'/></div>"
                  else
                    html = "<div class='make-switch' data-on-label='<i class=\"fa fa-check icon-white\"></i>' data-off-label='<i class=\"fa fa-times\"></i>'> <input type='checkbox' class='toggle'/></div>"
                  $fieldwrapper.html html
              else if editor is "number" and not isprimary
                if instance.profile.columns.editability[i].bool()
                  $fieldwrapper.html "<input type='text' class='form-control field'>"
                else
                  $fieldwrapper.html "<input type='text' disabled class='form-control field'>"
                $fieldwrapper.find("input").val instance.data.data[0][i]
              else if editor is "datetime" and not isprimary
                if instance.profile.columns.editability[i].bool()
                    $fieldwrapper.html "<input type='text' readonly class='form-control field'>"
                    $fieldwrapper.find("input").val instance.data.data[0][i]
                    $fieldwrapper.find("input").datetimepicker
                        format: "dd.mm.yyyy hh.ii.00"
                        todayBtn: true
                        autoclose: true
                else
                  $fieldwrapper.html "<input type='text' disabled class='form-control field'>"
                  $fieldwrapper.find("input").val instance.data.data[0][i]
              else if editor is "select2" and not isprimary
                if instance.profile.columns.editability[i].bool()
                  refcolumns = instance.profile.columns.refcolumns[i]
                  reference = instance.profile.columns.references[i]
                  returnscolumn = instance.profile.columns.returnscolumn[i]
                  text = instance.data.data[0][i]
                  html = ((if instance.profile.columns.accommands[i] then "<input type='hidden' class='select2input field' data-accommand='" + instance.profile.columns.accommands[i] + "' data-accolumns='" + instance.profile.columns.accolumns[i] + "' data-acreturnscolumns='" + instance.profile.columns.acreturnscolumns[i] + "' data-returnscolumn='" + returnscolumn + "'>" else "<input type='hidden' class='select2input field' data-returnscolumn='" + returnscolumn + "'>"))
                  $fieldwrapper.html html
                  $fieldwrapper.find("input").select2
                    placeholder: text
                    allowClear: true
                    ajax:
                      url: "/cgi-bin/b2cJ"
                      dataType: "json"
                      data: (term, page) ->
                        options = undefined
                        options =
                          command: "get"
                          object: reference
                          columns: refcolumns
                          sid: MB.User.sid

                        options["where"] = instance.profile.columns.selectwhere[i] + " = " + (instance.getfielddata(instance.profile.columns.selectwhere[i]))  if instance.profile.columns.selectwhere[i]
                        p_xml: MB.Core.makeQuery(options)

                      results: (data, page) ->
                        results: MB.Form.parseforselect2data(data)
                else
                  $fieldwrapper.html "<input type='text' disabled class='form-control field'>"
              else if editor is "select2withEmptyValue" and not isprimary
                if instance.profile.columns.editability[i].bool()
                  refcolumns = instance.profile.columns.refcolumns[i]
                  reference = instance.profile.columns.references[i]
                  returnscolumn = instance.profile.columns.returnscolumn[i]
                  text = instance.data.data[0][i]
                  html = ((if instance.profile.columns.accommands[i] then "<input type='hidden' class='select2input field' data-accommand='" + instance.profile.columns.accommands[i] + "' data-accolumns='" + instance.profile.columns.accolumns[i] + "' data-acreturnscolumns='" + instance.profile.columns.acreturnscolumns[i] + "' data-returnscolumn='" + returnscolumn + "'>" else "<input type='hidden' class='select2input field' data-returnscolumn='" + returnscolumn + "'>"))
                  $fieldwrapper.html html
                  $fieldwrapper.find("input").select2
                    placeholder: text
                    allowClear: true
                    matcher: (term, text, option) ->
                      console.log arguments
                      text

                    ajax:
                      url: "/cgi-bin/b2cJ"
                      dataType: "json"
                      data: (term, page) ->
                        options = undefined
                        options =
                          command: "get"
                          object: reference
                          columns: refcolumns
                          sid: MB.User.sid

                        options["where"] = instance.profile.columns.selectwhere[i] + " = " + (instance.getfielddata(instance.profile.columns.selectwhere[i]))  if instance.profile.columns.selectwhere[i]
                        p_xml: MB.Core.makeQuery(options)

                      results: (data, page) ->
                        results: MB.Form.parseforselect2data(data, "empty")

                else
                  $fieldwrapper.html "<input type='text' disabled class='form-control field'>"
              else if editor is "colorpicker" and not isprimary
                if instance.profile.columns.editability[i].bool()
                  $fieldwrapper.html "<input type='text' class='form-control field'>"
                  $fieldwrapper.find("input").colorpicker "setValue", instance.data.data[0][i]
                  $fieldwrapper.find("input").val instance.data.data[0][i]
                else
                  $fieldwrapper.html "<input type='text' disabled class='form-control field'>"
                  $fieldwrapper.find("input").colorpicker "setValue", instance.data.data[0][i]
                  $fieldwrapper.find("input").val instance.data.data[0][i]
              else if isprimary
                $fieldwrapper.html "<select class='id-toggler form-control'></select>"
                html = ""
                active = ""
                i2 = 0
                l2 = instance.ids.length
                while i2 < l2
                  html += "<option value='" + instance.ids[i2] + "'>" + instance.ids[i2] + "</option>"
                  i2++
                $fieldwrapper.find("select").html html
          ) i
          i++
        instance.$container.find(".form-save-button").addClass "disabled"
        log "GOAL"
        log instance
        if instance.profile.general.childobject
            log "if"
            table = new MB.Table(
              world: instance.name
              name: instance.profile.general.childobject
              params:
                parentkeyvalue: instance.activeId
                parentobject: instance.name
                parentobjecttype: "form"
            )
            table.create log table
        instance.$container.find(".form-portlet-title .caption span").html instance.profile.general.objectname
      else
        i = 0
        l = instance.data.names.length
        while i < l
          ((i) ->
            $fieldwrapper = undefined
            active = undefined
            editor = undefined
            html = undefined
            i2 = undefined
            isprimary = undefined
            l2 = undefined
            $fieldwrapper = instance.$container.find(".column-wrapper[data-column='" + instance.data.names[i] + "']")
            isprimary = $fieldwrapper.hasClass("primarykey")
            if $fieldwrapper.length > 0
              editor = instance.profile.columns.editor[i]
              if editor is "text" and not isprimary
                $fieldwrapper.html "<input type='text' disabled class='form-control field'>"
                $fieldwrapper.find("input").val instance.data.data[0][i]
              else if editor is "checkbox" and not isprimary
                if instance.data.data[0][i].bool()
                  html = "<div class='make-switch' data-on-label='<i class=\"fa fa-check icon-white\"></i>' data-off-label='<i class=\"fa fa-times\"></i>'> <input type='checkbox' checked class='toggle'/></div>"
                else
                  html = "<div class='make-switch' data-on-label='<i class=\"fa fa-check icon-white\"></i>' data-off-label='<i class=\"fa fa-times\"></i>'> <input type='checkbox' class='toggle'/></div>"
                $fieldwrapper.html html
              else if editor is "number" and not isprimary
                $fieldwrapper.html "<input type='text' disabled class='form-control field'>"
                $fieldwrapper.find("input").val instance.data.data[0][i]
              else if editor is "datetime" and not isprimary
                $fieldwrapper.html "<input type='text' disabled class='form-control field'>"
                $fieldwrapper.find("input").val instance.data.data[0][i]
              else if editor is "select2" and not isprimary
                $fieldwrapper.html "<input type='text' disabled class='form-control field'>"
                $fieldwrapper.find("input").val instance.data.data[0][i]
              else if isprimary
                $fieldwrapper.html "<select class='id-toggler form-control'></select>"
                html = ""
                active = ""
                i2 = 0
                l2 = instance.ids.length
                while i2 < l2
                  html += "<option value='" + instance.ids[i2] + "'>" + instance.ids[i2] + "</option>"
                  i2++
                $fieldwrapper.find("select").html html
          ) i
          i++
        instance.$container.find(".form-save-button").addClass "disabled"
        if instance.profile.general.childobject
          table = new MB.Table(
            world: instance.name
            name: instance.profile.general.childobject
            params:
              parentkeyvalue: instance.activeId
              parentobject: instance.name
              parentobjecttype: "form"
          )
          table.create ->

        instance.$container.find(".form-portlet-title .caption span").html instance.profile.general.objectname
    else if part is "add"
      if instance.profile.general.modifycommand.bool()
        unless instance.$container.find(".id-toggler").find("option[value='new']").length > 0
          selectedrows = instance.$container.find(".id-toggler").html()
          instance.$container.find(".id-toggler").html "<option value='new'>Новый</option>" + selectedrows
        i = 0
        l = instance.data.names.length
        while i < l
          ((i) ->
            $fieldwrapper = undefined
            editor = undefined
            html = undefined
            isprimary = undefined
            refcolumns = undefined
            reference = undefined
            returnscolumn = undefined
            text = undefined
            $fieldwrapper = instance.$container.find(".column-wrapper[data-column='" + instance.data.names[i] + "']")
            isprimary = $fieldwrapper.hasClass("primarykey")
            if $fieldwrapper.length > 0
              editor = instance.profile.columns.editor[i]
              if editor is "text" and not isprimary
                if instance.profile.columns.editability[i].bool()
                  $fieldwrapper.html "<input type='text' class='form-control field'>"
                else
                  $fieldwrapper.html "<input type='text' disabled class='form-control field'>"
              else if editor is "checkbox" and not isprimary
                if instance.profile.columns.editability[i].bool()
                  html = "<div class='make-switch' data-on-label='<i class=\"fa fa-check icon-white\"></i>' data-off-label='<i class=\"fa fa-times\"></i>'> <input type='checkbox' class='toggle'/></div>"
                  $fieldwrapper.html html
                  $fieldwrapper.find(".make-switch")["bootstrapSwitch"]()
                else
                  html = "<div class='make-switch' data-on-label='<i class=\"fa fa-check icon-white\"></i>' data-off-label=\"<i class='fa fa-times\"></i>'> <input type='checkbox' class='toggle'/></div>"
                  $fieldwrapper.html html
              else if editor is "number" and not isprimary
                if instance.profile.columns.editability[i].bool()
                  $fieldwrapper.html "<input type='text' class='form-control field'>"
                else
                  $fieldwrapper.html "<input type='text' disabled class='form-control field'>"
              else if editor is "datetime" and not isprimary
                if instance.profile.columns.editability[i].bool()
                  $fieldwrapper.html "<input type='text' readonly class='form-control field'>"
                  $fieldwrapper.find("input").val instance.data.data[0][i]
                  $fieldwrapper.find("input").datetimepicker
                    format: "dd.mm.yyyy hh.ii.00"
                    todayBtn: true
                    autoclose: true

                else
                  $fieldwrapper.html "<input type='text' disabled class='form-control field'>"
              else if editor is "select2" and not isprimary
                if instance.profile.columns.editability[i].bool()
                  refcolumns = instance.profile.columns.refcolumns[i]
                  reference = instance.profile.columns.references[i]
                  returnscolumn = instance.profile.columns.returnscolumn[i]
                  text = instance.data.data[0][i]
                  html = ((if instance.profile.columns.accommands[i] then "<input type='hidden' class='select2input field' data-returnscolumn='" + returnscolumn + "'>" else "<input type='hidden' class='select2input field' data-accommand='" + instance.profile.columns.accommands[i] + "' data-accolumn='" + instance.profile.columns.accolumns[i] + "' data-acreturnscolumns='' data-returnscolumn='" + returnscolumn + "'>"))
                  $fieldwrapper.html html
                  $fieldwrapper.find("input").select2
                    placeholder: "Нет выбранных значений"
                    allowClear: true
                    ajax:
                      url: "/cgi-bin/b2cJ"
                      dataType: "json"
                      data: (term, page) ->
                        options = undefined
                        options =
                          command: "get"
                          object: reference
                          columns: refcolumns
                          sid: MB.User.sid

                        options["where"] = instance.profile.columns.selectwhere[i] + " = " + (instance.getfielddata(instance.profile.columns.selectwhere[i]))  if instance.profile.columns.selectwhere[i]
                        p_xml: MB.Core.makeQuery(options)

                      results: (data, page) ->
                        results: MB.Form.parseforselect2data(data)

                else
                  $fieldwrapper.html "<input type='text' disabled class='form-control field'>"
              if (instance.profile.general.prepareInsert.NAMES.indexOf(instance.data.names[i])) > -1
                console.log instance.profile.general.prepareInsert.DATA[instance.profile.general.prepareInsert.NAMES.indexOf(instance.data.names[i])]
                $fieldwrapper.find("input").val instance.profile.general.prepareInsert.DATA[instance.profile.general.prepareInsert.NAMES.indexOf(instance.data.names[i])]
                instance.addingStorage[instance.data.names[i]] = instance.profile.general.prepareInsert.DATA[instance.profile.general.prepareInsert.NAMES.indexOf(instance.data.names[i])]
                instance.$container.find(".form-save-button").removeClass "disabled"
          ) i
          i++
      else
        unless instance.$container.find(".id-toggler").find("option[value='new']").length > 0
          selectedrows = instance.$container.find(".id-toggler").html()
          instance.$container.find(".id-toggler").html "<option value='new'>Новый</option>" + selectedrows
        i = 0
        l = instance.data.names.length
        while i < l
          ((i) ->
            $fieldwrapper = undefined
            editor = undefined
            html = undefined
            isprimary = undefined
            $fieldwrapper = instance.$container.find(".column-wrapper[data-column='" + instance.data.names[i] + "']")
            isprimary = $fieldwrapper.hasClass("primarykey")
            if $fieldwrapper.length > 0
              editor = instance.profile.columns.editor[i]
              if editor is "text" and not isprimary
                $fieldwrapper.html "<input type='text' disabled class='form-control field'>"
              else if editor is "number" and not isprimary
                $fieldwrapper.html "<input type='text' disabled class='form-control field'>"
              else if editor is "datetime" and not isprimary
                $fieldwrapper.html "<input type='text' disabled class='form-control'>"
              else if editor is "checkbox" and not isprimary
                if instance.data.data[0][i].bool()
                  html = "<div class='make-switch' data-on-label='<i class=\"fa fa-check icon-white\"></i>' data-off-label='<i class=\"fa fa-times\"></i>'> <input type='checkbox' checked class='toggle'/></div>"
                else
                  html = "<div class='make-switch' data-on-label='<i class=\"fa fa-check icon-white\"></i>' data-off-label='<i class=\"fa fa-times\"></i>'> <input type='checkbox' class='toggle'/></div>"
                $fieldwrapper.html html
              else
                $fieldwrapper.html "<input type='text' disabled class='form-control field'>"  if editor is "select2" and not isprimary
          ) i
          i++
    callback()

  MB.Form.fn.updatecontroller = (part, callback) ->
    $form = undefined
    instance = undefined
    instance = this
    $form = instance.$container
    if part is "init"
      $form.find(".portlet-title").on "click", (e) ->
        $target = undefined
        $target = $(e.target)
        instance.reload "data"  if $target.hasClass("reload")
      $form.find(".make-switch").each (i, el) ->
        $(this).on "switch-change", (e, data) ->
          currentvalue = undefined
          val = undefined
          currentvalue = instance.data.data[0][instance.data.names.indexOf($(this).closest(".column-wrapper").data("column"))]
          val = data.value
          if currentvalue.bool() is val
            $(this).find("input").removeClass "edited"
            if instance.$container.find(".edited").length < 1
              $form.find(".form-save-button").addClass "disabled"
              delete instance.editingStorage
          else
            $(this).find("input").addClass "edited"
            $form.find(".form-save-button").removeClass "disabled"
      $form.find(".select2input").each (i, el) ->
        $(this).on "change", (e) ->
          accolumns = undefined
          acobject = undefined
          acreturnscolumns = undefined
          column = undefined
          id = undefined
          o = undefined
          where = undefined
          if $(this).val()
            if $(this).data("accommand")
              acobject = $(this).data("accommand")
              accolumns = $(this).data("accolumns")
              acreturnscolumns = $(this).data("acreturnscolumns").split(",")
              where = $(this).data("returnscolumn") + " = '" + e.val + "'"
              o =
                command: "get"
                object: acobject
                sid: MB.User.sid
                columns: accolumns
                where: where

              MB.Core.sendQuery o, (res) ->
                l = undefined
                _results = undefined
                i = 0
                l = acreturnscolumns.length
                _results = []
                while i < l
                  instance.$container.find("[data-column='" + acreturnscolumns[i] + "'] input").val res.DATA[0][i]
                  _results.push i++
                _results

            instance.$container.find("[data-column='" + $(this).data("returnscolumn") + "'] input").val e.val
            id = instance.activeId
            unless instance.addingStorage?
              instance.editingStorage = instance.editingStorage or {}
              if instance.editingStorage.hasOwnProperty(id)
                column = $(this).data("returnscolumn")
                instance.editingStorage[id][column] = (if e.val is " " then "" else e.val)
              else
                instance.editingStorage[id] =
                  command: "modify"
                  object: instance.profile.general.object
                  sid: MB.User.sid

                instance.editingStorage[id]["OBJVERSION"] = $form.find(".column-wrapper[data-column='OBJVERSION']").find("input").val()
                instance.editingStorage[id][instance.profile.general.primarykey] = id
                column = $(this).data("returnscolumn")
                instance.editingStorage[id][column] = (if e.val is " " then "" else e.val)
              $form.find(".form-save-button").removeClass "disabled"
            else
              column = $(this).data("returnscolumn")
              instance.addingStorage[column] = e.val
          else
            if instance.$container.find(".edited").length < 1
              $form.find(".form-save-button").addClass "disabled"
              delete instance.editingStorage
            else
              column = $(this).data("returnscolumn")
              delete instance.editingStorage[instance.activeId][column]  if instance.editingStorage and instance.editingStorage[instance.activeId][column]

      $form.find(".id-toggler").off().on "change", ->
        $toggler = undefined
        val = undefined
        $toggler = $(this)
        if instance.addingStorage and instance.$container.find(".edited").length > 0
          bootbox.dialog
            message: "Вы уверены что хотите перейти к другой записи не сохранив внесенные изменения?"
            title: "Есть не сохраннные изменения"
            buttons:
              success:
                label: "Да"
                assName: "green"
                callback: ->
                  val = undefined
                  val = $toggler.val()
                  instance.activeId = val
                  instance.reload "data"

              danger:
                label: "Нет"
                className: "red"
                callback: ->

        else
          val = $(this).val()
          instance.activeId = val
          instance.reload "data"

      $form.find("input[type='text']").each (i, el) ->
        $(el).bind
          change: ->
            $form.find(".form-save-button").removeClass "disabled"
            $(el).addClass "edited"

          keyup: ->
            $form.find(".form-save-button").removeClass "disabled"
            $(el).addClass "edited"


      $form.find(".form-create-button").on "click", (e) ->
        $form.find(".form-delete-button").addClass "disabled"
        if instance.$container.find(".edited").length > 0
          bootbox.dialog
            message: "Вы уверены что хотите создать еще новую запись не сохранив старую?"
            title: "Есть не сохраннные изменения"
            buttons:
              success:
                label: "Да"
                assName: "green"
                callback: ->
                  instance.addingStorage =
                    command: "new"
                    object: instance.profile.general.object
                    sid: MB.User.sid

                  instance.updateview "add", ->
                    instance.updatecontroller "add", ->



              danger:
                label: "Нет"
                className: "red"
                callback: ->

        else
          instance.addingStorage =
            command: "new"
            object: instance.profile.general.object
            sid: MB.User.sid

          instance.updateview "add", ->
            instance.updatecontroller "add", ->



      $form.find(".form-delete-button").on "click", (e) ->
        if instance.ids.length is 1
          instance.deletingStorage =
            command: "remove"
            object: instance.profile.general.object
            sid: MB.User.sid

          instance.deletingStorage["OBJVERSION"] = $form.find(".column-wrapper[data-column='OBJVERSION']").find("input").val()
          instance.deletingStorage[instance.profile.general.primarykey] = instance.activeId
          MB.Core.sendQuery instance.deletingStorage, (res) ->
            if parseInt(res.RC) is 0
              toastr[res.TOAST_TYPE] res.MESSAGE, res.TITLE
              MB.O.tables[instance.parentobject].reload "data"
              MB.Modal.closefull()

        else if instance.ids.length > 1
          if instance.$container.find(".edited").length > 0
            bootbox.dialog
              message: "Вы уверены что хотите удалить запись с несохраненными изменениями?"
              title: "Есть не сохраннные изменения"
              buttons:
                success:
                  label: "Да"
                  assName: "green"
                  callback: ->
                    removed = undefined
                    instance.deletingStorage =
                      command: "remove"
                      object: instance.profile.general.object
                      sid: MB.User.sid

                    instance.deletingStorage["OBJVERSION"] = $form.find(".column-wrapper[data-column='OBJVERSION']").find("input").val()
                    instance.deletingStorage[instance.profile.general.primarykey] = instance.activeId
                    removed = instance.ids.splice(instance.ids.indexOf(instance.activeId), 1)
                    instance.activeId = instance.ids[0]
                    MB.Core.sendQuery instance.deletingStorage, (res) ->
                      if parseInt(res.RC) is 0
                        toastr[res.TOAST_TYPE] res.MESSAGE, res.TITLE
                        instance.reload "data"


                danger:
                  label: "Нет"
                  className: "red"
                  callback: ->

          else
            bootbox.dialog
              message: "Вы уверены что хотите удалить запись?"
              title: "Удаление"
              buttons:
                success:
                  label: "Да"
                  assName: "green"
                  callback: ->
                    removed = undefined
                    instance.deletingStorage =
                      command: "remove"
                      object: instance.profile.general.object
                      sid: MB.User.sid

                    instance.deletingStorage["OBJVERSION"] = $form.find(".column-wrapper[data-column='OBJVERSION']").find("input").val()
                    instance.deletingStorage[instance.profile.general.primarykey] = instance.activeId
                    removed = instance.ids.splice(instance.ids.indexOf(instance.activeId), 1)
                    instance.activeId = instance.ids[0]
                    MB.Core.sendQuery instance.deletingStorage, (res) ->
                      if parseInt(res.RC) is 0
                        toastr.info res.MESSAGE, "Информация"
                        instance.reload "data"


                danger:
                  label: "Нет"
                  className: "red"
                  callback: ->


      $form.find(".form-save-button").on "click", ->
        id = undefined
        id = instance.activeId
        if instance.addingStorage is `undefined`
          instance.editingStorage = instance.editingStorage or {}
          if instance.editingStorage.hasOwnProperty(id)
            $(".edited").each (i, el) ->
              column = undefined
              tag = undefined
              type = undefined
              val = undefined
              tag = $(el).prop("tagName")
              log tag
              log $(el).val()
              if tag is "INPUT"
                type = $(el).attr("type")
                if type is "text"
                  column = $(el).parent().data("column")
                  instance.editingStorage[id][column] = $(el).val()
                else if type is "checkbox"
                  val = $(el).prop("checked")
                  column = $(el).closest(".column-wrapper").data("column")
                  instance.editingStorage[id][column] = val.toString().toUpperCase()
                else if type is "hidden"
                  column = $(el).attr("data-returnscolumn")
                  instance.editingStorage[id][column] = $(el).val()
              $(el).removeClass "edited"

          else
            instance.editingStorage[id] =
              command: "modify"
              object: instance.profile.general.object
              sid: MB.User.sid

            instance.editingStorage[id]["OBJVERSION"] = $form.find(".column-wrapper[data-column='OBJVERSION']").find("input").val()
            instance.editingStorage[id][instance.profile.general.primarykey] = id
            $(".edited").each (i, el) ->
              column = undefined
              tag = undefined
              type = undefined
              val = undefined
              tag = $(el).prop("tagName")
              if tag is "INPUT"
                type = $(el).attr("type")
                if type is "text"
                  column = $(el).parent().data("column")
                  instance.editingStorage[id][column] = $(el).val()
                else if type is "checkbox"
                  val = $(el).prop("checked")
                  column = $(el).closest(".column-wrapper").data("column")
                  instance.editingStorage[id][column] = val.toString().toUpperCase()
                else if type is "hidden"
                  column = $(el).attr("data-returnscolumn")
                  instance.editingStorage[id][column] = $(el).val()
              $(el).removeClass "edited"

          MB.Core.sendQuery instance.editingStorage[id], (res) ->
            if parseInt(res.RC) is 0
              toastr[res.TOAST_TYPE] res.MESSAGE, res.TITLE
              delete instance.editingStorage

              instance.reload "data"

        else if instance.addingStorage
          $(".edited").each (i, el) ->
            column = undefined
            tag = undefined
            type = undefined
            val = undefined
            tag = $(el).prop("tagName")
            if tag is "INPUT"
              type = $(el).attr("type")
              if type is "text"
                column = $(el).parent().data("column")
                instance.addingStorage[column] = $(el).val()
              else if type is "checkbox"
                val = $(el).prop("checked")
                column = $(el).closest(".column-wrapper").data("column")
                instance.addingStorage[column] = val.toString().toUpperCase()
            $(el).removeClass "edited"

          MB.Core.sendQuery instance.addingStorage, (res) ->
            if parseInt(res.RC) is 0
              toastr[res.TOAST_TYPE] res.MESSAGE, res.TITLE
              delete instance.addingStorage

              instance.activeId = res.ID
              instance.ids.push res.ID
              instance.reload "data"


      if instance.profile.general.custom.bool()
        $.getScript "html/forms/" + instance.name + "/" + instance.name + ".js", (data, status, xhr) ->
          instance.custom ->
            callback()


      else
        callback()
    else if part is "data"
      $form.find(".form-delete-button").removeClass "disabled"
      $form.find(".make-switch").each (i, el) ->
        $(this).on "switch-change", (e, data) ->
          currentvalue = undefined
          val = undefined
          currentvalue = instance.data.data[0][instance.data.names.indexOf($(this).closest(".column-wrapper").data("column"))]
          val = data.value
          if currentvalue.bool() is val
            $(this).find("input").removeClass "edited"
            if instance.$container.find(".edited").length < 1
              $form.find(".form-save-button").addClass "disabled"
              delete instance.editingStorage
          else
            $(this).find("input").addClass "edited"
            $form.find(".form-save-button").removeClass "disabled"


      $form.find(".id-toggler").off().on "change", ->
        $toggler = undefined
        val = undefined
        $toggler = $(this)
        if instance.addingStorage and instance.$container.find(".edited").length > 0
          bootbox.dialog
            message: "Вы уверены что хотите перейти к другой записи не сохранив внесенные изменения?"
            title: "Есть не сохраннные изменения"
            buttons:
              success:
                label: "Да"
                assName: "green"
                callback: ->
                  val = undefined
                  val = $toggler.val()
                  instance.activeId = val
                  instance.reload "data"

              danger:
                label: "Нет"
                className: "red"
                callback: ->

        else
          val = $(this).val()
          instance.activeId = val
          instance.reload "data"

      $form.find("input[type='text']").each (i, el) ->
        $(el).bind
          change: ->
            $form.find(".form-save-button").removeClass "disabled"
            $(el).addClass "edited"

          keyup: ->
            $form.find(".form-save-button").removeClass "disabled"
            $(el).addClass "edited"

      $form.find(".select2input").each (i, el) ->
        $(this).on "change", (e) ->
          accolumns = undefined
          acobject = undefined
          acreturnscolumns = undefined
          column = undefined
          id = undefined
          o = undefined
          where = undefined
          if $(this).val()
            if $(this).data("accommand")
              acobject = $(this).data("accommand")
              accolumns = $(this).data("accolumns")
              acreturnscolumns = $(this).data("acreturnscolumns").split(",")
              where = $(this).data("returnscolumn") + " = '" + e.val + "'"
              o =
                command: "get"
                object: acobject
                sid: MB.User.sid
                columns: accolumns
                where: where

              MB.Core.sendQuery o, (res) ->
                l = undefined
                _results = undefined
                i = 0
                l = acreturnscolumns.length
                _results = []
                while i < l
                  instance.$container.find("[data-column='" + acreturnscolumns[i] + "'] input").val res.DATA[0][i]
                  _results.push i++
                _results

            instance.$container.find("[data-column='" + $(this).data("returnscolumn") + "'] input").val e.val
            id = instance.activeId
            unless instance.addingStorage?
              instance.editingStorage = instance.editingStorage or {}
              if instance.editingStorage.hasOwnProperty(id)
                column = $(this).data("returnscolumn")
                instance.editingStorage[id][column] = (if e.val is " " then "" else e.val)
              else
                instance.editingStorage[id] =
                  command: "modify"
                  object: instance.profile.general.object
                  sid: MB.User.sid

                instance.editingStorage[id]["OBJVERSION"] = $form.find(".column-wrapper[data-column='OBJVERSION']").find("input").val()
                instance.editingStorage[id][instance.profile.general.primarykey] = id
                column = $(this).data("returnscolumn")
                instance.editingStorage[id][column] = (if e.val is " " then "" else e.val)
              $form.find(".form-save-button").removeClass "disabled"
            else
              column = $(this).data("returnscolumn")
              instance.addingStorage[column] = e.val
          else
            if instance.$container.find(".edited").length < 1
              $form.find(".form-save-button").addClass "disabled"
              delete instance.editingStorage
            else
              column = $(this).data("returnscolumn")
              delete instance.editingStorage[instance.activeId][column]  if instance.editingStorage and instance.editingStorage[instance.activeId][column]
              
      if instance.profile.general.custom.bool()
        $.getScript "html/forms/" + instance.name + "/" + instance.name + ".js", (data, status, xhr) ->
          instance.custom ->
            callback()


      else
        callback()
    else if part is "add"
      $form.find(".make-switch").each (i, el) ->
        $(this).on "switch-change", (e, data) ->
          val = undefined
          val = data.value
          $(this).find("input").addClass "edited"
          $form.find(".form-save-button").removeClass "disabled"


      $form.find("input[type='text']").each (i, el) ->
        $(el).bind
          change: ->
            $form.find(".form-save-button").removeClass "disabled"
            $(el).addClass "edited"

          keyup: ->
            $form.find(".form-save-button").removeClass "disabled"
            $(el).addClass "edited"


      $form.find(".select2input").each (i, el) ->
        $(this).on "change", (e) ->
          accolumns = undefined
          acobject = undefined
          acreturnscolumns = undefined
          column = undefined
          id = undefined
          o = undefined
          where = undefined
          if $(this).val()
            if $(this).data("accommand")
              acobject = $(this).data("accommand")
              accolumns = $(this).data("accolumns")
              acreturnscolumns = $(this).data("acreturnscolumns").split(",")
              where = $(this).data("returnscolumn") + " = '" + e.val + "'"
              o =
                command: "get"
                object: acobject
                sid: MB.User.sid
                columns: accolumns
                where: where

              MB.Core.sendQuery o, (res) ->
                l = undefined
                _results = undefined
                i = 0
                l = acreturnscolumns.length
                _results = []
                while i < l
                  instance.$container.find("[data-column='" + acreturnscolumns[i] + "'] input").val res.DATA[0][i]
                  _results.push i++
                _results

            instance.$container.find("[data-column='" + $(this).data("returnscolumn") + "'] input").val e.val
            id = instance.activeId
            unless instance.addingStorage?
              instance.editingStorage = instance.editingStorage or {}
              if instance.editingStorage.hasOwnProperty(id)
                column = $(this).data("returnscolumn")
                instance.editingStorage[id][column] = (if e.val is " " then "" else e.val)
              else
                instance.editingStorage[id] =
                  command: "modify"
                  object: instance.profile.general.object
                  sid: MB.User.sid

                instance.editingStorage[id]["OBJVERSION"] = $form.find(".column-wrapper[data-column='OBJVERSION']").find("input").val()
                instance.editingStorage[id][instance.profile.general.primarykey] = id
                column = $(this).data("returnscolumn")
                instance.editingStorage[id][column] = (if e.val is " " then "" else e.val)
              $form.find(".form-save-button").removeClass "disabled"
            else
              column = $(this).data("returnscolumn")
              instance.addingStorage[column] = e.val
          else
            if instance.$container.find(".edited").length < 1
              $form.find(".form-save-button").addClass "disabled"
              delete instance.editingStorage
            else
              column = $(this).data("returnscolumn")
              delete instance.editingStorage[instance.activeId][column]  if instance.editingStorage and instance.editingStorage[instance.activeId][column]



  MB.Form.fn.reload = (part) ->
    log part
    instance = undefined
    instance = this
    if part is "data"
      instance.getdata instance.activeId, (res) ->
        instance.updatemodel "data", res, ->
          instance.updateview "data", ->
            instance.updatecontroller "data", ->
    if part is "init"
      instance.getdata instance.activeId, (res) ->
        instance.updatemodel "init", res, ->
          instance.updateview "init", ->
            instance.updatecontroller "init", ->





  MB.Form.fn.init = ->
    instance = undefined
    instance = this
    instance.loadhtml ->
      instance.getdata instance.activeId, (res) ->
        instance.updatemodel res
        instance.updateview "form"
        instance.updatecontroller()



  MB.Form.fn.createmodallistitem = ->
    instance = undefined
    instance = this
    $(".modals-list").append "<li data-type='form' data-object='" + instance.name + "'><i class='cross fa fa-times-circle'></i>" + instance.profile.general.objectname + "</li>"

  MB.Form.fn.showit = (init) ->
    instance = undefined
    query = undefined
    instance = this
    query = "#modal_" + MB.User.activemodal + "_wrapper"
    $(query).hide()
    query = "#modal_" + instance.name + "_wrapper"
    $(query).show()
    instance.createmodallistitem()  if init
    MB.User.activemodal = instance.name
    MB.User.loadedmodals.push instance.name
).call this