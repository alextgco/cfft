MB = window.MB or {}

MB.Table = (options) ->
	console.log options
	instance = @
	instance.name = options.name or do MB.Core.guid
	instance.world = options.world or "page"
	instance.constructorWhere = options.where or ""
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

MB.Table.createOpenInModalContextMenuItem2 = (instance, key, options, params) ->
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
			isNewModal: true
			params:
				parentobject: instance.name

MB.Table.helpers =
	calculateDiscountToPrice: (handsontableInstance, row, prop, newVal, instance) ->
		TicketStatus = instance.data.data[row][instance.data.names.indexOf "STATUS"]
		if TicketStatus=="RESERVED"||TicketStatus=="TO_PAY"
			nominalPrice = instance.data.data[row][instance.data.names.indexOf "NOMINAL_PRICE"]
			value = nominalPrice - nominalPrice*(newVal/100)
			handsontableInstance.setDataAtRowProp row,"PRICE",value,"discountToPrice"
		return
	calculatePriceToDiscount: (handsontableInstance, row, prop, newVal, instance) ->
		TicketStatus = instance.data.data[row][instance.data.names.indexOf "STATUS"]
		if TicketStatus=="RESERVED"||TicketStatus=="TO_PAY"
			nominalPrice = instance.data.data[row][instance.data.names.indexOf "NOMINAL_PRICE"]
			value = (nominalPrice-newVal)/10
			handsontableInstance.setDataAtRowProp row,"DISCOUNT",value,"priceToDiscount"
		return

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
	query = "##{area}_#{name}_wrapper"
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
	$worldcontainer = $ ".#{instance.world}-content-wrapper"
	$container = $ "<div id='#{instance.world}_#{instance.name}_wrapper' class='#{instance.world}-item'></div>"
	$worldcontainer.find('#' + instance.world + '_' + instance.name + '_wrapper.'+ instance.world + '-item').remove()
	$('.page-content-wrapper').html('')
	$worldcontainer.append $container
	instance.$worldcontainer = $worldcontainer
	instance.$container = $container
	do callback

MB.Table::getprofile = (callback) ->
	instance = @
	o =
		command: "get"
		object: "user_profile"
		client_object: instance.name
	MB.Core.sendQuery o, (res) ->
		if res.RC? and parseInt(res.RC) isnt 0
			toastr[res.TOAST_TYPE] res.MESSAGE, res.TITLE
		callback res

MB.Table::getdata = (callback, all) ->
	instance = @
	general = instance.profile.general
	_columns = instance.profile.columns

	defaultWhere = if general.where then [general.where] else []

	filterWhere = []
	if Object.keys(general.filterWhere).length > 0
		for key, value of general.filterWhere
			switch value.type
				when "equal" then filterWhere.push "#{key} = '#{value.value}'"
				when "notIn"
					k = key.substr 0, (key.length - 1)
					filterWhere.push "#{k} not in#{value.value}"
				when "daterange"
					if value.start? then filterWhere.push "#{key} >= to_date('#{value.start}', 'DD.MM.YYYY')"
					if value.end? then filterWhere.push "#{key} <= to_date('#{value.end}', 'DD.MM.YYYY')"
				when "not equal" then filterWhere.push "#{key} != #{value.value}"
				when "grater than or equal" then filterWhere.push "#{key} >= '#{value.value}'"
				when "less than or equal" then filterWhere.push "#{key} <= '#{value.value}'"
				when "like" then filterWhere.push "#{key} like '%#{value.value}%'"

	parentWhere = []
	for keytype, i in _columns.keytypes
		if keytype is "PARENT_KEY"
			value = instance.parent.data.data[0][instance.parent.data.names.indexOf _columns.columnsdb[i]]
			parentWhere.push "#{_columns.columnsdb[i]} = '#{value}'"

	constructorWhere = if instance.constructorWhere then [instance.constructorWhere] else []


	resultWhereArr = [].concat defaultWhere, filterWhere, parentWhere, constructorWhere

	resultWhereString = ""
	if resultWhereArr.length
		if resultWhereArr.length > 1
			resultWhereString = resultWhereArr.join " and "
		else
			resultWhereString = resultWhereArr[0]

	o =
		command: "get"
		object: general.getobject
		where: resultWhereString
		order_by: general.orderby
		client_object: instance.name
		sid: MB.User.sid

	unless all
		o.page_no = general.pageno
		o.rows_max_num = general.rowsmaxnum

	MB.Core.sendQuery o, (res) ->
		if res.RC? and parseInt(res.RC) isnt 0
			toastr[res.TOAST_TYPE] res.MESSAGE, res.TITLE
		callback res
	# where = ""
	# defaultWhere = general.where
	# filterWhere = ""
	# parentWhere = ""
	# if instance.parentkeyvalue then	parentWhere += "#{general.parentkey} = '#{instance.parentkeyvalue}'"
	# if Object.keys(general.filterWhere).length > 0
	# 	arr = []
	# 	for key, value of general.filterWhere
	# 		switch value.type
	# 			when "equal" then arr.push "#{key} = '#{value.value}'"
	# 			when "notIn"
	# 				k = key.substr 0, (key.length - 1)
	# 				arr.push "#{k} not in#{value.value}"
	# 			when "daterange"
	# 				if value.start? then arr.push "#{key} >= to_date('#{value.start}', 'DD.MM.YYYY')"
	# 				if value.end? then arr.push "#{key} <= to_date('#{value.end}', 'DD.MM.YYYY')"
	# 			when "not equal" then arr.push "#{key} != #{value.value}"
	# 			when "grater than or equal" then arr.push "#{key} >= '#{value.value}'"
	# 			when "less than or equal" then arr.push "#{key} <= '#{value.value}'"
	# 			when "like" then arr.push "#{key} like '%#{value.value}%'"
	# 	filterWhere = arr.join " and "
	# arrWhere.push defaultWhere if defaultWhere
	# arrWhere.push filterWhere if filterWhere
	# arrWhere.push parentWhere if parentWhere
	# arrWhere.push instance.constructorWhere if instance.constructorWhere
	# if arrWhere.length > 0
	# # 	if arrWhere.length is 1 then where = arrWhere[0]
	# # 	else where = arrWhere.join " and "
	# o =
	# 	command: "get"
	# 	object: instance.profile.general.getobject
	# 	where: where
	# 	order_by: instance.profile.general.orderby
	# 	client_object: instance.name
	# 	# rows_max_num: instance.profile.general.rowsmaxnum
	# 	# page_no: instance.profile.general.pageno
	# 	sid: MB.User.sid
	# unless all
	# 	o.page_no = instance.profile.general.pageno
	# 	o.rows_max_num = instance.profile.general.rowsmaxnum
	# # query = MB.Core.makeQuery o
	# # sendQuery2 query, (res) ->
	# # 	if res.RC? and parseInt(res.RC) isnt 0
	# # 		toastr[res.TOAST_TYPE] res.MESSAGE, res.TITLE
	# # 	console.log res
	# # 	callback res.results[0]
	# MB.Core.sendQuery o, (res) ->
	# 	if res.RC? and parseInt(res.RC) isnt 0
	# 		toastr[res.TOAST_TYPE] res.MESSAGE, res.TITLE
	# 	callback res

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
	instance.profile.general.rmbmenu = parsedprofile.RMB_MENU
	instance.profile.columns.align = parsedprofile.ALIGN
	instance.profile.columns.columnsclient = parsedprofile.NAME
	instance.profile.columns.columnsdb = parsedprofile.COLUMN_NAME
	instance.profile.columns.insertability = parsedprofile.INSERTABLE
	instance.profile.columns.editability = parsedprofile.EDITABLE
	instance.profile.columns.keytypes = parsedprofile.KEY_TYPE
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
	instance.profile.columns.filterLabel = parsedprofile.FILTER_LABEL
	instance.profile.columns.filterObject = parsedprofile.FILTER_COMMAND
	instance.profile.columns.filterQueryColumns = parsedprofile.FILTER_COLUMNS
	instance.profile.general.where = parsedprofile.DEFAULT_WHERE
	instance.profile.columns.changeActionNames = parsedprofile.COLUMN_CHANGE_ACTION_NAME
	instance.profile.columns.requirable = parsedprofile.REQUIRED
	instance.profile.columns.querable = parsedprofile.QUERABLE
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
	.find "[data-object='#{instance.name}']"
	.remove

MB.Table::closeit = ->
	instance = @
	if instance.world is "page"
		query = "#page_#{instance.name}_wrapper"
		do $query
		.hide
	else
		query = "#modal_#{instance.name}_wrapper"
		do $query
		.hide
		do instance.removemodallistitem

MB.Table::createmodallistitem = ->
	instance = @
	$ ".modals-list"
	.append "
		<li data-type='table' data-object='#{instance.name}'>
			<i class='cross fa fa-times-circle'></i>#{instance.profile.general.tablename}
		</li>"

MB.Table::showit = (init) ->
	instance = @
	if instance.world is "page"
		query = "#page_#{MB.User.activepage}_wrapper"
		do $ query
		.hide
		query = "#page_#{instance.name}_wrapper"
		do $ query
		.show
		MB.User.activepage = instance.name
		MB.User.loadedpages.push instance.name
	else
		query = "#modal_#{MB.User.activemodal}_wrapper"
		do $ query
		.hide
		query = "#modal_#{instance.name}_wrapper"
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
	else if part is "duplicateRow"
		instance.data.data.unshift MB.Table.NewRow()
		do callback

MB.Table::makenewrow = (callback) ->
	instance = @
	$handsontable = instance.$container.find ".handsontable"
	handsontableInstance = $handsontable.handsontable "getInstance"
	handsontableInstance.alter "insert_row", 0, 1
	do callback

