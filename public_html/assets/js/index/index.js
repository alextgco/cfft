String.prototype.replaceAll = function (search, replace) {
	return this.split(search).join(replace);
};


$(document).ready(function () {
	(function () {
		var hDD = $('.headerDD');

		var headerDDClass = {
			setPosition: function (item) {
				var pos = item.data('position');
				var content = item.find('.hDDcontent');
				var itemWidth = item.data('width');
				item.attr('style', pos + ':0;');
				//item.css(pos, 0);
				content.css('marginRight', -itemWidth + 'px');
				//item.css('width', itemWidth+'px');
			},
			initHandlers: function (item) {
				var parent = item.data('parent'),
					owners = $('[data-owner=' + parent + ']'),
					pos = item.data('position'),
					itemWidth = item.data('width'),
					close = item.find('.closehDD'),
					lgout = item.find('.logout'),
					content = item.find('.hDDcontent'),
					closeItem = function () {
						item.hide(400);
						content.animate({
							marginRight: -itemWidth + 'px'
						}, 300);
						item.animate({
							width: 0
						}, 400, 'easeOutCubic');
						return false;
					};


				owners.each(function (index, ownerItem) {
					$(ownerItem).on('click', function () {
						item.show(0);
						content.animate({
							marginRight: 0
						}, 500);
						item.animate({
							width: itemWidth + 'px'
						}, 400, 'easeOutCubic');

					});
				});

				close.on('click', closeItem);
				lgout.on('click', closeItem);
			}
		};

		for (var i in hDD) {
			headerDDClass.setPosition(hDD.eq(i));
			headerDDClass.initHandlers(hDD.eq(i));
		}

	}());

	$('#logo').off('click').on('click', function () {
		document.location.reload();
	});

	$('#call_print_stack').off('click').on('click', function () {
		var contentId = MB.Core.guid();
		var content = new MB.ContentNew({
			id: contentId,
			filename: 'printStack',
			params: {
				activeId: 'activeId',
				label: 'Процесс печати',
				title: 'Процесс печати'
			}
		});
		content.create();
	});

    $('.incQuotaCtrl').off('click').on('click', function(){
        MB.Core.switchModal({
            type: "content",
            filename: "get_quota",
            isNew: 'true',
            params: {
                title: 'Полчение квоты',
                label: 'Полчение квоты'
            }
        });
    });


//    MB.Core.searchSelectID = MB.Core.guid();
//    var searchSelectInstance = MB.Core.select3.init({
//        id: MB.Core.searchSelectID,
//        wrapper: $('#search'),
//        getString: 'main_search',
//        column_name: '',
//        view_name: 'main_search',
//        value: {
//            id: '',
//            name: ''
//        },
//        data: [],
//        fromServerIdString: '',
//        fromServerNameString: '',
//        searchKeyword: 'SEARCH_FIELD',
//        withEmptyValue: true,
//        absolutePosition: true,
//        isFilter: false
//    });


	MB.Core.resizeWindows = function() {
		var headerH = $('.header').eq(0).outerHeight();
		var footerH = $('#mw-footerPanel').outerHeight();
		var winH = $(window).height();
		$('#mainMenu').height(winH - (headerH + footerH) + 'px');
		$('#fixHeightContent').height(winH - (headerH + footerH) + 'px');
	};

	MB.Core.resizeWindows();
	$(window).resize(function () {
		MB.Core.resizeWindows();
	});


	(function () {

		var afisha = {
			init: function () {
				afisha.getData(function () {
					afisha.renderAfisha(function () {
						afisha.setHandlers(function () {

						});
					});
				});
			},
			getData: function (callback) {
				var o = {
					command: 'get',
					object: 'actions_for_sale'
				};
				socketQuery(o, function (res) {
					res = JSON.parse(res);
					console.log(res);
					afisha.data = jsonToObj(res['results'][0]);
					console.log(res);
					if (typeof callback == 'function') {
						callback();
					}
				});

			},
			resize: function () {
				afisha.innerBlocks.each(function (index, elem) {
					console.log(elem);
					$(elem).width($(elem).outerHeight() + 'px');
				});
			},
			renderAfisha: function (callback) {
				var colWidth = ($(window).width() >= 1600) ? 'col-md-4' : 'col-md-6';
				var tpl = '<div class="row afisha-wrapper">{{#actions}}' +
					'<div class="' + colWidth + ' afisha-item" data-id="{{id}}" data-hall="{{hall}}" data-action_with_date="{{action_with_date}}">' +
					'<div class="afisha-item-wrapper">' +
					'<div class="afisha-item-image-wrapper" style="background-image: url(\'{{poster}}\')"></div>' +
					'<div class="afisha-item-top-bar">' +
					'<div class="afisha-item-datetime">{{datetime}}</div>' +
					'<div class="afisha-item-hall">{{hall}}</div>' +
					'<div class="afisha-item-age">{{age_category}}</div>' +
					'</div>' +
					'<div class="afisha-item-title-bar">{{title}}<div class="afisha-item-fpc">Свободных мест: {{free_place_count}}</div></div>' +
					'</div></div>{{/actions}}</div>';
				var mO = {
					actions: []
				};
				var container = $('.page-content-wrapper');

				for (var i in afisha.data) {
					var action = afisha.data[i];
					mO.actions.push({
						id: action['ACTION_ID'],
						poster: (action['ACTION_POSTER_IMAGE'].length > 0) ? 'upload/' + action['ACTION_POSTER_IMAGE'] : 'assets/img/afisha_default.png',
						title: action['ACTION_NAME'],
						action_with_date: action['ACTION_NAME'] + ' ' + action['ACTION_DATE_TIME'],
						datetime: action['ACTION_DATE_TIME'],
						hall: action['HALL_NAME'],
						age_category: action['AGE_CATEGORY'],
						free_place_count: action['FREE_PLACE_COUNT']
					});
				}

				container.html(Mustache.to_html(tpl, mO));
				afisha.container = container;
				afisha.items = container.find('.afisha-item');
				afisha.innerBlocks = container.find('.afisha-item-wrapper');
				if (typeof callback == 'function') {
					callback();
				}
			},
			setHandlers: function (callback) {

				afisha.items.off('click').on('click', function () {
					var actionId = $(this).data('id');
					var label = $(this).data('action_with_date') + ' | ' + $(this).data('hall');
					console.log(afisha.data);
					for (var i in afisha.data) if (afisha.data[i]['ACTION_ID'] == actionId) break;
					var isWithPlaces = afisha.data[i]['ACTION_TYPE'] != 'ACTION_WO_PLACES';
					if (isWithPlaces) {
						MB.Core.switchModal({
							type: "content",
							isNew: true,
							filename: "one_action",
							params: {
								activeId: actionId,
								action_id: actionId,
								title: label,
								label: 'Продажа',
								action_name: label
							}
						});
					} else {
						var o = {
							command: 'get',
							object: 'action_scheme_ticket_zone',
							params: {
								where: 'action_id = ' + actionId
							}
						};
						socketQuery(o, function (res) {
							res = JSON.parse(res);
							res = res['results'][0];

							var n = res.data_columns;
							console.log(n)
							var d = res.data;
							var tpl = '{{#zones}}<div data-id="{{id}}" class="row marTop10 wp-zone-item"><div class="col-md-12"><div class="form-group"><label class="control-label">{{label}} (Осталось билетов: {{max}} стоимость: {{price}})</label><input max="{{max}}" min="0" class="col-md-6 form-control orderTicketCount marTop5" type="number" value=""/></div></div></div>{{/zones}}';
							var mo = {
								zones: []
							};
							for (var i in d) {
								var it = d[i];
								var to = {
									id: it[n.indexOf('ACTION_SCHEME_TICKET_ZONE_ID')],
									label: it[n.indexOf('NAME')],
									max: it[n.indexOf('FREE_TICKET_COUNT')],
									price: it[n.indexOf('TICKET_PRICE')]
								};
								mo.zones.push(to);
							}
							var me = bootbox.dialog({
								title: 'Выберите входные билеты',
								message: ' ' + Mustache.to_html(tpl, mo),
								buttons: {
									ok: {
										label: "Ок",
										className: "blue",
										callback: function () {
											var o = {
												command: 'operation',
												object: 'create_to_pay_order_without_places',
												action_id: actionId
											}, cnt = 1;
											for (var i = 0; i < $('.wp-zone-item .orderTicketCount').length; i++) {
												var r = $('.wp-zone-item').eq(i);
												var id = r.data('id');
												var val = r.find('.orderTicketCount').val();
												if (!val) continue;
												o['action_scheme_ticket_zone_id_' + cnt] = id;
												o['ticket_count_' + cnt] = val;
												cnt++;
											}
											socketQuery(o, function (res) {
												res = JSON.parse(res).results[0];
												toastr[res.toastr.type](res.toastr.message, res.toastr.title);
												console.log(res);

												if (res.code != '0') return false;
												me.modal('hide');
												var formId = MB.Core.guid();
												var form = new MB.FormN({
													id: formId,
													name: 'form_order',
													type: 'form',
													ids: [res.order_id]
												});
												form.create();
											});
											return false;
										}
									},
									cancel: {
										label: "Отмена",
										className: "blue",
										callback: function () {
										}
									}
								}
							});
						});
					}
				});

				if (typeof callback == 'function') {
					callback();
				}
			}
		};

		afisha.init();
		MB.Core.afisha = afisha;
	}());

	(function () {
		socketQuery({
			command: 'get',
			object: 'user',
			params: {
				where: "login= '" + MB.User.username + "'"
			}
		}, function (res) {
			res = JSON.parse(res);
			res = res['results'][0];
			res = jsonToObj(res);

			console.log(res);

			MB.User.fullname = res[0]['FULLNAME'];
			//MB.User.photo = res['PHOTO'];
			$('.userName').html(MB.User.fullname);
		});
	}());

	(function () {
		var searchWrapper = $("#search"), //mainSearch / main search
			searchInput = searchWrapper.find('input'),
			resultsWrapper = searchWrapper.find('.resultsWrapper'),
			ul = resultsWrapper.find('.resultsList'),
			hint = resultsWrapper.find('.resultsHint'),
			defaultHint = 'Введите ещё хотя бы <span>2</span> символа';

		searchInput.on('input', function () {
			var t = $(this),
				val = t.val(),
				a = (val.length) ? '' : 'а';
			if (val.length < 2) {
				ul.empty();
				hint.html('Введите ещё хотя бы <span>' + (2 - val.length) + '</span> символ' + a).show();
				return;
			}
			socketQuery({
				command: 'get',
				object: 'main_search',
				params: {
					search_string: val
				}
			}, function (res) {
				res = JSON.parse(res).results[0];
				if (val == t.val()) showResults(res);
			});
			hint.html('').hide();
		}).on('focus', function () {
			hint.html(defaultHint).hide();
			resultsWrapper.fadeIn(150);
		});

		searchWrapper.on('click', function (e) {
			e.stopPropagation();
		});

		$(document).on('click', function (e) {
			if (!$(this).parents('#search').length) {
				hideResults();
			}
		});

		ul.on('click', 'li', function () {
			var form = new MB.FormN({
				id: MB.Core.guid(),
				name: $(this).attr('data-form'),
				type: 'form',
				ids: [$(this).attr('data-id')]
			});
			form.create(function () {
				hideResults();
			});
		});

		function showResults(obj) {
			var results = '';
			if (!obj.data.length) {
				ul.html('<li>Ничего не найдено</li>');
				return;
			}
			var objId = obj.data_columns.indexOf("OBJ_ID"),
				info = obj.data_columns.indexOf("INFO"),
				openFormClientObject = obj.data_columns.indexOf("OPEN_FORM_CLIENT_OBJECT");
			for (var i in obj.data) {
				results += '<li data-id="' + obj.data[i][objId] + '" data-form="' + obj.data[i][openFormClientObject] + '">' + obj.data[i][info] + '</li>';
			}
			ul.html(results);
		}

		function hideResults() {
			resultsWrapper.fadeOut(150);
			ul.empty();
			searchInput.val('');
		}

		$('#mainPanel .clientScreenCtrl').on('click', function () {
			toClientscreen({type:"list"});
		});
	}());
});
