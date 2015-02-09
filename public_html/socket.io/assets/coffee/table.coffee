MB = window.MB or {}

MB.Table = (options) ->
	instance = @
	instance.name = options.name or do MB.Core.guid
	instance.world = options.world or "page"
	if options.params
		for key, value of options.params
			instance[key] = value
	return

MB.Table.getSelectedRowsInterval = (handsontableInstance) ->
	arr = do handsontableInstance.getSelected
	if arr[0] > arr[2]
		start = arr[2]
		end = arr[0]
	else
		start = arr[0]
		end = arr[2]
	[start, end]

MB.Table.createOpenInModalContextMenuItem = (instance, key, options) ->
	$handsontable = instance.$container.find ".handsontable"
	handsontableInstance = $handsontable.handsontable "getInstance"
	selectedRowsInterval = MB.Table.getSelectedRowsInterval handsontableInstance
	ids = []
	i = selectedRowsInterval[0]
	while i <= selectedRowsInterval[1]
		id = instance.data.data[i][instance.data.names.indexOf instance.profile.general.primarykey]
		ids.push id
		++i
	if ids.length > 0
		MB.Core.switchModal
			type: "form"
			ids: ids
			name: instance.profile.general.juniorobject
			params:
				parentobject: instance.name

MB.Table.parseprofile = (data, callback) ->
	parsedProfile = {}
	for key, value of data.OBJECT_PROFILE
		parsedProfile[key] = value
	for name, i in data.NAMES
		parsedProfile[name] = []
		for row, ii in data.DATA
			parsedProfile[name].push data.DATA[ii][i]
	callback parsedProfile

MB.Table.hasloaded = (name) ->
	if MB.O.tables.hasOwnProperty name then true else false

MB.Table.find = (name) ->
	MB.O.tables[name]

MB.Table.show = (area, name) ->
	table = MB.O.tables[name]
	do $ ".page-item"
	.hide
	query = "#" + area + "_" + name + "_wrapper"
	do $ query
	.show
	MB.User.activepage = table.name
	MB.User.loadedpages.push table.name

MB.Table.parseforselect2data = (res) ->
	data = []
	if res.NAMES.length isnt 2
		alert "В parseforselect2data приходит не 2 колонки!"
	else
		for value, i in res.DATA
			data.push
				id: res.DATA[i][0]
				text: res.DATA[i][1]
	data

MB.Table::create = (callback) ->
	instance = @
	instance.makedir ->
		instance.makecontainer ->
			instance.getprofile (res) ->
				instance.updatemodel "profile", res, ->
					instance.getdata (res) ->
						instance.updatemodel "data", res, ->
							instance.updateview "init", ->
								instance.updatecontroller "init", ->
									do callback

MB.Table::makedir = (callback) ->
	instance = @
	MB.O.tables[instance.name] = instance
	do callback

MB.Table::makecontainer = (callback) ->
	instance = @
	$worldcontainer = $ "." + instance.world + "-content-wrapper"
	$container = $ "<div id='" + instance.world + "_" + instance.name + "_wrapper' class='" + instance.world + "-item'></div>"
	$worldcontainer.append $container
	instance.$worldcontainer = $worldcontainer
	instance.$container = $container
	do callback

MB.Table::getprofile = (callback) ->
	instance = @
	o =
		command: "get"
		object: "user_object_profile"
		client_object: instance.name
		sid: MB.User.sid
	MB.Core.sendQuery o, (res) ->
		callback res

MB.Table::getdata = (callback) ->
	instance = @
	arrWhere = []
	where = ""
	defaultWhere = instance.profile.general.where
	filterWhere = ""
	parentWhere = ""
	parentWhere += instance.profile.general.parentkey + " = '" + instance.parentkeyvalue + "'"  if instance.parentkeyvalue
	if Object.keys(instance.profile.general.filterWhere).length > 0
		arr = []
		for key, value of instance.profile.general.filterWhere
			if value.type is "equal"
				arr.push "" + key + " = '" + value.value + "'"
			else if value.type is "daterange"
				arr.push "" + key + " >= to_date('" + value.start + "', 'DD.MM.YYYY')"
				arr.push "" + key + " <= to_date('" + value.end + "', 'DD.MM.YYYY')"
			else if value.type is "notIn"
				k = key.substr 0, (key.length - 1)
				arr.push "" + k + " not in " + value.value
		filterWhere = arr.join " and "
	arrWhere.push defaultWhere if defaultWhere
	arrWhere.push filterWhere if filterWhere
	arrWhere.push parentWhere if parentWhere
	if arrWhere.length > 0
		if arrWhere.length is 1
			where = arrWhere[0]
		else
			where = arrWhere.join " and "
	o =
		command: "get"
		object: instance.profile.general.getobject
		where: where
		order_by: instance.profile.general.orderby
		client_object: instance.name
		rows_max_num: instance.profile.general.rowsmaxnum
		page_no: instance.profile.general.pageno
		sid: MB.User.sid
	MB.Core.sendQuery o, (res) ->
		callback res

