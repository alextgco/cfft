var parentBlock = $('#clientScreen');

var clientScreen = {
	data: {},
	title: 'Мероприятия',
	fromDate: getDateString(new Date()),
	toDate: '01.01.2060',
	bgColor: '#131313',
	lastHighlighted: '',
	afishaTemplate: '<div id="clientScreenInner">' +
	'<div id="clientScreenTitle">Мероприятия <span id="fromToRange"></span></div>' +
	'<div id="clientScreenContent">' +
	'<ul id="clientScreenActionsList">' +
	'{{#actions}}<li data-action-id="{{action_id}}" class="actionItemParent">' +
	'<div class="actionItemHeader">' +
	'<div class="actionItemShortDate"><div class="dayMth"><div class="bigDay">{{day}}</div>{{mth}}</div></div>' +
	'<div class="actionItemTitle dark"><div class="innerHeightBlock"></div><div class="titleInner">{{title}}</div></div>' +
	'</div>' +
	'<div class="actionItemContent">' +
	'<img class="actionItemImage" src="{{image}}">' +
	'<div class="actionItemHall">{{hall}}</div>' +
	'<div class="actionItemTime">{{time}}</div>' +
	'</div>' +
	'</li>{{/actions}}' +
	'</ul>' +
	'<div id="clientScreenForMap"></div>' +
	'</div>' +
	'<div id="clientScreenFooter">' +
	'<div class="pr70">' +
	'<ul id="placesInfo" class="newUl selectable hoverable"></ul>' +
	'</div>' +
	'<div class="pr30">' +
	'<div id="totalSumm">64 800.00 руб.</div>' +
	'</div>' +
	'</div>' +
	'</div>',

	orderTemplate: '<div id="clientScreenModalPlace"><div id="orderTpl-wrapper">' +
	'<div id="orderTpl-inner">' +
	'<div class="orderTpl-header">{{title}}</div>' +
	'<div class="orderTpl-content">' +
	'<ul class="orderTpl-tickets">' +
	'{{#tickets}}' +
	'<li>' +
	'<div class="action_name_date">{{action_name_date}}</div>' +
	'<div class="zone">{{zone}}</div>' +
	'<div class="rowName">{{rowName}}</div>' +
	'<div class="row">{{row}}</div>' +
	'<div class="placeName">{{placeName}}</div>' +
	'<div class="place">{{place}}</div>' +
	'<div class="price"><span class="bold">{{price}}</span> руб.</div>' +
	'</li>' +
	'{{/tickets}}' +
	'</ul>' +
	'</div>' +
	'<div class="orderTpl-footer">' +
	'Итого: {{total}} руб.' +
	'</div>' +
	'</div>' +
	'</div></div>',

	getActions: function (obj, callback) {
		var fromDate = obj.fromDate || getDateString(new Date());
		var toDate = obj.toDate || '01.01.2060';
		var o = {
			command: 'get',
			object: 'actions_for_sale',
			sid: sid,
			params: {
				where: "ACTION_DATE >= to_date('" + fromDate + "', 'DD.MM.YYYY') and ACTION_DATE <= to_date('" + toDate + "', 'DD.MM.YYYY')"
			}
		};
		//console.log(MB.Core.makeQuery(o));
		socketQuery(o, function (res) {
			var data = JSON.parse(res);
			var DATA = MB.Core.jsonToObj(data['results'][0]);
			if (typeof callback === 'function') {
				callback(DATA);
			}
		});
	},
	resizeList: function () {
		var wid = $(window).width(), hei = $(window).height(), ul = $('#clientScreenActionsList'), li = ul.children();
		if (wid/hei < 0.80) {
			li.width('33.33%');
			li.height(li.eq(0).width());
		} else if (wid/hei > 1.25) {
			li.width('20%');
			li.height(li.eq(0).width());
		} else {
			li.width('25%');
			li.height(li.eq(0).width());
		}
		var inner = $('#clientScreenInner');
		var  availHeight = hei - parseInt(inner.css('margin-top')) - parseInt(inner.css('margin-bottom')) - $('#clientScreenTitle').outerHeight();

		ul.height(li.eq(0).height() * parseInt(availHeight / li.eq(0).height()));
		console.log(inner.innerHeight())
		var he = (hei - inner.innerHeight())/2;
		he = (he - 20 > 19)? he - 20 : he;
		inner.css('margin-top', he+'px');
	},
	resizeModal: function () {
		var hei = $(window).height(), modalWrapper = $('#clientScreenModalPlace');
		var he = (hei - modalWrapper.innerHeight())/2;
		he = (he - 80 > 19)? he - 80 : he;
		modalWrapper.css('margin-top', he+'px');
	},
	renderAfisha: function (data) {
		var dataToRender = {
			actions: []
		};
		for (var i in data) {
			var item = data[i];
			var tmpObj = {};
			tmpObj.date = item['ACTION_DATE_TIME'];
			tmpObj.short_date = item['ACTION_DATE_TIME'];
			tmpObj.day = revertDateString(item['ACTION_DATE_TIME']).day;
			tmpObj.mth = revertDateString(item['ACTION_DATE_TIME']).mth;
			tmpObj.year = revertDateString(item['ACTION_DATE_TIME']).year;
			tmpObj.action_id = item['ACTION_ID'];
			tmpObj.title = item['ACTION_NAME'];
			tmpObj.image = (item['ACTION_POSTER_IMAGE']) ? '/upload/' + item['ACTION_POSTER_IMAGE'] : '/upload/default.jpg';
			tmpObj.hall = item['HALL_NAME'];
			tmpObj.time = item['TIME'];
			dataToRender.actions.push(tmpObj);
		}
		console.log('renderAfisha');
		parentBlock.html(Mustache.render(this.afishaTemplate, dataToRender));
		this.resizeList();

	},
	showAfisha: function (obj) {
		var self = this;
		this.getActions(obj, function (data) {
			self.renderAfisha(data);
		});
	},
    showHall: function (obj) {
		this.lastHighlighted = '';
		var actionId = obj.id;
		console.log('renderHall');
        one_action_map = new Map1({
			container: parentBlock,
            cWidth: $(window).width(),
            cHeight: $(window).height(),
            navWideSide: 0,
            navNarrowSide: 0,
            mode: "client_screen",
            doc_root:'../',
			resizeListen: true
		});

		var socketObject = {
			sid: sid,
			type: "action_scheme",
			param: "action_id",
            id: actionId,
			portion: 30,
			save: {
				command: "operation",
				object: "block_place_list",
                params: {
                    action_id: actionId
                },
				field_name: "action_scheme_id"
			},
			load: {
				command: "get",
                object: "action_scheme",
				params: {
                    action_id: actionId
				},
				columns: "ACTION_SCHEME_ID,PRICE,STATUS,STATUS_TEXT,FUND_GROUP_NAME,PRICE_GROUP_NAME,BLOCK_COLOR,COLOR",
				field_name: "action_scheme_id"
			}
		};
		var squareO = {
			command: "get",
            object: "action_scheme",
			sid: sid,
			params: {
                action_id: actionId
			}
		};
		var layerO = {
			command: "get",
			object: "action_scheme_layer",
			sid: sid,
			params: {
                action_id: actionId,
                /*where: "ACTION_ID = " + environment.action_id + " and VISIBLE_CASHER='TRUE'",*/
                where: " VISIBLE_CLIENT_SCREEN='TRUE'",
                /*columns: "ACTION_SCHEME_LAYER_ID",*/
				order_by: "SORT_NO"
			}
		};
		var objectO = {
			command: "get",
			object: "action_scheme_object",
			sid: sid,
			where_field: "ACTION_SCHEME_LAYER_ID",
			params: {
                action_id: actionId,
				/*columns:"ACTION_SCHEME_OBJECT_ID,OBJECT_TYPE,OBJECT_TYPE,ROTATION,FONT_FAMILY,FONT_SIZE,FONT_STYLE,FONT_WIEGH,COLOR,X,Y,BACKGROUND_URL_SCALE,BACKGROUND_URL_ORIGINAL,BACKGROUND_COLOR",*/
				order_by: "SORT_NO"
			}
		};
        one_action_map.openSocket(socketObject);
        one_action_map.loadSquares(squareO, function () {
            one_action_map.loadRenderItems({
				layerO: layerO,
				objectO: objectO
			}, function () {
                one_action_map.render();
			});
            //one_action_map.loadObjects(o2,function(){
            one_action_map.setLayout(function () {
                one_action_map.setMinMax(function () {
                    one_action_map.setScaleCoff(function () {
                        one_action_map.render(function () {
                            /*one_action_map.reLoadLayout(function () {
                            });*/
							});
                        //one_action_map.setEvents();
						});
					});
				});
			});
	},
	highlight: function (obj) {
		var squaresInPrice;
		if (this.lastHighlighted == obj.priceGrpId) {
			if (window.interval) clearInterval(window.interval);
			for (var lig in one_action_map.squares) {
				if (one_action_map.squares[lig].lighted_now != undefined) {
					one_action_map.squares[lig].lighted_now = false;
				}
			}
			one_action_map.render();
			this.lastHighlighted = '';
		} else {

			if (window.interval) clearInterval(window.interval);

			if (one_action_map.shiftState == 17) {

			} else {
				squaresInPrice = [];
				for (var lig in one_action_map.squares) {
					if (!one_action_map.squares[lig].lighted_now) one_action_map.squares[lig].lighted_now = false;
					one_action_map.squares[lig].lighted_now = false;
				}
			}


			for (var sq in one_action_map.squares) {
				var sqItem = one_action_map.squares[sq];
				if (sqItem.priceGroup == obj.priceGrpId) {
					if (sqItem.status != 0) {
						squaresInPrice.push(sqItem.id);

					}
				}
			}


			var inter = 0;
			window.interval = window.setInterval(function () {

				for (var ligInt in squaresInPrice) {
					var ligItem = squaresInPrice[ligInt];
					if (!one_action_map.squares[ligItem].lighted_now) one_action_map.squares[ligItem].lighted_now = false;

					if (inter % 2 == 0) {
						one_action_map.squares[ligItem].lighted_now = true;
					} else {
						one_action_map.squares[ligItem].lighted_now = false;
					}
				}
				inter++;
				one_action_map.render();
			}, 400);
			this.lastHighlighted = obj.priceGrpId;
		}
		},
	showOrder: function (obj) {
		console.log('showOrder');
		socketQuery({
			command: 'get',
			object: 'order',
			params: {
				where: 'ORDER_ID='+obj.id
			}
		}, function (res) {
			var order = JSON.parse(res).results[0];
			socketQuery({
				command: 'get',
				object: 'order_ticket',
				params: {
					where: 'ORDER_ID='+obj.id
				}
			}, function (res) {
				var tickets = JSON.parse(res).results[0];
				var orderNames = order.data_columns;
				var ticketsNames = tickets.data_columns;
				console.log(tickets, order);
				var renderObj = {
					title: 'Заказ № ' + obj.id,
					tickets: [],
					total: order.data[0][orderNames.indexOf('TOTAL_ORDER_AMOUNT')]
				};
				for (var i in tickets.data) {
					var item = tickets.data[i];
					if (item[ticketsNames.indexOf('STATUS')] != 'TO_PAY' && item[ticketsNames.indexOf('STATUS')] != 'RESERVED') {
						continue;
					}
					var iRowName = item[ticketsNames.indexOf('LINE_TITLE')],
						iRow = item[ticketsNames.indexOf('LINE')],
						iPlaceName = item[ticketsNames.indexOf('PLACE_TITLE')],
						iPlace = item[ticketsNames.indexOf('PLACE')];

					if (iRow == '-' && iPlace == '-') {
						iRow = iRowName = iPlace = iPlaceName = '';
					}

					var tmpObj = {
						action_name_date: item[ticketsNames.indexOf('ACTION')],
						zone: item[ticketsNames.indexOf('AREA_GROUP')] || 'Сектор не указан',
						rowName: iRowName,
						row: iRow,
						placeName: iPlaceName,
						place: iPlace,
						price: item[ticketsNames.indexOf('PRICE')]
					};
					renderObj.tickets.push(tmpObj);
				}
				parentBlock.html(Mustache.render(clientScreen.orderTemplate, renderObj));
				clientScreen.resizeModal();
			});
		});
	},
	clearAll: function () {
		parentBlock.empty();
	}
};



