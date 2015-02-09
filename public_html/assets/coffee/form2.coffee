MB = window.MB
MB = MB or {}
MB.Form = (option) ->
	@name = option.name
	@world = option.world
	@ids = option.ids
	@activeId = option.ids[0]
	if option.params
		for key, value of options.params
			@[key] = value
	return
MB.Form.parseprofile = (data, callback) ->
	parsedprofile = {}
	for key, value of data.OBJECT_PROFILE
		parsedprofile[key] = value
	for value, i in data.NAMES
		parsedprofile[value] = []
		for value2, i2 in data.DATA
			parsedprofile[value].push value2[i]
	callback parsedprofile
MB.Form.parseforselect2data = (res, option) ->
	data = []
	if res.NAMES.length isnt 2
		console.log "В parseforselect2data приходит не 2 колонки!"
	else
		for value, i in res.DATA
			data.push
				id: value[0]
				text: value[1]
	if option? and option is "empty"
		data.unshift
			id: " "
			text: "Empty value"
	data
MB.Form.hasloaded = (name) ->
	MB.O.forms.hasOwnProperty name
MB.Form.find = (name) ->
	MB.O.forms[name]
MB.Form::getfielddata = (field) ->
	@$container.find("[data-column='" + field + "'] input").val()
MB.Form::hidecontrols = ->
	@$container.find(".control-buttons").hide()

MB.Form::showcontrols = ->
	@$container.find(".control-buttons").show()

MB.Form::makedir = (callback) ->
	MB.O.forms[@name] = @
	callback()
MB.Form::makecontainer = (callback) ->
	instance = @
	$worldcontainer = $("." + instance.world + "-content-wrapper")
	$container = $("<div id='" + instance.world + "_" + instance.name + "_wrapper' class='" + instance.world + "-item'></div>")
	$worldcontainer.append $container
	instance.$worldcontainer = $worldcontainer
	instance.$container = $container
	callback()
MB.Form::makeportletcontainer = (callback) ->
	instance = @
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
MB.Form::loadhtml = (callback) ->
	instance = @
	url = "html/forms/" + instance.name + "/" + instance.name + ".html"
	instance.url = url
	instance.$container.find(".portlet-body").load url, (res, status, xhr) ->
		callback()
MB.Form::getprofile = (callback) ->
	instance = @
	o =
		command: "get"
		object: "user_object_profile"
		client_object: instance.name
		sid: MB.User.sid
	MB.Core.sendQuery o, (res) ->
		callback res
MB.Form::getdata = (id, callback) ->
	instance = @
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
MB.Form::distributeprofile = (parsedprofile, callback) ->
	instance = @
	instance.profile = {}
	instance.profile.general = {}
	instance.profile.columns = {}
	instance.profile.general.childobject 		= parsedprofile.CHILD_CLIENT_OBJECT
	instance.profile.general.custom 			= parsedprofile.ADDITIONAL_FUNCTIONALITY
	instance.profile.general.getobject 			= parsedprofile.GET_OBJECT_COMMAND
	instance.profile.general.modifycommand 		= parsedprofile.MODIFY_COMMAND
	instance.profile.general.newcommand 		= parsedprofile.NEW_COMMAND
	instance.profile.general.object 			= parsedprofile.OBJECT_COMMAND
	instance.profile.general.objectname 		= parsedprofile.CLIENT_OBJECT_NAME
	instance.profile.general.orderby 			= parsedprofile.DEFAULT_ORDER_BY
	instance.profile.general.pageno 			= 1
	instance.profile.general.prepareInsert 		= parsedprofile.PREPARE_INSERT
	instance.profile.general.primarykey 		= parsedprofile.PRIMARY_KEY
	instance.profile.general.removecommand 		= parsedprofile.REMOVE_COMMAND
	instance.profile.general.rowsmaxnum 		= parsedprofile.ROWS_MAX_NUM
	instance.profile.general.where 				= parsedprofile.DEFAULT_WHERE
	instance.profile.columns.accolumns 			= parsedprofile.AC_COLUMNS
	instance.profile.columns.accommands 		= parsedprofile.AC_COMMAND
	instance.profile.columns.accommands 		= parsedprofile.AC_COMMAND
	instance.profile.columns.acreturnscolumns 	= parsedprofile.AC_RETURN_TO_COLUMN
	instance.profile.columns.acwhere 			= parsedprofile.AC_WHERE
	instance.profile.columns.align 				= parsedprofile.ALIGN
	instance.profile.columns.clientnames 		= parsedprofile.NAME
	instance.profile.columns.columnsdb 			= parsedprofile.COLUMN_NAME
	instance.profile.columns.editability 		= parsedprofile.EDITABLE
	instance.profile.columns.editor 			= parsedprofile.TYPE_OF_EDITOR
	instance.profile.columns.refclientobj 		= parsedprofile.REFERENCE_CLIENT_OBJECT
	instance.profile.columns.refcolumns 		= parsedprofile.LOV_COLUMNS
	instance.profile.columns.references 		= parsedprofile.LOV_COMMAND
	instance.profile.columns.returnscolumn 		= parsedprofile.LOV_RETURN_TO_COLUMN
	instance.profile.columns.selectwhere 		= parsedprofile.LOV_WHERE
	instance.profile.columns.visibility 		= parsedprofile.VISIBLE
	instance.profile.columns.insertability 		= parsedprofile.INSERTABLE
	instance.profile.columns.updatability 		= parsedprofile.UPDATABLE
	instance.profile.columns.width 				= parsedprofile.WIDTH
	instance.profile.columns.requirable 		= parsedprofile.REQUIRED
	do callback
