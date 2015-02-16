window.log = (s) ->
	log = console.log
	log.call console, s
$.cookie "language", "Rus",
	expires: 7

if $.fn.datetimepicker
	$.fn.datetimepicker.defaults =
		maskInput: true
		pickDate: true
		pickTime: true
		pick12HourFormat: false
		pickSeconds: true
		startDate: "2014-01-01"
		endDate: Infinity

$('.username').html($.cookie('userfullname'));

$('#changePack').on "click", ->
	printQuery({command: "CHANGE_PACK"})

$('#changeCashBox').on "click", ->
	MB.Core.setCashBox()

$(".clear-all-sessions").on "click", ->
	obj = command: "clear_all_sessions"
	MB.Core.sendQuery obj, (response) ->


clearLSProfiles = ()->
	profiles = []
	for ls of localStorage
		if ls.indexOf('formN_') > -1 or ls.indexOf('tableN_') > -1
			profiles.push(ls)

	for prs in profiles
		localStorage.removeItem(prs)

clearLSProfiles()


#$('#clientScreen_showAfisha').on "click", ->
#	fromDate = $('#clientScreenWidget-content input[name="start"]').val()
#	toDate = $('#clientScreenWidget-content input[name="end"]').val()
#	initAfisha = ->
#		toClientscreen
#	        type: 'list',
#	        fromDate:fromDate,
#	        toDate: toDate
#
#
#		MB.Core.cSreenWindow.window.onbeforeunload = ->
#	    	MB.Core.cSreenWindow = undefined
#	    return
#
#	if MB.Core.cSreenWindow is undefined
#		MB.Core.cSreenWindow = window.open MB.Core.doc_root+"clientscreenview"
#		MB.Core.cSreenWindow.window.onload = ->
#			window.setTimeout (->
#				initAfisha()
#				return
#			), 300
#			return
#	else
#		initAfisha()

$('#clientScreen_showAfisha').on "click", ->
	fromDate = $('#clientScreenWidget-content input[name="start"]').val()
	toDate = $('#clientScreenWidget-content input[name="end"]').val()
	toClientscreen
		type: 'list',
		fromDate:fromDate,
		toDate: toDate

$('#clientScreen_closeOrder').on 'click', ->
	toClientscreen
    	type: 'closeOrder'

	MB.Core.cSreenWindow.window.onbeforeunload = ->
    	MB.Core.cSreenWindow = undefined

$("#open_action_14").on "click", ->
	log "clicked"
	MB.Core.switchModal
		type: "content"
		filename: "one_action"
		id: MB.Core.guid()
		params:
			action_id: 14


$("#open_fundZones_30").on "click", ->
	MB.Core.switchModal
		type: "content"
		filename: "fundZones"
		id: MB.Core.guid()
		params:
			hall_scheme_id: 30


$("#open_priceZones_30").on "click", ->
	o =
		name: "priceZones"
		hall_scheme_id: 30


# MBOOKER.Fn.switchPage("content", o);
$(".synchronize").on "click", ->
	o =
		command: "operation"
		object: "synchronize"
		sid: $.cookie("sid")

	MB.Core.sendQuery o, (a) ->