/*

var CScreen = function (params) {
	this.id = params.id || MB.Core.guid();
	this.data = params.data || {};
	this.title = params.title || 'Мероприятия';
	this.fromDate = params.fromDate || getDateString(new Date());
	this.toDate = params.toDate || '01.01.2060';
	this.actionId = params.actionId || undefined;
	this.order = params.order || undefined;
	this.bgColor = params.bgColor || '#131313';
	this.afishaTemplate = '{{#actions}}<li data-action-id="{{action_id}}" class="actionItemParent">' +
	'<div class="actionItemHeader">' +
	'<div class="actionItemShortDate"><div class="dayMth"><div class="bigDay">{{day}}</div>{{mth}}</div></div>' +
	'<div class="actionItemTitle dark"><div class="innerHeightBlock"></div><div class="titleInner">{{title}}</div></div>' +
	'</div>' +
	'<div class="actionItemContent">' +
	'<img class="actionItemImage" src="{{image}}">' +
	'<div class="actionItemHall">{{hall}}</div>' +
	'<div class="actionItemTime">{{time}}</div>' +
	'</div>' +
	'</li>{{/actions}}';
	this.orderTemplate = '<div id="orderTpl-wrapper">' +
	'<div id="orderTpl-inner">' +
	'<div class="orderTpl-header">{{title}}</div>' +
	'<div class="orderTpl-content">' +
	'<ul class="orderTpl-tickets">' +
	'{{#tickets}}' +
	'<li>' +
	'<div class="action_name_date">{{action_name_date}}</div>' +
	'<div class="zone">{{zone}}</div>' +
	'<div class="rowName">{{rowName}}</div>' +
	'<div class="row">{{row}}</div>' +
	'<div class="placeName">{{placeName}}</div>' +
	'<div class="place">{{place}}</div>' +
	'<div class="price"><span class="bold">{{price}}</span> руб.</div>' +
	'</li>' +
	'{{/tickets}}' +
	'</ul>' +
	'</div>' +
	'<div class="orderTpl-footer">' +
	'Итого: {{total}} руб.' +
	'</div>' +
	'</div>' +
	'</div>'
};

CScreen.prototype.clearScreen = function () {

};
CScreen.prototype.renderHall = function () {
	var _t = this;

	function getTitleByActionId(action_id, callback) {
		var o = {
			command: 'get',
			object: 'action_active',
            sid: MB.User.sid,
			params: {
				where: 'ACTION_ID = ' + action_id
			}
		};
		MB.Core.sendQuery(o, function (res) {
			var name = res.DATA[0][res.NAMES.indexOf('NAME')];
			var dateTime = res.DATA[0][res.NAMES.indexOf('ACTION_DATE_TIME')];
			var hall = res.DATA[0][res.NAMES.indexOf('HALL')];
			var result = name + ' ' + dateTime + ' | ' + hall;
			if (typeof callback == 'function') {
				callback(result);
			}
		});
	}

    blocks.content.css('overflow', 'hidden');
    var w = $(window).width()-40;
    var h = $(window).height()-108;
    var w70 = w -17 - w*3/10;
	getTitleByActionId(_t.actionId, function (result) {
		blocks.title.html(result);
	});
	blocks.actionsList.html('');
	clientScreenMap = new Map1({
		container: $("#clientScreenForMap"),
		cWidth: w,
		cHeight: h,
		doc_root: MB.Core.doc_root,
		bgColor: "#131313",
		mode: "client_screen"
	});

	var socketObject = {
		sid: sid,
		type: "action_scheme",
		param: "action_id",
		id: _t.actionId,
		portion: 30,
		save: {
			command: "operation",
			object: "block_place_list",
			field_name: "action_scheme_id"
		},
		load: {
			command: "get",
			object: "action_scheme_for_clientscreen",
			params: {
				action_id: _t.actionId
			},
			columns: "ACTION_SCHEME_ID,PRICE,STATUS,STATUS_TEXT,FUND_GROUP_NAME,PRICE_GROUP_NAME,BLOCK_COLOR,COLOR",
			field_name: "action_scheme_id"
		}
	};



	var squareO = {
		command: "get",
		object: "action_scheme_for_clientscreen",
		sid: sid,
		params: {
			action_id: _t.actionId
		}
	};



	var layerO = {
		command: "get",
		object: "action_scheme_layer",
		sid: sid,
		params: {
			where: "ACTION_ID = " + _t.actionId + " and VISIBLE_CASHER='TRUE'",
			columns: "ACTION_SCHEME_LAYER_ID",
			order_by: "SORT_NO"
		}
	};
	var objectO = {
		command: "get",
		object: "action_scheme_object",
		sid: sid,
		where_field: "ACTION_SCHEME_LAYER_ID",
		params: {

            */
