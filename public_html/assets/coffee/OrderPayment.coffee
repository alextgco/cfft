sid = MB.User.sid
OrderPaymentClass = (obj)->
	this.orderId = obj.orderId
	if obj.table != undefined
		this.table = obj.table
OrderPaymentClass::init = ()->

OrderPaymentClass::ButtonsState = (state)->
	switch state
		when "on"
			$(".modal-footer .btn").each ->
				$(this).removeClass "disabled"

			$(".formOrderMini input").each ->
				$(this).removeAttr "disabled"

			$(".formOrderMini .btn").each ->
				$(this).removeAttr "disabled"

		when "off"
			$(".modal-footer .btn").each ->
				$(this).addClass "disabled"  if $(this).attr("class").indexOf("btn_cancel") is -1

			$(".formOrderMini input").each ->
				$(this).attr "disabled", true

			$(".formOrderMini .btn").each ->
				$(this).attr "disabled", true

OrderPaymentClass::sendAmount = (payType, orderId,callback,params)->
	if params is `undefined`
		params = {}
		params["ORDER_ID"] = orderId
		params['OBJVERSION'] = $("[name=OBJVERSION]").val();
		$(".formOrderMini").find("input").each ->
			val = $(this).val()
			key = $(this).attr("name")
			params[key] = val
	payType = if payType.attr("id").indexOf("CASH") is -1 then "CARD" else "CASH"
	params["payment_type"] = payType;
	if payType is 'CARD'
		#<query><command>get</command><object>payment_card_type</object><columns>payment_card_type_id,payment_card_type</columns><sid>xiCRUbYCuNdpNLFNUMmOiCaTJzeerjpHjxZhvxaiPFoiwgLPwb</sid><where>upper(payment_card_type) like upper('%Visa%')</where><in_out_key>X8nLOUu34AtOW_7lSbuv</in_out_key></query>
		MB.Core.sendQuery
			command: 'get'
			object: 'payment_card_type'
			sid: sid
			, (cardTypes)->
				selectHtml = '<select id="chooseCardType">'
				for option in cardTypes.DATA
					selectHtml += '<option value="'+option[cardTypes.NAMES.indexOf('PAYMENT_CARD_TYPE_ID')]+'">'+option[cardTypes.NAMES.indexOf('PAYMENT_CARD_TYPE')]+'</option>'
				selectHtml += '</select>'
				bootbox.dialog
					message: selectHtml,
					title: 'Выберите тип банковской карты',
					buttons:
						ok:
							label: 'Подтвердить'
							className: ''
							callback: ->
								selectedCardType = $('#chooseCardType').select2('val')
								params.payment_card_type_id = selectedCardType
								MB.Core.sendQuery
									command: "operation"
									object: "set_order_payment_type"
									sid: sid
									params: params
									, (data) ->
										toastr[data.TOAST_TYPE](data.MESSAGE, data.TITLE)
										callback data
						cancel:
							label: 'Отмена'
							className: ''
							callback: ->
				$('#chooseCardType').select2()
	else
		MB.Core.sendQuery
			command: "operation"
			object: "set_order_payment_type"
			sid: sid
			params: params
			, (data) ->
				toastr[data.TOAST_TYPE](data.MESSAGE, data.TITLE)
				callback data
OrderPaymentClass::updateView = ()->
	_this = this;
	table: (obj) ->
		if _this.table != "no"
			$(".form_order_mini-content-wrapper").html ""
			console.log '_this', _this
			table = new MB.Table(
				world: "form_order_mini"
				name: "tbl_order_ticket_mini"
				params:
					parent:
					  type: "form"
					  activeId: _this.orderId
					  data:
					    data: [[_this.orderId]]
					    names: ["ORDER_ID"]
					# parentkeyvalue: _this.orderId
					# parentobjecttype: "form"
			)
			table.create ->


	amount: (obj,first) ->
		if first==undefined
			Id = _this.orderId  if Id is `undefined` or Id is ""
			MB.Core.sendQuery
				command: "get"
				object: "order"
				sid: sid
				params:
					where: "ORDER_ID = " + Id
				, (data) ->
					totalOrderAmount = data["DATA"][0][data["NAMES"].indexOf("TOTAL_ORDER_AMOUNT")]
					$(".formOrderMini").find("input").each ->
						val = data["DATA"][0][data["NAMES"].indexOf($(this).attr("name"))]
						log val
						$(this).val val  unless val is 0
						orderObjversion = data["DATA"][0][data["NAMES"].indexOf("OBJVERSION")]
						$("[name=OBJVERSION]").val orderObjversion
	all: (obj) ->
		@table obj
		@amount obj

	db: (Id, callback) ->
		Id = _this.orderId  if Id is `undefined` or Id is ""
		MB.Core.sendQuery
			command: "get"
			object: "order"
			sid: sid
			params:
				where: "ORDER_ID = " + Id
			, (data) ->
				_this.updateView().table data
				_this.updateView().amount data
				$(".StrOrderAmount").find("input").each ->
					key = $(this).attr("name") 
					val = data["DATA"][0][data["NAMES"].indexOf(key)]
					$("[name="+$(this).attr("name")+"]").val val
				if parseInt(data["DATA"][0][data["NAMES"].indexOf("TOTAL_ORDER_AMOUNT")]) is 0
					$(".formOrderMini").find("input").each ->
						$(this).val ""
					_this.ButtonsState "off"
				callback data  if callback isnt `undefined` and typeof callback is "function"