(($, global, undefined_) ->
	MB = MB or {}
	MB.keys = {}

	$(document).off "keydown"
	$(document).on "keydown", (e)->
		doPrevent = false
		if e.keyCode is 8
			d = e.srcElement || e.target
			if (d.tagName.toUpperCase() is "INPUT" and (d.type.toUpperCase() is "NUMBER" or d.type.toUpperCase() is "TEXT" or d.type.toUpperCase() is "PASSWORD" or d.type.toUpperCase() is "FILE" or d.type.toUpperCase() is "EMAIL" or d.type.toUpperCase() is "SEARCH" or d.type.toUpperCase() is "DATE")) or d.tagName.toUpperCase() is "TEXTAREA"
				doPrevent = d.readOnly || d.disabled
			else
				doPrevent = true
		if doPrevent
			e.preventDefault()

		MB.keys[e.which] = true


	$(document).on "keyup", (e)->
		delete MB.keys[e.which]

	$(document).on "click", (e)->
		if $(e.target).parents('.ctxMenu-wrapper').length is 0
			$(document).find('.ctxMenu-wrapper').remove()

	# Resetting
	String::bool = ->
		(/^(true|TRUE|True)$/i).test this

	toastr = toastr or null
	if toastr
		toastr.options =
			closeButton: true
			debug: false
			positionClass: "toast-bottom-right"
			onclick: null
			showDuration: "1000"
			hideDuration: "1000"
			timeOut: "10000"
			extendedTimeOut: "1000"
			showEasing: "swing"
			hideEasing: "linear"
			showMethod: "fadeIn"
			hideMethod: "fadeOut"
	
	# User data
	MB.User = {}
	MB.User.sid = $.cookie("sid")

	MB.O = {}
	MB.O.tables = {}
	MB.O.contents = {}
	MB.O.forms = {}
	
	# Core functions
	MB.Core = {}
	MB.Core.getUserGuid = ->
		pGuid = MB.Core.guid()
		if !localStorage.getItem 'printerGuid'
			localStorage.setItem 'printerGuid', pGuid
		else
			pGuid = localStorage.getItem 'printerGuid'
		pGuid
	MB.Core.parseFormat = (resold) ->
		resnew = {}
		if resold.hasOwnProperty("results")
			if resold.results[0].hasOwnProperty("data")
				_ref = resold.results[0]
				for key of _ref
					value = _ref[key]
					switch key
						when "data"
							resnew.DATA = value
						when "data_columns"
							resnew.NAMES = value
						when "data_info"
							resnew.INFO =
								ROWS_COUNT: value.rows_count
								VIEW_NAME: value.view_name
						when "extra_data"
							for key2 of value
								value2 = value[key2]
								switch key2
									when "object_profile"
										resnew.OBJECT_PROFILE = {}
										for key3 of value2
											value3 = value2[key3]
											key4 = key3.toUpperCase()
											switch key3
												when "prepare_insert"
													resnew.OBJECT_PROFILE[key4] =
														DATA: value3.data
														NAMES: value3.data_columns
												else
													resnew.OBJECT_PROFILE[key4] = value3
									else
										key5 = key2.toUpperCase()
										resnew[key5] = value2
			else
				_ref1 = resold.results[0]
				for key of _ref1
					value = _ref1[key]
					key2 = key.toUpperCase()
					switch key
						when "toastr"
							resnew.TOAST_TYPE = value.type
							resnew.MESSAGE = value.message
							resnew.TITLE = value.title
						when "code"
							resnew.RC = value
						else
							resnew[key2] = value
		resnew

	# MB.Core.jsonToObj = (obj) ->
	# 	obj_true = {}
	# 	objIndex = {}
	# 	for i of obj["DATA"]
	# 		for index of obj["NAMES"]
	# 			obj_true[i] = {}  if obj_true[i] is `undefined`
	# 			obj_true[i][obj["NAMES"][index]] = obj["DATA"][i][index]
	# 	obj_true

	MB.Core.randomnumber = ->
		Math.floor(Math.random() * (1000000 - 0 + 1)) + 0

	MB.Core.guid = ->
		"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxxx".replace(/[xy]/g, (c) ->
			r = Math.random() * 16 | 0
			v = (if c is "x" then r else (r & 0x3 | 0x8))
			v.toString 16
		).toUpperCase()

	MB.Core.sendQuery = (options, callback) ->

		if options? and typeof options is "object" and options.command?
			options.sid ?= MB.User.sid
			if location.hash is "#show_log"
				options.hash = location.hash

		socketQuery options, (result) ->
        res = JSON.parse result
        ress = {}
        if res.results?
          if res.results[0].data?
            for key, value of res.results[0]
              switch key
                when "data" then ress.DATA = value
                when "data_columns" then ress.NAMES = value
                when "data_info" then ress.INFO =
                  ROWS_COUNT: value.rows_count
                  VIEW_NAME: value.view_name
                when "extra_data"
                  for key2, value2 of res.results[0][key]
                    if key2 is "object_profile"
                      ress.OBJECT_PROFILE = {}
                      for key3, value3 of value2
                        key4 = do key3.toUpperCase
                        if key3 is "prepare_insert" or key3 is "rmb_menu"
                          ress.OBJECT_PROFILE[key4] =
                            DATA: value3.data
                            NAMES: value3.data_columns
                        else ress.OBJECT_PROFILE[key4] = value3
                    else
                      key5 = do key2.toUpperCase
                      ress[key5] = value2
          else
            for key, value of res.results[0]
              key2 = do key.toUpperCase
              switch key
                when "toastr"
                  ress.TOAST_TYPE = value.type
                  ress.MESSAGE = value.message
                  ress.TITLE = value.title
                when "code" then ress.RC = value
                else ress[key2] = value
        console.log ress
        if ress.RC?
          if parseInt(ress.RC) is 0
            if ress.TICKET_PACK_USER_INFO
              JSONstring = ress.TICKET_PACK_USER_INFO
              userInfo = new userInfoClass(JSONstring: JSONstring).userInfo_Refresh()
            callback ress if typeof callback is "function"
          else if parseInt(ress.RC) is -2
            (if toastr then toastr[ress.TOAST_TYPE](ress.MESSAGE) else console.warn("Ваша сессия не актульна, зайдите на сайт пожалуйста заново, MB.Core.sendQuery"))
            setTimeout (->
              $.removeCookie "sid"
              document.location.href = "login.html"
            ), 3000
          else
            callback ress if typeof callback is "function"
        else
          callback ress if typeof callback is "function"



	MB.Core.makeQuery = (options, callback) ->
		opt = MB.Core.cloneObj(options)
		xml = "<query>"
		if opt and typeof opt is "object" and opt.object and opt.command
			if opt.hasOwnProperty("params")
				for key of opt.params
					xml += "<" + key + ">" + opt.params[key] + "</" + key + ">"
				delete opt.params
			for key of opt
				xml += "<" + key + ">" + opt[key] + "</" + key + ">"
			xml += "</query>"
		xml

	MB.Core.getClientWidth = ->
		(if window.innerWidth then window.innerWidth else ((if document.documentElement.clientWidth then document.documentElement.clientWidth else document.body.offsetWidth)))

	MB.Core.getClientHeight = ->
		(if window.innerHeight then window.innerHeight else ((if document.documentElement.clientHeight then document.documentElement.clientHeight else document.body.offsetHeight)))

	MB.User.activepage = "content_index"
	MB.User.loadedpages = [ "content_index" ]
	MB.Core.$pageswrap = $(".page-content-wrapper")
	MB.Core.switchPage = (options) ->
		if options.type
			if options.type is "table" and options.name
				if options.isNewTable
					table = new MB.TableN(
						name: options.name
						id: MB.Core.guid()
						externalWhere: options.externalWhere
					)
					table.create MB.Core.$pageswrap, ->
						console.log('new table rendered')
						
						return
				else
					if MB.Table.hasloaded(options.name)
						if options.where isnt ""
							MB.O.tables[options.name].constructorWhere = options.where
						MB.O.tables[options.name].reload "data"
						MB.Table.show "page", options.name
					else
						table = new MB.Table(
							world: "page"
							name: options.name
							where: options.where or ""
						)
						table.create ->
							table.showit()

			else if options.type is "content" and options.filename
				if MB.Content.hasloaded(options.filename)
					MB.Content.find(options.filename).showit()
				else
					content = new MB.Content(
						world: "page"
						filename: options.filename
					)
					content.create ->
						content.showit()
						content.init()

			else if options.type is "modalmini" and options.name
				if options.isNew
					MB.Core.mini_form.init(options);
				else
					modalmini = new MB.modalmini(
						objectname: options.name
						world: "page"
						pageswrap: MB.Core.$pageswrap
					)
					modalmini.init()
			else if options.type is "report" and options.name
				report = new MB.Core.Report
					name:options.name
				report.init()

	MB.Core.cloneObj = (obj) ->
		return obj  if not obj? or typeof (obj) isnt "object"
		temp = {}
		for key of obj
			temp[key] = MB.Core.cloneObj(obj[key])
		temp

	MB.Core.ModalMiniContent = (obj) ->
		ModalDiv = $(obj.selector)
		ModalHeader = ModalDiv.find(".modal-header")
		ModalBody = ModalDiv.find(".modal-body")
		ModalHeader.html obj.title
		ModalBody.html obj.content
		$(".modal-footer").html ""
		for key of obj["buttons"]
			((key) ->
				val = obj["buttons"][key]
				html = ""
				html += "<button type=\"button\" class=\"btn " + val["color"] + " btn_" + key + "\" " + val["dopAttr"] + ">" + val["label"] + "</button>"
				$(".modal-footer").append html
				$(".btn_" + key).click ->
					val.callback()

			) key
		ModalDiv.find(".modal-dialog").addClass obj.modalType  unless obj.modalType is `undefined`
		ModalDiv.find(".modal-dialog").css "width", obj.modalWidth  unless obj.modalWidth is `undefined`
		ModalDiv.find(".modal-dialog").css obj.css  unless obj.css is `undefined`
		ModalDiv.modal "show"

	

	MB.Modal = {}
	MB.Modal.activemodal = null
	MB.Modal.modalsqueue = []
	MB.Modal.loadedmodals = []
	MB.Modal.countmodals = 0
	MB.Modal.opened = false
	MB.Modal.$wrapper = $(".modal-content-wrapper")
	MB.Modal.$container = $(".bt-menu")
	MB.Modal.$modalslist = $(".modals-list")
	MB.Modal.itemsinit = ->
		MB.Modal.$modalslist.on "click", "li", (e) ->
			$target = $(e.target)
			object = $(this).data("object")
			type = $(this).data("type")
			iscross = $target.hasClass("cross")
			if iscross
				if MB.O.forms.hasOwnProperty MB.Modal.activemodal
				# console.log  MB.O.forms[MB.Modal.activemodal].parentobject
				# if MB.O.forms[MB.Modal.activemodal].parentobject
					if MB.O.forms[MB.Modal.activemodal].parentobject?
						MB.O.tables[MB.O.forms[MB.Modal.activemodal].parentobject].reload "data"
				if MB.Modal.countmodals is 1
					if type is "content"
						content = MB.Content.find(object)
						content.onClose()  if content.onClose?
					MB.Modal.closefull()
					MB.Modal.$modalslist.off "click"
				else if MB.Modal.countmodals > 1
					if MB.Modal.activemodal isnt object
						if type is "content"
							content = MB.Content.find(object)
							content.onClose()  if content.onClose?
						MB.Modal.loadedmodals.splice MB.Modal.loadedmodals.indexOf(object), 1
						MB.Modal.modalsqueue.splice MB.Modal.modalsqueue.indexOf(object), 1
						MB.Modal.lastmodal = "closed"  if MB.Modal.lastmodal is object
						MB.Modal.countmodals--
						delete MB.O[type + "s"][object]

						MB.Modal.remove object
					else if MB.Modal.activemodal is object
						if MB.Modal.modalsqueue.indexOf(object) is (MB.Modal.countmodals - 1) # if last
							MB.Modal.hide MB.Modal.activemodal
							MB.Modal.activemodal = MB.Modal.modalsqueue[(MB.Modal.modalsqueue.indexOf(object) - 1)]
							MB.Modal.show MB.Modal.activemodal
							MB.Modal.activateitem MB.Modal.activemodal
							
							# MB.Modal.getTypeOf(MB.Modal.activemodal)
							newObj = MB.Content.find(MB.Modal.activemodal)
							newObj.onFocus()  if newObj.onFocus?  if newObj.type is "content"
							if type is "content"
								content = MB.Content.find(object)
								content.onClose()  if content.onClose?
							MB.Modal.loadedmodals.splice MB.Modal.loadedmodals.indexOf(object), 1
							MB.Modal.modalsqueue.splice MB.Modal.modalsqueue.indexOf(object), 1
							MB.Modal.countmodals--
							delete MB.O[type + "s"][object]

							MB.Modal.remove object
						else
							MB.Modal.hide MB.Modal.activemodal
							MB.Modal.activemodal = MB.Modal.modalsqueue[(MB.Modal.modalsqueue.indexOf(object) + 1)]
							MB.Modal.show MB.Modal.activemodal
							MB.Modal.activateitem MB.Modal.activemodal
							newObj = MB.Content.find(MB.Modal.activemodal)
							newObj.onFocus()  if newObj.onFocus?  if newObj.type is "content"
							if type is "content"
								content = MB.Content.find(object)
								content.onClose()  if content.onClose?
							MB.Modal.loadedmodals.splice MB.Modal.loadedmodals.indexOf(object), 1
							MB.Modal.modalsqueue.splice MB.Modal.modalsqueue.indexOf(object), 1
							MB.Modal.countmodals--
							delete MB.O[type + "s"][object]

							MB.Modal.remove object
			

			else
				if type is "content"
					content = MB.Content.find(object)
					
					# console.log(content);
					if content.onFocus?
						unless MB.Modal.activemodal is object
							MB.Modal.hide MB.Modal.activemodal
							MB.Modal.activemodal = object
							MB.Modal.show object
							MB.Modal.activateitem object
							content.onFocus()
					else
						MB.Modal.hide MB.Modal.activemodal
						MB.Modal.activemodal = object
						MB.Modal.show object
						MB.Modal.activateitem object
				else
					unless MB.Modal.activemodal is object
						MB.Modal.hide MB.Modal.activemodal
						MB.Modal.activemodal = object
						MB.Modal.show object
						MB.Modal.activateitem object



	MB.Modal.closefull = ->
		if $("#modal_" + MB.Modal.activemodal + "_wrapper .edited").length > 0
			bootbox.dialog
				message: "Вы уверены что хотите выйти из формы не сохранив изменения?"
				title: "Есть не сохраннные изменения"
				buttons:
					success:
						label: "Да"
						assName: "green"
						callback: ->
							i = 0
							l = MB.Modal.modalsqueue.length

							while i < l
								for key of MB.O
									delete MB.O[key][MB.Modal.modalsqueue[i]]  if MB.O[key].hasOwnProperty(MB.Modal.modalsqueue[i])
								i++
							MB.Modal.$wrapper.empty()
							MB.Modal.$modalslist.empty()
							MB.Modal.loadedmodals = []
							MB.Modal.modalsqueue = []
							MB.Modal.activemodal = null
							MB.Modal.countmodals = 0
							classie.remove document.getElementById("bt-menu"), "bt-menu-open"
							MB.Modal.opened = false

					danger:
						label: "Нет"
						className: "red"
						callback: ->

		else
			i = 0
			l = MB.Modal.modalsqueue.length

			while i < l
				for key of MB.O
					delete MB.O[key][MB.Modal.modalsqueue[i]]  if MB.O[key].hasOwnProperty(MB.Modal.modalsqueue[i])
				i++
			MB.Modal.$wrapper.empty()
			MB.Modal.$modalslist.empty()
			MB.Modal.loadedmodals = []
			MB.Modal.modalsqueue = []
			MB.Modal.activemodal = null
			MB.Modal.countmodals = 0
			classie.remove document.getElementById("bt-menu"), "bt-menu-open"
			MB.Modal.opened = false

	

	MB.Modal.open = (callback) ->
		classie.add document.getElementById("bt-menu"), "bt-menu-open"
		MB.Modal.opened = true
		MB.Modal.itemsinit()
		setTimeout callback(), 350

	MB.Modal.remove = (name) ->
		
		# if(typeof MB.Content.find(name).callback == 'function'){
		# 	MB.Content.find(name).callback(name);
		# }
		MB.Modal.$wrapper.find("#modal_" + name + "_wrapper").remove()
		MB.Modal.$container.find(".modals-list").find("[data-object='" + name + "']").remove()

	MB.Modal.hide = (name) ->
		MB.Modal.$wrapper.find("#modal_" + name + "_wrapper").hide()

	MB.Modal.close = (name) ->
		$("#modal_" + name + "_wrapper .edited").length > 0
		MB.Modal.remove name
		MB.Modal.activemodal = MB.Modal.modalsqueue[(MB.Modal.modalsqueue.indexOf(name) - 1)]
		MB.Modal.show MB.Modal.activemodal
		MB.Modal.activateitem MB.Modal.activemodal
		MB.Modal.countmodals--

	MB.Modal.show = (name) ->
		MB.Modal.$wrapper.find("#modal_" + name + "_wrapper").show()

	MB.Modal.additem = (name, type) ->
		object = MB.O[type + "s"][name]
		html = "<li data-type='" + type + "' data-object='" + (object.id or object.name) + "'><i class='cross fa fa-times-circle'></i>" + (object.label or object.filename or object.profile.general.objectname or object.profile.general.tablename) + "</li>"
		MB.Modal.$container.find(".modals-list").append html

	MB.Modal.activateitem = (name) ->
		MB.Modal.$modalslist.find(".activateitem").removeClass ".activeitem"
		MB.Modal.$modalslist.find("[data-object='" + name + "']").addClass "activeitem"

	
	# MB.Core.switchModal
	# 		type: "form"
	# 		ids: ids
	# 		name: instance.profile.general.juniorobject
	# 		params:
	# 			parentobject: instance.name
	# onFocus: ->
	MB.Core.switchModal = (options, cb) ->
		if options.isNewModal
			form = new MB.FormN(options)
			form.create (instance) ->
				console.log('Im HERE', instance);
				if typeof cb is 'function'
					cb(instance)
		if options.type
			if options.type is "master" and options.filename
				master = new MB.Master(options)
				created = master.create (createdInstance) ->
					if typeof cb is 'function'
						cb(createdInstance)
				return created
			if options.type is "content" and options.filename
				if options.isNew
					content = new MB.ContentNew(options)
					created = content.create (createdInstance) ->
						if typeof cb is 'function'
							cb(createdInstance)
					return created
				else
					if MB.Modal.opened
						console.log "modal is opened"
						if options.params.newerGuid?
							console.log "options.params.newerGuid != null (" + options.params.newerGuid + ")"
							if MB.Modal.loadedmodals.indexOf(options.params.newerGuid) > -1
								console.log "MB.Modal.loadedmodals.indexOf(options.params.newerGuid) > -1"
								MB.Modal.hide MB.Modal.activemodal
								MB.Modal.lastmodal = MB.Modal.activemodal
								MB.Modal.activemodal = options.params.newerGuid
								MB.Modal.show options.params.newerGuid
								MB.Modal.activateitem options.params.newerGuid
							else
								console.log "not MB.Modal.loadedmodals.indexOf(options.params.newerGuid) > -1"
								content = new MB.Content(
									world: "modal"
									filename: options.filename
									id: (options.params.newerGuid)
									params: options.params
								)
								content.create ->

									# content.init();
									MB.Modal.hide MB.Modal.activemodal
									MB.Modal.activemodal = content.id
									MB.Modal.show content.id
									MB.Modal.additem content.id, options.type
									MB.Modal.activateitem content.id
									MB.Modal.loadedmodals.push content.id
									MB.Modal.modalsqueue.push content.id
									MB.Modal.countmodals++
									content.init()

						else
							console.log "options.params.newerGuid == null"
							content = new MB.Content(
								world: "modal"
								filename: options.filename
								id: (MB.Core.guid())
								params: options.params
							)
							content.create ->

								# content.init();
								MB.Modal.hide MB.Modal.activemodal
								MB.Modal.activemodal = content.id
								MB.Modal.show content.id
								MB.Modal.additem content.id, options.type
								MB.Modal.activateitem content.id
								MB.Modal.loadedmodals.push content.id
								MB.Modal.modalsqueue.push content.id
								MB.Modal.countmodals++
								content.init()



					else
						console.log "modal was closed"
						MB.Modal.open ->
							content = new MB.Content(
								world: "modal"
								filename: options.filename
								id: (MB.Core.guid())
								params: options.params
							)
							content.create ->

								# content.init();
								MB.Modal.activemodal = content.id
								MB.Modal.show content.id
								MB.Modal.additem content.id, options.type
								MB.Modal.activateitem content.id
								MB.Modal.loadedmodals.push content.id
								MB.Modal.modalsqueue.push content.id
								MB.Modal.countmodals++
								content.init()
#			if options.type is "form" and options.name
#				if MB.Modal.opened
#					if MB.Modal.countmodals is 1
#						if MB.Modal.activemodal is options.name
#							toastr.info "Это уже открыто", "Информация"
#						else
#							form = new MB.Form(options)
#
#							# MB.Modal.activemodal = options.name;
#							form.create ->
#								MB.Modal.hide MB.Modal.activemodal
#								MB.Modal.activemodal = options.name
#								MB.Modal.show options.name
#								MB.Modal.additem options.name, options.type
#								MB.Modal.activateitem options.name
#								MB.Modal.loadedmodals.push options.name
#								MB.Modal.modalsqueue.push options.name
#								MB.Modal.countmodals++
#
#					else if MB.Modal.countmodals > 1
#						if MB.Modal.activemodal is options.name
#							toastr.info "Это уже открыто", "Информация"
#						else if MB.Form.hasloaded(options.name)
#							MB.Modal.hide MB.Modal.activemodal
#							MB.Modal.activemodal = options.name
#							MB.Modal.show options.name
#							MB.Modal.activateitem options.name
#						else
#							form = new MB.Form(options)
#
#							# MB.Modal.activemodal = options.name;
#							form.create ->
#								MB.Modal.hide MB.Modal.activemodal
#								MB.Modal.activemodal = options.name
#								MB.Modal.show options.name
#								MB.Modal.additem options.name, options.type
#								MB.Modal.activateitem options.name
#								MB.Modal.loadedmodals.push options.name
#								MB.Modal.modalsqueue.push options.name
#								MB.Modal.countmodals++
#
#				else
#					MB.Modal.open ->
#						form = new MB.Form(options)
#						MB.Modal.activemodal = options.name
#						form.create ->
#							MB.Modal.activemodal = options.name
#							MB.Modal.show options.name
#							MB.Modal.additem options.name, options.type
#							MB.Modal.activateitem options.name
#							MB.Modal.loadedmodals.push options.name
#							MB.Modal.modalsqueue.push options.name
#							MB.Modal.countmodals++
#
#
#			else if options.type is "table"
#				if MB.Modal.opened
#					if MB.Modal.countmodals is 1
#						if MB.Modal.activemodal is options.name
#							toastr.info "Эта таблица сейчас открыта", "Информация"
#						else
#							table = new MB.Table(
#								world: "modal"
#								name: options.name
#								params: options.params
#							)
#							table.create ->
#								MB.Modal.hide MB.Modal.activemodal
#								MB.Modal.activemodal = options.name
#								MB.Modal.show options.name
#								MB.Modal.additem options.name, options.type
#								MB.Modal.activateitem options.name
#								MB.Modal.loadedmodals.push options.name
#								MB.Modal.modalsqueue.push options.name
#								MB.Modal.countmodals++
#
#					else if MB.Modal.countmodals > 1
#						if MB.Modal.activemodal is options.name
#							toastr.info "Эта таблица сейчас открыта", "Информация"
#						else if MB.Form.hasloaded(options.name)
#							MB.Modal.hide MB.Modal.activemodal
#							MB.Modal.lastmodal = MB.Modal.activemodal
#							MB.Modal.activemodal = options.name
#							MB.Modal.show options.name
#							MB.Modal.activateitem options.name
#						else
#							table = new MB.Table(
#								world: "modal"
#								name: options.name
#								params: options.params
#							)
#							table.create ->
#								MB.Modal.hide MB.Modal.activemodal
#								MB.Modal.activemodal = options.name
#								MB.Modal.show options.name
#								MB.Modal.additem options.name, options.type
#								MB.Modal.activateitem options.name
#								MB.Modal.loadedmodals.push options.name
#								MB.Modal.modalsqueue.push options.name
#								MB.Modal.countmodals++
#
#				else
#					MB.Modal.open ->
#						table = new MB.Table(
#							world: "modal"
#							name: options.name
#							params: options.params
#						)
#						table.create ->
#							MB.Modal.activemodal = options.name
#							MB.Modal.show options.name
#							MB.Modal.additem options.name, options.type
#							MB.Modal.activateitem options.name
#							MB.Modal.loadedmodals.push options.name
#							MB.Modal.modalsqueue.push options.name
#							MB.Modal.countmodals++
#
#
#			else if options.type is "content" and options.filename
#				if options.isNew
#					content = new MB.ContentNew(options)
#					content.create()
#				else
#					if MB.Modal.opened
#						console.log "modal is opened"
#						if options.params.newerGuid?
#							console.log "options.params.newerGuid != null (" + options.params.newerGuid + ")"
#							if MB.Modal.loadedmodals.indexOf(options.params.newerGuid) > -1
#								console.log "MB.Modal.loadedmodals.indexOf(options.params.newerGuid) > -1"
#								MB.Modal.hide MB.Modal.activemodal
#								MB.Modal.lastmodal = MB.Modal.activemodal
#								MB.Modal.activemodal = options.params.newerGuid
#								MB.Modal.show options.params.newerGuid
#								MB.Modal.activateitem options.params.newerGuid
#							else
#								console.log "not MB.Modal.loadedmodals.indexOf(options.params.newerGuid) > -1"
#								content = new MB.Content(
#									world: "modal"
#									filename: options.filename
#									id: (options.params.newerGuid)
#									params: options.params
#								)
#								content.create ->
#
#									# content.init();
#									MB.Modal.hide MB.Modal.activemodal
#									MB.Modal.activemodal = content.id
#									MB.Modal.show content.id
#									MB.Modal.additem content.id, options.type
#									MB.Modal.activateitem content.id
#									MB.Modal.loadedmodals.push content.id
#									MB.Modal.modalsqueue.push content.id
#									MB.Modal.countmodals++
#									content.init()
#
#						else
#							console.log "options.params.newerGuid == null"
#							content = new MB.Content(
#								world: "modal"
#								filename: options.filename
#								id: (MB.Core.guid())
#								params: options.params
#							)
#							content.create ->
#
#								# content.init();
#								MB.Modal.hide MB.Modal.activemodal
#								MB.Modal.activemodal = content.id
#								MB.Modal.show content.id
#								MB.Modal.additem content.id, options.type
#								MB.Modal.activateitem content.id
#								MB.Modal.loadedmodals.push content.id
#								MB.Modal.modalsqueue.push content.id
#								MB.Modal.countmodals++
#								content.init()
#
#
#
#					else
#						console.log "modal was closed"
#						MB.Modal.open ->
#							content = new MB.Content(
#								world: "modal"
#								filename: options.filename
#								id: (MB.Core.guid())
#								params: options.params
#							)
#							content.create ->
#
#								# content.init();
#								MB.Modal.activemodal = content.id
#								MB.Modal.show content.id
#								MB.Modal.additem content.id, options.type
#								MB.Modal.activateitem content.id
#								MB.Modal.loadedmodals.push content.id
#								MB.Modal.modalsqueue.push content.id
#								MB.Modal.countmodals++
#								content.init()




	MB.Core.makepagewrap = (name) ->
		"<div id='page_" + name + "_wrapper' class='page-item' style='display:none'></div>"

	MB.Core.makemodalwrap = (name) ->
		"<div id='modal_" + name + "_wrapper' class='modal-item' style='display:none'></div>"


	# window.sendQuery2 = function(obj, callback) {
 #      socket2.emit('query', obj);
 #      socket2.on("sendQuery2Response", function(data) {
 #        callback(JSON.parse(data.results.returnParam));
 #  });

	window.sendQuery2 = (req, cb) ->
		socket2.emit "query", req
		socket2.on "sendQuery2Response", (res) ->
			ress = {}
			if res.results?
				if res.results[0].data?
					for key, value of res.results[0]
						switch key
							when "data" then ress.DATA = value
							when "data_columns" then ress.NAMES = value
							when "data_info" then ress.INFO =
								ROWS_COUNT: value.rows_count
								VIEW_NAME: value.view_name
							when "extra_data"
								for key2, value2 of res.results[0][key]
									if key2 is "object_profile"
										ress.OBJECT_PROFILE = {}
										for key3, value3 of value2
											key4 = do key3.toUpperCase
											if key3 is "prepare_insert" then ress.OBJECT_PROFILE[key4] =
													DATA: value3.data
													NAMES: value3.data_columns
											else ress.OBJECT_PROFILE[key4] = value3
									else
										key5 = do key2.toUpperCase
										ress[key5] = value2
				else
					for key, value of res.results[0]
						key2 = do key.toUpperCase
						switch key
							when "toastr"
								ress.TOAST_TYPE = value.type
								ress.MESSAGE = value.message
								ress.TITLE = value.title
							when "code" then ress.RC = value
							else ress[key2] = value
			console.log ress
			cb ress





			
	# MB.Core.jsonToObj = (obj) ->
	# 	obj_true = {}
	# 	objIndex = {}
	# 	unless obj["DATA"] is `undefined`
	# 		for i of obj["DATA"]
	# 			for index of obj["NAMES"]
	# 				obj_true[i] = {}  if obj_true[i] is `undefined`
	# 				obj_true[i][obj["NAMES"][index]] = obj["DATA"][i][index]
	# 	else unless obj["data"] is `undefined`
	# 		for i of obj["data"]
	# 			for index of obj["names"]
	# 				obj_true[i] = {}  if obj_true[i] is `undefined`
	# 				obj_true[i][obj["names"][index]] = obj["data"][i][index]
	# 	obj_true




	MB.Core.jsonToObj = (obj) ->
	  i = undefined
	  index = undefined
	  objIndex = undefined
	  obj_true = undefined
	  obj_true = {}
	  objIndex = {}
	  if obj["DATA"] isnt `undefined`
	    for i of obj["DATA"]
	      for index of obj["NAMES"]
	        obj_true[i] = {}  if obj_true[i] is `undefined`
	        obj_true[i][obj["NAMES"][index]] = obj["DATA"][i][index]
	  else if obj["data"] isnt `undefined`
	    for i of obj["data"]
	      if obj["names"] isnt `undefined`
	        for index of obj["names"]
	          obj_true[i] = {}  if obj_true[i] is `undefined`
	          obj_true[i][obj["names"][index]] = obj["data"][i][index]
	      else unless obj["data_columns"] is `undefined`
	        for index of obj["data_columns"]
	          obj_true[i] = {}  if obj_true[i] is `undefined`
	          obj_true[i][obj["data_columns"][index]] = obj["data"][i][index]
	  obj_true

 # MB.Core.jsonToObj = function(obj) {
	#   var i, index, objIndex, obj_true;
	#   obj_true = {};
	#   objIndex = {};
	#   if (obj["DATA"] !== undefined) {
	# 	for (i in obj["DATA"]) {
	# 	  for (index in obj["NAMES"]) {
	# 		if (obj_true[i] === undefined) {
	# 		  obj_true[i] = {};
	# 		}
	# 		obj_true[i][obj["NAMES"][index]] = obj["DATA"][i][index];
	# 	  }
	# 	}
	#   } else if (obj["data"] !== undefined) {
	# 	for (i in obj["data"]) {
	# 		if (obj["names"]!==undefined){
	# 			for (index in obj["names"]) {
	# 				if (obj_true[i] === undefined) {
	# 					obj_true[i] = {};
	# 				}
	# 				obj_true[i][obj["names"][index]] = obj["data"][i][index];
	# 			}
	# 		}else if(obj['data_columns']!=undefined){
	# 			for (index in obj["data_columns"]) {
	# 				if (obj_true[i] === undefined) {
	# 					obj_true[i] = {};
	# 				}
	# 				obj_true[i][obj["data_columns"][index]] = obj["data"][i][index];
	# 			}
	# 		}

	# 	}
	#   }

	# 	return obj_true;
	# };





























	

	MB.Core.renderOrderPaymentType = (obj) ->
		obj = MB.Core.jsonToObj(obj)
		html = "<div class=\"form_order_mini-content-wrapper\"></div>
		        <div class=\"row\">
		          <div class=\"col-md-4 col-md-offset-8 StrOrderAmount\">
                Мест #{obj[0]["COUNT_TO_PAY_TICKETS"]}
                билетов #{obj[0]["TICKETS_COUNT"]}
                на сумму <input value=\"#{obj[0]["TOTAL_ORDER_AMOUNT"]}\" size=\"5\" disabled class=\"orderAmount\" />
                <form class=\"formOrderMini\" role=\"form\">
                  <div class=\"form-group\">
                    <div class=\"left\">
                      <div id=\"btnOrderAmount_CASH\" class=\"btn blue pull-left btnOrderAmount\"><i class=\"fa fa-money\"></i></div>
                      <div class=\"pull-left text\">Оплата наличными</div>
                    </div>
                      <input type=\"text\" class=\"pull-left\" id=\"\" name=\"CASH_AMOUNT\" placeholder=\"0\" size=\"5\" />
                      <div class=\"clearfix\"></div>
                  </div>
                  <div class=\"form-group\">
                    <div class=\"left\">
                      <div id=\"btnOrderAmount_CARD\" class=\"btn blue pull-left btnOrderAmount\"><i class=\"fa fa-credit-card\"></i></div>
                      <div class=\"pull-left text\">Оплата банковской картой</div>
                    </div>
                      <input type=\"text\" class=\"pull-left\" id=\"\" name=\"CARD_AMOUNT\" placeholder=\"0\" size=\"5\">
                      <div class=\"clearfix\"></div>
                  </div>
                  <div class=\"form-group\">
                    <div class=\"left\">
                      <div id=\"btnOrderAmount_GIFT_CARD\" class=\"btn blue pull-left btnOrderAmount\"><i class=\"fa fa-gift\"></i> </div>
                      <div class=\"pull-left text\">Оплата подарочной картой</div>
                    </div>
                      <input type=\"text\" class=\"pull-left\" id=\"\" name=\"GIFT_CARD_AMOUNT\" placeholder=\"0\" size=\"5\">
                      <div class=\"clearfix\"></div>
                  </div>
                </form>
              </div>
            </div>"
		html

	MB.Core.sendQueryForObj = (o, callback) ->
		MB.Core.sendQuery o, (res) ->
			if parseInt(res.RC) is 0
				console.log "toastr", toastr
				window.toastr.success res.MESSAGE, "Ок"
				callback res

			# instance.reload("data");
			else
				window.toastr.error res.MESSAGE, ""


	MB.Core.helper = {}
	window.MB = MB
) jQuery, window, `undefined`