MB.Table::distributeprofile = (parsedprofile, callback) ->
	instance = @
	instance.profile = {}
	instance.profile.general = {}
	instance.profile.columns = {}
	instance.profile.general.prepareInsert = parsedprofile.PREPARE_INSERT
	instance.profile.general.rowsmaxnum = parsedprofile.ROWS_MAX_NUM
	instance.profile.general.primarykey = parsedprofile.PRIMARY_KEY
	instance.profile.general.parentkey = parsedprofile.PARENT_KEY
	instance.profile.general.orderby = parsedprofile.DEFAULT_ORDER_BY
	instance.profile.general.object = parsedprofile.OBJECT_COMMAND
	instance.profile.general.getobject = parsedprofile.GET_OBJECT_COMMAND
	instance.profile.general.tablename = parsedprofile.CLIENT_OBJECT_NAME
	instance.profile.general.newcommand = parsedprofile.NEW_COMMAND
	instance.profile.general.removecommand = parsedprofile.REMOVE_COMMAND
	instance.profile.general.juniorobject = parsedprofile.OPEN_FORM_CLIENT_OBJECT
	instance.profile.general.modifycommand = parsedprofile.MODIFY_COMMAND
	instance.profile.general.custom = parsedprofile.ADDITIONAL_FUNCTIONALITY
	instance.profile.general.pageno = 1
	instance.profile.columns.align = parsedprofile.ALIGN
	instance.profile.columns.columnsclient = parsedprofile.NAME
	instance.profile.columns.columnsdb = parsedprofile.COLUMN_NAME
	instance.profile.columns.editability = parsedprofile.EDITABLE
	instance.profile.columns.keys = parsedprofile.PRIMARY_KEY
	instance.profile.columns.editor = parsedprofile.TYPE_OF_EDITOR
	instance.profile.columns.visibility = parsedprofile.VISIBLE
	instance.profile.columns.width = parsedprofile.WIDTH
	instance.profile.columns.refclientobj = parsedprofile.REFERENCE_CLIENT_OBJECT
	instance.profile.columns.returnscolumn = parsedprofile.LOV_RETURN_TO_COLUMN
	instance.profile.columns.refcolumns = parsedprofile.LOV_COLUMNS
	instance.profile.columns.references = parsedprofile.LOV_COMMAND
	instance.profile.columns.refwhere = parsedprofile.LOV_WHERE
	instance.profile.columns.acwhere = parsedprofile.AC_WHERE
	instance.profile.columns.acreturnscolumns = parsedprofile.AC_RETURN_TO_COLUMN
	instance.profile.columns.accolumns = parsedprofile.AC_COLUMNS
	instance.profile.columns.accommands = parsedprofile.AC_COMMAND
	instance.profile.columns.filterType = parsedprofile.FILTER_TYPE
	instance.profile.columns.filterTypeRu = parsedprofile.FILTER_TYPE_RU
	instance.profile.columns.filterObject = parsedprofile.FILTER_COMMAND
	instance.profile.columns.filterQueryColumns = parsedprofile.FILTER_COLUMNS
	instance.profile.general.where = parsedprofile.DEFAULT_WHERE
	instance.profile.general.filterWhere = {}
	do callback

MB.Table::distributedata = (data, callback) ->
	instance = @
	instance.data = {}
	instance.data.data = data.DATA
	instance.data.names = data.NAMES
	instance.data.info = data.INFO
	instance.data.dropdownsData = {}
	do callback

MB.Table::removemodallistitem = ->
	instance = @
	do $ ".modals-list"
	.find "[data-object='" + instance.name + "']"
	.remove

MB.Table::closeit = ->
	instance = @
	if instance.world is "page"
		query = "#page_" + instance.name + "_wrapper"
		do $query
		.hide
	else
		query = "#modal_" + instance.name + "_wrapper"
		do $query
		.hide
		do instance.removemodallistitem