OrderPaymentClass::handlerOrderAmount = (obj) ->
	obj = MB.Core.jsonToObj(obj)
	_this = this
	ButtonsState = this.ButtonsState
	# orderId = obj["DATA"][0][obj["NAMES"].indexOf("ORDER_ID")]
	orderId = _this.orderId
	totalOrderAmount = obj[0]["TOTAL_ORDER_AMOUNT"]
	orderObjversion = obj[0]["OBJVERSION"]
	$("[name=OBJVERSION]").val orderObjversion
	$(".formOrderMini .btn").click ->      
		$(".formOrderMini").find("input:not([name='OBJVERSION'])").each ->
			$(this).val ""
		selector = $(this).attr("id").replace("btnOrderAmount_", "") + "_AMOUNT"
		$("[name=" + selector + "]").val totalOrderAmount
		ButtonsState "off"
		_this.sendAmount $(this), orderId, (result) ->
			_this.updateView().amount result
			$('.form_order-item .reload, .form_order_mini-item .reload').click()
			ButtonsState "on"
	$(".formOrderMini input").blur ->
		ButtonsState "off"
		_this.sendAmount $(this), orderId, (result) ->
			_this.updateView().amount result
			ButtonsState "on"

OrderPaymentClass::renderOrderPaymentType = (obj) ->
	# Мест <input name='PLACES_COUNT' value=''+obj[0]['PLACES_COUNT']+ '' size='3' disabled/>
	# билетов <input name='TICKETS_COUNT' value=''+obj[0]['TICKETS_COUNT']+ '' size='3' disabled/>
	# на сумму <input name='TOTAL_ORDER_AMOUNT' value=''+obj[0]['TOTAL_ORDER_AMOUNT']+'' size='8' disabled class='' />
	# <input name='TOTAL_TO_PAY_ORDER_AMOUNT' value=''+obj[0]['TOTAL_TO_PAY_ORDER_AMOUNT']+'' size='8' disabled style='color:red' />

	#<form class='formOrderMini' role='form'>
	#<div class='form-group'>
	#<div class='left'>
	#<div id='btnOrderAmount_CASH' class='btn blue pull-left btnOrderAmount'><i class='fa fa-money'></i> </div>
	#<div class='pull-left text'>Оплата наличными</div>
	#</div>
	#<input type='text' class='pull-left' id='' name='CASH_AMOUNT' placeholder='0' size='9'>
	#<div class='clearfix'></div>
	#</div>
	#<div class='form-group'>
	#<div class='left'>
	#<div id='btnOrderAmount_CARD' class='btn blue pull-left btnOrderAmount'><i class='fa fa-credit-card'></i> </div>
	#<div class='pull-left text'>Оплата банковской картой</div>
	#</div>
	#<input type='text' class='pull-left' id='' name='CARD_AMOUNT' placeholder='0' size='9'>
	#<div class='clearfix'></div>
	#</div>
	#<div class='form-group'>
	#<div class='left'>
	#<div id='btnOrderAmount_GIFT_CARD' class='btn blue pull-left btnOrderAmount'><i class='fa fa-gift'></i> </div>
	#<div class='pull-left text'>Оплата подарочной картой</div>
	#</div>
	#<input type='text' class='pull-left' id='' name='GIFT_CARD_AMOUNT' placeholder='0' size='9'>
	#<div class='clearfix'></div>
	#</div>
	#</form>

	#Мест <input name="PLACES_COUNT" value="'+obj[0]["PLACES_COUNT"]+ '" size="3" disabled/>
	#билетов <input name="TICKETS_COUNT" value="'+obj[0]["TICKETS_COUNT"]+ '" size="3" disabled/>
	#на сумму <input name="TOTAL_ORDER_AMOUNT" value="'+obj[0]['TOTAL_ORDER_AMOUNT']+'" size="8" disabled class="" />
	#<input name="TOTAL_TO_PAY_ORDER_AMOUNT" value="'+obj[0]['TOTAL_TO_PAY_ORDER_AMOUNT']+'" size="8" disabled style="color:red" />
	# 	</div>
	#<form class="formOrderMini" role="form">
	#<div class="form-group">
	#<div class="left">
	#<div id="btnOrderAmount_CASH" class="btn blue pull-left btnOrderAmount"><i class="fa fa-money"></i> </div>
	#<div class="pull-left text">Оплата наличными</div>
	#</div>
	#<input type="text" class="pull-left" id="" name="CASH_AMOUNT" placeholder="0" size="9">
	#<div class="clearfix"></div>
	#</div>
	#<div class="form-group">
	#<div class="left">
	#<div id="btnOrderAmount_CARD" class="btn blue pull-left btnOrderAmount"><i class="fa fa-credit-card"></i> </div>
	#<div class="pull-left text">Оплата банковской картой</div>
	#</div>
	#<input type="text" class="pull-left" id="" name="CARD_AMOUNT" placeholder="0" size="9">
	#<div class="clearfix"></div>
	#</div>
	#<div class="form-group">
	#<div class="left">
	#<div id="btnOrderAmount_GIFT_CARD" class="btn blue pull-left btnOrderAmount"><i class="fa fa-gift"></i> </div>
	#<div class="pull-left text">Оплата подарочной картой</div>
	#</div>
	#<input type="text" class="pull-left" id="" name="GIFT_CARD_AMOUNT" placeholder="0" size="9">
	#<div class="clearfix"></div>
	#</div>
	#</form>

	obj = MB.Core.jsonToObj(obj);
	html = "
	<form class='formOrderMini' role='form'>
	<div class='row'>
		<div class='col-md-8'>
			<div class='form_order_mini-content-wrapper'></div>
		</div>
		<div class='col-md-4 pull-right'>
			<div class='StrOrderAmount'>

				<div class='row'>
					<div class='col-md-12'>
						<div class='col-md-6'>
							<label class='wid100pr'>Мест
								<input class='col-md-12' name='PLACES_COUNT' value='#{obj[0].PLACES_COUNT}' size='3' disabled/>
							 </label>
						</div>

						<div class='col-md-6'>
							<label class='wid100pr'>билетов
								<input class='col-md-12' name='TICKETS_COUNT' value='#{obj[0].TICKETS_COUNT}' size='3' disabled/>
							 </label>
						</div>
					</div>

					<div class='col-md-12'>
						<div class='col-md-6'>
							<label class='wid100pr'>На сумму
								<input class='col-md-12' name='TOTAL_ORDER_AMOUNT' value='#{obj[0].TOTAL_ORDER_AMOUNT}' size='8' disabled/>
							 </label>
						</div>

						<div class='col-md-6'>
							<label class='wid100pr'>&nbsp;
								<input class='col-md-12 hiddenImp' name='TOTAL_TO_PAY_ORDER_AMOUNT' value='#{obj[0].TOTAL_TO_PAY_ORDER_AMOUNT}' size='8' disabled/>
							 </label>
						</div>
					</div>

					<div class='col-md-12 marBot20'>
						<div class='col-md-6'>
							<button type='button' class='wid100pr btn btn-default newStyle clickButton' id='btnOrderAmount_CASH'><i class='fa fa-money'></i>&nbsp;&nbsp;<div class='textUp'>Наличными</div></button>
						</div>
						<div class='col-md-6'>
							<button type='button' class='wid100pr btn btn-default newStyle deSelect clickButton' id='btnOrderAmount_CARD'><i class='fa fa-credit-card'></i>&nbsp;&nbsp;<div class='textUp'>Картой</div></button>
						</div>
					</div>

				</div>
			</div>



		<input type='hidden' name='OBJVERSION'/>
		</div>
		</div>
	</form>"
	html