MB.Table::initTable = (callback) ->
	instance = @
	general = instance.profile.general
	_columns = instance.profile.columns
	_data = instance.data
	$container = instance.$container
	$handsontable = $container.find ".handsontable"
	handsontableInstance = $handsontable.handsontable "getInstance"
	# processSelect2 = (mode, tableRow, prop, newVal, doesSelect2WithEmptyValue) ->
	# 	_columns = instance.profile.columns
	# 	_data = instance.data
	# 	propIndex = _columns.columnsdb.indexOf prop
	# 	$handsontable = $container.find ".handsontable"
	# 	handsontableInstance = $handsontable.handsontable "getInstance"
	# 	returnsColumn = _columns.returnscolumn[propIndex]
	# 	switch mode
	# 		when "create" then modelRow = handsontableInstance.getDataAtRowProp tableRow, "guid"
	# 		else modelRow = data.data[tableRow][data.names.indexOf instance.profile.general.primarykey]
	# 	doesFieldHaveReturnsColumn = if returnsColumn then yes else no
	# 	if doesFieldHaveReturnsColumn
	# 		returnsColumnIndex = _columns.columnsdb.indexOf returnsColumn
	# 		doesReturnsColumnVisible = yes if _columns.visibility[returnsColumnIndex]
	# 		if doesReturnsColumnVisible
	# 			if doesSelect2WithEmptyValue and newVal is "" then returnsValue = newVal
	# 			else for value, i in _data.dropdownsData[prop].DATA then returnsValue = value[0] if value[1] is newVal
	# 			processChange mode, modelRow, returnsColumn, returnsValue
	# 			handsontableInstance.setDataAtRowProp tableRow, returnsColumn, returnsValue, "setValueToTheReturnsColumn"
	# 	else processChange mode, modelRow, prop, newVal
	makeSelect2Column = (i, doesSelect2WithEmptyValue) ->
		column = 
			type: "autocomplete"
			data: _columns.columnsdb[i]
			strict: yes
			source: (query, process) ->
				request =
					command: "get"
					object: _columns.references[i]
					columns: _columns.refcolumns[i]
					sid: MB.User.sid
				where = ""
				if _columns.refcolumns[i]
					likecolumn = (_columns.refcolumns[i].split ",")[1]
					if query isnt ""
						if where is ""
							where = "upper(#{likecolumn}) like upper('%#{query}%')"
						else
							where += " and upper(#{likecolumn}) like upper('%#{query}%')"
				if _columns.refwhere[i]
					$handsontable = instance.$container.find ".handsontable"
					handsontableInstance = $handsontable.handsontable "getInstance"
					refwherecolumn = _columns.refwhere[i]
					row = @.row
					# refwherevalue = handsontableInstance.getDataAtRowProp row, refwherecolumn
					refwherevalue = instance.data.data[row][instance.data.names.indexOf refwherecolumn]
					if where is ""
						where = "#{refwherecolumn} = '#{refwherevalue}'"
					else
						where += " and #{refwherecolumn} = '#{refwherevalue}'"
				request.where = where
				$.ajax
					url: "/cgi-bin/b2e/"
					dataType: "json"
					data:
						request: MB.Core.makeQuery request
					success: (response) ->
						response = MB.Core.parseFormat response
						_columns = instance.profile.columns
						_data = instance.data
						_data.dropdownsData[_columns.columnsdb[i]] = response
						dropdown = _data.dropdownsData[_columns.columnsdb[i]]
						if doesSelect2WithEmptyValue then dropdown.DATA.unshift ["", ""]
						list = []
						for value in dropdown.DATA then list.push value[1]
						process list
						return
		column
	processChange = (changes) ->
		row = changes[0][0]
		prop = changes[0][1]
		oldVal = changes[0][2]
		newVal = changes[0][3]
		_general = instance.profile.general
		_columns = instance.profile.columns
		_data = instance.data
		$handsontable = $container.find ".handsontable"
		handsontableInstance = $handsontable.handsontable "getInstance"
		propIndex = _columns.columnsdb.indexOf prop
		rowStatus = handsontableInstance.getDataAtRowProp row, "rowStatus"
		editor = _columns.editor[propIndex]
		switch editor
			when "select2", "select2withEmptyValue"
				returnsColumn = _columns.returnscolumn[propIndex]
				if returnsColumn
					if (editor is "select2withEmptyValue" or editor is "select2") and newVal is ""
						returnsValue = newVal
					else
						for value, i in _data.dropdownsData[prop].DATA
							if value[1] is newVal
								returnsValue = value[0]
					returnsColumnIndex = _columns.columnsdb.indexOf returnsColumn
					if do _columns.visibility[returnsColumnIndex].bool
						handsontableInstance.setDataAtRowProp row, returnsColumn, returnsValue, "setValueToTheReturnsColumn"
					prop = returnsColumn
				else returnsValue = newVal
			else
				returnsValue = newVal
		switch rowStatus
			when "addingRow" then mode = "create"
			when "editedRow" then mode = "update"
			when "justRow"
				mode = "update"
				handsontableInstance.setDataAtRowProp row, "rowStatus", "editedRow", "changeRowStatus"
		command = switch
			when mode is "create" then "new"
			when mode is "update" then "modify"
			when mode is "delete" then "remove"
		storage = switch
			when mode is "create" then "addingStorage"
			when mode is "update" then "editingStorage"
			when mode is "delete" then "deletingStorage"
		storageRow = switch
			when mode is "create" then handsontableInstance.getDataAtRowProp row, "guid"
			else _data.data[row][_data.names.indexOf _general.primarykey]
		storageProp = prop
		storageValue = returnsValue
		# console.log storage, storageRow, storageProp, storageValue
		unless instance[storage]? then instance[storage] = {}
		unless instance[storage][storageRow]?
			instance[storage][storageRow] = command: command, object: _general.object
			switch mode
				when "update", "delete"
					instance[storage][storageRow].objversion = _data.data[row][_data.names.indexOf "OBJVERSION"]
					instance[storage][storageRow][_general.primarykey] = _data.data[row][_data.names.indexOf _general.primarykey]
			if instance.parent?
				instance[storage][storageRow][MB.O.forms[instance.parent.name].profile.general.primarykey] = instance.parent.activeId
		instance[storage][storageRow][storageProp] = storageValue
	config =
		autoWrapCol: true
		autoWrapRow: true
		columnSorting: true
		enterBeginsEditing: false
		fillHandle: false
		manualColumnMove: true
		manualColumnResize: true
		multiSelect: true
		outsideClickDeselects: false
		undo: true
		stretchH: "all"
		currentRowClassName: "currentRow"
		currentColClassName: "currentCol"
		afterChange: (changes, source) ->
			console.log "afterChangeEvent", arguments
			switch source
				when "loadData" then return
				when "changeRowStatus" then return
				when "changeRowGuid" then return
				when "setValueToTheReturnsColumn" then return
				when "edit", "paste", "duplicateInsertion"
					processChange changes
		rowHeaders: (i) ->
			$handsontable = instance.$container.find ".handsontable"
			handsontableInstance = $handsontable.handsontable "getInstance"
			rowStatus = handsontableInstance.getDataAtRowProp i, "rowStatus"
			"<div class='rowStatusMarker #{rowStatus}'>#{i + 1}</div>"
		columns: do ->
			columns = []
			doesTableUpdatable = do general.modifycommand.bool
			for value, i in _columns.columnsdb
				columnEditor = _columns.editor[i]
				isTablesInLs = JSON.parse(localStorage.getItem 'tables')?
				instanceVisSettings = false
				if isTablesInLs
					for value2, i2 in JSON.parse(localStorage.getItem 'tables')
						if value2.name == instance.name
							instanceVisSettings = value2

				if instanceVisSettings and instanceVisSettings.visibility
					doesColumnVisible = instanceVisSettings.visibility[value]
				else
					doesColumnVisible = do _columns.visibility[i].bool
				doesColumnUpdatable = do _columns.editability[i].bool

				if doesColumnVisible
					if doesTableUpdatable and doesColumnUpdatable
						switch columnEditor
							when "text" then column = type: "text", data: value
							when "number" then column = type: "text", data: value
							when "colorpicker" then column = type: "colorpicker", data: value, isColorpicker: "TRUE"
							when "password" then column = type: "text", data: value
							when "datetime" then column = type: "datetime", data: value
							when "checkbox" then column = type: "checkbox", data: value, checkedTemplate: "TRUE", uncheckedTemplate: "FALSE"
							when "select2" then do (i) -> column = makeSelect2Column i, no
							when "select2withEmptyValue" then do (i) -> column = makeSelect2Column i, yes
					else
						switch columnEditor
							when "checkbox" then column = type: "checkbox", data: value, checkedTemplate: "TRUE", uncheckedTemplate: "FALSE", readOnly: yes
							else column = type: "text", data: value, readOnly: yes
				else continue
				columns.push column
			columns
		data: do ->
			_columns = instance.profile.columns
			data = []
			_data = instance.data
			tableInLs = false
			if JSON.parse(localStorage.getItem('tables'))
				for lsTable, lsT in JSON.parse(localStorage.getItem('tables'))
					if lsTable.name == instance.name then tableInLs = lsTable.visibility
			for value, i in _data.data
				rowObject = {}
				for value2, i2 in _columns.columnsdb
					if tableInLs != false
						if tableInLs[value2]
							if _columns.editor[i2] is "checkbox"
								val = value[_columns.columnsdb.indexOf value2]
								if val is "" then val = "FALSE"
								rowObject[value2] = val
								rowObject.rowStatus = "justRow"
							else
								rowObject[value2] = value[_columns.columnsdb.indexOf value2]
								rowObject.rowStatus = "justRow"
					else
						if do _columns.visibility[i2].bool
							if _columns.editor[i2] is "checkbox"
								val = value[_columns.columnsdb.indexOf value2]
								if val is "" then val = "FALSE"
								rowObject[value2] = val
								rowObject.rowStatus = "justRow"
							else
								rowObject[value2] = value[_columns.columnsdb.indexOf value2]
								rowObject.rowStatus = "justRow"
				data.push rowObject
			data
		colHeaders: do ->
			colHeaders = []
			totalNo = true
			if JSON.parse(localStorage.getItem('tables'))
				for lsTable, lsT in JSON.parse(localStorage.getItem('tables'))
					if lsTable.name == instance.name
						for lsTabInnerName, lsTabIN of lsTable.visibility
							if lsTabIN
								colHeaders.push _columns.columnsclient[_columns.columnsdb.indexOf lsTabInnerName]
								totalNo = false
			if totalNo
				for value, i in _columns.columnsclient
					if do _columns.visibility[i].bool and do _columns.requirable[i].bool then colHeaders.push "#{value}<span class='redStar'>*</span>"
					else if do _columns.visibility[i].bool then colHeaders.push value
			colHeaders
		# dataSchema: ->
		# 	dataSchema = {}
		# 	for value, i in general.prepareInsert.NAMES then dataSchema[value] = general.prepareInsert.DATA[i]
		# 	dataSchema
		afterCreateRow: (index, ammount) ->
			$handsontable = instance.$container.find ".handsontable"
			handsontableInstance = $handsontable.handsontable "getInstance"
			guid = do MB.Core.guid
			handsontableInstance.setDataAtRowProp index, "rowStatus", "addingRow", "changeRowStatus"
			handsontableInstance.setDataAtRowProp index, "guid", guid, "changeRowGuid"
			for value, i in general.prepareInsert.NAMES then handsontableInstance.setDataAtRowProp index, value, general.prepareInsert.DATA[i]
			# if instance.parentobject? then processChange "create", guid, general.primarykey, MB.O.forms[instance.parentobject].activeId

		# contextMenu:
		# 	callback: (key, options) ->
		# 		if key is "openInModal"
		# 			MB.Table.createOpenInModalContextMenuItem instance, key, options
		# 	items:
		# 		openInModal:
		# 			disabled: ->
		# 				$handsontable = instance.$container.find ".handsontable"
		# 				handsontableInstance = $handsontable.handsontable "getInstance"
		# 				disableStatus = off
		# 				if instance.profile.general.juniorobject is ""
		# 					disableStatus = on
		# 				else
		# 					selectedRowsInterval = MB.Table.getSelectedRowsInterval handsontableInstance
		# 					row = selectedRowsInterval[0]
		# 					rowEnd = selectedRowsInterval[1]
		# 					while row <= rowEnd
		# 						rowStatus = handsontableInstance.getDataAtRowProp row, "rowStatus"
		# 						if rowStatus is "addingRow" then disableStatus = on
		# 						row++
		# 				disableStatus
		# 			name: "Открыть в форме ..."
	# config.contextMenu.callback = (key, options) ->
	# 	if key is "openInModal"
	# 		MB.Table.createOpenInModalContextMenuItem instance, key, options
	config.contextMenu = {}
	config.contextMenu.items = {}
	config.contextMenu.items.openInModal = 
		disabled: ->
			$handsontable = instance.$container.find ".handsontable"
			handsontableInstance = $handsontable.handsontable "getInstance"
			disableStatus = off
			if instance.profile.general.juniorobject is ""
				disableStatus = on
			else
				selectedRowsInterval = MB.Table.getSelectedRowsInterval handsontableInstance
				row = selectedRowsInterval[0]
				rowEnd = selectedRowsInterval[1]
				while row <= rowEnd
					rowStatus = handsontableInstance.getDataAtRowProp row, "rowStatus"
					if rowStatus is "addingRow" then disableStatus = on
					row++
			disableStatus
		name: "Открыть в форме ..."