MB.Table::createmodallistitem = ->
	instance = @
	$ ".modals-list"
	.append "<li data-type='table' data-object='" + instance.name + "'><i class='cross fa fa-times-circle'></i>" + instance.profile.general.tablename + "</li>"

MB.Table::showit = (init) ->
	instance = @
	if instance.world is "page"
		query = "#page_" + MB.User.activepage + "_wrapper"
		do $ query
		.hide
		query = "#page_" + instance.name + "_wrapper"
		do $ query
		.show
		MB.User.activepage = instance.name
		MB.User.loadedpages.push instance.name
	else
		query = "#modal_" + MB.User.activemodal + "_wrapper"
		do $ query
		.hide
		query = "#modal_" + instance.name + "_wrapper"
		do $ query
		.show
		do instance.createmodallistitem if init
		MB.User.activemodal = instance.name
		MB.User.loadedmodals.push instance.name

MB.Table.NewRow = ->
	"newrow"

MB.Table::updatemodel = (part, data, callback) ->
	instance = @
	if part is "profile"
		MB.Table.parseprofile data, (parsedprofile) ->
			instance.distributeprofile parsedprofile, ->
				do callback
	else if part is "data"
		instance.distributedata data, ->
			do callback
	else if part is "addrow"
		instance.data.data.unshift MB.Table.NewRow()
		do callback

MB.Table::makenewrow = (callback) ->
	instance = @
	instance.$container.find ".handsontable"
	.handsontable "getInstance"
	.alter "insert_row", 0, 1, "addd"
	do callback