OrderPaymentClass::renderOrderPaymentTypeForm = (obj)->
	obj = MB.Core.jsonToObj(obj);
	html = "
	<form class='formOrderMini' role='form'>
	<div>
	<div class='StrOrderAmount'>
	<div class='row'>
	<div class='col-md-12'>
	<div class='col-md-6'>
	<label class='wid100pr'>Мест
	<input class='col-md-12' name='PLACES_COUNT' value='#{obj[0].PLACES_COUNT}' size='3' disabled/>
	</label>
	</div>

	<div class='col-md-6'>
	<label class='wid100pr'>билетов
	<input class='col-md-12' name='TICKETS_COUNT' value='#{obj[0].TICKETS_COUNT}' size='3' disabled/>
	</label>
	</div>
	</div>

	<div class='col-md-12'>
	<div class='col-md-6'>
	<label class='wid100pr'>На сумму
	<input class='col-md-12' name='TOTAL_ORDER_AMOUNT' value='#{obj[0].TOTAL_ORDER_AMOUNT}' size='8' disabled/>
	</label>
	</div>

	<div class='col-md-6'>
	<label class='wid100pr'>&nbsp;
	<input class='col-md-12 hiddenImp' name='TOTAL_TO_PAY_ORDER_AMOUNT' value='#{obj[0].TOTAL_TO_PAY_ORDER_AMOUNT}' size='8' disabled/>
	</label>
	</div>
	</div>

	<div class='col-md-12'>
	<div class='col-md-6'>
	<button type='button' class='wid100pr btn btn-default newStyle clickButton' id='btnOrderAmount_CASH'><i class='fa fa-money'></i>&nbsp;&nbsp;<div class='textUp'>Наличными</div></button>
	</div>
	<div class='col-md-6'>
	<button type='button' class='wid100pr btn btn-default newStyle deSelect clickButton' id='btnOrderAmount_CARD'><i class='fa fa-credit-card'></i>&nbsp;&nbsp;<div class='textUp'>Картой</div></button>
	</div>
	</div>
	</div>


		<input type='hidden' name='OBJVERSION'/>
		</div>
	</form>"
	html

MB.OrderPaymentClass = OrderPaymentClass