# rmbmenu: Object
# DATA: Array[1]
# 0: Array[4]
# 0: "Адреса залов ..."
# 1: "table_hall_addresses"
# 2: "Адреса залов "
# 3: "ADDR_ID"
# length: 4
# __proto__: Array[0]
# length: 1
# __proto__: Array[0]
# NAMES: Array[4]
# 0: "RMB_MENU_LABEL"
# 1: "OPEN_CLIENT_OBJECT"
# 2: "OPEN_CLIENT_OBJECT_TITLE"
# 3: "WHERE_COLUMNS"
# length: 4
# __proto__: Array[0]
# __proto__: Object



	for value, i in instance.profile.general.rmbmenu.DATA
		do (value, i) ->
			if value[instance.profile.general.rmbmenu.NAMES.indexOf "RMB_MENU_TYPE"] is "SEND_COMMAND"
				config.contextMenu.items[value[instance.profile.general.rmbmenu.NAMES.indexOf "RMB_MENU_ITEM_ID"]] =
					name: value[instance.profile.general.rmbmenu.NAMES.indexOf "RMB_MENU_LABEL"]
					disabled: ->
						handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance")
						selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
						keyword2 = value[instance.profile.general.rmbmenu.NAMES.indexOf 'IS_DISABLED_COLUMN']
						if keyword2 is ""
							return false
						else
							return instance.data.data[selectedRows[0]][instance.data.names.indexOf(keyword2)] is "TRUE"
			else
				config.contextMenu.items[value[instance.profile.general.rmbmenu.NAMES.indexOf "RMB_MENU_ITEM_ID"]] =
					name: value[instance.profile.general.rmbmenu.NAMES.indexOf "RMB_MENU_LABEL"]
					disabled: ->
						handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance")
						selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
						keyword = value[instance.profile.general.rmbmenu.NAMES.indexOf 'WHERE_COLUMNS']

						getTotalRows = (arr)->
							result = true
							i = arr[0]
							while i < arr[1]
								if instance.data.data[i][instance.data.names.indexOf(keyword)] == ""
									result = false
								i++
							return result

						if selectedRows[0] is selectedRows[1]
							result = instance.data.data[selectedRows[0]][instance.data.names.indexOf(keyword)] == ""
						else
							result = getTotalRows selectedRows
	config.contextMenu.callback = (key, options) ->
		for gValue, g in instance.profile.general.rmbmenu.DATA
			if gValue[instance.profile.general.rmbmenu.NAMES.indexOf "RMB_MENU_ITEM_ID"] is key
				value = gValue
		handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance")
		selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);	
		if key is "openInModal"
			MB.Table.createOpenInModalContextMenuItem instance, key, options
		else
			if value[instance.profile.general.rmbmenu.NAMES.indexOf "RMB_MENU_TYPE"] is "SEND_COMMAND"
				paramsArr = value[instance.profile.general.rmbmenu.NAMES.indexOf "SEND_ATTRIBUTE"].replace(RegExp(" ", "g"), "").split(",")
				paramsObj = {}
				for k in paramsArr
					paramsObj[k] = instance.data.data[selectedRows[0]][instance.data.names.indexOf k]
				if value[instance.profile.general.rmbmenu.NAMES.indexOf "SEND_WITH_ALERT"] is "TRUE"
					bootbox.dialog
						message: value[instance.profile.general.rmbmenu.NAMES.indexOf "SEND_ALERT"]
						title: "Подтверждение"
						buttons:
							success:
								label: "Да"
								className: "green"
								callback: ->
									MB.Core.sendQuery
										command: value[instance.profile.general.rmbmenu.NAMES.indexOf "SEND_OPERATION"]
										Object: value[instance.profile.general.rmbmenu.NAMES.indexOf "SEND_OBJECT"]
										sid: MB.User.sid
										params: paramsObj
									, (res)->
										toastr[res.TOAST_TYPE] res.MESSAGE, res.TITLE
							danger:
								label: "Нет"
								className: "red"
								callback: ->
				else
					MB.Core.sendQuery
						command: value[instance.profile.general.rmbmenu.NAMES.indexOf "SEND_OPERATION"]
						Object: value[instance.profile.general.rmbmenu.NAMES.indexOf "SEND_OBJECT"]
						sid: MB.User.sid
						params: paramsObj
					, (res)->
						toastr[res.TOAST_TYPE] res.MESSAGE, res.TITLE
			else
				if key is value[instance.profile.general.rmbmenu.NAMES.indexOf "RMB_MENU_ITEM_ID"]
					MB.Core.switchPage
						type: "table"
						name: value[instance.profile.general.rmbmenu.NAMES.indexOf "OPEN_CLIENT_OBJECT"]
						where: "#{value[instance.profile.general.rmbmenu.NAMES.indexOf 'WHERE_COLUMNS']} = #{instance.data.data[options.start._row][instance.data.names.indexOf (value[instance.profile.general.rmbmenu.NAMES.indexOf 'WHERE_COLUMNS'])]}"
			return

	# for value, i in instance.profile.general.rmbmenu.NAMES
	# 	for value2, i2 in instance.profile.general.rmbmenu.DATA
	# 		config.contextMenu.items[instance.profile.general.rmbmenu.DATA]










	$handsontable = instance.$container.find ".handsontable"
	$handsontable.handsontable config
	do callback
	instance.reload "data"

MB.Table::updateTable = (callback) ->
	instance = @
	_columns = instance.profile.columns
	makeSelect2Column = (i, doesSelect2WithEmptyValue) ->
		column = 
			type: "autocomplete"
			data: _columns.columnsdb[i]
			strict: yes
			source: (query, process) ->
				request =
					command: "get"
					object: _columns.references[i]
					columns: _columns.refcolumns[i]
					sid: MB.User.sid
				where = ""
				if _columns.refcolumns[i]
					likecolumn = (_columns.refcolumns[i].split ",")[1]
					if query isnt ""
						if where is ""
							where = "upper(#{likecolumn}) like upper('%#{query}%')"
						else
							where += " and upper(#{likecolumn}) like upper('%#{query}%')"
				if _columns.refwhere[i]
					$handsontable = instance.$container.find ".handsontable"
					handsontableInstance = $handsontable.handsontable "getInstance"
					refwherecolumn = _columns.refwhere[i]
					row = @.row
					# refwherevalue = handsontableInstance.getDataAtRowProp row, refwherecolumn
					refwherevalue = instance.data.data[row][instance.data.names.indexOf refwherecolumn]
					if where is ""
						where = "#{refwherecolumn} = '#{refwherevalue}'"
					else
						where += " and #{refwherecolumn} = '#{refwherevalue}'"
				request.where = where

				MB.Core.sendQuery request, (response)->
					#response = MB.Core.parseFormat response
					_columns = instance.profile.columns
					_data = instance.data
					_data.dropdownsData[_columns.columnsdb[i]] = response
					dropdown = _data.dropdownsData[_columns.columnsdb[i]]
					if doesSelect2WithEmptyValue then dropdown.DATA.unshift ["", ""]
					list = []
					for value in dropdown.DATA then list.push value[1]
					process list
					return

				#$.ajax
				#	url: "/cgi-bin/b2e/"
				#	dataType: "json"
				#	data:
				#		request: MB.Core.makeQuery request
				#	success: (response) ->
				#		response = MB.Core.parseFormat response
				#		_columns = instance.profile.columns
				#		_data = instance.data
				#		_data.dropdownsData[_columns.columnsdb[i]] = response
				#		dropdown = _data.dropdownsData[_columns.columnsdb[i]]
				#		if doesSelect2WithEmptyValue then dropdown.DATA.unshift ["", ""]
				#		list = []
				#		for value in dropdown.DATA then list.push value[1]
				#		process list
				#		return
		column
	config =
		columns: do ->			
			general = instance.profile.general
			columns = []
			doesTableUpdatable = do general.modifycommand.bool
			for value, i in _columns.columnsdb
				columnEditor = _columns.editor[i]
				isTablesInLs = JSON.parse(localStorage.getItem 'tables')?
				instanceVisSettings = false
				if isTablesInLs
					for value2, i2 in JSON.parse(localStorage.getItem 'tables')
						if value2.name == instance.name
							instanceVisSettings = value2

				if instanceVisSettings and instanceVisSettings.visibility
					doesColumnVisible = instanceVisSettings.visibility[value]
				else
					doesColumnVisible = do _columns.visibility[i].bool
				doesColumnUpdatable = do _columns.editability[i].bool

				if doesColumnVisible
					if doesTableUpdatable and doesColumnUpdatable
						switch columnEditor
							when "text" then column = type: "text", data: value
							when "number" then column = type: "text", data: value
							when "colorpicker" then column = type: "colorpicker", data: value, isColorpicker: "TRUE"
							when "password" then column = type: "text", data: value
							when "datetime" then column = type: "datetime", data: value
							when "checkbox" then column = type: "checkbox", data: value, checkedTemplate: "TRUE", uncheckedTemplate: "FALSE"
							when "select2" then do (i) -> column = makeSelect2Column i, no
							when "select2withEmptyValue" then do (i) -> column = makeSelect2Column i, yes
					else
						switch columnEditor
							when "checkbox" then column = type: "checkbox", data: value, checkedTemplate: "TRUE", uncheckedTemplate: "FALSE", readOnly: yes
							else column = type: "text", data: value, readOnly: yes
				else continue
				columns.push column
			columns
		colHeaders: do ->
			_columns = instance.profile.columns
			colHeaders = []
			totalNo = true
			if JSON.parse(localStorage.getItem('tables'))
				for lsTable, lsT in JSON.parse(localStorage.getItem('tables'))
					if lsTable.name == instance.name
						for lsTabInnerName, lsTabIN of lsTable.visibility
							if lsTabIN
								colHeaders.push _columns.columnsclient[_columns.columnsdb.indexOf lsTabInnerName]
								totalNo = false
			if totalNo
				for value, i in _columns.columnsclient
					if do _columns.visibility[i].bool and do _columns.requirable[i].bool then colHeaders.push "#{value}<span class='redStar'>*</span>"
					else if do _columns.visibility[i].bool then colHeaders.push value
			console.log colHeaders
			colHeaders
		data: do ->
			_columns = instance.profile.columns
			data = []
			_data = instance.data
			tableInLs = false
			if JSON.parse(localStorage.getItem('tables'))
				for lsTable, lsT in JSON.parse(localStorage.getItem('tables'))
					if lsTable.name == instance.name then tableInLs = lsTable.visibility

			for value, i in _data.data
				rowObject = {}
				for value2, i2 in _columns.columnsdb
					if tableInLs != false
						if tableInLs[value2]
							if _columns.editor[i2] is "checkbox"
								val = value[_columns.columnsdb.indexOf value2]
								if val is "" then val = "FALSE"
								rowObject[value2] = val
								rowObject.rowStatus = "justRow"
							else
								rowObject[value2] = value[_columns.columnsdb.indexOf value2]
								rowObject.rowStatus = "justRow"
					else
						if do _columns.visibility[i2].bool
							if _columns.editor[i2] is "checkbox"
								val = value[_columns.columnsdb.indexOf value2]
								if val is "" then val = "FALSE"
								rowObject[value2] = val
								rowObject.rowStatus = "justRow"
							else
								rowObject[value2] = value[_columns.columnsdb.indexOf value2]
								rowObject.rowStatus = "justRow"
				data.push rowObject
			console.log data
			data
	$handsontable = instance.$container.find ".handsontable"
	handsontableInstance = $handsontable.handsontable "getInstance"
	handsontableInstance.updateSettings config
	do callback