MB.Table::initTable = (callback) ->
	instance = @
	config =
		autoWrapCol: true
		autoWrapRow: true
		columnSorting: true
		enterBeginsEditing: false
		fillHandle: false
		manualColumnMove: true
		manualColumnResize: true
		multiSelect: true
		outsideClickDeselects: true
		undo: true
		stretchH: "all"
		currentRowClassName: "currentRow"
		currentColClassName: "currentCol"
		rowHeaders: (index) ->
			"<div><input type='checkbox' class='row-checker' data-row='" + index + "'></div>"
		columns: do ->
			columns = []
			instance.profile.columns.columnsdb.forEach (value, i, array) ->
				if do instance.profile.columns.visibility[i].bool
					if do instance.profile.general.modifycommand.bool
						unless do instance.profile.columns.editability[i].bool
							column =
								data: instance.profile.columns.columnsdb[i]
								readOnly: true
						else
							editor = instance.profile.columns.editor[i]
							if editor is "text" or editor is "number"
								column =
									type: "text"
									data: instance.profile.columns.columnsdb[i]
							else if editor is "select2"
								do (i) ->
									j = i
									column =
										type: "autocomplete"
										data: instance.profile.columns.columnsdb[j]
										source: (query, process) ->
											o =
												command: "get"
												object: instance.profile.columns.references[j]
												sid: MB.User.sid
												columns: instance.profile.columns.refcolumns[j]
											$.ajax
												url: "/cgi-bin/b2cJ/"
												dataType: "json"
												data:
													p_xml: MB.Core.makeQuery o
												success: (response) ->
													instance.data.dropdownsData[instance.profile.columns.columnsdb[j]] = response
													list = []
													for value, i in response.DATA
														list.push value[1]
													process list
													return
										strict: true
							else if editor is "select2withEmptyValue"
								do (i) ->
									j = i
									column =
										type: "autocomplete"
										data: instance.profile.columns.columnsdb[j]
										source: (query, process) ->
											o =
												command: "get"
												object: instance.profile.columns.references[j]
												sid: MB.User.sid
												columns: instance.profile.columns.refcolumns[j]
											$.ajax
												url: "/cgi-bin/b2cJ/"
												dataType: "json"
												data:
													p_xml: MB.Core.makeQuery o
												success: (response) ->
													instance.data.dropdownsData[instance.profile.columns.columnsdb[j]] = response
													if not (instance.data.dropdownsData[instance.profile.columns.columnsdb[j]].DATA[0][0] is "" and instance.data.dropdownsData[instance.profile.columns.columnsdb[j]].DATA[0][0] is "")
														instance.data.dropdownsData[instance.profile.columns.columnsdb[j]].DATA.unshift ["", ""]
													list = []
													for value, i in response.DATA
														list.push value[1]
													process list
													return
										strict: true
							else if editor is "checkbox"
								column =
									data: instance.profile.columns.columnsdb[i]
									type: "checkbox"
									checkedTemplate: "TRUE"
									uncheckedTemplate: "FALSE"
							else if editor is "datetime"
								column =
									data: instance.profile.columns.columnsdb[i]
									type: "date"
									dateFormat: "mm/dd/yy"
							else if editor is "password"
								column =
									data: instance.profile.columns.columnsdb[i]
									type: "password"
									hashSymbol: "&#9632;"
					else
						column =
							data: instance.profile.columns.columnsdb[i]
							readOnly: true
					columns.push column
			columns
		data: do ->
			data = []
			instance.data.data.forEach (value, i, array) ->
				rowObject = {}
				instance.profile.columns.columnsdb.forEach (value2, i2, array2) ->
					if do instance.profile.columns.visibility[i2].bool
						rowObject[value2] = array[i][array2.indexOf value2]
						rowObject.rowStatus = "justRow"
				data.push rowObject
			data
		colHeaders: do ->
			colHeaders = []
			for value, i in instance.profile.columns.columnsclient
				colHeaders.push value if do instance.profile.columns.visibility[i].bool
			colHeaders
		dataSchema: ->
			o = {}
			for value, i in instance.profile.general.prepareInsert.NAMES
				o[value] = instance.profile.general.prepareInsert.DATA[i]
			o
		afterChange: (changes, source) ->
			console.log arguments
			if source isnt "loadData"
				row = changes[0][0]
				prop = changes[0][1]
				oldVal = changes[0][2]
				newVal = changes[0][3]
				$handsontable = instance.$container.find ".handsontable"
				handsontableInstance = $handsontable.handsontable "getInstance"
				if source is "edit" and prop isnt "rowStatus" and prop isnt "guid"
					index = instance.profile.columns.columnsdb.indexOf prop
					if instance.profile.columns.editor[index] is "select2" or instance.profile.columns.editor[index] is "select2withEmptyValue"
						colHeaders = do handsontableInstance.getColHeader
						isReturnColumnVisible = no
						for value, i in colHeaders
							isReturnColumnVisible = yes if (handsontableInstance.colToProp i) is instance.profile.columns.returnscolumn[index]
						if isReturnColumnVisible
							dropdownIndex = null
							for value, i in instance.data.dropdownsData[prop].DATA
								dropdownIndex = i if value.indexOf(newVal) > -1
							handsontableInstance.setDataAtRowProp row, instance.profile.columns.returnscolumn[index], instance.data.dropdownsData[prop].DATA[dropdownIndex][0]
						else
							instance.editingStorage = instance.editingStorage or {}
							primaryKeyId = instance.data.data[row][instance.data.names.indexOf instance.profile.general.primarykey]
							if newVal is ""
								if instance.editingStorage[primaryKeyId]?
									instance.editingStorage[primaryKeyId][instance.profile.columns.returnscolumn[index]] = newVal
								else
									objversion = instance.data.data[row][instance.data.names.indexOf "OBJVERSION"]
									instance.editingStorage[primaryKeyId] =
										command: "modify"
										object: instance.profile.general.object
										sid: MB.User.sid
									instance.editingStorage[primaryKeyId][instance.profile.general.primarykey] = primaryKeyId
									instance.editingStorage[primaryKeyId][instance.profile.columns.returnscolumn[index]] = newVal
									instance.editingStorage[primaryKeyId]["OBJVERSION"] = objversion
							else
								if instance.editingStorage[primaryKeyId]?
									instance.editingStorage[primaryKeyId][instance.profile.columns.returnscolumn[index]] = instance.data.data[row][instance.profile.columns.columnsdb.indexOf instance.profile.columns.returnscolumn[index]]
								else
									objversion = instance.data.data[row][instance.data.names.indexOf "OBJVERSION"]
									instance.editingStorage[primaryKeyId] =
										command: "modify"
										object: instance.profile.general.object
										sid: MB.User.sid
									instance.editingStorage[primaryKeyId][instance.profile.general.primarykey] = primaryKeyId
									dropdownIndex = null
									for value, i in instance.data.dropdownsData[prop].DATA
										dropdownIndex = i if (value.indexOf(newVal)) > -1
									instance.editingStorage[primaryKeyId][instance.profile.columns.returnscolumn[index]] = instance.data.dropdownsData[prop].DATA[dropdownIndex][0]
									instance.editingStorage[primaryKeyId]["OBJVERSION"] = objversion
					rowStatus = handsontableInstance.getDataAtRowProp row, "rowStatus"
					switch rowStatus
						when "justRow"
							handsontableInstance.setDataAtRowProp row, "rowStatus", "editedRow"
							instance.editingStorage = instance.editingStorage or {}
							primaryKeyId = instance.data.data[row][instance.data.names.indexOf instance.profile.general.primarykey]
							if instance.editingStorage[primaryKeyId]?
								instance.editingStorage[primaryKeyId][prop] = newVal
								return do handsontableInstance.render
							else
								objversion = instance.data.data[row][instance.data.names.indexOf "OBJVERSION"]
								instance.editingStorage[primaryKeyId] =
									command: "modify"
									object: instance.profile.general.object
									sid: MB.User.sid
								instance.editingStorage[primaryKeyId][instance.profile.general.primarykey] = primaryKeyId
								instance.editingStorage[primaryKeyId][prop] = newVal
								instance.editingStorage[primaryKeyId]["OBJVERSION"] = objversion
								return do handsontableInstance.render
						when "addingRow"
							guid = handsontableInstance.getDataAtRowProp row, "guid"
							instance.addingStorage[guid][prop] = newVal
				debugger
		afterCreateRow: (index, ammount) ->
			$handsontable = instance.$container.find ".handsontable"
			handsontableInstance = $handsontable.handsontable "getInstance"
			guid = do MB.Core.guid
			handsontableInstance.setDataAtRowProp index, "rowStatus", "addingRow"
			handsontableInstance.setDataAtRowProp index, "guid", guid
			instance.addingStorage = instance.addingStorage or {}
			instance.addingStorage[guid] =
				command: "new"
				object: instance.profile.general.object
				sid: MB.User.sid
			for value, i in instance.profile.general.prepareInsert.NAMES
				instance.addingStorage[guid][value] = instance.profile.general.prepareInsert.DATA[i]
			if instance.parentobject?
				parent = MB.O.forms[instance.parentobject]
				instance.addingStorage[guid][parent.profile.general.primarykey] = parent.activeId
		contextMenu:
			callback: (key, options) ->
				if key is "openInModal"
					MB.Table.createOpenInModalContextMenuItem instance, key, options
			items:
				openInModal:
					name: "Открыть в форме ..."
	$handsontable = instance.$container.find ".handsontable"
	$handsontable.handsontable config
	do callback