/*columns:"ACTION_SCHEME_OBJECT_ID,OBJECT_TYPE,OBJECT_TYPE,ROTATION,FONT_FAMILY,FONT_SIZE,FONT_STYLE,FONT_WIEGH,COLOR,X,Y,BACKGROUND_URL_SCALE,BACKGROUND_URL_ORIGINAL,BACKGROUND_COLOR",*//*

			order_by: "SORT_NO"
		}
	};
	clientScreenMap.openSocket(socketObject);
    $('#clientScreenContent').css('backgroudColor',_t.bgColor);
	clientScreenMap.loadSquares(squareO, function () {
		clientScreenMap.loadRenderItems({
			layerO: layerO,
			objectO: objectO
		}, function () {
			clientScreenMap.render();
		});

		//clientScreenMap.loadObjects(o2,function(){
		clientScreenMap.setLayout(function () {
			clientScreenMap.setMinMax(function () {
				clientScreenMap.setScaleCoff(function () {
					clientScreenMap.render(function () {
						clientScreenMap.reLoadLayout(function () {
							//action_price_info.load();
						});
					});

					clientScreenMap.setEvents();
				});

			});
		});
		//});

		uiTabs();
		uiUl();

	});
	blocks.modalPlace.hide(0);
	blocks.content.fadeTo(300, 1);
};
CScreen.prototype.hightlightPriceGroup = function (priceGrpId) {
	var _t = this;
	clearInterval(hlInterval);

	var squaresInGrp = [];
	for (var i in clientScreenMap.squares) {
		var sqr = clientScreenMap.squares[i];
		if (sqr.priceGroup == priceGrpId) {
			squaresInGrp.push(sqr.id);
		}
	}

	console.log(priceGrpId, clientScreenMap);

	var inter = 0;
	hlInterval = window.setInterval(function () {

		for (var ligInt in squaresInGrp) {
			var ligItem = squaresInGrp[ligInt];
			if (!clientScreenMap.squares[ligItem].lighted_now) clientScreenMap.squares[ligItem].lighted_now = false;

			if (inter % 2 == 0) {
				clientScreenMap.squares[ligItem].lighted_now = true;
			} else {
				clientScreenMap.squares[ligItem].lighted_now = false;
			}
		}
		inter++;
		clientScreenMap.render();
	}, 400);

};
CScreen.prototype.stopHightlight = function () {
	clearInterval(hlInterval);
	for (var i in clientScreenMap.squares) {
		var sqr = clientScreenMap.squares[i];
		if (sqr.lighted_now == true) {
			sqr.lighted_now = false;
		}
	}
	clientScreenMap.render();
};
CScreen.prototype.getData = function (callback) {
	var _t = this;
	var o = {
		command: 'get',
		object: 'action_for_clientscreen',
		sid: MB.User.sid,
		params: {
			where: "ACTION_DATE >= to_date('" + _t.fromDate + "', 'DD.MM.YYYY') and ACTION_DATE <= to_date('" + _t.toDate + "', 'DD.MM.YYYY')"
		}
	};

	console.log(o);

	MB.Core.sendQuery(o, function (res) {
		console.log('SC res', res);
		_t.data = res;
		if (typeof callback == 'function') {
			callback();
		}
	});
};
CScreen.prototype.renderAfisha = function () {
	var _t = this;
	var dataToRender = {
		actions: []
	};
	for (var i in _t.data.DATA) {
		var item = _t.data.DATA[i];
		var names = _t.data.NAMES;
		var tmpObj = {};
		tmpObj.date = item[names.indexOf('ACTION_DATE_TIME')];
		tmpObj.short_date = item[names.indexOf('ACTION_DATE_TIME')];
		tmpObj.day = _t.revertDateString(item[names.indexOf('ACTION_DATE_TIME')]).day;
		tmpObj.mth = _t.revertDateString(item[names.indexOf('ACTION_DATE_TIME')]).mth;
		tmpObj.year = _t.revertDateString(item[names.indexOf('ACTION_DATE_TIME')]).year;
		tmpObj.action_id = item[names.indexOf('ACTION_ID')];
		tmpObj.title = item[names.indexOf('NAME')];
		tmpObj.image = (item[names.indexOf('ACTION_POSTER_IMAGE')]) ? MB.Core.doc_root + 'upload/' + item[names.indexOf('ACTION_POSTER_IMAGE')] : MB.Core.doc_root + 'upload/default.jpg';
		tmpObj.hall = item[names.indexOf('HALL')];
		tmpObj.time = item[names.indexOf('TIME')];

		dataToRender.actions.push(tmpObj);
	}
	blocks.title.html('Мероприятия');
	blocks.modalPlace.hide(0);
	blocks.content.fadeTo(300, 1);
	blocks.mapPlace.html('');
	blocks.actionsList.html(Mustache.to_html(_t.afishaTemplate, dataToRender));

};
CScreen.prototype.renderOrder = function () {
	var _t = this;
	var order = undefined;
	var tickets = undefined;
	var orderO = {
		command: 'get',
		object: 'order',
		sid: sid,
		params: {
			where: 'ORDER_ID = ' + _t.order
		}
	};
	var ticketsO = {
		command: 'get',
		object: 'order_ticket',
		sid: sid,
		params: {
			where: 'ORDER_ID = ' + _t.order
		}
	};
	function runRenderOrder() {
		var orderNames = order.NAMES;
		var ticketsNames = tickets.NAMES;
		var renderObj = {
			title: 'Заказ № ' + _t.order,
			tickets: [],
			total: order.DATA[0][orderNames.indexOf('TOTAL_ORDER_AMOUNT')]
		};

		for (var i in tickets.DATA) {
			var item = tickets.DATA[i];
			if (item[ticketsNames.indexOf('STATUS')] != 'TO_PAY' && item[ticketsNames.indexOf('STATUS')] != 'RESERVED') {
				continue;
			}
			var tmpObj = {
				action_name_date: item[ticketsNames.indexOf('ACTION')],
				zone: item[ticketsNames.indexOf('AREA_GROUP')] || 'Сектор не указан',
				rowName: item[ticketsNames.indexOf('LINE_TITLE')] || 'Ряд',
				row: item[ticketsNames.indexOf('LINE')],
				placeName: item[ticketsNames.indexOf('PLACE_TITLE')] || 'Место',
				place: item[ticketsNames.indexOf('PLACE')],
				price: item[ticketsNames.indexOf('PRICE')]
			};
			renderObj.tickets.push(tmpObj);
		}

		blocks.modalPlace.html(Mustache.to_html(_t.orderTemplate, renderObj));
		blocks.modalPlace.show(100);
		blocks.content.fadeTo(300, 0.5);
	}
	MB.Core.sendQuery(orderO, function (res) {
		order = res;
		MB.Core.sendQuery(ticketsO, function (tRes) {
			tickets = tRes;
			runRenderOrder();
		});
	});
};
CScreen.prototype.closeOrder = function () {
	blocks.modalPlace.hide(100);
	blocks.content.fadeTo(300, 1);
};
CScreen.prototype.setHandlers = function () {

};
CScreen.prototype.sortActions = function () {
	var _t = this;
	return _t.data.DATA.reverse();
};
CScreen.prototype.revertDateString = function (str) {
	function revert(dayMthStr) {
		var months = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];
		var result = {};
		result.day = (dayMthStr.substr(0, 2).substr(0, 1) == "0") ? dayMthStr.substr(1, 1) : dayMthStr.substr(0, 2);
		result.mth = months[(+dayMthStr.substr(3, 2)) - 1];

		return result;
	}
	return {
		day: revert(str.substr(0, 5)).day,
		mth: revert(str.substr(0, 5)).mth,
		year: '`' + str.substr(8, 2)
	};
};
*/