MB.Table::updateview = (part, callback) ->
	instance = @
	tmpPageNo = instance.profile.pageno
	dataCount = instance.data.info.ROWS_COUNT
	maxRowsCount = instance.profile.general.rowsmaxnum
	$paginationWrapper = instance.$container.find('.pagination')
	$tmpPage = $paginationWrapper.find('input.form-control')
	$totalPages = $paginationWrapper.find('.totalPages')

	if Math.ceil(dataCount / maxRowsCount) <= 1
		$tmpPage.val('1')
	totalValue = ->
		console.log(dataCount , maxRowsCount)
		if Math.ceil(dataCount / maxRowsCount) > 1
			'/ '+ Math.ceil(dataCount/maxRowsCount)
		else
			''
	$totalPages.html(totalValue)


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
								innerInput = '<input  type="text" class="colorPInTable"/>'
								# $('td.colorpickerInTable').each (index, elem) ->
									# console.log($(elem).html('asdasd'))
									# $(elem).html(innerInput)
									# $(elem).find('input.colorPInTable').colorpicker()
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
	else if part is "duplicateRow"
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
	columns = instance.profile.columns
	optionslist = ""
	for value, i in columns.querable then optionslist += "<option value='#{columns.columnsdb[i]}'>#{columns.columnsclient[i]} (#{columns.columnsdb[i]})</option>" if do value.bool
	html = ""
	html += "
		<div class='row'>
			<div class='col-md-12'>
				<div class='portlet box blue'>"
	html += htmls.header
	html += "<div class='portlet-body'>"
	html += htmls.toppanel
	html += "<div class='row'>"
	html += htmls.table
	html += "</div>"
	html += "
		<div class='modal fade' id='#{instance.name}-searchmodal' tabindex='-1' role='basic' aria-hidden='true'>
			<div class='modal-dialog'>
				<div class='modal-content'>
					<div class='modal-header'>
						<button type='button' class='close' data-dismiss='modal' aria-hidden='true'></button>
						<h4 class='modal-title'>Поиск</h4>
					</div>
					<div class='modal-body'>
						<div class='filter row'>
							<div class='col-md-4'>
								<select class='form-control'>
									#{optionslist}
								</select>
							</div>
							<div class='col-md-3'>
								<select class='form-control'>
									<option value='equal'>(==) Равно</option>
									<option value='not equal'>(!=) Не равно</option>
									<option value='grater than or equal'>(>=) Больше или равно</option>
									<option value='less than or equal'>(<=) Меньше или равно</option>
									<option value='like'>(%) Любое значение</option>
								</select>
							</div>
							<div class='col-md-4'>
								<input type='text' class='form-control'>
							</div>
							<div class='col-md-1'>
								<button type='button' class='close removefilter'></button>
							</div>
						</div>
					</div>
					<div class='modal-footer'>
						<button type='button' class='btn default resetfilters'>Сбросить фильтры</button>
						<button type='button' class='btn default addfilter'>Добавить фильтр</button>
						<button type='button' class='btn blue google'>Найти</button>
						<button type='button' class='btn default' data-dismiss='modal'>Закрыть</button>
					</div>
				</div>
			</div>
		</div>"
	callback html

MB.Table::makeheader = (callback) ->
	instance = @
	html = ""
	pageNumber = parseInt instance.profile.general.pageno
	numberOfPages = Math.ceil (instance.data.info.ROWS_COUNT / instance.profile.general.rowsmaxnum)
	html += "
		<div class='portlet-title'>
			<div class='caption'>
				<i class='fa fa-globe'></i>" + instance.profile.general.tablename + "
			</div>
		<div class='tools'>
			<a href='#portlet-config' data-toggle='modal' class='config'></a>
			<a href='javascript:;' class='reload'></a>
		</div>
		<div class='actions'>"
	html += "
		<div class='pagination'>
			Стр. 
			<a href='#' class='btn default switchPreviousPage'>
				<i class='fa fa-angle-left'></i>
			</a>
			<input type='text' class='form-control' disabled >
			<a href='#' class='btn default switchNextPage'>
				<i class='fa fa-angle-right'></i>
			</a> <span class='totalPages'>/ " + numberOfPages + "</span>
		</div>" if numberOfPages > 1
	filtersExists = no
	for value, i in instance.profile.columns.filterType
		filtersExists = yes if instance.profile.columns.filterType[i] isnt ""
	filtersExists = yes if instance.constructorWhere isnt ""
	html += "
		<a href='#' class='btn btn-primary reset_filters'>
			<i class='fa fa-filter'></i>
		</a>" if filtersExists
	for value, i in instance.profile.columns.querable
		querablesExists = yes if value isnt ""
	if querablesExists
		html += "
			<a class='btn default' data-toggle='modal' href='##{instance.name}-searchmodal'>
				<i class='fa fa-search'></i>
			</a>"
		instance.querablesExists = querablesExists
	if do instance.profile.general.newcommand.bool
		html += "
			<a href='#' class='btn btn-primary create_button'>
				<i class='fa fa-plus'></i> Создать 
			</a>"
		html += "
			<a href='#' class='btn btn-primary create_in_form_button'>
				<i class='fa fa-plus'></i> Создать в форме
			</a>" if instance.profile.general.juniorobject
		html += "
			<a href='#' class='btn btn-primary duplicate_button'>
				<i class='fa fa-copy'></i> Дублировать 
			</a>"
	html += "
		<a href='#' class='btn red delete_button'>
			<i class='fa fa-times'></i> Удалить 
		</a>" if do instance.profile.general.removecommand.bool
	html += "
		<a href='#' class='btn green save_button'>
			<i class='fa fa-save'></i> Сохранить 
		</a>"  if do instance.profile.general.modifycommand.bool or do instance.profile.general.newcommand.bool
	html += "
		<div class='btn-group'>
			<a class='btn green' href='#' data-toggle='dropdown'>
				<i class='fa fa-cogs'></i> Доп. функции 
				<i class='fa fa-angle-down'></i>
			</a>
			<ul class='dropdown-menu pull-right'>
				<li>
					<a href='#' class='xls-converter'>
						<i class='fa fa-pencil'></i> Export to Excel 
					</a>
				</li>
				<li>
					<a href='#' class='send_exel_to_email'>
						<i class='fa fa-pencil'></i> Send excel to email
					</a>
				</li>
				<li class='divider'></li>
				<li>
					<a href='#'>
						<i class='i'></i> More action 
					</a>
				</li>
			</ul>
		</div>"
	html += "
		<div class='btn-group'>
			<a class='btn green' href='#' data-toggle='dropdown'>
				 Колонки 
				<i class='fa fa-angle-down'></i> 
			</a>
			<div class='dropdown-menu hold-on-click dropdown-checkboxes pull-right columns_toggler'>"
	totalNo = true
	if JSON.parse(localStorage.getItem('tables'))
		for lsTable, lsT in JSON.parse(localStorage.getItem('tables'))
			if lsTable.name == instance.name
				for lsTabInnerName, lsTabIN of lsTable.visibility
					if lsTabIN
						html += "<label><input type='checkbox' data-column='" + lsTabInnerName + "' checked>" + instance.profile.columns.columnsclient[instance.profile.columns.columnsdb.indexOf lsTabInnerName] + "</label>"
					else
						html += "<label><input type='checkbox' data-column='" + lsTabInnerName + "'>" + instance.profile.columns.columnsclient[instance.profile.columns.columnsdb.indexOf lsTabInnerName] + "</label>"
					totalNo = false

	if totalNo
		i = 0
		l = instance.profile.columns.columnsdb.length
		while i < l
			if instance.profile.columns.visibility[i]  is "TRUE"
				html += "<label><input type='checkbox' data-column='" + instance.profile.columns.columnsdb[i] + "' checked>" + instance.profile.columns.columnsclient[i] + "</label>"
			else
				html += "<label><input type='checkbox' data-column='" + instance.profile.columns.columnsdb[i] + "'>" + instance.profile.columns.columnsclient[i] + "</label>"
			i++

	html += "</div></div></div></div>"
	callback html

