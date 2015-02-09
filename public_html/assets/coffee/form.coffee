MB = window.MB
MB = MB or {}
MB.Form = (options) ->
	@type = 'form'
	@name = options.name
	@world = "modal"
	@ids = options.ids
	@activeId = options.ids[0]
	@prevActiveId = null
	@mode = if options.mode? then options.mode else null
	if options.params
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
	res = MB.Core.parseFormat res
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
	do @$container.find "[data-column='#{field}'] input"
	.val
MB.Form::hidecontrols = ->
	do @$container.find ".control-buttons"
	.hide
MB.Form::showcontrols = ->
	do @$container.find ".control-buttons"
	.show
MB.Form::makedir = (callback) ->
	MB.O.forms[@name] = @
	do callback
MB.Form::makecontainer = (callback) ->
	instance = @
	$worldcontainer = $ ".#{instance.world}-content-wrapper"
	$container = $ "<div id='#{instance.world}_#{instance.name}_wrapper' class='#{instance.world}-item'></div>"
	$worldcontainer.append $container
	instance.$worldcontainer = $worldcontainer
	instance.$container = $container
	do callback
MB.Form::makeportletcontainer = (callback) ->
	instance = @
	general = instance.profile.general
	_columns = instance.profile.columns
	html = ""
	html += "
		<div class='row'>
			<div class='col-md-12'>
				<div class='portlet box grey'>
					<div class='form-portlet-title portlet-title'>
						<a href='#' class='bt-menu-trigger'>
							<span>Menu</span>
						</a>
						<div class='caption'>
							<i class='fa fa-reorder'></i>
							<span></span>
						</div>
						<div class='actions'>"
	list = []
	for value, i in _columns.refclientobj
		if value then list.push value
	if list.length > 0
		html += "
							<div class='btn-group'>
								<a class='btn green' href='#' data-toggle='dropdown'>
									<i class='fa fa-cogs'></i> 
									Перейти в справочник... 
									<i class='fa fa-angle-down'></i>
								</a>
								<ul class='dropdown-menu pull-right gotos-wrapper'>"
		for value, i in list
			html += "
									<li data-goto='#{value}'>
										<a href='#' class='xls-converter'>
											<i class='fa fa-pencil'></i> 
											#{value} 
										</a>
									</li>"
		html += "
								</ul>
							</div>"
	if do general.newcommand.bool then html += "
							<button type='button' class='btn blue form-create-button'>
								<i class='fa fa-plus'></i> Создать
							</button>
							<button type='button' class='btn btn-primary form-create-button'>
								<i class='fa fa-copy'></i> Дублировать
							</button>"
	if do general.newcommand.bool or do general.modifycommand.bool then html += "
							<button type='button' class='btn green form-save-button'>
								<i class='fa fa-save'></i> Сохранить
							</button>"
	if do general.removecommand.bool then html += "
							<button type='button' class='btn red form-delete-button'>
								<i class='fa fa-times'></i> Удалить
							</button>"
	html += "
							<button class=\"btn dark tools reload\" style=\"margin-left: 15px;\">
								<i class=\"fa fa-refresh reload\"></i>
							</button>
						</div>
					</div>
					<div class='portlet-body'></div>
				</div>
			</div>
		</div>
		<div class='row'>
			<div class='col-md-12'>
				<div class='btn-group control-buttons btn-group-solid'></div>
			</div>
		</div>"
	instance.$container.html html
	do borderMenu
	do callback
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
		object: "user_profile"
		client_object: instance.name
		sid: MB.User.sid
	MB.Core.sendQuery o, (res) ->
		callback res
MB.Form::getdata = (id, callback) ->
	console.log "id", id
	instance = @
	o =
		command: "get"
		object: instance.profile.general.getobject
		where: "#{instance.profile.general.primarykey} = '#{id}'"
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
	instance.profile.columns.required 			= parsedprofile.REQUIRED
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
			do callback
	else if part is "data add"
		instance.distributedata data, ->
			instance.ids.unshift "new"
			instance.prevActiveId = instance.activeId
			instance.activeId = "new"
			instance.addingStorage =
				command: "new"
				object: instance.profile.general.object
				sid: MB.User.sid
			do callback
	else if part is "add"
		instance.ids.unshift "new"
		instance.prevActiveId = instance.activeId
		instance.activeId = "new"
		instance.addingStorage =
			command: "new"
			object: instance.profile.general.object
			sid: MB.User.sid
		do callback
