
MB = undefined
libModalType  = undefined
reportClass  = undefined
reportLib = undefined

MB = window.MB
reportLib = MB.reportLib
libModalType = {}
libModalType =
	actions: ->
		html = undefined
		html = ""
		MB.Core.sendQuery
			command: "get"
			object: "ACTION_REPORT_LOV"
			sid: MB.User.sid
			, (resultAction) ->
				key = undefined
				objAction = undefined
				val = undefined
				objAction = MB.Core.jsonToObj(resultAction)
				html = "<div class='row reportStyle'><div class='col-md-12'>"
				html += "<label> Мероприятие </label><br>"
				html += "<select name='action_id' class='select2Report'>"
				for key of objAction
					val = objAction[key]
					html += "<option value=\"" + objAction[key]["ACTION_ID"] + "\">" + objAction[key]["ACTION_NAME"] + "</option>"
				html += "</select>"
				html += "</div></div>"
				$("#params").append html
				$('select.select2Report').select2();
				return
	actions2: ->
		html = undefined
		html = ""
		MB.Core.sendQuery
			command: "get"
			object: "action_report2_lov"
			sid: MB.User.sid
			, (resultAction) ->
				key = undefined
				objAction = undefined
				val = undefined
				objAction = MB.Core.jsonToObj(resultAction)
				html = "<div class='row reportStyle'><div class='col-md-12'>"
				html += "<label> Мероприятие </label><br>"
				html += "<select name='action_id' class='select2Report'>"
				for key of objAction
					val = objAction[key]
					html += "<option value=\"" + objAction[key]["ACTION_ID"] + "\">" + objAction[key]["ACTION_NAME"] + "</option>"
				html += "</select>"
				html += "</div></div>"
				$("#params").append html
				$('select.select2Report').select2();
				return
	users: ->
		MB.Core.sendQuery
			command: "get"
			object: "user_active"
			sid: MB.User.sid
			, (resultUser) ->
				currentUser = undefined
				html = undefined
				key = undefined
				objUser = undefined
				val = undefined
				objUser = MB.Core.jsonToObj(resultUser)
				currentUser = resultUser["CURRENT_USER_ID"]
				html = "<div class='row reportStyle'><div class='col-md-12'>"
				html += "<label> Пользователь </label><br>"
				html += "<select name='user_id' class='select2Report'>"
				for key of objUser
					val = objUser[key]
					if currentUser is objUser[key]["USER_ID"]
						html += "<option value=\"" + objUser[key]["USER_ID"] + "\" selected>" + objUser[key]["FULLNAME"] + "</option>"
					else
						html += "<option value=\"" + objUser[key]["USER_ID"] + "\">" + objUser[key]["FULLNAME"] + "</option>"
				html += "</select>"
				html += "</div></div>"
				$("#params").append html
				$('select.select2Report').select2();
				return
	users2: ->
		MB.Core.sendQuery
			command: "get"
			object: "user_for_reports_lov"
			sid: MB.User.sid
			, (resultUser) ->
				currentUser = undefined
				html = undefined
				key = undefined
				objUser = undefined
				val = undefined
				objUser = MB.Core.jsonToObj(resultUser)
				currentUser = resultUser["CURRENT_USER_ID"]
				html = "<div class='row reportStyle'><div class='col-md-12'>"
				html += "<label> Пользователь </label><br>"
				html += "<select name='user_id' class='select2Report'>"
				for key of objUser
					val = objUser[key]
					if currentUser is objUser[key]["USER_ID"]
						html += "<option value=\"" + objUser[key]["USER_ID"] + "\" selected>" + objUser[key]["FULLNAME"] + "</option>"
					else
						html += "<option value=\"" + objUser[key]["USER_ID"] + "\">" + objUser[key]["FULLNAME"] + "</option>"
				html += "</select>"
				html += "</div></div>"
				$("#params").append html
				$('select.select2Report').select2();
				return
	cash_desk2: ->
		MB.Core.sendQuery
			command: "get"
			object: "cash_desk_for_reports_lov"
			sid: MB.User.sid
			, (resultUser) ->
				currentUser = undefined
				html = undefined
				key = undefined
				objUser = undefined
				val = undefined
				objUser = MB.Core.jsonToObj(resultUser)
				currentUser = resultUser["CASH_DESK_ID"]
				html = "<div class='row reportStyle'><div class='col-md-12'>"
				html += "<label> Касса </label><br>"
				html += "<select name='cash_desk_id' class='select2Report'>"
				for key of objUser
					val = objUser[key]
					if currentUser is objUser[key]["CASH_DESK_ID"]
						html += "<option value=\"" + objUser[key]["CASH_DESK_ID"] + "\" selected>" + objUser[key]["CASH_DESK_NAME"] + "</option>"
					else
						html += "<option value=\"" + objUser[key]["CASH_DESK_ID"] + "\">" + objUser[key]["CASH_DESK_NAME"] + "</option>"
				html += "</select>"
				html += "</div></div>"
				$("#params").append html
				$('select.select2Report').select2();
				return
	cash_desk: ->
		MB.Core.sendQuery
			command: "get"
			object: "cash_desk"
			sid: MB.User.sid
			, (resultUser) ->
				currentUser = undefined
				html = undefined
				key = undefined
				objUser = undefined
				val = undefined
				objUser = MB.Core.jsonToObj(resultUser)
				currentUser = resultUser["CASH_DESK_ID"]
				html = "<div class='row reportStyle'><div class='col-md-12'>"
				html += "<label> Касса </label><br>"
				html += "<select name='cash_desk_id' class='select2Report'>"
				for key of objUser
					val = objUser[key]
					if currentUser is objUser[key]["CASH_DESK_ID"]
						html += "<option value=\"" + objUser[key]["CASH_DESK_ID"] + "\" selected>" + objUser[key]["CASH_DESK_NAME"] + "</option>"
					else
						html += "<option value=\"" + objUser[key]["CASH_DESK_ID"] + "\">" + objUser[key]["CASH_DESK_NAME"] + "</option>"
				html += "</select>"
				html += "</div></div>"
				$("#params").append html
				$('select.select2Report').select2();
				return
	ticket_operation: ->
		MB.Core.sendQuery
			command: "get"
			object: "ticket_operation"
			sid: MB.User.sid
			, (resultAction) ->
				key = undefined
				objAction = undefined
				val = undefined
				objAction = MB.Core.jsonToObj(resultAction)
				html = "<div class='row reportStyle'><div class='col-md-12'>"
				html += "<label> Тип операции </label><br>"
				html += "<select name='ticket_operation_id' class='select2Report'>"
				for key of objAction
					val = objAction[key]
					html += "<option value=\"" + objAction[key]["DB_VALUES"] + "\">" + objAction[key]["CLIENT_VALUES"] + "</option>"
				html += "</select>"
				html += "</div></div>"
				$("#params").append html
				$('select.select2Report').select2();
				return

	dates: ->
		html = undefined
		html = "<div class=\"date_block row reportStyle\"> <div class=\"col-md-6\"> <label for=\"from_date\"><h5>Дата с:</h5></label> <input type=\"text\" id=\"from_date\" name=\"from_date\" class=\"date_inp form-control\" size=\"10\"/> </div> <div class=\"col-md-6\"> <label for=\"to_date\"><h5>Дата по:</h5></label> <input type=\"text\" id=\"to_date\" name=\"to_date\" class=\"date_inp form-control\" size=\"10\"/> </div> </div>"
		$("#params").append html
		$(".date_inp").datepicker format: "dd.mm.yyyy"
		MB.Core.sendQuery
			command: "get"
			object: "sysdate"
			sid: MB.User.sid
			, (res) ->
				$("#from_date,#to_date").val res.SYSDATE
				return

	date: ->
		html = undefined
		html = "<div class=\"date_block row reportStyle\"> <div class=\"col-md-12\"> <label for=\"date\"><h5>Дата:</h5></label> <input type=\"text\" id=\"date\" name=\"date\" class=\"date_inp form-control\" size=\"10\"/> </div> </div> </div>"
		$("#params").append html
		$(".date_inp").datepicker format: "dd.mm.yyyy"
		MB.Core.sendQuery
			command: "get"
			object: "sysdate"
			sid: MB.User.sid
			, (res) ->
				$("#date").val res.SYSDATE
				return
	paymentType: ->
		html = undefined
		html = "<div class=\"row reportStyle\"> <div class=\"col-md-12\"> Тип оплаты: </div> <div class=\"col-md-12\"><div class=\"row payType\"> <div class=\"col-md-4\"> <input id=\"payTypeCASH\" type=\"radio\" name=\"payment_type\" value=\"CASH\" checked> <label for=\"payTypeCASH\">Наличными:</label> </div> <div class=\"col-md-4\"> <input id=\"payTypeCARD\" type=\"radio\" name=\"payment_type\" value=\"CARD\"> <label for=\"payTypeCARD\">Картой:</label> </div> <div class=\"clearfix\"></div> </div></div></div> "
		$("#params").append html

	order: ->
		MB.Core.sendQuery
			command: "get"
			object: "order"
			sid: MB.User.sid
			, (resultAction) ->
				html = undefined
				key = undefined
				objAction = undefined
				val = undefined
				objAction = MB.Core.jsonToObj(resultAction)
				html = "<div class='reportStyle'>"
				html += "<label> Заказ </label><br>"
				html += "<select name='order_id'>"
				for key of objAction
					val = objAction[key]
					html += "<option value=\"" + objAction[key]["ORDER_ID"] + "\">" + objAction[key]["ORDER_ID"] + "</option>"
				html += "</select>"
				html += "</div>"
				$("#params").append html
				$('select.select2Report').select2();
				return


	order_agent: ->
		MB.Core.sendQuery
			command: "get"
			object: "order_agent"
			sid: MB.User.sid
			, (resultAction) ->
				html = undefined
				key = undefined
				objAction = undefined
				val = undefined
				objAction = MB.Core.jsonToObj(resultAction)
				html = "<div class='reportStyle'>"
				html += "<label> Заказ </label><br>"
				html += "<select name='order_id' class='select2Report'>"
				for key of objAction
					val = objAction[key]
					html += "<option value=\"" + objAction[key]["ORDER_ID"] + "\">" + objAction[key]["ORDER_ID"] + "</option>"
				html += "</select>"
				html += "</div>"
				$("#params").append html
				$('select.select2Report').select2()
				return
	sale_frame: ->
		MB.Core.sendQuery
			command: "get"
			object: "sale_frame_report_lov"
			sid: MB.User.sid
			, (resultAction) ->
				html = undefined
				key = undefined
				objAction = undefined
				val = undefined
				objAction = MB.Core.jsonToObj(resultAction)
				html = "<div class='reportStyle'>"
				html += "<label> Площадки продаж </label><br>"
				html += "<select name='sale_frame_id' class='select2Report'>"
				for key of objAction
					val = objAction[key]
					html += "<option value=\"" + objAction[key]["SALE_FRAME_ID"] + "\">" + objAction[key]["AGENT_NAME"] + "</option>"
				html += "</select>"
				html += "</div>"
				$("#params").append html
				#$('select.select2Report').select2()
				return