MB.Table::updateTable = (callback) ->
	instance = @
	config =
		data: do ->
			data = []
			for value, i in instance.data.data
				rowObject = {}
				for column, ii in instance.profile.columns.columnsdb
						rowObject[column] = instance.data.data[i][instance.profile.columns.columnsdb.indexOf column]
						rowObject.rowStatus = "justRow"
				data.push rowObject
			data
	$handsontable = instance.$container.find ".handsontable"
	handsontableInstance = $handsontable.handsontable "getInstance"
	handsontableInstance.updateSettings config
	do callback

MB.Table::updateview = (part, callback) ->
	instance = @
	if part is "init"
		instance.makeheader (header) ->
			instance.maketoppanel (toppanel) ->
				instance.maketable (table) ->
					instance.concathtml
						header: header
						toppanel: toppanel
						table: table
					, (concatedhtml) ->
						instance.loadhtml
							init: concatedhtml
						, ->
							instance.initTable ->
								do callback
	else if part is "data"
		instance.maketable (table) ->
			instance.loadhtml
				data: table
			, ->
				instance.updateTable ->
				do callback
	else if part is "data pagination"
		instance.maketable (table) ->
			instance.makepagination (pagination) ->
				instance.loadhtml
					data: table
					pagination: pagination
				, ->
					do callback
	else if part is "addrow"
		instance.makenewrow ->
			do callback

MB.Table::loadhtml = (options, callback) ->
	instance = @
	query = "#" + instance.world + "_" + instance.name + "_wrapper"
	for key, value of options
		if key is "init"
			$ query
			.html options[key]
			$ query
			.find ".pagination input"
			.val 1
			do callback
		else if key is "data"
			do callback
		else if key is "pagination"
			$ query
			.find ".pagination"
			.empty()
			.html options[key]
			do callback
		else
			do callback

MB.Table::concathtml = (htmls, callback) ->
	instance = @
	html = ""
	html += "<div class='row'><div class='col-md-12'><div class='portlet box blue'>"
	html += htmls.header
	html += "<div class='portlet-body'>"
	html += htmls.toppanel
	html += "<div class='row'>"
	html += htmls.table
	html += "</div>"
	html += "</div></div></div></div>"
	callback html