MB.Form::create = (callback) ->
	console.log 56756756
	instance = @
	if instance.mode is "add"
		instance.makedir ->
			instance.getprofile (res) ->
				instance.updatemodel "profile", res, ->
					# instance.getdata instance.activeId, (res) ->
					# instance.updatemodel "data add", res, ->
					instance.makecontainer ->
						instance.makeportletcontainer ->
							instance.loadhtml ->
								instance.addingStorage =
									command: "new"
									object: instance.profile.general.object
									sid: MB.User.sid
								instance.updateview "addinit", ->
									instance.updatecontroller "addinit", ->
										do callback
	else
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
	columns = @profile.columns
	data = @data
	$container = @$container
	console.log 'PART fff222', part
	switch part
		when "addinit"
			data =
				names: columns.columnsdb
			instance.mode = "add"
			for column, i in data.names
				$fw = $container.find ".column-wrapper[data-column='#{column}']"
				editable = do columns.editability[i].bool
				editor = columns.editor[i]
				insertable = do columns.insertability[i].bool
				isprimary = $fw.hasClass "primarykey"
				prepareInsertIndex = general.prepareInsert.NAMES.indexOf column
				prepareInsertExists = if prepareInsertIndex > -1 then yes else no
				required = do columns.required[i].bool
				val = if prepareInsertExists then general.prepareInsert.DATA[prepareInsertIndex] else ""
				if prepareInsertExists
					instance.addingStorage[column] = val
				unless isprimary
					if editable and insertable
						if editor is "checkbox"
							$fw.html "<input type='checkbox' class='field'>"
						else if editor is "select2" or editor is "select2withEmptyValue" or editor is "select2FreeType"
							$fw.html "<input type='hidden' class='select2input field'>"
						else if editor is "File"
							$fw.html "<input type='text' class='field  form-control uploadFile' value='Выберите файл'>"
						else
							$fw.html "<input type='text' class='field form-control'>"
					else
						if editor is "checkbox"
							$fw.html "<input type='checkbox' class='field' readonly>"
						else
							$fw.html "<input type='text' class='field form-control' readonly>"
					$input = $fw.find "input"
					switch editor
						when "checkbox" then $input.prop "checked", (if val is "" then no else do val.bool)
						else $input.val val
				else
					result = "<select class='id-toggler form-control'>"
					html = ""
					active = ""
					for value in instance.ids
						if value is instance.activeId
							active += "<option value='#{value}'>#{value}</option>"
						else
							html += "<option value='#{value}'>#{value}</option>"
					result += (active + html + "</select>")
					$fw.html result
				if required
					$fw.parents ".form-group"
					.find "label"
					.append "<span class='label-star'>*</span>"
				$(".column-wrapper[data-column='COLOR']").each (index, elem) ->
					elemInput = $(elem).find('input')
					elemColor = elemInput.val()
					elemBlock = '<div class="colorView" style="background-color:'+elemColor+'"></div>'
					$(elem).prepend elemBlock
			do callback
		when "init"
			instance.mode = "edit"
			unless do general.modifycommand.bool
				for column, i in data.names
					$fw = $container.find ".column-wrapper[data-column='#{column}']"
					isprimary = $fw.hasClass "primarykey"
					required = do columns.required[i].bool
					unless isprimary
						editor = columns.editor[i]
						val = data.data[0][i]
						switch editor
							when "checkbox"
								$fw.html "<input type='checkbox' class='field' readonly>"
							else
								$fw.html "<input type='text' class='field form-control' readonly>"
						$input = $fw.find "input"
						switch editor
							when "checkbox" then $input.prop "checked", do val.bool
							else $input.val val
					else
						result = "<select class='id-toggler form-control'>"
						html = ""
						active = ""
						for value in instance.ids
							if value is instance.activeId
								active += "<option value='#{value}'>#{value}</option>"
							else
								html += "<option value='#{value}'>#{value}</option>"
						result += (active + html + "</select>")
						$fw.html result
					if required
						$fw.parents ".form-group"
						.find "label"
						.append "<span class='label-star'>*</span>"
			else
				for column, i in data.names
					$fw = $container.find ".column-wrapper[data-column='#{column}']"
					isprimary = $fw.hasClass "primarykey"
					required = do columns.required[i].bool
					unless isprimary
						editor = columns.editor[i]
						editable = do columns.editability[i].bool
						updatable = do columns.updatability[i].bool
						val = data.data[0][i]
						if editable and updatable
							if editor is "checkbox"
								$fw.html "<input type='checkbox' class='field'>"
							else if editor is "select2" or editor is "select2withEmptyValue" or editor is "select2FreeType"
								$fw.html "<input type='hidden' class='select2input field'>"
							else if editor is "File"
								$fw.html "<input type='text' class='field form-control uploadFile' value='Выберите файл'>"
							else
								$fw.html "<input type='text' class='field form-control'>"
						else
							if editor is "checkbox"
								$fw.html "<input type='checkbox' class='field' readonly>"
							else
								$fw.html "<input type='text' class='field form-control' readonly>"
						$input = $fw.find "input"
						switch editor
							when "checkbox" then $input.prop "checked", do val.bool
							else $input.val val
					else
						result = "<select class='id-toggler form-control'>"
						html = ""
						active = ""
						for value in instance.ids
							if value is instance.activeId
								active += "<option value='#{value}'>#{value}</option>"
							else
								html += "<option value='#{value}'>#{value}</option>"
						result += (active + html + "</select>")
						$fw.html result
					if required
						$fw.parents ".form-group"
						.find "label"
						.append "<span class='label-star'>*</span>"
				$(".column-wrapper[data-column='COLOR']").each (index, elem) ->
					elemInput = $(elem).find('input')
					elemColor = elemInput.val()
					elemBlock = '<div class="colorView" style="background-color:'+elemColor+'"></div>'
					$(elem).prepend elemBlock

			if general.childobject
				table = new MB.Table
					world: instance.name
					name: general.childobject
					params:
						parent: instance
						# parentkeyvalue: instance.activeId
						# parentobject: instance.name
						# parentobjecttype: "form"
				table.create ->
					do callback
			else do callback
		when "data"
			instance.mode = "edit"
			for column, i in data.names
				$fw = $container.find ".column-wrapper[data-column='#{column}']"
				isprimary = $fw.hasClass "primarykey"
				unless isprimary
					editor = columns.editor[i]
					val = data.data[0][i]
					$input = $fw.find "input"
					switch editor
						when "checkbox" then $input.prop "checked", do val.bool
						when "select2"
							returnscolumn = columns.returnscolumn[i]
							id = data.data[0][data.names.indexOf returnscolumn]
							text = val
							$input.select2 "data", {id: id,	text: text}
						when "select2withEmptyValue"
							returnscolumn = columns.returnscolumn[i]
							id = data.data[0][data.names.indexOf returnscolumn]
							text = val
							$input.select2 "data", {id: id,	text: text}
						else $input.val val
				else
					$toggler = $fw.find ".id-toggler"
					html = ""
					active = ""
					for value in @ids
						if value is @activeId
							active += "<option value='#{value}'>#{value}</option>"
						else
							html += "<option value='#{value}'>#{value}</option>"
					result = active + html
					$toggler.html result
			if general.childobject
				if MB.O.tables[general.childobject]?
					table = MB.O.tables[general.childobject].reload "data", ->
						do callback
			else do callback
		when "data after add"
			instance.mode = "edit"
			for column, i in data.names
				$fw = $container.find ".column-wrapper[data-column='#{column}']"
				isprimary = $fw.hasClass "primarykey"
				unless isprimary
					editor = columns.editor[i]
					val = data.data[0][i]
					$input = $fw.find "input"
					switch editor
						when "checkbox" then $input.prop "checked", do val.bool
						when "select2"
							returnscolumn = columns.returnscolumn[i]
							id = data.data[0][data.names.indexOf returnscolumn]
							text = val
							$input.select2 "data", {id: id, text: text}
						when "select2withEmptyValue"
							returnscolumn = columns.returnscolumn[i]
							id = data.data[0][data.names.indexOf returnscolumn]
							text = val
							$input.select2 "data", {id: id, text: text}
						else $input.val val
				else
					$toggler = $fw.find ".id-toggler"
					html = ""
					active = ""
					for value in @ids
						if value is @activeId
							active += "<option value='#{value}'>#{value}</option>"
						else
							html += "<option value='#{value}'>#{value}</option>"
					result = active + html
					$toggler.html result
			if general.childobject
				if MB.O.tables[general.childobject]?
					table = MB.O.tables[general.childobject].reload "data", ->
						do callback
				else
					do callback
			else
				do callback
			# do callback
		when "add"
			instance.mode = "add"
			for column, i in data.names
				editable = columns.editability[i].bool
				editor = columns.editor[i]
				$fw = $container.find ".column-wrapper[data-column='#{column}']"
				$input = $fw.find "input"
				insertable = columns.insertability[i].bool
				prepareInsertIndex = general.prepareInsert.NAMES.indexOf column
				prepareInsertExists = if prepareInsertIndex > -1 then yes else no
				if prepareInsertExists
					val = general.prepareInsert.DATA[prepareInsertIndex]
					instance.addingStorage[column] = val
				else val = ""
				val = if prepareInsertExists then general.prepareInsert.DATA[prepareInsertIndex] else ""
				isprimary = $fw.hasClass "primarykey"
				if editable
					unless isprimary
						unless insertable
							if editor is "select2" or editor is "select2withEmptyValue"
								$input.select2 "readonly", yes
							else
								$input.attr "readonly"
					else
						$toggler = $fw.find ".id-toggler"
						html = ""
						active = ""
						for value in @ids
							if value is @activeId
								active += "<option value='#{value}'>#{value}</option>"
							else
								html += "<option value='#{value}'>#{value}</option>"
						result = active + html
						$toggler.html result
				else
					if editor is "select2" or editor is "select2withEmptyValue"
						$input.select2 "readonly", yes
					else
						$input.attr "readonly"
				switch editor
					when "checkbox" then $input.prop "checked", (if val is "" then no else do val.bool)
					when "select2"
						if val is "" then $input.select2 "val", ""
						else
							returnscolumn = columns.returnscolumn[i]
							returnscolumnid = general.prepareInsert.DATA[general.prepareInsert.NAMES.indexOf returnscolumn]
							$input.select2 "data", {id: returnscolumnid, text: val}
					when "select2withEmptyValue"
						if val is "" then $input.select2 "val", ""
						else
							returnscolumn = columns.returnscolumn[i]
							returnscolumnid = general.prepareInsert.DATA[general.prepareInsert.NAMES.indexOf returnscolumn]
							$input.select2 "data", {id: returnscolumnid, text: val}
					else $input.val val			
			do callback			