# MB.Core.$pageswrap.append(MB.Core.makepagewrap(options.filename));
# if (options.params) {
#     var content = new MB.Content2({world: "modal", filename: options.filename, id: id, params: options.params});
# } else {
#     var content = new MB.Content2({world: "modal", filename: options.filename, id: id});
# }
# content.loadhtml(function () {
#     content.showit();
#     content.init();
#     MB.User.activemodal = options.id;
#     MB.User.loadedmodals.push(options.id);
# }); 

# if (MB.Content2.hasloaded(options.filename)) {
#     MB.Content2.show(options.filename);
# } else {
#     var content = new MB.Content2(options);
#     content.create(function () {
#         content.show();
#     });
# }
# MB.Form.createcontainer(options.name, function () {
#     MB.Form.loadhtml(options.name, function () {
#         MB.Form.init(options.name, function () {

#         });
#     });    
# });

# MB.Core.switchModal = function (options) {
#     if (options && options.type) {
#         if (options.type === "form" && options.ids && options.objectname) {
#             if (MB.O.forms.hasOwnProperty(options.objectname)) {
#                 MB.O.forms[options.objectname].reload();
#                 MB.O.forms[options.objectname].showit();
#                 MB.User.activemodal = options.objectname;
#             } else {
#                 classie.add(document.getElementById('bt-menu'), 'bt-menu-open');
#                 MB.Core.$modalswrap.append(MB.Core.makemodalwrap(options.objectname));
#                 var form = new MB.Form({objectname: options.objectname, world: "modal", ids: options.ids});
#                 form.loadhtml(function () {
#                     form.init();
#                     form.showit();
#                     MB.User.activemodal = options.objectname;
#                     MB.User.loadedmodals.push(options.objectname);
#                 });
#             }
#         } else if (options.type === "content" && options.filename && options.id) {
#             if (MB.O.contents.hasOwnProperty(options.id)) {
#                 MB.O.contents[options.id].showit();
#                 MB.O.contents[options.id].reload();
#                 MB.User.activemodal = options.id;
#             } else {
#                 classie.add(document.getElementById('bt-menu'), 'bt-menu-open');
#                 var id = MB.Core.guid();
#                 MB.Core.$modalswrap.append(MB.Core.makemodalwrap(id));
#                 if (options.params) {
#                     var content = new MB.Content2({world: "modal", filename: options.filename, id: id, params: options.params});
#                 } else {
#                     var content = new MB.Content2({world: "modal", filename: options.filename, id: id});
#                 }
#                 content.loadhtml(function () {
#                     content.showit();
#                     content.init();
#                     MB.User.activemodal = options.id;
#                     MB.User.loadedmodals.push(options.id);
#                 });                    
#             }
#         } else if (options.type === "table" && options.objectname) {
#             if (MB.User.activemodal) {
#                 if (MB.Table.exists(options.objectname)) {
#                     MB.O.tables[options.objectname].reload();
#                     MB.O.tables[options.objectname].showit();
#                     MB.User.activemodal = options.objectname;
#                 } else {
#                     MB.Core.$modalsswrap.append(MB.Core.makemodalwrap(options.objectname));
#                     var table = new MB.Table({objectname: options.objectname, world: "modal"});
#                     table.init();
#                     table.showit();
#                     MB.User.activemodal = options.objectname;
#                     MB.User.loadedmodals.push(options.objectname);
#                 }                    
#             } else {
#                 classie.add(document.getElementById('bt-menu'), 'bt-menu-open');
#                 MB.Core.$modalsswrap.append(MB.Core.makemodalwrap(options.objectname));
#                 var table = new MB.Table({objectname: options.objectname, world: "modal"});
#                 table.init();
#                 table.showit();
#                 MB.User.activemodal = options.objectname;
#                 MB.User.loadedmodals.push(options.objectname);
#             }