MB.Table::maketoppanel = (callback) ->
	instance = @
	columns = instance.profile.columns
	html = "<div class='row'><div class='col-md-12'><div class='top-panel'><div class='row'>"
	for value, i in columns.columnsdb
		filterType = columns.filterType[i]
		switch filterType
			when "daterange"
				html += "
					<div class='col-md-3'>
						<div class='form-group'>
							<div>
								<label>#{columns.filterLabel[i]}</label>
							</div>
							<div class='row filterContainer' data-column='#{value}' data-filterType='#{filterType}'>
								<div class='col-md-6'>
									<div class='input-group'>
										<span class='input-group-addon'>С:</span>
										<input type='text' class='form-control' data-side='start'>
									</div>
								</div>
								<div class='col-md-6'>
									<div class='input-group'>
										<span class='input-group-addon'>По:</span>
										<input type='text' class='form-control' data-side='end'>
									</div>
								</div>
							</div>
						</div>
					</div>"
			when "select2"
				html += "
					<div class='col-md-2'>
						<div class='form-group'>
							<label>#{columns.filterLabel[i]}</label>
							<div class='filterContainer' data-column='#{value}' data-filterType='#{filterType}'>
								<input type='text' class='form-control filter'>
							</div>
						</div>
					</div>"
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
					# if instance.parentobject
					# 	MB.O.forms[instance.parentobject].reload "data"
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
		# $ ".columns_toggler"
		# .on "click", "label", (e) ->
		# 	$target = $ e.target
		# 	state = $target.find "input"
		# 	.prop "checked"
		# 	column = $target.find "input"
		# 	.data "column"
		# 	console.log "columns_toggler", state
		$searchmodal = instance.$container.find "##{instance.name}-searchmodal"
		$searchmodal.find ".modal-body"
		.on "click", (e) ->
			$target = $ e.target
			if $target.hasClass "removefilter"
				do $target.parents ".filter"
				.remove
		$searchmodal.find ".modal-footer"
		.on "click", "button", (e) ->
			columns = instance.profile.columns
			$target = $ e.target
			if $target.hasClass "google" then button = "google"
			else if $target.hasClass "addfilter" then button = "addfilter"
			else if $target.hasClass "resetfilters" then button = "resetfilters"
			switch button
				when "addfilter"
					optionslist = ""
					for value, i in columns.querable then optionslist += "<option value='#{columns.columnsdb[i]}'>#{columns.columnsclient[i]} (#{columns.columnsdb[i]})</option>" if do value.bool
					$searchmodal.find ".modal-body"
					.append "
						<div class='filter row'>
							<div class='col-md-4'>
								<select class='form-control'>
									#{optionslist}
								</select>
							</div>
							<div class='col-md-3'>
								<select class='form-control'>
									<option value='equal'>(==) Равно</option>
									<option value='not equal'>(!=) Не равно</option>
									<option value='grater than or equal'>(>=) Больше или равно</option>
									<option value='less than or equal'>(<=) Меньше или равно</option>
									<option value='like'>(%) Любое значение</option>
								</select>
							</div>
							<div class='col-md-4'>
								<input type='text' class='form-control'>
							</div>
							<div class='col-md-1'>
								<button type='button' class='close removefilter'></button>
							</div>
						</div>"
				when "resetfilters"
					countfilters = 0
					for key, value of instance.profile.general.filterWhere
						if value.flag? and value.flag is "searchmodal"
							countfilters++
							delete instance.profile.general.filterWhere[key]
					if countfilters > 0
						instance.reload "data"
						$searchmodal.find ".filter"
						.each (i, el) ->
							$filter = $ el
							if i isnt 0
								do $ el
								.remove
							else
								$filter.find "input"
								.val ""
				when "google"
					counter = 0
					filtercount = $searchmodal.find ".filter"
						.length
					$searchmodal.find ".filter"
					.each (i, el) ->
						$filter = $ el
						field = do $filter.find "select"
							.eq 0
							.val
						filtertype = do $filter.find "select"
							.eq 1
							.val
						value = do $filter.find "input"
							.val
						instance.profile.general.filterWhere[field] =
							type: filtertype, value: value, flag: "searchmodal"
						counter++
						if filtercount is counter then instance.reload "data"
		instance.$container.on "click", ".reset_filters", (e) ->
			if instance.name is "table_order"
				countWhere = Object.keys(instance.profile.general.filterWhere).length
				if countWhere is 0
					$st = instance.$container.find ".top-panel .statusToggler"
					$st.prop "checked", yes
					instance.profile.general.filterWhere["STATUS2"] =
						type: "notIn"
						value: "('CANCELED', 'RETURNED', 'RETURNED_REALIZATION', 'DEFECTIVE')"
					instance.reload "data"
				else if countWhere is 1
					key = Object.keys(instance.profile.general.filterWhere)[0]
					if key is "STATUS2"
						return
					else
						filterType = instance.profile.general.filterWhere[key].$filterContainer.data "filtertype"
						if filterType is "select2"
							instance.profile.general.filterWhere[key].$filterContainer.find "input.filter"
							.select2 "val", ""
							delete instance.profile.general.filterWhere[key]
						else if filterType is "daterange"
							instance.profile.general.filterWhere[key].$filterContainer.find "input"
							.each (i, el) ->
								$ el
								.val ""
							delete instance.profile.general.filterWhere[key]
						$st = instance.$container.find ".top-panel .statusToggler"
						$st.prop "checked", yes
						instance.profile.general.filterWhere["STATUS2"] =
							type: "notIn"
							value: "('CANCELED', 'RETURNED', 'RETURNED_REALIZATION', 'DEFECTIVE')"
						instance.reload "data"
				else if countWhere > 1
					keys = Object.keys instance.profile.general.filterWhere
					if keys.indexOf "STATUS2" is -1
						$st = instance.$container.find ".top-panel .statusToggler"
						$st.prop "checked", yes
						instance.profile.general.filterWhere["STATUS2"] =
							type: "notIn"
							value: "('CANCELED', 'RETURNED', 'RETURNED_REALIZATION', 'DEFECTIVE')"
					for key, value of instance.profile.general.filterWhere
						if key is "STATUS2"
							continue
						else
							filterType = value.$filterContainer.data "filtertype"
							if filterType is "select2"
								value.$filterContainer.find "input.filter"
								.select2 "val", ""
								delete instance.profile.general.filterWhere[key]
							else if filterType is "daterange"
								value.$filterContainer.find "input"
								.each (i, el) ->
									$ el
									.val ""
								delete instance.profile.general.filterWhere[key]
					instance.reload "data"
			else
				for key, value of instance.profile.general.filterWhere
					filterType = value.$filterContainer.data "filtertype"
					if filterType is "select2"
						value.$filterContainer.find "input.filter"
						.select2 "val", ""
						delete instance.profile.general.filterWhere[key]
					else if filterType is "daterange"
						value.$filterContainer.find "input"
						.each (i, el) ->
							$ el
							.val ""
						delete instance.profile.general.filterWhere[key]
				if instance.constructorWhere isnt ""
					instance.constructorWhere = ""
				instance.reload "data"
		instance.$container.find ".filterContainer"
		.each (i, el) ->
			filterType = $ el
			.data "filtertype"
			column = $ el
			.data "column"
			switch filterType
				when "daterange"
					$ el
					.find "input"
					.each (ii, ell) ->
						side = $ ell
						.data "side"
						$ ell
						.datepicker
							format: "dd.mm.yyyy"
							weekStart: 1
							firstDay: 1
						.on "changeDate", (e) ->
							val = do $ ell
							.val
							if instance.profile.general.filterWhere[column]?
								if side is "start"
									instance.profile.general.filterWhere[column].start = val
								else
									instance.profile.general.filterWhere[column].end = val
							else
								instance.profile.general.filterWhere[column] =
									$filterContainer: $ el
									type: "daterange"
								if side is "start"
									instance.profile.general.filterWhere[column].start = val
								else
									instance.profile.general.filterWhere[column].end = val
							instance.reload "data"
							$(this).datepicker "hide"
				when "select2"
					$ el
					.find "input"
					.select2
						placeholder: "Выберите"
						ajax:
							url: "/cgi-bin/b2e"
							dataType: "json"
							data: (term, page) ->
								index = instance.profile.columns.columnsdb.indexOf column
								object = instance.profile.columns.filterObject[index]
								columns = instance.profile.columns.filterQueryColumns[index]
								options =
									command: "get"
									object: "select2_for_query"
									column_name: column
									view_name: instance.data.info.VIEW_NAME
									sid: MB.User.sid
								options.where = "upper(#{column}) like upper('%#{term}%')" if term
								request: MB.Core.makeQuery options
							results: (data, page) ->
								data = MB.Core.parseFormat data
								results: MB.Table.parseforselect2data data
					.on "change", (e)->
						val = e.val
						instance.profile.general.filterWhere[column] =
							$filterContainer: $ el
							type: "equal"
							value: val
						instance.reload "data"
		instance.$container.find(".xls-converter").on "click", (e) ->
			vis = instance.profile.columns.visibility
			# o =
			# 	command: "get"
			# 	object: instance.profile.general.getobject
			# 	order_by: instance.profile.general.orderby
			# 	client_object: instance.name
			# 	where: (if (instance.parentkeyvalue isnt `undefined`) then instance.profile.general.parentkey + " = " + instance.parentkeyvalue else "")
			# 	sid: window.MB.User.sid
			instance.getdata (data) ->

			# window.MB.Core.sendQuery o, (data) ->
				th = "<tr>"
				for k1 of data.NAMES
					continue if vis[k1] is "FALSE"
					th += "<td>" + data.NAMES[k1] + "</td>"
				th += "</tr>"
				trs = ""
				for k2 of data.DATA
					trD = data.DATA[k2]
					trs += "<tr>"
					for k3 of trD
						continue  if vis[k3] is "FALSE"
						trs += "<td>" + trD[k3] + "</td>"
					trs += "</tr>"
				html = "<table><tbody>" + th + trs + "</tbody></table>"
				window.open "data:application/vnd.ms-excel," + "﻿" + encodeURIComponent(html), "_self"
			, yes
		instance.$container.find('.send_exel_to_email').on "click", (e) ->
			console.log instance, instance.profile.general.filterWhere
			filterWhere = []
			if instance.profile.general.filterWhere
				general = {}
				general.filterWhere = instance.profile.general.filterWhere
				for key, value of general.filterWhere
					switch value.type
						when "equal" then filterWhere.push "#{key} = '#{value.value}'"
						when "notIn"
							k = key.substr 0, (key.length - 1)
							filterWhere.push "#{k} not in#{value.value}"
						when "daterange"
							if value.start? then filterWhere.push "#{key} >= to_date('#{value.start}', 'DD.MM.YYYY')"
							if value.end? then filterWhere.push "#{key} <= to_date('#{value.end}', 'DD.MM.YYYY')"
						when "not equal" then filterWhere.push "#{key} != #{value.value}"
						when "grater than or equal" then filterWhere.push "#{key} >= '#{value.value}'"
						when "less than or equal" then filterWhere.push "#{key} <= '#{value.value}'"
						when "like" then filterWhere.push "#{key} like '%#{value.value}%'"
			MB.Core.sendQuery
				command: 'operation',
				object: 'send_excel_to_email',
				sid: MB.User.sid,
				params:
					where: filterWhere.join(' and '),
					CLIENT_OBJECT: instance.name,
					VIEW_NAME: instance.data.info.VIEW_NAME,
					getObject: instance.profile.general.getobject
			, (res) ->
				toastr[res.TOAST_TYPE] res.MESSAGE, res.TITLE
		instance.$container.on "click", ".portlet-title", (e) ->
			$target = $ e.target
			if $target.hasClass "reload"
				$handsontable = instance.$container.find ".handsontable"
				handsontableInstance = $handsontable.handsontable "getInstance"
				dataProp = handsontableInstance.getDataAtProp "rowStatus"
				data = handsontableInstance.getData()
				needAlert = no
				for value, i in data
					needAlert = yes if value.rowStatus is "addingRow" or value.rowStatus is "duplicatedRow" or value.rowStatus is "editedRow"
				if needAlert
					bootbox.dialog
						message: "Есть несохраненные изменения. Вы уверены что хотите продолжить?"
						title: "Подтверждение обновления таблицы"
						buttons:
							success:
								label: "Да"
								className: "green"
								callback: ->
									instance.reload "data"
							danger:
								label: "Нет"
								className: "red"
								callback: ->
				else
					instance.reload "data"
			else if ($target.prop "tagName") is "LABEL" or ($target.prop "tagName") is "INPUT"
				$handsontable = instance.$container.find ".handsontable"
				handsontableInstance = $handsontable.handsontable "getInstance"
				$target = $ e.target
				!state = $target.find "input"
				.prop "checked"
				column = $target.find "input"
				.data "column"
				console.log "columns_toggler", state
				parseVisibility = ()->
					visibilityObject = {}
					for value,i in instance.profile.columns.columnsdb
						if value == column
							visibilityObject[column] = !state
						else
							visibilityObject[value] = instance.$container.find('div.columns_toggler input[type="checkbox"][data-column="'+value+'"]').attr('checked') is "checked"
					return visibilityObject

				lsTableObj = 
					name: instance.name
					visibility: parseVisibility()

				tempLsTables = JSON.parse(localStorage.getItem "tables")
				notFound = true
				if tempLsTables
					for lsTable, lsT in tempLsTables
						if lsTable.name is instance.name
							lsTable.visibility = {}
							lsTable.visibility = lsTableObj.visibility
							notFound = false
				if notFound
					if not tempLsTables?
						tempLsTables = []
					tempLsTables.push(lsTableObj)
				localStorage.tables = JSON.stringify(tempLsTables)
				do handsontableInstance.render
				instance.reload('data')
				# handsontableInstance.updateSetting
				# 	columns: do ->
				# 		general = instance.profile.general
				# 		_columns = instance.profile.columns
				# 		columns = []
				# 		doesTableUpdatable = do general.modifycommand.bool
				# 		for value, i in _columns.columnsdb
				# 			columnEditor = _columns.editor[i]
				# 			doesColumnVisible = do _columns.visibility[i].bool
				# 			doesColumnUpdatable = do _columns.editability[i].bool
				# 			if doesColumnVisible
				# 				if doesTableUpdatable and doesColumnUpdatable
				# 					switch columnEditor
				# 						when "text" then column = type: "text", data: value
				# 						when "number" then column = type: "text", data: value
				# 						when "colorpicker" then column = type: "text", data: value
				# 						when "password" then column = type: "text", data: value
				# 						when "datetime" then column = type: "datetime", data: value
				# 						when "checkbox" then column = type: "checkbox", data: value, checkedTemplate: "TRUE", uncheckedTemplate: "FALSE"
				# 						when "select2" then do (i) -> column = makeSelect2Column i, no
				# 						when "select2withEmptyValue" then do (i) -> column = makeSelect2Column i, yes
				# 				else
				# 					switch columnEditor
				# 						when "checkbox" then column = type: "checkbox", data: value, checkedTemplate: "TRUE", uncheckedTemplate: "FALSE", readOnly: yes
				# 						else column = type: "text", data: value, readOnly: yes
				# 			else continue
				# 			columns.push column
				# 		columns



		# 				$ ".columns_toggler"
		# .on "click", "label", (e) ->
		# 	$target = $ e.target
		# 	state = $target.find "input"
		# 	.prop "checked"
		# 	column = $target.find "input"
		# 	.data "column"
		# 	console.log "columns_toggler", state
				
			
			# else if ($target.prop "tagName") is "INPUT" and 
			# 	alert 888888
			###else console.log $target.prop "tagName"###
			###else if $target.prop "tagName" is "INPUT"
				alert 88888888###
			# else if $target.prop "tagName" is "LABEL" and $target.closest ".columns_toggler"
			# .length > 0
			# 	alert 7777777
			# 	state = $target.find "input"
			# 	.prop "checked"
			# 	column = $target.find "input"
			# 	.data "column"
			# 	console.log "columns_toggler", state
				# if state
				# 	do instance.$container.find "table [data-column='" + column + "']"
				# 	.hide
				# else
				# 	do instance.$container.find "table [data-column='" + column + "']"
				# 	.show
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
				# console.log val
				pageNumber = parseInt instance.profile.general.pageno
				numberOfPages = Math.ceil (instance.data.info.ROWS_COUNT / instance.profile.general.rowsmaxnum)
				if parseInt(val) is numberOfPages
					return
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
				if parseInt(val) is 1
					return
				val--
				$target.parent()
				.find "input"
				.val val
				instance.profile.general.pageno = val
				instance.reload "data"
			else if $target.hasClass "create_button"
				instance.updatemodel "addrow", {}, ->
					instance.updateview "addrow", ->
			else if $target.hasClass "create_in_form_button"
				MB.Core.switchModal
					type: "form"
					ids: ["new"]
					name: instance.profile.general.juniorobject
					params:
						mode: "add"
						parentobject: instance.name
				# instance.updatemodel "addrow", {}, ->
				# 	instance.updateview "addrow", ->
			else if $target.hasClass "lets_query"

			else if $target.hasClass "save_button"
				if (instance.addingStorage?) and (instance.editingStorage?)
					addingNodesCount = Object.keys(instance.addingStorage).length
					editingNodesCount = Object.keys(instance.editingStorage).length
					nodesCount = addingNodesCount + editingNodesCount
					callbacksCounter = 0
					do ->
						for own key, row of instance.addingStorage
							MB.Core.sendQuery row, (res) ->
								callbacksCounter++
								toastr[res.TOAST_TYPE] res.MESSAGE, res.TITLE
								if callbacksCounter is nodesCount
									delete instance.addingStorage
									delete instance.editingStorage
									instance.reload "data"
					do ->
						for own key, row of instance.editingStorage
							MB.Core.sendQuery row, (res) ->
								callbacksCounter++
								toastr[res.TOAST_TYPE] res.MESSAGE, res.TITLE
								if callbacksCounter is nodesCount
									delete instance.addingStorage
									delete instance.editingStorage
									instance.reload "data"
				else if instance.addingStorage?
					addingNodesCount = Object.keys(instance.addingStorage).length
					callbacksCounter = 0
					for own key, row of instance.addingStorage
						MB.Core.sendQuery row, (res) ->
								callbacksCounter++
								toastr[res.TOAST_TYPE] res.MESSAGE, res.TITLE
								if callbacksCounter is addingNodesCount
									delete instance.addingStorage
									instance.reload "data"
				else if instance.editingStorage?
					editingNodesCount = Object.keys(instance.editingStorage).length
					callbacksCounter = 0
					for own key, row of instance.editingStorage
						MB.Core.sendQuery row, (res) ->
								callbacksCounter++
								toastr[res.TOAST_TYPE] res.MESSAGE, res.TITLE
								if callbacksCounter is editingNodesCount
									delete instance.editingStorage
									instance.reload "data"
			else if $target.hasClass "delete_button"
				bootbox.dialog
					message: "Вы уверены что хотите удалить эти данные?"
					title: "Подтверждение удаления"
					buttons:
						success:
							label: "Да"
							className: "green"
							callback: ->
								instance.deletingStorage = {}
								$handsontable = instance.$container.find ".handsontable"
								handsontableInstance = $handsontable.handsontable "getInstance"
								selectedRowsInterval = MB.Table.getSelectedRowsInterval handsontableInstance
								row = selectedRowsInterval[0]
								rowEnd = selectedRowsInterval[1]
								addingCache = []
								while row <= rowEnd
									rowStatus = handsontableInstance.getDataAtRowProp row, "rowStatus"
									# console.log rowStatus
									if rowStatus is "justRow" or rowStatus is "editedRow"
										primaryKeyId = instance.data.data[row][instance.data.names.indexOf instance.profile.general.primarykey]
										objversion = instance.data.data[row][instance.data.names.indexOf "OBJVERSION"]
										instance.deletingStorage[primaryKeyId] =
											command: "remove"
											object: instance.profile.general.object
											sid: MB.User.sid
										instance.deletingStorage[primaryKeyId]["OBJVERSION"] = objversion
										instance.deletingStorage[primaryKeyId][instance.profile.general.primarykey] = primaryKeyId
										row++
									else if rowStatus is "addingRow"
										addingCache.push row
										row++
								if addingCache.length > 0
									if addingCache.length is 1
										handsontableInstance.alter "remove_row", addingCache[0], addingCache[0]
									else if addingCache.length > 1
										handsontableInstance.alter "remove_row", addingCache[0], addingCache.length
								deletingNodesCount = Object.keys(instance.deletingStorage).length
								callbacksCounter = 0
								if deletingNodesCount > 0
									for own key, row of instance.deletingStorage
										MB.Core.sendQuery row, (res) ->
											callbacksCounter++
											toastr[res.TOAST_TYPE] res.MESSAGE, res.TITLE
											if callbacksCounter is deletingNodesCount
												delete instance.deletingStorage
												instance.reload "data"
						danger:
							label: "Нет"
							className: "red"
							callback: ->
			else if $target.hasClass "duplicate_button"
				$handsontable = instance.$container.find ".handsontable"
				handsontableInstance = $handsontable.handsontable "getInstance"
				selectedRowsInterval = MB.Table.getSelectedRowsInterval handsontableInstance
				if selectedRowsInterval[0] is selectedRowsInterval[1]
					data = do handsontableInstance.getData
					row = selectedRowsInterval[0]
					rowStatus = handsontableInstance.getDataAtRowProp row, "rowStatus"
					if rowStatus is "justRow"
						addingObject = {}
						data = instance.data.data[row]
						for value, i in instance.profile.columns.columnsdb
							if do instance.profile.columns.insertability[i].bool
								if instance.data.data[row][i] isnt ""
									editor = instance.profile.columns.editor[i]
									switch editor
										when "select2"
											returnsColumn = instance.profile.columns.returnscolumn[i]
											if returnsColumn isnt ""
												addingObject[value] = instance.data.data[row][i]
												returnsColumnIndex = instance.profile.columns.columnsdb.indexOf returnsColumn
												addingObject[returnsColumn] = instance.data.data[row][returnsColumnIndex]
											else
												addingObject[value] = instance.data.data[row][i]
										when "select2withEmptyValue"
											returnsColumn = instance.profile.columns.returnscolumn[i]
											if returnsColumn isnt ""
												addingObject[value] = instance.data.data[row][i]
												returnsColumnIndex = instance.profile.columns.columnsdb.indexOf returnsColumn
												addingObject[returnsColumn] = instance.data.data[row][returnsColumnIndex]
											else
												addingObject[value] = instance.data.data[row][i]
										else
											addingObject[value] = instance.data.data[row][i]
						instance.updatemodel "addrow", {}, ->
							instance.updateview "addrow", ->
								for key, value of addingObject
									handsontableInstance.setDataAtRowProp 0, key, value, "duplicateInsertion"
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
		if do instance.profile.general.custom.bool
			$.getScript "html/tables/require/" + instance.name + ".js", (data, status, xhr) ->
				instance.custom ->
					do callback
			return
		else
			do callback











							# ...
						
					# do stuff 6


			# 	when "google"

			# else if $target.hasClass "addfilter"




						# when "select2" then processSelect2 rowStatus, rowId, prop, newVal, no
						# when "select2withEmptyValue" then processSelect2 rowStatus, rowId, prop, newVal, yes





							# rowModel = instance[storage][row][general.primarykey]