MB.Form::distributedata = (data, callback) ->
	instance = @
	instance.data = {}
	instance.data.data = data.DATA
	instance.data.names = data.NAMES
	instance.data.info = data.INFO
	do callback
MB.Form::updatemodel = (part, data, callback) ->
	instance = @
	if part is "profile"
		MB.Form.parseprofile data, (parsedprofile) ->
			instance.distributeprofile parsedprofile, ->
				do callback
	else if part is "data"
		instance.distributedata data, ->
			callback()
MB.Form::create = (callback) ->
	instance = @
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
											do callback
MB.Form::updateview = (part, callback) ->
	instance = @
	general = @profile.general
	data = @data
	columns = @profile.columns
	$container = @$container
	switch part
		when "init"
			unless do general.modifycommand.bool
				for column, i in data.names
					$fw = $container.find ".column-wrapper[data-column='#{column}']"
					isprimary = $fw.hasClass "primarykey"
					unless isprimary
						editor = columns.editor[i]
						val = data.data[0][i]
						switch editor
							when "checkbox"
								$fw.html "<input type='checkbox' class='field' readonly>"
							else
								$fw.html "<input type='text' class='field' readonly>"
						$input = $fw.find "input"
						if $input.attr "type" is "checkbox" then $input.prop "checked", do val.bool else $input.val val
					else
						$fw.html "<select class='id-toggler form-control'></select>"
						html = ""
						for value in @ids then html += "<option value='#{value}'>#{value}</option>"
						$fw.find "select"
						.html html
			else
				for column, i in data.names
					$fw = $container.find ".column-wrapper[data-column='#{column}']"
					isprimary = $fw.hasClass "primarykey"
					unless isprimary
						editor = columns.editor[i]
						editable = columns.editability[i].bool
						updatable = columns.updatability[i].bool
						val = data.data[0][i]
						if editable and updatable
							if editor is "checkbox"
								$fw.html "<input type='checkbox' class='field'>"
							else if editor is "select2" or editor is "select2withEmptyValue"
								$fw.html "<input type='hidden' class='select2input field'>"
							else
								$fw.html "<input type='text' class='field form-control'>"
						else
							if editor is "checkbox"
								$fw.html "<input type='checkbox' class='field' readonly>"
							else
								$fw.html "<input type='text' class='field form-control' readonly>"
						$input = $fw.find "input"
						if $input.attr "type" is "checkbox" then $input.prop "checked", do val.bool else $input.val val
					else
						$fw.html "<select class='id-toggler form-control'></select>"
						for value in @ids then html += "<option value='#{value}'>#{value}</option>"
						$fw.find "select"
						.html html
			if general.childobject
				table = new MB.Table
					world: instance.name
					name: general.childobject
					params:
						parentkeyvalue: instance.activeId
						parentobject: instance.name
						parentobjecttype: "form"
				table.create ->
					do callback
			else do callback
		when "data"
			for column, i in data.names
				$fw = $container.find ".column-wrapper[data-column='#{column}']"
				isprimary = $fw.hasClass "primarykey"
				unless isprimary
					editor = columns.editor[i]
					val = data.data[0][i]
					$input = $fw.find "input"
					if editor is "checkbox" then $input.prop "checked", do val.bool else $input.val val
			if general.childobject
				table = MB.O.tables[general.childobject].reload "data", ->
					do callback
			else do callback
		when "add"
			for column, i in data.names
				editable = columns.editability[i].bool
				if editable
					$fw = $container.find ".column-wrapper[data-column='#{column}']"
					$input = $fw.find "input"
					insertable = columns.insertability[i].bool
					prepareInsertExists = yes if prepareInsertIndex > -1
					prepareInsertIndex = general.prepareInsert.NAMES.indexOf column
					prepareInsertValue = general.prepareInsert.DATA[prepareInsertIndex] if prepareInsertExists
					val = if prepareInsertExists then prepareInsertValue else ""
					isprimary = $fw.hasClass "primarykey"
					unless isprimary
						unless insertable
							if editor is "select2" or editor is "select2withEmptyValue"
								$input.select2 "readonly", yes
							else
								$input.attr "readonly"
					else alert "Поле #{column} является primarykey и отмечено как editable"
					if editor is "checkbox" then $input.prop "checked", do val.bool else $input.val val
			$container.find ".id-toggler"
			.prepend "<option value='new'>new</option>"
			do callback