#         }
#     }
# };

# MB.Core.switchPage = function (options) {
#     if (options && options.type) {
#         if (options.type === "tableobject" && options.objectname) {
#             if (MB.Table.exists(options.objectname)) {
#                 MB.O.tables[options.objectname].reload();
#                 MB.O.tables[options.objectname].showit();
#                 MB.User.activepage = options.objectname;
#             } else {
#                 MB.Core.$pageswrap.append(MB.Core.makepagewrap(options.objectname));
#                 var table = new MB.Table({objectname: options.objectname, world: "page"});
#                 table.init();
#                 table.showit();
#                 MB.User.activepage = options.objectname;
#                 MB.User.loadedpages.push(options.objectname);
#             }
#         } else if (options.type === "contentobject" && options.objectname){
#             var content = new MB.Content({objectname: options.objectname, world: "page",pageswrap:MB.Core.$pageswrap});
#             content.init();
#             content.showit();
#             MB.User.activepage = options.objectname;
#             MB.User.loadedpages.push(options.objectname);
#         } else if (options.type === "modalminiobject" && options.objectname){
#             var modalmini = new MB.modalmini({objectname: options.objectname, world: "page",pageswrap:MB.Core.$pageswrap});
#             modalmini.init();
#         }
#     }
# };

# else if (options.type === "modalminiobject" && options.objectname){
#     var modalmini = new MB.modalmini({objectname: options.objectname, world: "page",pageswrap:MB.Core.$pageswrap});
#     modalmini.init();
# }