# instance[storage][row][general.primarykey]



					# mode = switch
					# 	when rowStatus is "addingRow" then "create"
					# 	else "update"
					# rowModel = switch
					# 	when 

					# rowId = switch
					# 	when rowStatus is "addingRow" then handsontableInstance.getDataAtRowProp row, "guid"
					# 	when rowStatus is "addingRow" then row
					# 	else row
					# switch editor
						# when "select2" then processSelect2 rowStatus, rowId, prop, newVal, no
						# when "select2withEmptyValue" then processSelect2 rowStatus, rowId, prop, newVal, yes




	# 					<div class='filter row'>
	# 						<div class='col-md-4'>
	# 							<select class='form-control'>"
	# for value, i in columns.querable then html += "<option value='#{columns.columnsdb[i]}'>#{columns.columnsdb[i]}</option>" if do value.bool
	# html +=	"					</select>
	# 						</div>
	# 						<div class='col-md-3'>
	# 							<select class='form-control'>
	# 								<option>(===)</option>
	# 								<option>(!==)</option>
	# 							</select>
	# 						</div>
	# 						<div class='col-md-4'>
	# 							<input type='text' class='form-control'>
	# 						</div>
	# 						<div class='col-md-1'>
	# 							<button type='button' class='close'></button>
	# 						</div>
	# 					</div>





		# instance.$container.find "##{instance.name}-querymodal input"
		# .on "keyup", (e) ->
		# 	$ @
		# 	.parents ".row.querablecolumn"
		# 	.addClass ".changedFilter"
		# instance.$container.find "##{instance.name}-querymodal select"
		# .on "keyup", (e) ->
		# 	$ @
		# 	.parents ".row.querablecolumn"
		# 	.addClass ".changedFilter"
		# instance.$container.find "##{instance.name}-querymodal .row.querablecolumn"
		# .each (i, el) ->
		# 	columns = instance.profile.columns
		# 	column = $ el
		# 	.data "querablecolumn"
		# 	columnIndex = columns.columnsdb.indexOf column
		# 	columnEditor = columns.editor[columnIndex]
		# 	$queryContainer = $ el
		# 	.find ".queryContainer"
		# 	switch columnEditor
		# 		when "select2"
		# 			$input = $queryContainer.find "input"
		# 			$input.select2
		# 				placeholder: "Выберите"
		# 				ajax:
		# 					url: "/cgi-bin/b2e"
		# 					dataType: "json"
		# 					data: (term, page) ->
		# 						references = columns.references[columnIndex]
		# 						refcolumns = columns.refcolumns[columnIndex]
		# 						options =
		# 							command: "get"
		# 							object: references
		# 							columns: refcolumns
		# 							sid: MB.User.sid
		# 						request: MB.Core.makeQuery options
		# 					results: (data, page) ->
		# 						data = MB.Core.parseFormat data
		# 						results: MB.Table.parseforselect2data data
		# 		when "datetime"
		# 			$queryContainer.find "input"
		# 			.each (ii, ell) ->
		# 				$ ell
		# 				.datepicker
		# 					format: "dd.mm.yyyy"



		# instance.$container.find "##{instance.name}-searchmodal"
		# .on "click", ".fire_button", (e) ->
		# 	55


			# columns = instance.profile.columns
			# $modal = instance.$container.find "##{instance.name}-querymodal"
			# $modal.find ".row.querablecolumn"
			# .each (i, el) ->
			# 	column = $ el
			# 	.data "querablecolumn"
			# 	columnIndex = columns.columnsdb.indexOf column
			# 	columnEditor = columns.editor[columnIndex]
			# 	switch columnEditor
			# 		when "select2", "select2withEmptyValue"
			# 			filterValue = $ el
			# 			.find "input"
			# 			.select2 "val"
			# 			filterType = do $ el
			# 			.find "select"
			# 			.val
			# 			# if filterValue then console.log column: column, editor: columnEditor, filterType: filterType, filterValue: filterValue
			# 		when "datetime"
			# 			filterValueStart = do $ el
			# 			.find "input[data-side='start']"
			# 			.val
			# 			filterValueEnd = do $ el
			# 			.find "input[data-side='end']"
			# 			.val
			# 			filterType = do $ el
			# 			.find "select"
			# 			.val
			# 			if filterValueStart and filterValueEnd then console.log column: column, editor: columnEditor, filterType: filterType, filterValueStart: filterValueStart, filterValueEnd: filterValueEnd
			# 		else
			# 			filterValue = do $ el
			# 			.find "input"
			# 			.val
			# 			filterType = do $ el
			# 			.find "select"
			# 			.val
			# 			# if filterValue then console.log column: column, editor: columnEditor, filterType: filterType, filterValue: filterValue
						
						



				# filterValue = switch
				# 	when columnEditor is "select2" then 






				# switch columnEditor
				# 	when "select2"
				# 		filterValue 
				# $row = $ el
				# column = $row.data "querablecolumn"
				# columnIndex = columns.columnsdb.indexOf column
				# editor = columns.editor[columnIndex]
				# filterType = do $row.find "select"
				# .val
				# filterValue = do $row.find "input"
				# .val
				# if filterValue
				# 	console.log column: column, editor: editor, filterType: filterType, filterValue: filterValue






						# .on "changeDate", (e) ->
						# 	val = do $ ell
						# 	.val
						# 	# console.log column, filterType, val, side
						# 	if instance.profile.general.filterWhere[column]?
						# 		if side is "start"
						# 			instance.profile.general.filterWhere[column].start = val
						# 		else
						# 			instance.profile.general.filterWhere[column].end = val
						# 	else
						# 		instance.profile.general.filterWhere[column] =
						# 			$filterContainer: $ el
						# 			type: "daterange"
						# 		if side is "start"
						# 			instance.profile.general.filterWhere[column].start = val
						# 		else
						# 			instance.profile.general.filterWhere[column].end = val
						# 	instance.reload "data"
						# 	$(this).datepicker "hide"



				# when "daterange"
				# 	$ el
				# 	.find "input"
				# 	.each (ii, ell) ->
				# 		side = $ ell
				# 		.data "side"
				# 		$ ell
				# 		.datepicker
				# 			format: "dd.mm.yyyy"
				# 		.on "changeDate", (e) ->
				# 			val = do $ ell
				# 			.val
				# 			# console.log column, filterType, val, side
				# 			if instance.profile.general.filterWhere[column]?
				# 				if side is "start"
				# 					instance.profile.general.filterWhere[column].start = val
				# 				else
				# 					instance.profile.general.filterWhere[column].end = val
				# 			else
				# 				instance.profile.general.filterWhere[column] =
				# 					$filterContainer: $ el
				# 					type: "daterange"
				# 				if side is "start"
				# 					instance.profile.general.filterWhere[column].start = val
				# 				else
				# 					instance.profile.general.filterWhere[column].end = val
				# 			instance.reload "data"
				# 			$(this).datepicker "hide"

























		# instance.$container.find "##{instance.name}-querymodal"
		# .on "click", ".fire_button", (e) ->
		# 	$modal = instance.$container.find "##{instance.name}-querymodal"
		# 	$modal.find ".row.querablecolumn"
		# 	.each (i, el) ->
		# 		columns = instance.profile.columns
		# 		column = $row.data "querablecolumn"
		# 		columnIndex = columns.columnsdb.indexOf column
		# 		columnEditor = columns.editor[columnIndex]





				# switch columnEditor
				# 	when "select2" then 


				# $row = $ el
				# column = $row.data "querablecolumn"
				# columnIndex = columns.columnsdb.indexOf column
				# editor = columns.editor[columnIndex]
				# filterType = do $row.find "select"
				# .val
				# filterValue = do $row.find "input"
				# .val
				# if filterValue
				# 	console.log column: column, editor: editor, filterType: filterType, filterValue: filterValue