MB.Form::updatecontroller = (part, callback) ->
	instance = @
	general = @profile.general
	data = @data
	columns = @profile.columns
	$container = @$container
	process = (type, column, value) ->
		switch type
			when "edit"
				unless instance.editingStorage?
					instance.editingStorage =
						command: "modify"
						object: general.object
						sid: MB.User.sid
					instance.editingStorage.OBJVERSION = do $container.find ".column-wrapper[data-column='OBJVERSION'] input"
						.val
					instance.editingStorage[general.primarykey] = instance.activeId
					instance.editingStorage[column] = value
					$container.find ".form-save-button"
					.removeClass "disabled"
				else
					instance.editingStorage[column] = value
			when "add"
				unless instance.addingStorage?
					instance.addingStorage =
						command: "new"
						object: general.object
						sid: MB.User.sid
					instance.addingStorage[column] = value
					$container.find ".form-save-button"
					.removeClass "disabled"
				else
					instance.addingStorage[column] = value
	switch part
		when "init"
			###########################################################################################################
			for column, i in data.names
				do (i) ->
					editable = do columns.editability[i].bool
					if editable
						editor = columns.editor[i]
						$fw = $container.find ".column-wrapper[data-column='#{column}']"
						$input = $fw.find "input"
						switch editor
							when "checkbox"
								$input.on "change", (e) ->
									checked = $ e.target
									.prop "checked"
									if checked then process "edit", column, "TRUE" else process "edit", column, "FALSE"
							when "select2"
								val = do $input.val
								refcolumns = columns.refcolumns[i]
								reference = columns.references[i]
								returnscolumn = columns.returnscolumn[i]
								$input.select2
									placeholder: val
									ajax:
										url: "/cgi-bin/b2cJ"
										dataType: "json"
										data: (term, page) ->
											o =
												command: "get"
												object: reference
												columns: refcolumns
												sid: MB.User.sid
											if columns.selectwhere[i]?
												where = "#{columns.selectwhere[i]} = #{instance.getfielddata columns.selectwhere[i]}"
											o.where = where
											p_xml: MB.Core.makeQuery o
										results: (data, page) ->
											results: MB.Form.parseforselect2data data
								.on "change", (e) ->
									newval = e.val
									process "edit", column, newval
							when "select2withEmptyValue"
								val = do $input.val
								refcolumns = columns.refcolumns[i]
								reference = columns.references[i]
								returnscolumn = columns.returnscolumn[i]
								$input.select2
									placeholder: val
									ajax:
										url: "/cgi-bin/b2cJ"
										dataType: "json"
										data: (term, page) ->
											o =
												command: "get"
												object: reference
												columns: refcolumns
												sid: MB.User.sid
											if columns.selectwhere[i]?
												where = "#{columns.selectwhere[i]} = #{instance.getfielddata columns.selectwhere[i]}"
											o.where = where
											p_xml: MB.Core.makeQuery o
										results: (data, page) ->
											results: MB.Form.parseforselect2data data
								.on "change", (e) ->
									newval = e.val
									process "edit", column, newval
							when "datetime"
								$input.datetimepicker
									format: "dd.mm.yyyy hh:ii"
									autoclose: true
									todayHighlight: true
									minuteStep: 10
									keyboardNavigation: true
									todayBtn: true
									language: "ru"
								.on "changeDate", (e) ->
									timestamp = do e.date.valueOf - 14400000
									date = new Date timestamp
									dd = do date.getDate
									mm = do date.getMonth + 1
									yyyy = do date.getFullYear
									hh = do date.getHours
									ii = do date.getMinutes
									if dd < 10 then dd = "0" + dd
									if mm < 10 then mm = "0" + mm
									if hh < 10 then hh = "0" + hh
									if ii < 10 then ii = "0" + ii
									result = "#{dd}.#{mm}.#{yyyy} #{hh}:#{ii}"
									process "edit", column, result
							else
								$input.on "change", (e) ->
									process "edit", column, e.val
			###########################################################################################################
			$container.find ".portlet-title"
			.on "click", (e) ->
				$target = $ e.target
				instance.reload "data" if $target.hasClass "reload"
			###########################################################################################################
			$container.find ".id-toggler"
			.off()
			.on "change", (e) ->
				$toggler = $ e.target
				if instance.editingStorage?
					bootbox.dialog
						message: "Вы уверены что хотите перейти к другой записи не сохранив внесенные изменения?"
						title: "Есть не сохраннные изменения"
						buttons:
							success:
								label: "Да"
								assName: "green"
								callback: ->
									val = do $toggler.val
									instance.activeId = val
									instance.reload "data"
							danger:
								label: "Нет"
								className: "red"
								callback: ->
				else
					val = do $toggler.val
					instance.activeId = val
					instance.reload "data"
			###########################################################################################################
			$container.find ".form-create-button"
			.on "click", (e) ->
				if instance.editingStorage?
					bootbox.dialog
						message: "Вы уверены что хотите создать еще новую запись не сохранив старую?"
						title: "Есть не сохраннные изменения"
						buttons:
							success:
								label: "Да"
								assName: "green"
								callback: ->
									delete instance.editingStorage
									instance.updateview "add", ->
										instance.updatecontroller "add", ->
							danger:
								label: "Нет"
								className: "red"
								callback: ->
				else
					instance.updateview "add", ->
						instance.updatecontroller "add", ->
			###########################################################################################################
			$container.find ".form-delete-button"
			.on "click", (e) ->
				if instance.editingStorage?
					bootbox.dialog
						message: "Вы уверены что хотите удалить запись с несохраненными изменениями?"
						title: "Есть не сохраннные изменения"
						buttons:
							success:
								label: "Да"
								assName: "green"
								callback: ->
									if instance.ids.length is 1
										instance.deletingStorage =
											command: "remove"
											object: instance.profile.general.object
											sid: MB.User.sid
										instance.deletingStorage.OBJVERSION = do $container.find ".column-wrapper[data-column='OBJVERSION'] input"
										.val
										instance.deletingStorage[general.primarykey] = instance.activeId
										MB.Core.sendQuery instance.deletingStorage, (res) ->
											toastr[res.TOAST_TYPE] res.MESSAGE, res.TITLE
											MB.O.tables[instance.parentobject].reload "data"
											do MB.Modal.closefull
									else
										instance.deletingStorage =
											command: "remove"
											object: general.object
											sid: MB.User.sid
										instance.deletingStorage.OBJVERSION = do $container.find ".column-wrapper[data-column='OBJVERSION'] input"
										.val
										instance.deletingStorage[general.primarykey] = instance.activeId
										# removed = instance.ids.splice(instance.ids.indexOf(instance.activeId), 1)
										instance.ids.splice(instance.ids.indexOf(instance.activeId), 1)
										instance.activeId = instance.ids[0]
										MB.Core.sendQuery instance.deletingStorage, (res) ->
											toastr[res.TOAST_TYPE] res.MESSAGE, res.TITLE
											instance.reload "data"
				else
					if instance.ids.length is 1
						instance.deletingStorage =
							command: "remove"
							object: instance.profile.general.object
							sid: MB.User.sid
						instance.deletingStorage.OBJVERSION = do $container.find ".column-wrapper[data-column='OBJVERSION'] input"
						.val
						instance.deletingStorage[general.primarykey] = instance.activeId
						MB.Core.sendQuery instance.deletingStorage, (res) ->
							toastr[res.TOAST_TYPE] res.MESSAGE, res.TITLE
							MB.O.tables[instance.parentobject].reload "data"
							do MB.Modal.closefull
					else
						instance.deletingStorage =
							command: "remove"
							object: general.object
							sid: MB.User.sid
						instance.deletingStorage.OBJVERSION = do $container.find ".column-wrapper[data-column='OBJVERSION'] input"
						.val
						instance.deletingStorage[general.primarykey] = instance.activeId
						# removed = instance.ids.splice(instance.ids.indexOf(instance.activeId), 1)
						instance.ids.splice(instance.ids.indexOf(instance.activeId), 1)
						instance.activeId = instance.ids[0]
						MB.Core.sendQuery instance.deletingStorage, (res) ->
							toastr[res.TOAST_TYPE] res.MESSAGE, res.TITLE
							instance.reload "data"
			###########################################################################################################
			$container.find ".form-save-button"
			.on "click", ->
				if instance.editingStorage?
					MB.Core.sendQuery instance.editingStorage, (res) ->
						toastr[res.TOAST_TYPE] res.MESSAGE, res.TITLE
						delete instance.editingStorage
						instance.reload "data"
				else
					alert "Нет изменений для сохранения"
			###########################################################################################################
			if general.custom.bool
				$.getScript "html/forms/#{instance.name}/#{instance.name}.js", (data, status, xhr) ->
					instance.custom ->
						do callback
			else
				do callback
			###########################################################################################################
		when "data"
			console.log part
			do callback
		when "data after add"
			###########################################################################################################
			for column, i in data.names
				do (i) ->
					editable = do columns.editability[i].bool
					$fw = $container.find ".column-wrapper[data-column='#{column}']"
					$input = $fw.find "input"
					if editable
						updatable = columns.updatability[i].bool
						editor = columns.editor[i]
						if updatable
							if editor is "checkbox"
								$input.off "change"
								.on "change", (e) ->
									checked = $ e.target
									.prop "checked"
									if checked then process "edit", column, "TRUE" else process "edit", column, "FALSE"
							else if editor is "select2" or editor is "select2withEmptyValue"
								$input.off "change"
								.on "change", (e) ->
									newval = e.val
									process "edit", column, newval
							else if editor is "datetime"
								$input.off "changeDate"
								.on "changeDate", (e) ->
									timestamp = do e.date.valueOf - 14400000
									date = new Date timestamp
									dd = do date.getDate
									mm = do date.getMonth + 1
									yyyy = do date.getFullYear
									hh = do date.getHours
									ii = do date.getMinutes
									if dd < 10 then dd = "0" + dd
									if mm < 10 then mm = "0" + mm
									if hh < 10 then hh = "0" + hh
									if ii < 10 then ii = "0" + ii
									result = "#{dd}.#{mm}.#{yyyy} #{hh}:#{ii}"
									process "edit", column, result
							else
								$input.off "change"
								.on "change", (e) ->
									process "edit", column, e.val
						else
							if editor is "datetime"
								$input.off "changeDate"
							else
								$input.off "change"
			###########################################################################################################
			$container.find ".form-save-button"
			.off "click"
			.on "click", ->
				if instance.editingStorage?
					MB.Core.sendQuery instance.editingStorage, (res) ->
						toastr[res.TOAST_TYPE] res.MESSAGE, res.TITLE
						delete instance.editingStorage
						instance.reload "data"
				else
					alert "Нет изменений для сохранения"
			###########################################################################################################
			do callback
		when "add"
			###########################################################################################################
			for column, i in data.names
				do (i) ->
					editable = do columns.editability[i].bool
					$fw = $container.find ".column-wrapper[data-column='#{column}']"
					$input = $fw.find "input"
					if editable
						insertable = columns.insertability[i].bool
						editor = columns.editor[i]
						if insertable
							if editor is "checkbox"
								$input.off "change"
								.on "change", (e) ->
									checked = $ e.target
									.prop "checked"
									if checked then process "add", column, "TRUE" else process "add", column, "FALSE"
							else if editor is "select2" or editor is "select2withEmptyValue"
								$input.off "change"
								.on "change", (e) ->
									newval = e.val
									process "add", column, newval
							else if editor is "datetime"
								$input.off "changeDate"
								.on "changeDate", (e) ->
									timestamp = do e.date.valueOf - 14400000
									date = new Date timestamp
									dd = do date.getDate
									mm = do date.getMonth + 1
									yyyy = do date.getFullYear
									hh = do date.getHours
									ii = do date.getMinutes
									if dd < 10 then dd = "0" + dd
									if mm < 10 then mm = "0" + mm
									if hh < 10 then hh = "0" + hh
									if ii < 10 then ii = "0" + ii
									result = "#{dd}.#{mm}.#{yyyy} #{hh}:#{ii}"
									process "add", column, result
							else
								$input.off "change"
								.on "change", (e) ->
									process "add", column, e.val
						else
							if editor is "datetime"
								$input.off "changeDate"
							else
								$input.off "change"
			###########################################################################################################
			$container.find ".form-save-button"
			.off "click"
			.on "click", ->
				if instance.addingStorage?
					MB.Core.sendQuery instance.addingStorage, (res) ->
						toastr[res.TOAST_TYPE] res.MESSAGE, res.TITLE
						delete instance.addingStorage
						instance.reload "data after add"
				else
					alert "Нет изменений для сохранения"
			###########################################################################################################
			do callback
			###########################################################################################################
			###########################################################################################################
			###########################################################################################################
			###########################################################################################################
			###########################################################################################################
			###########################################################################################################
			###########################################################################################################
			###########################################################################################################
			###########################################################################################################














