MB.Form::updatecontroller = (part, callback) ->
	instance = @
	general = @profile.general
	data = @data
	columns = @profile.columns
	$container = @$container
	$container.find ".bt-menu-trigger"
	.on "click", (e) ->
		alert 777
	process = (type, column, value) ->
		console.log type, column, value
		if column is 'COLOR'
			$(".column-wrapper[data-column='COLOR'] .colorView").css('backgroundColor',value)
		# $(".column-wrapper[data-column='COLOR']").each (index, elem) ->
		# 	elemInput = $(elem).find('input')
		# 	elemColor = elemInput.val()
		# 	elemBlock = '<div class="colorView" style="background-color:'+value+'"></div>'
		# 	$(elem).prepend elemBlock
		switch type
			when "edit"
				unless instance.editingStorage?
					instance.editingStorage =
						command: "modify"
						object: general.object
						sid: MB.User.sid

					if general.object is 'action'
						if $container.find(".column-wrapper[data-column='NAME'] div.form-control").select2('data') != null
							if $container.find(".column-wrapper[data-column='NAME'] div.form-control").select2('data').id != $container.find(".column-wrapper[data-column='NAME'] div.form-control").select2('data').text
								if $container.find(".column-wrapper[data-column='NAME'] div.form-control").select2('data').id.indexOf('new_') == '-1'
									console.log '11-11-11', $container.find(".column-wrapper[data-column='NAME'] div.form-control").select2('data').id, $container.find(".column-wrapper[data-column='NAME'] div.form-control").select2('data').text
									instance.editingStorage.SHOW_ID = $container.find ".column-wrapper[data-column='NAME'] div.form-control"
										.select2('data').id
					instance.editingStorage.OBJVERSION = do $container.find ".column-wrapper[data-column='OBJVERSION'] input"
						.val
					instance.editingStorage[general.primarykey] = instance.activeId
					instance.editingStorage[column] = value
					$container.find ".form-save-button"
					.removeClass "disabled"
				else
					instance.editingStorage[column] = value
					if general.object is 'action'
						if $container.find(".column-wrapper[data-column='NAME'] div.form-control").select2('data') != null
							if $container.find(".column-wrapper[data-column='NAME'] div.form-control").select2('data').id != $container.find(".column-wrapper[data-column='NAME'] div.form-control").select2('data').text
								if $container.find(".column-wrapper[data-column='NAME'] div.form-control").select2('data').id.indexOf('new_') == '-1'
									console.log '22-22-22', $container.find(".column-wrapper[data-column='NAME'] div.form-control").select2('data').id, $container.find(".column-wrapper[data-column='NAME'] div.form-control").select2('data').text
									instance.editingStorage.SHOW_ID = $container.find ".column-wrapper[data-column='NAME'] div.form-control"
										.select2('data').id
			when "add"
				unless instance.addingStorage
					instance.addingStorage = {}
				instance.addingStorage[column] = value
				if general.object is 'action'
					if $container.find(".column-wrapper[data-column='NAME'] div.form-control").select2('data') != null 
						if $container.find(".column-wrapper[data-column='NAME'] div.form-control").select2('data').id.substr(4) != $container.find(".column-wrapper[data-column='NAME'] div.form-control").select2('data').text
							console.log 'add-add-add', $container.find(".column-wrapper[data-column='NAME'] div.form-control").select2('data').id.substr(4) , $container.find(".column-wrapper[data-column='NAME'] div.form-control").select2('data').text
							instance.addingStorage.SHOW_ID = $container.find ".column-wrapper[data-column='NAME'] div.form-control"
								.select2('data').id


		console.log instance
	handleSelect2 = ($input, column, i, isSelect2withEmptyValue, editOrAdd, isAfterAdd) ->
		if isAfterAdd
			$input.off "change"
		$input.on "change", (e) ->
			console.log e
			console.log isSelect2withEmptyValue
			returnscolumn = columns.returnscolumn[i]
			if isSelect2withEmptyValue
				val = if e.val is "empty" then "" else e.val
			else val = e.val
			console.log 77777777, val
			process editOrAdd, returnscolumn, val
			acreturnscolumns = columns.acreturnscolumns[i].split ","
			if isSelect2withEmptyValue and val is ""
				for value, ii in acreturnscolumns
					instance.$container.find "[data-column='#{value}'] input"
					.val ""
			else if columns.accolumns[i] and val isnt ""
				acobject = columns.accommands[i]
				accolumns = columns.accolumns[i]
				where = "#{returnscolumn} = '#{e.val}'"
				o =
					command: "get"
					object: acobject
					sid: MB.User.sid
					columns: accolumns
					where: where
				MB.Core.sendQuery o, (res) ->
					for value, ii in acreturnscolumns
						instance.$container.find "[data-column='#{value}'] input"
						.val res.DATA[0][ii]
						.trigger 'change'

























	handleSelect2ForActionForm = ($input, column, i, editOrAdd, isAfterAdd) ->
		console.log arguments
		if isAfterAdd
			$input.off "change"
		$input.on "change", (e) ->
			_columns = instance.profile.columns
			returnscolumnForStorage = _columns.returnscolumn[i].split(',')[1]
			returnscolumn = _columns.returnscolumn[i].split(',')[0]
			val = e.val
			valForStorage = e.added.text
			pattern = new RegExp "new_"
			test = pattern.test val
			if test
				val = val.slice 4, val.length
				process editOrAdd, column, val
			else
				process editOrAdd, returnscolumnForStorage, valForStorage
				acreturnscolumns = _columns.acreturnscolumns[i].split ","
				if _columns.accolumns[i]
					acobject = _columns.accommands[i]
					accolumns = _columns.accolumns[i]
					where = "#{returnscolumn} = '#{e.val}'"
					o =
						command: "get"
						object: acobject
						sid: MB.User.sid
						columns: accolumns
						where: where
					MB.Core.sendQuery o, (res) ->
						for value, ii in res.NAMES
							editorType = instance.profile.columns.editor[instance.profile.columns.columnsdb.indexOf value]
							switch editorType
								when "select2", "select2withEmptyValue", "select2FreeType"
									instance.$container.find "[data-column='#{value}'] input"
									.select2 "data",
										id: res.DATA[0][ii]
										text: res.DATA[0][ii]
								else
									instance.$container.find "[data-column='#{value}'] input"
									.val res.DATA[0][ii]
									.trigger 'change'





















	handleSelect2FreeType = ($input, column, i, editOrAdd, isAfterAdd) ->
		console.log arguments
		if isAfterAdd
			$input.off "change"
		$input.on "change", (e) ->
			returnscolumn = columns.returnscolumn[i]
			val = e.val
			pattern = new RegExp "new_"
			test = pattern.test val
			if test
				val = val.slice 4, val.length
				process editOrAdd, column, val
			else
				process editOrAdd, returnscolumn, val
				acreturnscolumns = columns.acreturnscolumns[i].split ","
				if columns.accolumns[i]
					acobject = columns.accommands[i]
					accolumns = columns.accolumns[i]
					where = "#{returnscolumn} = '#{e.val}'"
					o =
						command: "get"
						object: acobject
						sid: MB.User.sid
						columns: accolumns
						where: where
					MB.Core.sendQuery o, (res) ->
						for value, ii in acreturnscolumns
							editorType = instance.profile.columns.editor[instance.profile.columns.columnsdb.indexOf value]
							switch editorType
								when "select2", "select2withEmptyValue", "select2FreeType"
									instance.$container.find "[data-column='#{value}'] input"
									.select2 "data",
										id: res.DATA[0][ii]
										text: res.DATA[0][ii]
								else
									instance.$container.find "[data-column='#{value}'] input"
									.val res.DATA[0][ii]
									.trigger 'change'














	initSelect2ForActionForm = ($input, column, i, mode) ->
		refcolumns = columns.refcolumns[i]
		console.log(refcolumns)
		reference = columns.references[i]
		returnscolumn = columns.returnscolumn[i]
		$input.select2
			placeholder: "Выберите..."
			alllowClear: yes
			initSelection: (element, callback) ->
				# if mode is "add"
				# 	id = general.prepareInsert.DATA[general.prepareInsert.NAMES.indexOf returnscolumn]
				# else
				# 	id = data.data[0][data.names.indexOf returnscolumn]
				text = do $ element
				.val
				callback
					id: text
					text: text
			query: (options) ->
				do (i) ->
					console.log "options", options
					result =
						results: []
					refcolumn = columns.refcolumns[i]
					refcolumnForSearch = columns.refcolumns[i].split(',')[1]
					reference = columns.references[i]
					returnscolumn = columns.returnscolumn[i]
					if options.term isnt ""
						o =
							command: "get"
							object: reference
							columns: refcolumns
							sid: MB.User.sid
							where: "upper(#{refcolumnForSearch}) like upper('%#{options.term}%')"
						MB.Core.sendQuery o, (res) ->
							for value, i in res.DATA
								result.results.push id: value[0], text: value[1]
							result.results.push id: "new_#{options.term}", text: options.term
							options.callback result
					else
						o =
							command: "get"
							object: reference
							columns: refcolumns
							sid: MB.User.sid
						MB.Core.sendQuery o, (res) ->
							result.results.push id: "", text: ""
							for value, i in res.DATA
								result.results.push id: value[0], text: value[1]
							options.callback result
	initSelect2FreeType = ($input, column, i, mode) ->
		refcolumns = columns.refcolumns[i]
		reference = columns.references[i]
		returnscolumn = columns.returnscolumn[i]
		$input.select2
			placeholder: "Выберите..."
			alllowClear: yes
			initSelection: (element, callback) ->
				if mode is "add"
					id = general.prepareInsert.DATA[general.prepareInsert.NAMES.indexOf returnscolumn]
				else
					id = data.data[0][data.names.indexOf returnscolumn]
				text = do $ element
				.val
				callback
					id: id
					text: text
			query: (options) ->
				do (i) ->
					console.log "options", options
					result =
						results: []
					refcolumns = columns.refcolumns[i]
					reference = columns.references[i]
					returnscolumn = columns.returnscolumn[i]
					if options.term isnt ""
						o =
							command: "get"
							object: reference
							columns: refcolumns
							sid: MB.User.sid
							where: "upper(#{refcolumns.split(",")[1]}) like upper('%#{options.term}%')"
						MB.Core.sendQuery o, (res) ->
							for value, i in res.DATA
								result.results.push id: value[0], text: value[1]
							result.results.push id: "new_#{options.term}", text: options.term
							options.callback result
					else
						o =
							command: "get"
							object: reference
							columns: refcolumns
							sid: MB.User.sid
						MB.Core.sendQuery o, (res) ->
							result.results.push id: "", text: ""
							for value, i in res.DATA
								result.results.push id: value[0], text: value[1]
							options.callback result
	initSelect2 = ($input, column, i, isSelect2withEmptyValue, mode) ->
		refcolumns = columns.refcolumns[i]
		reference = columns.references[i]
		returnscolumn = columns.returnscolumn[i]
		$input.select2
			placeholder: "Выберите..."
			alllowClear: yes
			initSelection: (element, callback) ->
				if mode is "add"
					id = general.prepareInsert.DATA[general.prepareInsert.NAMES.indexOf returnscolumn]
				else
					id = data.data[0][data.names.indexOf returnscolumn]
				text = do $ element
				.val
				callback
					id: id
					text: text
			ajax:
				url: "/cgi-bin/b2e"
				dataType: "json"
				data: (term, page) ->
					o =
						command: "get"
						object: reference
						columns: refcolumns
						sid: MB.User.sid
					if columns.selectwhere[i]
						where = ''
						whereColumn = columns.selectwhere[i]
						if instance.addingStorage and instance.addingStorage.hasOwnProperty columns.selectwhere[i]
							where = "#{columns.selectwhere[i]} = '#{instance.addingStorage[whereColumn]}'"

						# console.log "columns.selectwhere[i]", columns.selectwhere[i]
						# $selectWhereColumnInput = $container.find ".column-wrapper[data-column='#{columns.selectwhere[i]}'] input"
						# console.log "$selectWhereColumnInput", $selectWhereColumnInput
						# console.log 'valll', $selectWhereColumnInput.val()
						# selectWhereColumnEditorType = columns.editor[data.names.indexOf columns.selectwhere[i]]
						# console.log "selectWhereColumnEditorType", selectWhereColumnEditorType
						# if selectWhereColumnEditorType is "select2" or selectWhereColumnEditorType is "select2withEmptyValue"
						# 	selectWhereColumnReturnsColumn = columns.returnscolumn[data.names.indexOf columns.selectwhere[i]]
						# 	where = "#{selectWhereColumnReturnsColumn} = '#{$selectWhereColumnInput.select2 "val"}'"
						# else
						# 	console.log "selectWhereColumnEditorType", selectWhereColumnEditorType
						# 	# returnValue = instance.dropdowns[columns.selectwhere[i]].
						# 	returnValue = ""
						# 	# for value, ii in instance.dropdowns[columns.selectwhere[i]].DATA
						# 	# 	if 
						# 	window.abc = $selectWhereColumnInput
						# 	where = "#{columns.selectwhere[i]} = '#{$selectWhereColumnInput.val()}'"
						o.where = where
					console.log MB.Core.makeQuery o
					request: MB.Core.makeQuery o
				results: (data, page) ->
					console.log data
					data = MB.Form.parseforselect2data data
					if isSelect2withEmptyValue then data.unshift
							id: "empty"
							text: ""
					unless instance.dropdowns then instance.dropdowns = {}
					instance.dropdowns[returnscolumn] = data
					results: data
	changeDate= (column, e, mode) ->
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
		process mode, column, result
	# changeColor = (column, e, mode) ->
	# 	process mode, column, result	
	console.log 'PART fff', part
	switch part
		when "addinit"
			$container.find ".bt-menu-trigger"
			.on "click", (e) ->
				alert 777
			data =
				names: columns.columnsdb
			for column, i in data.names
				do (column, i) ->
					editable = do columns.editability[i].bool
					editor = columns.editor[i]
					$fw = $container.find ".column-wrapper[data-column='#{column}']"
					$input = $fw.find "input"
					switch editor
						when "File"
							$input.on "change", (e) ->
								addOrEditHere = if instance.activeId is 'new' then "add" else "edit"
								process addOrEditHere, column, $input.val()
						when "checkbox"
							$input.on "change", (e) ->
								checked = $ e.target
								.prop "checked"
								if checked then process "add", column, "TRUE" else process "edit", column, "FALSE"
						when "select2"
							initSelect2 $input, column, i, no, "add"
							handleSelect2 $input, column, i, no, "add", no
						when "select2withEmptyValue"
							initSelect2 $input, column, i, yes, "add"
							handleSelect2 $input, column, i, yes, "add", no
						when "select2FreeType"
							initSelect2FreeType $input, column, i, "add"
							handleSelect2FreeType $input, column, i, "add", no
						when "select2ForActionForm"
							initSelect2ForActionForm $input, column, i, "add"
							handleSelect2ForActionForm $input, column, i, "add", no
						when "datetime"
							$input.datetimepicker
								format: "dd.mm.yyyy hh:ii"
								autoclose: true
								todayHighlight: true
								startDate: new Date
								minuteStep: 10
								keyboardNavigation: true
								todayBtn: true
								firstDay: 1
								weekStart: 1
								language: "ru"
							.on "changeDate", (e) ->
								changeDate column, e, "add"
						when "colorpicker"
							$input.colorpicker()
							.on "changeColor", (e) ->
								val = do e.color.toHex
								process "add", column, val
						else
							$input.on "keyup change", (e) ->
								process "add", column, e.target.value
			$container.find ".portlet-title"
			.on "click", (e) ->
				$target = $ e.target
				if $target.hasClass "reload"
					alert "Нельзя обновить запись в режиме добавления!"
			$container.find ".form-create-button"
			.on "click", (e) ->
				alert "Вы уже в режиме создания"
			$container.find ".form-delete-button"
			.on "click", (e) ->
				alert "Нельзя ..."
			$container.find ".form-save-button"
			.on "click", ->
				# reqiredFillCheck = yes
				# for value, i in instance.profile.columns.required
				# 	if do value.bool
				# 		console.log instance.profile.columns.columnsdb[i]
				# 		if instance.addingStorage.hasOwnProperty instance.profile.columns.columnsdb[i] then continue
						
				# 		else reqiredFillCheck = no
				# console.log reqiredFillCheck
				# if reqiredFillCheck
				MB.Core.sendQuery instance.addingStorage, (res) ->
					toastr[res.TOAST_TYPE] res.MESSAGE, res.TITLE
					if parseInt(res.RC) is 0
						id = res.ID
						delete instance.addingStorage
						# do instance.ids.shift
						instance.ids[0] = id
						# instance.ids.unshift id
						instance.prevActiveId = instance.activeId
						instance.activeId = id
						if instance.parentobject then MB.O.tables[instance.parentobject].reload "data"
						instance.reload "data after add"
				# else
				# 	alert "Заполните обязательные поля!"
			# instance.tabs.updateState "add"
			# do callback
			if do general.custom.bool
				$.getScript "html/forms/#{instance.name}/#{instance.name}.js", (data, status, xhr) ->
					instance.custom ->
						instance.tabs = new TabsClass
							instance: instance
							# state: "init"
						instance.tabs.updateState "addinit"
						do callback
			else
				do callback
		when "init"
			for column, i in data.names
				do (column, i) ->
					editable = do columns.editability[i].bool
					if editable
						editor = columns.editor[i]
						$fw = $container.find ".column-wrapper[data-column='#{column}']"
						$input = $fw.find "input"
						switch editor
							when "File"
								$input.on "change", (e) ->
									process "edit", column, $input.val()
							when "checkbox"
								$input.on "change", (e) ->
									checked = $ e.target
									.prop "checked"
									if checked then process "edit", column, "TRUE" else process "edit", column, "FALSE"
							when "select2"
								initSelect2 $input, column, i, no, "edit"
								handleSelect2 $input, column, i, no, "edit", no
							when "select2withEmptyValue"
								initSelect2 $input, column, i, yes, "edit"
								handleSelect2 $input, column, i, yes, "edit", no
							when "select2FreeType"
								initSelect2FreeType $input, column, i, "edit"
								handleSelect2FreeType $input, column, i, "edit", no
							when "select2ForActionForm"
								initSelect2ForActionForm $input, column, i, "edit"
								handleSelect2ForActionForm $input, column, i, "edit", no
							when "datetime"
								$input.datetimepicker
									format: "dd.mm.yyyy hh:ii"
									autoclose: true
									todayHighlight: true
									minuteStep: 10
									keyboardNavigation: true
									todayBtn: true
									firstDay: 1
									weekStart: 1
									language: "ru"
								.on "changeDate", (e) ->
									changeDate column, e, "edit"
							when "colorpicker"
								$input.colorpicker()
								.on "changeColor", (e) ->
									val = do e.color.toHex
									process "edit", column, val
							else
								$input.on "keyup change", (e) ->
									process "edit", column, e.target.value
			$container.find ".gotos-wrapper li"
			.on "click", (e) ->
				object = $ @
				.data "goto"
				o =
					type: "table"
					name: object
				MB.Core.switchModal o
			$container.find ".portlet-title"
			.on "click", (e) ->
				$target = $ e.target
				if $target.hasClass "reload"
					if instance.addingStorage?
						alert "Нельзя обновить запись в режиме добавления!"
					else if instance.editingStorage?
						bootbox.dialog
							message: "Вы уверены что не хотите сохранить изменения?"
							title: "Есть не сохраннные изменения"
							buttons:
								success:
									label: "Да"
									assName: "green"
									callback: ->
										instance.reload "data"
								danger:
									label: "Нет"
									className: "red"
									callback: ->
					else
						instance.reload "data"
			$container.find ".bt-menu-trigger"
			.on "click", (e) ->
				alert 777

			$container.find ".id-toggler"
			.off()
			.on "change", (e) ->
				$toggler = $ e.target
				val = do $toggler.val
				if instance.addingStorage?
					bootbox.dialog
						message: "Новая запись будет утерена. Вы уверены что хотите продолжить?"
						title: "Есть не сохраннные изменения"
						buttons:
							success:
								label: "Да"
								assName: "green"
								callback: ->
									delete instance.addingStorage
									instance.reload "data after add"
							danger:
								label: "Нет"
								className: "red"
								callback: ->
				else
					instance.prevActiveId = instance.activeId
					instance.activeId = val
					instance.ids.unshift 
					instance.reload "data"
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
									instance.updatemodel "add", null, ->
										instance.updateview "add", ->
											instance.updatecontroller "add", ->
							danger:
								label: "Нет"
								className: "red"
								callback: ->
				else
					instance.updatemodel "add", null, ->
						instance.updateview "add", ->
							instance.updatecontroller "add", ->
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
			$container.find ".form-save-button"
			.on "click", ->
				if instance.editingStorage?
					MB.Core.sendQuery instance.editingStorage, (res) ->
						toastr[res.TOAST_TYPE] res.MESSAGE, res.TITLE
						delete instance.editingStorage
						instance.reload "data"
				else
					alert "Нет изменений для сохранения"
			if do general.custom.bool
				$.getScript "html/forms/#{instance.name}/#{instance.name}.js", (data, status, xhr) ->
					instance.custom ->
						instance.tabs = new TabsClass
							instance: instance
							# state: "init"
						instance.tabs.updateState "init"
						do callback
			else
				do callback
		when "data"
			instance.tabs.updateState "edit"
			if do general.custom.bool
				$.getScript "html/forms/#{instance.name}/#{instance.name}.js", (data, status, xhr) ->
					instance.custom ->
						instance.tabs = new TabsClass
							instance: instance
							# state: "init"
						instance.tabs.updateState "init"
						do callback
			else
				do callback
		when "data after add"
			instance.tabs.updateState "edit"
			for column, i in data.names
				do (column, i) ->
					editable = do columns.editability[i].bool
					$fw = $container.find ".column-wrapper[data-column='#{column}']"
					$input = $fw.find "input"
					if editable
						updatable = columns.updatability[i].bool
						editor = columns.editor[i]
						if updatable
							switch editor
								when "File"
									$input.on "change", (e) ->
										process "edit", column, $input.val()
								when "checkbox"
									$input.off "change"
									.on "change", (e) ->
										checked = $ e.target
										.prop "checked"
										if checked then process "edit", column, "TRUE" else process "edit", column, "FALSE"
								when "select2"
									handleSelect2 $input, column, i, no, "edit", yes
								when "select2withEmptyValue"
									handleSelect2 $input, column, i, yes, "edit", yes
								when "select2FreeType"
									handleSelect2FreeType $input, column, i, no, "edit", yes
								when "select2ForActionForm"
									handleSelect2ForActionForm $input, column, i, no, "edit", yes
								when "datetime"
									$input.off "changeDate"
									.on "changeDate", (e) ->
										changeDate column, e, "edit"
								else
									$input.off "keyup"
									.on "keyup change", (e) ->
										process "edit", column, e.target.value
						else
							if editor is "datetime"
								$input.off "changeDate"
							else
								$input.off "change"
			$container.find ".portlet-title"
			.off "click"
			.on "click", (e) ->
				$target = $ e.target
				if $target.hasClass "reload"
					if instance.addingStorage?
						alert "Нельзя обновить запись в режиме добавления!"
					else if instance.editingStorage?
						bootbox.dialog
							message: "Вы уверены что не хотите сохранить изменения?"
							title: "Есть не сохраннные изменения"
							buttons:
								success:
									label: "Да"
									assName: "green"
									callback: ->
										instance.reload "data"
								danger:
									label: "Нет"
									className: "red"
									callback: ->
					else
						instance.reload "data"
			$container.find ".id-toggler"
			.off "change"
			.on "change", (e) ->
				$toggler = $ e.target
				val = do $toggler.val
				if instance.addingStorage?
					bootbox.dialog
						message: "Новая запись будет утерена. Вы уверены что хотите продолжить?"
						title: "Есть не сохраннные изменения"
						buttons:
							success:
								label: "Да"
								assName: "green"
								callback: ->
									delete instance.addingStorage
									instance.reload "data after add"
							danger:
								label: "Нет"
								className: "red"
								callback: ->
				else
					instance.prevActiveId = instance.activeId
					instance.activeId = val
					instance.ids.unshift 
					instance.reload "data"
			$container.find ".form-create-button"
			.off "click"
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
									instance.updatemodel "add", null, ->
										instance.updateview "add", ->
											instance.updatecontroller "add", ->
							danger:
								label: "Нет"
								className: "red"
								callback: ->
				else
					instance.updatemodel "add", null, ->
						instance.updateview "add", ->
							instance.updatecontroller "add", ->
			$container.find ".form-delete-button"
			.off "click"
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
			# instance.tabs.updateState "edit"
			if do general.custom.bool
				$.getScript "html/forms/#{instance.name}/#{instance.name}.js", (data, status, xhr) ->
					instance.custom ->
						do callback
			else
				do callback
		when "add"
			for column, i in data.names
				do (column, i) ->
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
									returnscolumn = columns.returnscolumn[i]
									newval = e.val
									process "add", returnscolumn, newval
							else if editor is "datetime"
								$input.off "changeDate"
								.on "changeDate", (e) ->
									changeDate column, e, "add"
							else
								$input.off "keyup"
								.on "keyup", (e) ->
									process "add", column, e.target.value
						else
							if editor is "datetime"
								$input.off "changeDate"
							else
								$input.off "change"
			$container.find ".form-save-button"
			.off "click"
			.on "click", ->
				MB.Core.sendQuery instance.addingStorage, (res) ->
					toastr[res.TOAST_TYPE] res.MESSAGE, res.TITLE
					id = res.ID
					delete instance.addingStorage
					do instance.ids.shift
					instance.ids.unshift id
					instance.prevActiveId = instance.activeId
					instance.activeId = id
					instance.reload "data after add"
			instance.tabs.updateState "edit"
			do callback