# if (MB.Modal.opened) {
#     if (MB.Modal.countmodals === 1) {
#         if (MB.Modal.activemodal === ) {
#             toastr.info("Это уже открыто", "MB.Core.switchModal");
#         } else {
#             var content = new MB.Content(options);
#             content.create(function () {
#                 MB.Modal.hide(MB.Modal.activemodal);
#                 MB.Modal.lastmodal = MB.Modal.activemodal;
#                 MB.Modal.activemodal = options.name;
#                 MB.Modal.show(options.name);
#                 MB.Modal.additem(options.name);
#                 MB.Modal.activateitem(options.name);
#                 MB.Modal.loadedmodals.push(options.name);
#                 MB.Modal.countmodals++;
#             });
#         }
#     } else if (MB.Modal.countmodals > 1) {
#         if (MB.Modal.activemodal === options.name) {
#             toastr.info("Это уже открыто", "MB.Core.switchModal");
#         } else if (MB.Form.hasloaded(options.name)) {
#             MB.Modal.hide(MB.Modal.activemodal);
#             MB.Modal.lastmodal = MB.Modal.activemodal;
#             MB.Modal.activemodal = options.name;
#             MB.Modal.show(options.name);
#             MB.Modal.activateitem(options.name);
#         } else {
#             var content = new MB.Content(options);
#             content.create(function () {
#                 MB.Modal.hide(MB.Modal.activemodal);
#                 MB.Modal.lastmodal = MB.Modal.activemodal;
#                 MB.Modal.activemodal = options.name;
#                 MB.Modal.show(options.name);
#                 MB.Modal.additem(options.name);
#                 MB.Modal.activateitem(options.name);
#                 MB.Modal.loadedmodals.push(options.name);
#                 MB.Modal.countmodals++;
#             });
#         }
#     }
# } else {
#     MB.Modal.open(function () {
#         var content = new MB.Content(options);
#         content.create(function () {
#             MB.Modal.activemodal = options.name;
#             MB.Modal.show(options.name);
#             MB.Modal.additem(options.name);
#             MB.Modal.activateitem(options.name);
#             MB.Modal.loadedmodals.push(options.name);
#             MB.Modal.countmodals++;
#         });
#     });
# }

#                 if (MB.Form.hasloaded(options.name)) {
#                     MB.Modal.show(options.name);
#                 } else {
#                     var form = new MB.Form(options);
#                     form.create(function () {
#                         MB.Modal.hide(MB.Modal.activemodal);
#                         MB.Modal.activemodal = options.name;
#                         MB.Modal.show(MB.Modal.activemodal);
#                         MB.Modal.additem(MB.Modal.activemodal);
#                         MB.Modal.activateitem(options.name);
#                     });
#                 }
#             } else {
#                 MB.Core.openmodal(function () {

#                 });
#             }

#                         MB.Modal.removeitem(MB.Modal.activemodal);
#             if (MB.User.activemodal === null) {
#                 MB.Core.openmodal(function () {
#                     var form = new MB.Form(options);
#                     form.create(function () {
#                         form.showit("init");
#                         MB.Core.switchModalInit();
#                     });
#                 });
#             } else {
#                 if (MB.Form.hasloaded(options.name)) {
#                     MB.Form.show(options.name);
#                 } else {
#                     var form = new MB.Form(options);
#                     form.create(function () {
#                         form.showit("init");
#                     });                        
#                 }
#             }
#         } else if (options.type === "content" && options.filename) {
#             if (MB.User.activemodal === null) {
#                 MB.Core.openmodal(function () {
#                     var id = MB.Core.guid();
#                     var content = new MB.Content({world: "modal", filename: options.filename, id: id, params: options.params});
#                     content.create(function () {
#                         content.showit("init");
#                         content.init();
#                         MB.Core.switchModalInit();
#                     }); 
#                 });                    
#             } else {
#                 var id = MB.Core.guid();
#                 var content = new MB.Content({world: "modal", filename: options.filename, id: id, params: options.params});
#                 content.create(function () {
#                     content.showit("init");
#                     content.init();
#                 });
#             }
#         } else if (options.type === "table" && options.name) {
#             if (MB.User.activemodal === null) {
#                 MB.Core.openmodal(function () {
#                     if (MB.Table.hasloaded(options.name)) {
#                         MB.Table.show("modal", options.name);                    
#                     } else {
#                         var table = new MB.Table({world: "modal", name: options.name, params: options.params});
#                         table.create(function () {
#                             table.showit("init");
#                             MB.Core.switchModalInit();
#                         });
#                     }    
#                 });
#             } else {
#                 if (MB.Table.hasloaded(options.name)) {
#                     MB.Table.show("modal", options.name);                    
#                 } else {
#                     var table = new MB.Table({world: "modal", name: options.name, params: options.params});
#                     table.create(function () {
#                         table.showit("init");
#                     });
#                 }
#             }
#         }
#     }
# };

# var MBOOKER = MBOOKER || {};

# MBOOKER.App = {};
# MBOOKER.Classes = {};
# MBOOKER.Fn = {};
# MBOOKER.Fn = {};
# MBOOKER.Map = {};
# MBOOKER.Menu = {};
# MBOOKER.Modals = {};
# MBOOKER.Pages = {};
# MBOOKER.Settings = {};
# MBOOKER.UserData = {};

# MBOOKER.Pages.activePage = "index";
# MBOOKER.Pages.loadedPages = ["index"];
# MBOOKER.Pages.typeOfActivePage = "content";
# MBOOKER.Pages.pages = {};
# MBOOKER.Pages.pages.contents = {};
# MBOOKER.Pages.pages.tables = {};

# MBOOKER.Modals.activeModal = null;
# MBOOKER.Modals.loadedModals = [];
# MBOOKER.Modals.typeOfActiveModal = null;
# MBOOKER.Modals.modals = {};
# MBOOKER.Modals.modals.contents = {};
# MBOOKER.Modals.modals.forms = {};
# MBOOKER.Modals.modals.tables = {};
# disables the text input mask
# disables the date picker
# disables de time picker
# enables the 12-hour format time picker
# disables seconds in the time picker
# set a minimum date
# set a maximum date

#  Отладочные функции    

# log = console.log

# console.log.call(this, s);
# window.console.log(s);

# log.call(console, 'печенье');

#  КОНЕЦ Отладочные функции    

#   Подключение модулей   

# $("body").prepend('<div id="for_alert"></div>');
# $("#for_alert").load("assets/js/alert/alert.html");
#   КОНЕЦ Подключение модулей   

# MBOOKER.Fn.getScript = function (url) {
#   var script = document.createElement('script');
#   script.src = url;
#   document.getElementsByTagName('head')[0].appendChild(script);
# }; 