MB.Table::makeheader = (callback) ->
	instance = @
	html = ""
	pageNumber = parseInt instance.profile.general.pageno
	numberOfPages = Math.ceil (instance.data.info.ROWS_COUNT / instance.profile.general.rowsmaxnum)
	html += "<div class='portlet-title'> <div class='caption'> <i class='fa fa-globe'></i>" + instance.profile.general.tablename + "</div> <div class='tools'> <a href='#portlet-config' data-toggle='modal' class='config'></a> <a href='javascript:;' class='reload'></a> </div> <div class='actions'>"
	html += "<div class='pagination'> Страница № <a href='#' class='btn default switchPreviousPage'> <i class='fa fa-arrow-left'></i> </a> <input type='text' class='form-control'> <a href='#' class='btn default switchNextPage'> <i class='fa fa-arrow-right'></i> </a> из " + numberOfPages + "</div>"  if numberOfPages > 1
	if do instance.profile.general.newcommand.bool
		html += "<a href='#' class='btn btn-primary create_button'> <i class='fa fa-plus'></i> Создать </a>"
		html += "<a href='#' class='btn btn-primary create_button'> <i class='fa fa-copy'></i> Дублировать </a>"
	html += "<a href='#' class='btn red delete_button'> <i class='fa fa-times'></i> Удалить </a>"  if do instance.profile.general.removecommand.bool
	html += "<a href='#' class='btn green save_button'> <i class='fa fa-save'></i> Сохранить </a>"  if do instance.profile.general.modifycommand.bool or do instance.profile.general.newcommand.bool
	html += "<div class='btn-group'> <a class='btn green' href='#' data-toggle='dropdown'> <i class='fa fa-cogs'></i> Tools <i class='fa fa-angle-down'></i> </a> <ul class='dropdown-menu pull-right'> <li> <a href='#'> <i class='fa fa-pencil'></i> Export to Excel </a> </li> <li class='divider'> </li> <li> <a href='#'> <i class='i'></i> More action </a> </li> </ul> </div>"
	html += "<div class='btn-group'> <a class='btn green' href='#' data-toggle='dropdown'> Columns <i class='fa fa-angle-down'></i> </a> <div class='dropdown-menu hold-on-click dropdown-checkboxes pull-right columns_toggler'>"
	i = 0
	l = instance.profile.columns.columnsdb.length
	while i < l
		if instance.profile.columns.visibility[i] is "TRUE"
			html += "<label><input type='checkbox' data-column='" + instance.profile.columns.columnsdb[i] + "' checked>" + instance.profile.columns.columnsdb[i] + "</label>"
		else
			html += "<label><input type='checkbox' data-column='" + instance.profile.columns.columnsdb[i] + "'>" + instance.profile.columns.columnsdb[i] + "</label>"
		i++
	html += "</div></div></div></div>"
	callback html

MB.Table::maketoppanel = (callback) ->
	instance = @
	html = "<div class='row'><div class='col-md-12'><div class='top-panel'><div class='row'>"
	for value, i in instance.profile.columns.columnsdb
		html += "<div class='col-md-2'> <div class='form-group'> <label>" + instance.profile.columns.columnsclient[i] + "</label> <div> <input type='text' class='form-control filter' data-filter-field='" + value + "'> </div></div></div>" if instance.profile.columns.filterType[i] isnt ""
	html += "</div></div></div></div>"
	callback html

MB.Table::maketable = (callback) ->
	instance = @
	html = "<div class='col-md-12'><div class='handsontable'></div></div>"
	callback html

MB.Table::reload = (part, callback) ->
	instance = @
	if part is "data"
		instance.getdata (res) ->
			instance.updatemodel "data", res, ->
				instance.updateview "data", ->
					do callback if callback
	else if part is "data pagination"
		instance.getdata (res) ->
			instance.updatemodel "data", res, ->
				instance.updateview "data pagination", ->
					do callback if callback
	else
		part is "all"