reportClass = (obj) ->
	if obj.objectname isnt undefined
		@objectname = obj.objectname
		@obj = @objectname
		#.substr(@objectname.indexOf("_") + 1)
		@objName = @obj
		#.replace("-", "_")
		@objName = @objType  if @objName is undefined
	else
		console.log "Не передаете objectname!"
	if obj.world isnt undefined
		@world = obj.world
	else
		console.log "Не передаете world!"
	if obj.pageswrap isnt undefined
		@pageswrap = obj.pageswrap
		console.log @pageswrap
	else
		console.log "Не передаете pageswrap!"
	@html = {}
	return

reportClass::init = ->
	_this = undefined
	_this = this
	MB.Core.sendQuery
		command: "get"
		object: _this.objName
		#"report_parameters"
		sid: MB.User.sid
		params:
			parameters: 'TRUE'
			#report: _this.objName
		, (resultAction) ->
				reportDB = undefined
				reportDB = MB.Core.jsonToObj(resultAction)[0]
				_this.reportObj =
					Name: reportDB["REPORT_NAME"]
					object: reportDB["REPORT_COMMAND"]
					Modal: reportDB["REPORT_PARAMETERS"].split(",")

				$(".iFrameForPrint").remove()  if $(".iFrameForPrint").length > 0
				_this.Modal()
				return