# instance.$container.find(".xls-converter").on("click", function(e) {
#     var o;
#     log(instance);
#     var vis = instance.profile.columns.visibility;
#     o = {
#         command: "get",
#         object: instance.profile.general.getobject,
#         order_by: instance.profile.general.orderby,
#         client_object: instance.name,
#         page_no: instance.profile.general.pageno,
#         where: (instance.parentkeyvalue != undefined)?instance.profile.general.parentkey+" = "+instance.parentkeyvalue:"",
#         sid: window.MB.User.sid
#     };
#     return window.MB.Core.sendQuery(o, function(data) {
#         var th = "<tr>";
#         for (var k1 in data.NAMES){
#             if (vis[k1]=="FALSE") continue;
#             th += "<td>"+data.NAMES[k1]+"</td>";
#         }
#         th += "</tr>";
#         var trs = "";
#         for(var k2 in data.DATA){
#             var trD = data.DATA[k2];
#             trs += "<tr>";
#             for (var k3 in trD){
#                 if (vis[k3]=="FALSE") continue;
#                 trs += "<td>"+trD[k3]+"</td>";
#             }
#             trs += "</tr>";
#         }
#         var html = "<table><tbody>"+th+trs+"</tbody></table>";
#         window.open('data:application/vnd.ms-excel,' + '\uFEFF' + encodeURIComponent(html),"_self");
#     });
# });











# 		instance.$container.find ".xls-converter"