MB.Table::updatecontroller = (part, callback) ->
	instance = @
	if part is "init"
		instance.$container.find ".top-panel input.filter"
		.each (i, el) ->
			field = $ el
			.data "filter-field"
			filterType = instance.profile.columns.filterType[instance.profile.columns.columnsdb.indexOf field]
			switch filterType
				when "select2"
					$ el
					.select2
						placeholder: "Выберите"
						ajax:
							url: "/cgi-bin/b2cJ"
							dataType: "json"
							data: (term, page) ->
								field = $ el
								.data "filter-field"
								index = instance.profile.columns.columnsdb.indexOf field
								object = instance.profile.columns.filterObject[index]
								columns = instance.profile.columns.filterQueryColumns[index]
								options =
									command: "get"
									object: object
									columns: columns
									sid: MB.User.sid
								p_xml: MB.Core.makeQuery options
							results: (data, page) ->
								results: MB.Table.parseforselect2data data
				when "daterange"
					$ el
					.daterangepicker
						format: "DD.MM.YYYY"
						showDropdowns: true
						showWeekNumbers: true
						singleDatePicker: true
					, (start, end) ->
						if instance.profile.general.filterWhere[field]?
							instance.profile.general.filterWhere[field].start = start.format "DD.MM.YYYY"
							instance.profile.general.filterWhere[field].end = end.format "DD.MM.YYYY"
							instance.reload "data"
						else
							instance.profile.general.filterWhere[field] =
								type: "daterange"
								start: start.format "DD.MM.YYYY"
								end: end.format "DD.MM.YYYY"
							instance.reload "data"
		instance.$container.find(".filter").on "change", (e) ->
			field = e.target.dataset.filterField
			filterType = instance.profile.columns.filterType[instance.profile.columns.columnsdb.indexOf field]
			val = e.val
			switch filterType
				when "select2"
					instance.profile.general.filterWhere[field] =
						type: "equal"
						value: val
					instance.reload "data"
		instance.$container.find ".xls-converter"
		.on "click", (e) ->
			o =
				command: "get"
				object: instance.profile.general.getobject
				order_by: instance.profile.general.orderby
				client_object: instance.name
				page_no: instance.profile.general.pageno
				sid: MB.User.sid
			MB.Core.sendQuery o, (res) ->
				csv = ""
				for name, i in res.NAMES
					csv += name + ";"
				csv += "\n"
				for row, i in res.DATA
					for cell, ii in row
						csv += res.DATA[i][ii] + ";"
				csv += "\n"
				pom = document.createElement "a"
				pom.setAttribute "href", "data:text/csv;charset=windows-1251," + encodeURI csv
				pom.setAttribute "download", "test.csv"
				do pom.click
		instance.$container.on "click", ".portlet-title", (e) ->
			$target = $ e.target
			if $target.hasClass "reload"
				instance.reload "data"
			else if $target.prop "tagName" is "LABEL" and $target.closest(".columns_toggler").length > 0
				state = $target.find "input"
				.prop "checked"
				column = $target.find "input"
				.data "column"
				if state
					do instance.$container.find "table [data-column='" + column + "']"
					.hide
				else
					do instance.$container.find "table [data-column='" + column + "']"
					.show
		instance.$container.find ".table-scrollable"
		.on click: (e) ->
			$targettr = $ e.target
			.closest "tr"
			targetstatus = $targettr.attr "class"
			if targetstatus is "justrow"
				$targettr.removeClass "justrow"
				.addClass "selectedrow"
			else
				$targettr.removeClass "selectedrow"
				.addClass "justrow" if targetstatus is "selectedrow"
		instance.$container.find ".handsontable"
		.on "click", (e) ->
			$target = $ e.target
			if $target.hasClass "row-checker"
				row = $target.data "row"
				data = do instance.$container.find ".handsontable"
				.handsontable "getInstance"
				.getData
				if data[row].rowStatus is "justRow"
					instance.$container.find ".handsontable"
					.handsontable "getInstance"
					.setDataAtRowProp +row, "rowStatus", "selectedRow"
				else 
					instance.$container.find ".handsontable"
					.handsontable "getInstance"
					.setDataAtRowProp +row, "rowStatus", "justRow" if data[row].rowStatus is "selectedRow"
		instance.$container.on "click", ".portlet-title a", (e) ->
			$target = $ this
			if $target.hasClass "switchNextPage"
				val = do $target.parent()
				.find "input"
				.val
				val++
				$target.parent()
				.find "input"
				.val val
				instance.profile.general.pageno = val
				instance.reload "data"
			else if $target.hasClass "switchPreviousPage"
				val = do $target.parent()
				.find "input"
				.val
				val--
				$target.parent()
				.find "input"
				.val val
				instance.profile.general.pageno = val
				instance.reload "data"
			else if $target.hasClass "create_button"
				instance.updatemodel "addrow", {}, ->
					instance.updateview "addrow", ->
			else if $target.hasClass "save_button"
				if (instance.addingStorage?) and (instance.editingStorage?)
					addingNodesCount = Object.keys(instance.addingStorage).length
					editingNodesCount = Object.keys(instance.editingStorage).length
					nodesCount = addingNodesCount + editingNodesCount
					callbacksCounter = 0
					do ->
						for own key, row of instance.addingStorage
							MB.Core.sendQuery row, (res) ->
								if (parseInt res.RC) is 0
									callbacksCounter++
									toastr[res.TOAST_TYPE] res.MESSAGE, res.TITLE
									if callbacksCounter is nodesCount
										instance.reload "data"
										delete instance.addingStorage
					do ->
						for own key, row of instance.editingStorage
							MB.Core.sendQuery row, (res) ->
								if (parseInt res.RC) is 0
									callbacksCounter++
									toastr[res.TOAST_TYPE] res.MESSAGE, res.TITLE
									if callbacksCounter is nodesCount
										instance.reload "data"
										delete instance.editingStorage
				else if instance.addingStorage?
					addingNodesCount = Object.keys(instance.addingStorage).length
					callbacksCounter = 0
					for own key, row of instance.addingStorage
						MB.Core.sendQuery row, (res) ->
							if (parseInt res.RC) is 0
								callbacksCounter++
								toastr[res.TOAST_TYPE] res.MESSAGE, res.TITLE
								if callbacksCounter is addingNodesCount
									instance.reload "data"
									delete instance.addingStorage
				else if instance.editingStorage?
					editingNodesCount = Object.keys(instance.editingStorage).length
					callbacksCounter = 0
					for own key, row of instance.editingStorage
						MB.Core.sendQuery row, (res) ->
							if (parseInt res.RC) is 0
								callbacksCounter++
								toastr[res.TOAST_TYPE] res.MESSAGE, res.TITLE
								if callbacksCounter is editingNodesCount
									instance.reload "data"
									delete instance.editingStorage
			else if $target.hasClass "delete_button"
				da = confirm "Вы уверены что хотите удалить эти данные?"
				if da
					instance.deletingStorage = {}
					data = do instance.$container.find ".handsontable"
					.handsontable "getInstance"
					.getData
					for value, i in data
						if value.rowStatus is "selectedRow"
							objversion = instance.data.data[i][instance.data.names.indexOf "OBJVERSION"]
							instance.deletingStorage[value[instance.profile.general.primarykey]] =
								command: "remove"
								object: instance.profile.general.object
								sid: MB.User.sid
							instance.deletingStorage[value[instance.profile.general.primarykey]][instance.profile.general.primarykey] = value[instance.profile.general.primarykey]
							instance.deletingStorage[value[instance.profile.general.primarykey]]["OBJVERSION"] = objversion
					deletingNodesCount = Object.keys(instance.deletingStorage).length
					callbacksCounter = 0
					for key, row of instance.deletingStorage
						MB.Core.sendQuery row, (res) ->
							if parseInt res.RC is 0
								callbacksCounter++
								toastr[res.TOAST_TYPE] res.MESSAGE, res.TITLE
								if callbacksCounter is deletingNodesCount
									instance.reload "data"
									delete instance.deletingStorage
			else if $target.hasClass "restore_button"
				instance.$container.find ".editingrow"
				.each (i, el) ->
					$ el
					.find "a"
					.each (i2, el2) ->
						$ el2
						.editable "destroy"
					$ el
					.removeClass "editingrow"
					.addClass "justrow"
				do instance.$container.find ".addingrow"
				.remove
				instance.addingStorage = null
				instance.editingStorage = null
		instance.$container.on "click", ".bottom-panel .pagination li", (e) ->
			$targetli = do $ e.target
			.parent
			if $targetli.hasClass "disabled" or $targetli.hasClass "active"
			else if $targetli.hasClass "prev"
				instance.profile.general.pageno -= 1
				instance.reload "data pagination"
			else if $targetli.parent()
			.hasClass "next"
				instance.profile.general.pageno += 1
				instance.reload "data pagination"
			else
				v = do $targetli.find "a"
				.text
				instance.profile.general.pageno = v
				instance.reload "data pagination"

		console.log do instance.profile.general.custom.bool
		console.log 66
		if do instance.profile.general.custom.bool
			console.log 77
			$.getScript "html/tables/require/" + instance.name + ".js", (data, status, xhr) ->
				console.log arguments
				instance.custom ->
					do callback
			return
		else
			console.log 88
			do callback