reportClass::Modal = ->
	html = undefined
	i = undefined
	mes = undefined
	modalObj = undefined
	report = undefined
	val = undefined
	_i = undefined
	_len = undefined
	_ref = undefined
	_this = undefined
	_this = this
	report = _this.reportObj
	html = "<div id=\"params\"><div id=\"reportModalLoader\"></div></div>"
	modalObj =
		selector: "#portlet-config"
		title: "<h4>" + _this.reportObj.Name + "</h4>"
		content: html
		buttons:
			ok1:
				label: "Сформировать"
				color: "blue"
				dopAttr: ""
				callback: ->
					arr = undefined
					paramsEl = undefined
					arr = []
					paramsEl = $("#portlet-config").find("#params")
					paramsEl.find("input,select").each ->
						key = undefined
						val = undefined
						key = $(this).attr("name")
						if $(this).hasClass('select2-focusser') or $(this).hasClass('select2-input')
						else
							if key is 'payment_type'
								val = $("[name='payment_type']:checked").val()
							else
								val = $(this).val()
							arr[key] = val
					_this.goToPrint arr
			excel:
				label:"Экспорт в Excel"
				color:"blue"
				dopAttr: ""
				callback: ->
					arr = []
					paramsEl = $("#portlet-config").find("#params")
					paramsEl.find("input,select").each ->
						key = $(this).attr("name")
						if key
							if key is 'payment_type'
								val = $("[name='payment_type']:checked").val()
							else
								val = $(this).val()
							console.log 666666666, this, key, val
							arr[key] = val
					_this.exportToExcel arr
			cancel:
				label: "Закрыть"
				color: "default"
				dopAttr: "data-dismiss=\"modal\""
				callback: ->
					$(".iFrameForPrint").remove()  if $(".iFrameForPrint").length > 0
					return

	runModal = (callback) ->
		MB.Core.ModalMiniContent modalObj
		if typeof callback is 'function'
			do callback

	runModal ->
		if report.Modal.length > 0 and report.Modal[0] isnt ""
			mes = ""
			_ref = report.Modal
			i = _i = 0
			_len = _ref.length

			while _i < _len
				val = _ref[i]
				libModalType[val]()  if libModalType[val]?
				i = ++_i
		else
			mes = "Отчет не требует дополнительный параметров."
		$("#params #reportModalLoader").remove()
		$("#params").append mes


	return