# instance.$container.find(".xls-converter").on("click", function(e) {
#             var o;
#             log(instance);
#             var vis = instance.profile.columns.visibility;
#             o = {
#                 command: "get",
#                 object: instance.profile.general.getobject,
#                 order_by: instance.profile.general.orderby,
#                 client_object: instance.name,
#                 page_no: instance.profile.general.pageno,
#                 where: (instance.parentkeyvalue != undefined)?instance.profile.general.parentkey+" = "+instance.parentkeyvalue:"",
#                 sid: window.MB.User.sid
#             };
#             return window.MB.Core.sendQuery(o, function(data) {
#                 var th = "<tr>";
#                 for (var k1 in data.NAMES){
#                     if (vis[k1]=="FALSE") continue;
#                     th += "<td>"+data.NAMES[k1]+"</td>";
#                 }
#                 th += "</tr>";
#                 var trs = "";
#                 for(var k2 in data.DATA){
#                     var trD = data.DATA[k2];
#                     trs += "<tr>";
#                     for (var k3 in trD){
#                         if (vis[k3]=="FALSE") continue;
#                         trs += "<td>"+trD[k3]+"</td>";
#                     }
#                     trs += "</tr>";
#                 }
#                 var html = "<table><tbody>"+th+trs+"</tbody></table>";
#                 window.open('data:application/vnd.ms-excel,' + '\uFEFF' + encodeURIComponent(html),"_self");
#             });
#         });











		# .on "click", (e) ->
		# 	o =
		# 		command: "get"
		# 		object: instance.profile.general.getobject
		# 		order_by: instance.profile.general.orderby
		# 		client_object: instance.name
		# 		page_no: instance.profile.general.pageno
		# 		sid: MB.User.sid
		# 	MB.Core.sendQuery o, (res) ->
		# 		csv = ""
		# 		for name, i in res.NAMES
		# 			csv += name + ";"
		# 		csv += "\n"
		# 		for row, i in res.DATA
		# 			for cell, ii in row
		# 				csv += res.DATA[i][ii] + ";"
		# 		csv += "\n"
		# 		pom = document.createElement "a"
		# 		pom.setAttribute "href", "data:text/csv;charset=windows-1251," + encodeURI csv
		# 		pom.setAttribute "download", "test.csv"
		# 		do pom.click













		# instance.$container.find ".top-panel input.filter"
		# .each (i, el) ->
		# 	field = $ el
		# 	.data "filter-field"
		# 	filterType = instance.profile.columns.filterType[instance.profile.columns.columnsdb.indexOf field]
		# 	switch filterType
		# 		when "select2"
		# 			$ el
		# 			.select2
		# 				placeholder: "Выберите"
		# 				ajax:
		# 					url: "/cgi-bin/b2cJ"
		# 					dataType: "json"
		# 					data: (term, page) ->
		# 						field = $ el
		# 						.data "filter-field"
		# 						index = instance.profile.columns.columnsdb.indexOf field
		# 						object = instance.profile.columns.filterObject[index]
		# 						columns = instance.profile.columns.filterQueryColumns[index]
		# 						options =
		# 							command: "get"
		# 							object: object
		# 							columns: columns
		# 							sid: MB.User.sid
		# 						p_xml: MB.Core.makeQuery options
		# 					results: (data, page) ->
		# 						results: MB.Table.parseforselect2data data
		# 		when "daterange"
		# 			$ el
		# 			.daterangepicker
		# 				format: "DD.MM.YYYY"
		# 				showDropdowns: true
		# 				showWeekNumbers: true
		# 				singleDatePicker: true
		# 			, (start, end) ->
		# 				if instance.profile.general.filterWhere[field]?
		# 					instance.profile.general.filterWhere[field].start = start.format "DD.MM.YYYY"
		# 					instance.profile.general.filterWhere[field].end = end.format "DD.MM.YYYY"
		# 					instance.reload "data"
		# 				else
		# 					instance.profile.general.filterWhere[field] =
		# 						type: "daterange"
		# 						start: start.format "DD.MM.YYYY"
		# 						end: end.format "DD.MM.YYYY"
		# 					instance.reload "data"
		# instance.$container.find(".filterContainer input").on "change", (e) ->
		# 	$filterContainer = $(e.target).closest ".filterContainer"
		# 	filterType = $filterContainer.data "filterType"
		# 	column = $filterContainer.data "column"
		# 	val = e.val
		# 	switch filterType
		# 		when "daterange"
		# 			inputSide = $(e.target).data "side"
		# 			if inputSide is "start"

		# 			else
			# field = e.target.dataset.filterField
			# filterType = instance.profile.columns.filterType[instance.profile.columns.columnsdb.indexOf field]
			# val = e.val
			# switch filterType
			# 	when "select2"
			# 		instance.profile.general.filterWhere[field] =
			# 			type: "equal"
			# 			value: val
			# 		instance.reload "data"







	# where = ""
	# defaultWhere = instance.profile.general.where
	# filterWhere = ""
	# parentWhere = ""
	# parentWhere += instance.profile.general.parentkey + " = '" + instance.parentkeyvalue + "'"  if instance.parentkeyvalue
	# if Object.keys(instance.profile.general.filterWhere).length > 0
	# 	arr = []
	# 	for key, value of instance.profile.general.filterWhere
	# 		if value.type is "equal"
	# 			arr.push "" + key + " = '" + value.value + "'"
	# 		else if value.type is "daterange"
	# 			if value.start? and value.end?
	# 				arr.push "" + key + " >= to_date('" + value.start + "', 'DD.MM.YYYY')"
	# 				arr.push "" + key + " <= to_date('" + value.end + "', 'DD.MM.YYYY')"
	# 			else if value.start?
	# 				arr.push "" + key + " >= to_date('" + value.start + "', 'DD.MM.YYYY')"
	# 			else if value.end?
	# 				arr.push "" + key + " <= to_date('" + value.end + "', 'DD.MM.YYYY')"
	# 		else if value.type is "notIn"
	# 			k = key.substr 0, (key.length - 1)
	# 			arr.push "" + k + " not in " + value.value
	# 	filterWhere = arr.join " and "
	# arrWhere.push defaultWhere if defaultWhere
	# arrWhere.push filterWhere if filterWhere
	# arrWhere.push parentWhere if parentWhere
	# if arrWhere.length > 0
	# 	if arrWhere.length is 1
	# 		where = arrWhere[0]
	# 	else
	# 		where = arrWhere.join " and "




			# 
			# 	for value, i in instance.profile.columns.columnsdb
			# 		editor = instance.profile.columns.editor[i]
			# 		editable = do instance.profile.columns.editability[i].bool
			# 		visible = do instance.profile.columns.visibility[i].bool
			# else
			# 	for value, i in instance.profile.columns.columnsdb
			# 		editor = instance.profile.columns.editor[i]
			# 		editable = do instance.profile.columns.editability[i].bool
			# 		visible = do instance.profile.columns.visibility[i].bool
			# 	if editor is "checkbox"
			# 		column =
			# 			type: "checkbox"
			# 			checkedTemplate: "TRUE"
			# 			uncheckedTemplate: "FALSE"
			# 			data: instance.profile.columns.columnsdb[i]
			# 			readOnly: true
			# 	else
			# 		column =
			# 			data: instance.profile.columns.columnsdb[i]
			# 			readOnly: true


			# columns = []
			# instance.profile.columns.columnsdb.forEach (value, i, array) ->
			# 	editor = instance.profile.columns.editor[i]
			# 	if do instance.profile.columns.visibility[i].bool
			# 		if do instance.profile.general.modifycommand.bool
			# 			unless do instance.profile.columns.editability[i].bool
			# 				column =
			# 					data: instance.profile.columns.columnsdb[i]
			# 					readOnly: true
			# 			else
			# 				if editor is "text" or editor is "number"
			# 					column =
			# 						type: "text"
			# 						data: instance.profile.columns.columnsdb[i]
			# 				else if editor is "select2"
			# 					do (i) ->
			# 						j = i
			# 						column =
			# 							type: "autocomplete"
			# 							data: instance.profile.columns.columnsdb[j]
			# 							source: (query, process) ->
			# 								o =
			# 									command: "get"
			# 									object: instance.profile.columns.references[j]
			# 									sid: MB.User.sid
			# 									columns: instance.profile.columns.refcolumns[j]
			# 								$.ajax
			# 									url: "/cgi-bin/b2cJ/"
			# 									dataType: "json"
			# 									data:
			# 										p_xml: MB.Core.makeQuery o
			# 									success: (response) ->
			# 										instance.data.dropdownsData[instance.profile.columns.columnsdb[j]] = response
			# 										list = []
			# 										for value, i in response.DATA
			# 											list.push value[1]
			# 										process list
			# 										return
			# 							strict: true
			# 				else if editor is "select2withEmptyValue"
			# 					do (i) ->
			# 						j = i
			# 						column =
			# 							type: "autocomplete"
			# 							data: instance.profile.columns.columnsdb[j]
			# 							source: (query, process) ->
			# 								o =
			# 									command: "get"
			# 									object: instance.profile.columns.references[j]
			# 									sid: MB.User.sid
			# 									columns: instance.profile.columns.refcolumns[j]
			# 								$.ajax
			# 									url: "/cgi-bin/b2cJ/"
			# 									dataType: "json"
			# 									data:
			# 										p_xml: MB.Core.makeQuery o
			# 									success: (response) ->
			# 										instance.data.dropdownsData[instance.profile.columns.columnsdb[j]] = response
			# 										if not (instance.data.dropdownsData[instance.profile.columns.columnsdb[j]].DATA[0][0] is "" and instance.data.dropdownsData[instance.profile.columns.columnsdb[j]].DATA[0][0] is "")
			# 											instance.data.dropdownsData[instance.profile.columns.columnsdb[j]].DATA.unshift ["", ""]
			# 										list = []
			# 										for value, i in response.DATA
			# 											list.push value[1]
			# 										process list
			# 										return
			# 							strict: true
			# 				else if editor is "checkbox"
			# 					column =
			# 						data: instance.profile.columns.columnsdb[i]
			# 						type: "checkbox"
			# 						checkedTemplate: "TRUE"
			# 						uncheckedTemplate: "FALSE"
			# 				else if editor is "datetime"
			# 					column =
			# 						data: instance.profile.columns.columnsdb[i]
			# 						type: "date"
			# 						dateFormat: "mm/dd/yy"
			# 				else if editor is "password"
			# 					column =
			# 						data: instance.profile.columns.columnsdb[i]
			# 						type: "password"
			# 						hashSymbol: "&#9632;"
			# 		else
			# 			if editor is "checkbox"
			# 				column =
			# 					type: "checkbox"
			# 					checkedTemplate: "TRUE"
			# 					uncheckedTemplate: "FALSE"
			# 					data: instance.profile.columns.columnsdb[i]
			# 					readOnly: true
			# 			else
			# 				column =
			# 					data: instance.profile.columns.columnsdb[i]
			# 					readOnly: true
			# 		columns.push column
			# columns