MB.Form::reload = (part, callback) ->
	instance = @
	switch part
		when "data"
			instance.getdata instance.activeId, (res) ->
				instance.updatemodel "data", res, ->
					instance.updateview "data", ->
						instance.updatecontroller "data", ->
							if instance.profile.general.childobject
								MB.O.tables[instance.profile.general.childobject].reload "data"
							if instance.parentobject
								MB.O.tables[instance.parentobject].reload "data"
							if callback then do callback
		when "data after add"
			instance.getdata instance.activeId, (res) ->
				instance.updatemodel "data", res, ->
					instance.updateview "data after add", ->
						instance.updatecontroller "data after add", ->
							if callback then do callback
# MB.Form::init = ->
# 	instance = @
# 	instance.loadhtml ->
# 		instance.getdata instance.activeId, (res) ->
# 			instance.updatemodel res, ->
# 				instance.updateview "form", ->
# 					instance.updatecontroller()
# MB.Form::createmodallistitem = ->
# 	instance = @
# 	$(".modals-list").append "<li data-type='form' data-object='" + instance.name + "'><i class='cross fa fa-times-circle'></i>" + instance.profile.general.objectname + "</li>"
# MB.Form::showit = (init) ->
# 	instance = @
# 	query = "#modal_" + MB.User.activemodal + "_wrapper"
# 	$(query).hide()
# 	query = "#modal_" + instance.name + "_wrapper"
# 	$(query).show()
# 	instance.createmodallistitem()  if init
# 	MB.User.activemodal = instance.name
# 	MB.User.loadedmodals.push instance.name













