reportClass::exportToExcel = (arr) ->
	_this = this
	name = _this.reportObj.object
	width = MB.Core.getClientWidth()
	height = MB.Core.getClientHeight() + 50
	get = "?sid=" + MB.User.sid
	# params = {}
	console.log 7777777777777, arr
	for key of arr
		val = arr[key]
		get += "&" + key + "=" + arr[key]
	get += "&object=" + _this.reportObj.object

	console.log name
	gg = "?sid=InebXxWRQjkcmdsVSidhPADtslwkQAlMacVXQLAbcxEVEUXzRd&action_id=394&object=sale_of_tickets_for_action2"
	if name is "casher_report" or name is "return_note" or name is "delivery_note" or name is "k17" or name is "casher_journal_of_operations" or name is "register_transfer_of_roots" or name is "sale_of_tickets_for_action"

		iFrame = "<iframe class=\"iFrameForPrint\" src=\"" + "html/report/report_" + _this.objName + "/print_" + _this.objName + ".html" + get + "\" width=\"0\" height=\"0\" align=\"left\"></iframe>"
		MB.Core.sendQuery
			command:"get"
			object:_this.objName
			sid: MB.User.sid
			xls: true
			params:
				asd:"asd"
		,(res)->
			window.open "data:application/vnd.ms-excel," + "﻿" + encodeURIComponent(res["DATA"]), "_self"
	else
		iFrame = "<iframe class=\"iFrameForPrint\" src=\"" + "html/report/print_report.html" + get + "\" width=\"0\" height=\"0\" align=\"left\"></iframe>"
		console.log 9999999999, get, _this.objName, name, arr
		params = {}
		for key, value of arr
			console.log key, value
			params[key] = value
		params.xls = true
		console.log 'params', params
		MB.Core.sendQuery
				command:"get"
				object:_this.objName
				sid: MB.User.sid
				xls: true
				params: params
					# asd:"asd"
					# user_id: arr['user_id']
			,(res)->
				console.log 8888888888, res
				window.open "data:application/vnd.ms-excel," + "﻿" + encodeURIComponent(res["DATA"]), "_self"

	return
reportClass::goToPrint = (arr) ->
	get = undefined
	height = undefined
	key = undefined
	name = undefined
	params = undefined
	report_page = undefined
	val = undefined
	width = undefined
	_this = undefined
	iFrame = undefined
	_this = this
	name = _this.reportObj.object
	width = MB.Core.getClientWidth()
	height = MB.Core.getClientHeight() + 50
	get = "?sid=" + MB.User.sid
	params = {}
	for key of arr
		val = arr[key]
		get += "&" + key + "=" + arr[key]
	get += "&subcommand=" + _this.reportObj.object

	console.log name

	if name is "casher_report" or name is "return_note" or name is "delivery_note" or name is "k17" or name is "casher_journal_of_operations" or name is "register_transfer_of_roots" or name is "sale_of_tickets_for_action"

		iFrame = "<iframe class=\"iFrameForPrint\" src=\"" + "html/report/report_" + _this.objName + "/print_" + _this.objName + ".html" + get + "\" width=\"0\" height=\"0\" align=\"left\"></iframe>"
	else
		iFrame = "<iframe class=\"iFrameForPrint\" src=\"" + "html/report/print_report.html" + get + "\" width=\"0\" height=\"0\" align=\"left\"></iframe>"
	$("body").append iFrame
	return


MB.reportClass = reportClass
return