# MBOOKER.Fn.require = function (url) {
#   var script = document.createElement('script');
#   script.src = url;
#   document.getElementsByTagName('head')[0].appendChild(script);
# }; 

# Object.prototype.countObj = function (obj) {
#     return Object.keys(obj).length;
# };

# MBOOKER.Fn.countObj = function (obj) {
#   return Object.keys(obj).length;
# };

# var o = {
#   "NAMES": ["ADDR_ID","ADDR","STATUS","OBJVERSION"],
#   "DATA":[ 
#     ["1","115054","ACTIVE","20140113150734"], 
#     ["2","ул.","ACTIVE","20140113150932"], 
#     ["102","улица","ACTIVE","20140113150319"] 
#   ], 
#   "INFO": {"ROWS_COUNT":"3","VIEW":"HALL_ADDRESSES"}
# };

# MBOOKER.Fn.sendQuery = function (obj, callback) {
#   var o = obj.subcommand;
#   delete obj.subcommand;
#   obj.object = o;
#   var xml = "";
#   var url = "/cgi-bin/b2cJ";
#   xml = "p_xml=<query>";
#   if (typeof obj === "object") {
#     if (obj.hasOwnProperty("command")) {
#       for (var i in obj) {
#         if (obj.hasOwnProperty(i)) {
#           if (i === "params") {
#             if (typeof obj[i] === "object") {
#               for (var j in obj.params) {
#                 xml += "<" + j + ">" + obj.params[j] + "</" + j + ">";
#               }
#             }
#           } else {
#             xml += "<" + i + ">" + obj[i] + "</" + i + ">";
#           }              
#         }
#       }    
#     } else {
#       toastr.error("В обекте не передан обязательный параметр command", "Ошибка");
#     }        
#   } else {
#     toastr.error("Не передали объект в sendQuery", "MBOOKER.Fn.sendQuery");
#   }
#   xml += "</query>";
#   $.getJSON( url, xml, function (response, textStatus, jqXHR) {
#     if (textStatus === "success") {
#       if (response && typeof response === "object") {
#         if (response.hasOwnProperty("RC")) {
#           var rc = parseInt(response.RC);
#           if (rc === 0) {
#             if(typeof callback == "function"){callback(response);}
#           } else if (rc === -2) {
#             setTimeout(
#               function () {
#                 $.removeCookie("sid")
#                 document.location.href = "login.html";                                
#               }
#             , 3000);
#           } else {
#             toastr.error("Ошибка: " + response.RC + ": " + response.MESSAGE, "MBOOKER.Fn.sendQuery");
#             if(typeof callback == "function"){callback(response);}
#           }
#         } else if (response.hasOwnProperty("DATA")) {
#           if (Array.prototype.isPrototypeOf(response.DATA)) {
#             if(typeof callback == "function"){callback(response);}
#           } else {
#             toastr.error("'DATA' не массив! :(", "MBOOKER.Fn.sendQuery");
#           }
#         } else {
#           if(typeof callback == "function"){callback(response);}
#         }
#       }
#     } else {
#       toastr.error("Статус ответа не success, значит надо смотреть консоль :)", "MBOOKER.Fn.sendQuery");
#     }
#   });
# };

# MBOOKER.Fn.jsonToObj = function(obj){
#   var obj_true = {};
#   var objIndex = {};
#   for (i in obj['DATA']){
#     for(var index in obj['NAMES']){
#       if(obj_true[i] == undefined){obj_true[i] = {};}
#       obj_true[i][obj['NAMES'][index]] = obj['DATA'][i][index];
#     }
#   }
#   return obj_true;
# }

# MBOOKER.Fn.createWrapperHTML = function (area, type, nameOrSubcommand) {
#   if (area && type && nameOrSubcommand && typeof area === "string" && typeof type === "string" && typeof nameOrSubcommand === "string") {
#     if (area === "modal") {
#       return "<div id='modal_" + type + "_" + nameOrSubcommand + "_wrapper' class='modal-content' style='display:none'></div>";
#     } else if (area === "page") {
#       return "<div id='page_" + type + "_" + nameOrSubcommand + "_wrapper' class='page-content' style='display:none;position:relative'></div>";
#     }
#   }
# };

# MBOOKER.Fn.getContentEnvironment = function (name) {
#   if (MBOOKER.App.contentArea === "page") {
#     return MBOOKER.Pages.pages.contents[name];
#   } else if (MBOOKER.App.contentArea === "modal") {
#     return MBOOKER.Modals.modals.contents[name];
#   } else {
#     return 1;
#   }
# };

# MBOOKER.Fn.getEnv = function (name) {
#   if (MBOOKER.App.contentArea === "page") {
#     return MBOOKER.Pages.pages.contents[name];
#   } else if (MBOOKER.App.contentArea === "modal") {
#     return MBOOKER.Modals.modals.contents[name];
#   }
# };

# MBOOKER.Fn.switchPage = function (type, obj) {
#   if (type && obj && typeof type === "string" && typeof obj === "object") {
#     if (type === "content" && obj.name && typeof obj.name === "string") {
#       if (MBOOKER.Pages.activePage === obj.name) {
#         console.log("Это сейчас открыто");
#       } else if (MBOOKER.Pages.loadedPages.indexOf(obj.name) === -1) {
#         var content = new MBOOKER.Classes.Content("page", obj);
#         MBOOKER.Pages.pages.contents[obj.name] = content;
#         MBOOKER.Pages.pages.contents[obj.name].init();
#         MBOOKER.Pages.activePage = obj.name;
#         MBOOKER.Pages.loadedPages.push(obj.name);  
#         MBOOKER.Pages.typeOfActivePage = type;  
#         MBOOKER.App.contentArea = "page";
#       } else if (MBOOKER.Pages.loadedPages.indexOf(obj.name) !== -1) {
#         MBOOKER.Pages.pages.contents[obj.name].show();
#         MBOOKER.Pages.activePage = obj.name;
#       }                                  
#     } else if (type === "table" && obj.subcommand && typeof obj.subcommand === "string") {
#       if (MBOOKER.Pages.activePage === obj.subcommand) {
#         console.log("Это сейчас открыто");
#       } else if (MBOOKER.Pages.loadedPages.indexOf(obj.subcommand) === -1) {
#         var table = new MB.Table({objectname: "table_hall_addresses"});
#         table.init();
#         // MBOOKER.Pages.pages.tables[obj.subcommand] = table;
#         // MBOOKER.Pages.pages.tables[obj.subcommand].rows = {};
#         // MBOOKER.Pages.pages.tables[obj.subcommand].init(function () {
#         //     MBOOKER.Pages.activePage = obj.subcommand;
#         //     MBOOKER.Pages.loadedPages.push(obj.subcommand); 
#         //     MBOOKER.Pages.typeOfActivePage = type;                    
#         // });
#       } else if (MBOOKER.Pages.loadedPages.indexOf(obj.subcommand) !== -1) {
#         MBOOKER.Pages.pages.tables[obj.subcommand].showTable();
#         MBOOKER.Pages.activePage = obj.subcommand;
#       } 
#     }
#   }
# };

# MBOOKER.Fn.switchModal = function (type, obj) {
#   if (MBOOKER.Modals.activeModal && MBOOKER.Modals.loadedModals[0]) {}
#   else {
#     classie.add( document.getElementById( 'bt-menu' ), 'bt-menu-open' );
#   }
#   if (type && obj && typeof type === "string" && typeof obj === "object") {
#     if (type === "content" && obj.name && typeof obj.name === "string") {
#       if (MBOOKER.Modals.activeModal === obj.name) {
#         console.log("Это сейчас открыто");
#       } else if (MBOOKER.Modals.loadedModals.indexOf(obj.name) === -1) {
#         var content = new MBOOKER.Classes.Content("modal", obj);
#         MBOOKER.Modals.modals.contents[obj.name] = content;
#         MBOOKER.Modals.modals.contents[obj.name].init();
#         MBOOKER.Modals.activeModal = obj.name;
#         MBOOKER.Modals.loadedModals.push(obj.name);  
#         MBOOKER.Modals.typeOfActiveModal = type;
#         MBOOKER.App.contentArea = "modal";
#         // var content = new MBOOKER.Classes.Content("modal", obj);
#         // MBOOKER.Pages.pages.contents[obj.name] = content;
#         // MBOOKER.Pages.pages.contents[obj.name].init();
#         // MBOOKER.Pages.activePage = obj.name;
#         // MBOOKER.Pages.loadedPages.push(obj.name);  
#         // MBOOKER.Pages.typeOfActivePage = type;  
#       } else if (MBOOKER.Modals.loadedModals.indexOf(obj.name) !== -1) {

#       }
#     } 
#   }        
# };

# MBOOKER.Fn.switchContent = function (page, isTable, callback) {
#     if (page && typeof page === "string") {
#         if (typeof isTable === "boolean") {
#             if (isTable) {
#                 if (MBOOKER.Pages.activePage === page) {
#                     callback();
#                 } else {
#                     if (MBOOKER.Pages.loadedPages.indexOf(page) === -1) {
#                         $("#" + MBOOKER.Pages.activePage + "_page").hide();
#                         var inside = '<div id="' + page + '_page" class="page-content" style="display:none;"><div id="' + page + '_table_wrapper"></div></div>';
#                         $(".page-content-wrapper").append(inside);
#                         MBOOKER.Pages.activePage = page;
#                         MBOOKER.Pages.loadedPages.push(page);
#                         $("#" + page + "_page").show();
#                         var o = {
#                             menuItemName: page
#                         };
#                         var table = new MBOOKER.Classes.Table(o);
#                         MBOOKER.Tables.tables[page] = table;
#                         MBOOKER.Tables.tables[page].rows = {};
#                         MBOOKER.Tables.tables[page].init();
#                         // MBOOKER.Fn.sendQuery({subcommand: page}, function (responsedData) {
#                         //  console.log(responsedData);
#                         // });
#                         callback();
#                     } else {
#                         $("#" + MBOOKER.Pages.activePage + "_page").hide();
#                         MBOOKER.Pages.activePage = page;
#                         MBOOKER.Pages.loadedPages.push(page);
#                         $("#" + page + "_page").show();
#                         callback();
#                     }
#                 }
#             } else {
#                 if (MBOOKER.Pages.activePage === page) {
#                     callback();
#                 } else {
#                     if (MBOOKER.Pages.loadedPages.indexOf(page) === -1) {
#                         $("#" + MBOOKER.Pages.activePage + "_page").hide();
#                         var inside = '<div id="' + page + '_page" class="page-content" style="display:none;"></div>';
#                         $(".page-content-wrapper").append(inside);
#                         MBOOKER.Pages.activePage = page;
#                         MBOOKER.Pages.loadedPages.push(page);
#                         // .load( url [, data ] [, complete(responseText, textStatus, XMLHttpRequest) ] )
#                         $("#" + MBOOKER.Pages.activePage + "_page").load("html/contents/" + page + "/" + page + ".html", function (response, textStatus, XMLHttpRequest) {
#                             $("#" + page + "_page").show();
#                             callback();
#                         });
#                     } else {

#                     }
#                 }
#             }
#         } else {
#             toastr.error("Параметр isTable не передан или не является булевым значением", "MBOOKER.Fn.switchContent");
#         }
#     } else {
#         toastr.error("Парметр page не передан или не является строкой", "MBOOKER.Fn.switchContent");
#     }
# };

# MBOOKER.Fn.sendQuery2 = function (obj, callback) {
#     // var o = obj.subcommand;
#     // delete obj.subcommand;
#     // obj.object = o;
#     var xml = "";
#     var url = "/cgi-bin/b2cJ";
#     xml = "p_xml=<query>";
#     if (typeof obj === "object") {
#         if (obj.hasOwnProperty("command")) {
#             for (var i in obj) {
#                 if (obj.hasOwnProperty(i)) {
#                     if (i === "params") {
#                         if (typeof obj[i] === "object") {
#                             for (var j in obj.params) {
#                                 xml += "<" + j + ">" + obj.params[j] + "</" + j + ">";
#                             }
#                         }
#                     } else {
#                         xml += "<" + i + ">" + obj[i] + "</" + i + ">";
#                     }              
#                 }
#             }    
#         } else {
#             toastr.error("В обекте не передан обязательный параметр command", "MBOOKER.Fn.sendQuery");
#         }        
#     } else {
#         toastr.error("Не передали объект в sendQuery", "MBOOKER.Fn.sendQuery");
#     }
#     xml += "</query>";
#     $.getJSON( url, xml, function (response, textStatus, jqXHR) {
#         if (textStatus === "success") {
#             if (response && typeof response === "object") {
#                 if (response.hasOwnProperty("RC")) {
#                     var rc = parseInt(response.RC);
#                     if (rc === 0) {
#                         callback(response);
#                     } else if (rc === -2) {
#                         toastr.error("Ваша сессия не актульна, зайдите на сайт пожалуйста заново", "MBOOKER.Fn.sendQuery");
#                         setTimeout(
#                             function () {
#                                 $.removeCookie("sid");
#                                 console.log("Ваша сессия не актульна, зайдите на сайт пожалуйста заново");
#                                 // document.location.href = "http://192.168.1.101/multibooker/login.html";                                
#                             }
#                         , 3000);
#                     } else {
#                         toastr.error("Ошибка: " + response.RC + ": " + response.MESSAGE, "MBOOKER.Fn.sendQuery");
#                     }
#                 } else if (response.hasOwnProperty("DATA")) {
#                     if (Array.prototype.isPrototypeOf(response.DATA)) {
#                         callback(response);
#                     } else {
#                         toastr.error("'DATA' не массив! :(", "MBOOKER.Fn.sendQuery");
#                     }
#                 } else {
#                     callback(response);
#                 }
#             }
#         } else {
#             toastr.error("Статус ответа не success, значит надо смотреть консоль :)", "MBOOKER.Fn.sendQuery");
#         }
#     });
# };
# MBOOKER.Classes.Table.prototype.render = function () {
# };
# console.log(toastr);
# $(document).ready(function () {
#     console.log(toastr);
# });

	# if ( res2.hasOwnProperty("results")) {
	#   res = {}
	#   if (res2.results[0].hasOwnProperty("data")) {
	#     res.DATA = res2.results[0].data
	#     res.NAMES = res2.results[0].data_columns
	#     res.INFO = res2.results[0].data_info
	#     if (res2.results[0].extra_data.object_profile) {
	#       // res.OBJECT_PROFILE = res2.results[0].extra_data.object_profile
	#       for (var key in res2.results[0].extra_data.object_profile) {
	#       }
	#     }
	#   } else {
	#     res.RC = res2.results[0].code
	#     res.TITLE = res2.results[0].toastr.title
	#     res.MESSAGE = res2.results[0].toastr.message
	#     res.TOAST_TYPE = res2.results[0].toastr.type
	#     res.OBJVERSION = res2.results[0].objversion
	#     res.id = res2.results[0].id
	#   }
	# }
	# if (res && status && status === "success" && typeof res === "object") {
	#   if (res.hasOwnProperty("RC")) {
	#     if (parseInt(res.RC) === 0) {
	#       if(res.TICKET_PACK_USER_INFO){
	#         var JSONstring = res.TICKET_PACK_USER_INFO;
	#         var userInfo = new userInfoClass({JSONstring:JSONstring}).userInfo_Refresh();
	#       }
	#       if(typeof callback == "function"){callback(res);}
	#     } else if (parseInt(res.RC) === -2) {
	#       toastr ? toastr[res.TOAST_TYPE](res.MESSAGE) : alert("Ваша сессия не актульна, зайдите на сайт пожалуйста заново, MB.Core.sendQuery");
	#       setTimeout(function () {$.removeCookie("sid");document.location.href = "login.html";}, 3000);    
	#     } else {
	#       if(typeof callback == "function"){callback(res);}
	#       // toastr ? toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE) : alert("Ошибка: " + res.RC + ": " + res.MESSAGE + ", MB.Core.sendQuery");
	#     }    
	#   } else {
	#     if(typeof callback == "function"){callback(res);}
	#   }
	# }

		# MB.Modal2 = {};
	# MB.Modal2.activeItem
	# MB.Modal2.itemsQueue
	# MB.Modal2.countModalItems
	# MB.Modal2.opened = false
	# MB.Modal2.$modalContentWrapper = $(".modal-content-wrapper");
	# MB.Modal2.$modalListContainer = $(".modals-list");
	
	# MB.Core.switchModal2 = function (options) {
	#   if (options.type) {
	
	#   } else {
	#     console.log("MB.Core.switchModal2")
	#   }
	# };
	
	# MB.Core.switchModal = function (options) {
	#   if (options.type) {
	#     if (options.type === "form" && options.name) {
	#       if (MB.Modal.opened) {
	#         if (MB.Modal.countmodals === 1) {
	#           if (MB.Modal.activemodal === options.name) {
	#             toastr.info("Это уже открыто", "Информация");
	#           } else {
	#             var form = new MB.Form(options);
	#             form.create(function () {
	#               MB.Modal.hide(MB.Modal.activemodal);
	#               MB.Modal.activemodal = options.name;
	#               MB.Modal.show(options.name);
	#               MB.Modal.additem(options.name, options.type);
	#               MB.Modal.activateitem(options.name);
	#               MB.Modal.loadedmodals.push(options.name);
	#               MB.Modal.modalsqueue.push(options.name);
	#               MB.Modal.countmodals++;
	#             });
	#           }
	#         } else if (MB.Modal.countmodals > 1) {
	#           if (MB.Modal.activemodal === options.name) {
	#             toastr.info("Это уже открыто", "Информация");
	#           } else if (MB.Form.hasloaded(options.name)) {
	#             MB.Modal.hide(MB.Modal.activemodal);
	#             MB.Modal.activemodal = options.name;
	#             MB.Modal.show(options.name);
	#             MB.Modal.activateitem(options.name);
	#           } else {
	#             var form = new MB.Form(options);
	#             form.create(function () {
	#               MB.Modal.hide(MB.Modal.activemodal);
	#               MB.Modal.activemodal = options.name;
	#               MB.Modal.show(options.name);
	#               MB.Modal.additem(options.name, options.type);
	#               MB.Modal.activateitem(options.name);
	#               MB.Modal.loadedmodals.push(options.name);
	#               MB.Modal.modalsqueue.push(options.name);
	#               MB.Modal.countmodals++;
	#             });
	#           }
	#         }
	#       } else {
	#         MB.Modal.open(function () {
	#           var form = new MB.Form(options);
	#           form.create(function () {
	#             MB.Modal.activemodal = options.name;
	#             MB.Modal.show(options.name);
	#             MB.Modal.additem(options.name, options.type);
	#             MB.Modal.activateitem(options.name);
	#             MB.Modal.loadedmodals.push(options.name);
	#             MB.Modal.modalsqueue.push(options.name);
	#             MB.Modal.countmodals++;
	#           });
	#         });
	#       }
	#     } else if (options.type === "table") {
	#       if (MB.Modal.opened) {
	#         if (MB.Modal.countmodals === 1) {
	#           if (MB.Modal.activemodal === options.name) {
	#             toastr.info("Эта таблица сейчас открыта", "Информация");
	#           } else {
	#             var table = new MB.Table({world: "modal", name: options.name, params: options.params});
	#             table.create(function () {
	#               MB.Modal.hide(MB.Modal.activemodal);
	#               MB.Modal.activemodal = options.name;
	#               MB.Modal.show(options.name);
	#               MB.Modal.additem(options.name, options.type);
	#               MB.Modal.activateitem(options.name);
	#               MB.Modal.loadedmodals.push(options.name);
	#               MB.Modal.modalsqueue.push(options.name);
	#               MB.Modal.countmodals++;
	#             });
	#           }
	#         } else if (MB.Modal.countmodals > 1) {
	#           if (MB.Modal.activemodal === options.name) {
	#             toastr.info("Эта таблица сейчас открыта", "Информация");
	#           } else if (MB.Form.hasloaded(options.name)) {
	#             MB.Modal.hide(MB.Modal.activemodal);
	#             MB.Modal.lastmodal = MB.Modal.activemodal;
	#             MB.Modal.activemodal = options.name;
	#             MB.Modal.show(options.name);
	#             MB.Modal.activateitem(options.name);
	#           } else {
	#             var table = new MB.Table({world: "modal", name: options.name, params: options.params});
	#             table.create(function () {
	#               MB.Modal.hide(MB.Modal.activemodal);
	#               MB.Modal.activemodal = options.name;
	#               MB.Modal.show(options.name);
	#               MB.Modal.additem(options.name, options.type);
	#               MB.Modal.activateitem(options.name);
	#               MB.Modal.loadedmodals.push(options.name);
	#               MB.Modal.modalsqueue.push(options.name);
	#               MB.Modal.countmodals++;
	#             });
	#           }
	#         }
	#       } else {
	#         MB.Modal.open(function () {
	#           var table = new MB.Table({world: "modal", name: options.name, params: options.params});
	#           table.create(function () {
	#             MB.Modal.activemodal = options.name;
	#             MB.Modal.show(options.name);
	#             MB.Modal.additem(options.name, options.type);
	#             MB.Modal.activateitem(options.name);
	#             MB.Modal.loadedmodals.push(options.name);
	#             MB.Modal.modalsqueue.push(options.name);
	#             MB.Modal.countmodals++;
	#           });
	#         });
	#       }
	#     } else if (options.type === "content" && options.filename) {
	#       if (MB.Modal.opened) {
	#         var content = new MB.Content({world: "modal", filename: options.filename, id: (MB.Core.guid()), params: options.params});
	#         content.create(function () {
	#           // content.init();
	#           MB.Modal.hide(MB.Modal.activemodal);
	#           MB.Modal.activemodal = content.id;
	#           MB.Modal.show(content.id);
	#           MB.Modal.additem(content.id, options.type);
	#           MB.Modal.activateitem(content.id);
	#           MB.Modal.loadedmodals.push(content.id);
	#           MB.Modal.modalsqueue.push(content.id);
	#           MB.Modal.countmodals++;
	#           content.init();
	#         });
	#       } else {
	#         MB.Modal.open(function () {
	#           var content = new MB.Content({world: "modal", filename: options.filename, id: (MB.Core.guid()), params: options.params});
	#           content.create(function () {
	#             // content.init();
	#             MB.Modal.activemodal = content.id;
	#             MB.Modal.show(content.id);
	#             MB.Modal.additem(content.id, options.type);
	#             MB.Modal.activateitem(content.id);
	#             MB.Modal.loadedmodals.push(content.id);
	#             MB.Modal.modalsqueue.push(content.id);
	#             MB.Modal.countmodals++;
	#             content.init();
	#             // if (typeof options.params.callback==="function"){
	#             //  MB.Content.find(content.id).callback = options.params.callback;
	#             // }
	#           });
	#         });
	#       }
	#     }
	#   }
	# };

				# console.log("iscross");
			# if (MB.Modal.countmodals === 1) {
			#   console.log("MB.Modal.countmodals === 1");
			#   if (type === "content") {
			#     console.log("type === 'content'");
			#     var content = MB.Content.find(object);
			#     if (content.onClose != null) {
			#       console.log("content.onClose != null");
			#       content.onClose();
			#     }
			#   }
			#   MB.Modal.closefull();
			#   MB.Modal.$modalslist.off("click");
			# } else if (MB.Modal.countmodals > 1) {
			#   console.log("MB.Modal.countmodals > 1");
			#   if (MB.Modal.activemodal === object) {
			#     console.log("MB.Modal.activemodal === object");
			#     if (type === "content") {
			#       console.log("type === 'content'");
			#       var content = MB.Content.find(object);
			#       if (content.onClose != null) {
			#         console.log("content.onClose != null");
			#         content.onClose();
			#       }
			#     }
			#     MB.Modal.remove(object);
			#     if (MB.Modal.modalsqueue.indexOf(object) === 0) { // if first
			#       MB.Modal.activemodal = MB.Modal.modalsqueue[(MB.Modal.modalsqueue.indexOf(object) + 1)];
			#     } else if (MB.Modal.modalsqueue.indexOf(object) === (MB.Modal.countmodals - 1)) { // if last
			#       MB.Modal.activemodal = MB.Modal.modalsqueue[(MB.Modal.modalsqueue.indexOf(object) - 1)];
			#     } else {
			#       MB.Modal.activemodal = MB.Modal.modalsqueue[(MB.Modal.modalsqueue.indexOf(object) + 1)];
			#     }
			#     //  MB.Modal.activemodal = MB.Modal.modalsqueue[(MB.Modal.modalsqueue.indexOf(object) + 1)];
			#     // }else if(MB.Modal.modalsqueue.indexOf(object) == (MB.Modal.countmodals-1)){ // if last
			#     //  MB.Modal.activemodal = MB.Modal.modalsqueue[(MB.Modal.modalsqueue.indexOf(object) - 1)];
			#     // }else{
			#     //  MB.Modal.activemodal = MB.Modal.modalsqueue[(MB.Modal.modalsqueue.indexOf(object) + 1)];
			#     // }
			#     // MB.Modal.modalsqueue.splice(MB.Modal.modalsqueue.indexOf(object), 1);
			#     // MB.Modal.loadedmodals.splice(MB.Modal.modalsqueue.indexOf(object), 1);
			#     MB.Modal.show(MB.Modal.activemodal);
			#     MB.Modal.activateitem(MB.Modal.activemodal);
			#     MB.Modal.countmodals--;
			#   } else {
			#     console.log("MB.Modal.activemodal !== object");
			#     if (type === "content") {
			#       console.log("type === 'content'");
			#       var content = MB.Content.find(object);
			#       if (content.onClose != null) {
			#         console.log("content.onClose != null");
			#         content.onClose();
			#       }
			#     }
			#     MB.Modal.remove(object);
			#     MB.Modal.countmodals--;
			#   }
			# }
			# delete MB.O[type + "s"][object];
			# console.log(MB.Modal.loadedmodals);
			# console.log(MB.Modal.modalsqueue);
			# MB.Modal.loadedmodals.splice(MB.Modal.loadedmodals.indexOf(object), 1);
			# MB.Modal.modalsqueue.splice(MB.Modal.loadedmodals.indexOf(object), 1);
			# console.log(MB.Modal.loadedmodals);
			# console.log(MB.Modal.modalsqueue);


	#if (iscross) {
	#       if (MB.Modal.countmodals === 1) {
	#         MB.Modal.closefull();
	#         MB.Modal.$modalslist.off("click");
	#       } else if (MB.Modal.countmodals > 1) {
	#         if (MB.Modal.activemodal === object) {
	#           MB.Modal.remove(object);
	#           MB.Modal.activemodal = MB.Modal.modalsqueue[(MB.Modal.modalsqueue.indexOf(object) - 1)];
	#           MB.Modal.show(MB.Modal.activemodal);
	#           MB.Modal.activateitem(MB.Modal.activemodal);
	#           MB.Modal.countmodals--;
	#         } else {
	#           MB.Modal.remove(object); 
	#           MB.Modal.countmodals--;
	#         }
	#       }
	#     } else {
	#       if (!(MB.Modal.activemodal === object)) {
	#         MB.Modal.hide(MB.Modal.activemodal);
	#         MB.Modal.activemodal = object;
	#         MB.Modal.show(object);
	#         MB.Modal.activateitem(object);
	#       } 
	#     }


					# console.log("modal is opened");
				# if (options.params.guid != null) {
				#   console.log("options.params.guid != null (" + options.params.guid + ")");
				#   if (MB.Modal.loadedmodals.indexOf(options.params.guid) > -1) {
				#     console.log("MB.Modal.loadedmodals.indexOf(options.params.guid) > -1");
				#     MB.Modal.hide(MB.Modal.activemodal);
				#     MB.Modal.lastmodal = MB.Modal.activemodal;
				#     MB.Modal.activemodal = options.params.guid;
				#     MB.Modal.show(options.params.guid);
				#     MB.Modal.activateitem(options.params.guid);
				#   } else {
				#     console.log("not MB.Modal.loadedmodals.indexOf(options.params.guid) > -1");
				#     var content = new MB.Content({world: "modal", filename: options.filename, id: (MB.Core.guid()), params: options.params});
				#     content.create(function () {
				#       // content.init();
				#       MB.Modal.hide(MB.Modal.activemodal);
				#       MB.Modal.activemodal = content.id;
				#       MB.Modal.show(content.id);
				#       MB.Modal.additem(content.id, options.type);
				#       MB.Modal.activateitem(content.id);
				#       MB.Modal.loadedmodals.push(content.id);
				#       MB.Modal.modalsqueue.push(content.id);
				#       MB.Modal.countmodals++;
				#       content.init();
				#     });
				#   }
				# } else {
				#   console.log("options.params.guid == null");
				#   var content = new MB.Content({world: "modal", filename: options.filename, id: (MB.Core.guid()), params: options.params});
				#   content.create(function () {
				#     // content.init();
				#     MB.Modal.hide(MB.Modal.activemodal);
				#     MB.Modal.activemodal = content.id;
				#     MB.Modal.show(content.id);
				#     MB.Modal.additem(content.id, options.type);
				#     MB.Modal.activateitem(content.id);
				#     MB.Modal.loadedmodals.push(content.id);
				#     MB.Modal.modalsqueue.push(content.id);
				#     MB.Modal.countmodals++;
				#     content.init();
				#   });
				# }


	# if (typeof options.params.callback==="function"){
	#   MB.Content.find(content.id).callback = options.params.callback;
	# }

		# MB.Modal.open 
	# MB.Modal.itemsinit 
	# 19.06.2014 14:30
	# dd.mm.yyyy hh.ii.00
	# MB.Modal.show 
	# MB.Modal.additem 
	# MB.Modal.activateitem 


	#
	#       var content = new MB.Content({objectname: options.objectname, world: "page",pageswrap:MB.Core.$pageswrap});
	#       content.init();
	#       content.showit();
	#       MB.User.activepage = options.objectname;
	#       MB.User.loadedpages.push(options.objectname);
	#   