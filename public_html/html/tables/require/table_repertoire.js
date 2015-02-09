(function () {
	var tableNId = $('.page-content-wrapper .classicTableWrap').data('id');
	var tableInstance = MB.Tables.getTable(tableNId);
	tableInstance.ct_instance.ctxMenuData = [
		{
			name: 'option2',
			title: 'Перейти к продаже',
			disabled: function () {
				return false;
			},
			callback: function () {
				var selArr = tableInstance.ct_instance.selection;
				var act = tableInstance.data.DATA[selArr[0]];
				var names = tableInstance.data.NAMES;
				var actionId = act[names.indexOf('ACTION_ID')];

				if (act[names.indexOf("ACTION_TYPE")] !== "ACTION_WO_PLACES") {

					var field_num = names.indexOf('ACTION_NAME');
					var action_date = names.indexOf('ACTION_DATE_TIME');
					var hallIndex = names.indexOf('HALL_NAME');

					console.log('ACR', act, names);

					var action_label = act[field_num] + " " + act[action_date] + " | " + act[hallIndex];

                    MB.Core.switchModal({type:"content", isNew: true, filename:"one_action", params:{activeId:actionId ,action_id:actionId,title: action_label, label:'Продажа', action_name:action_label}});

//					MB.Core.switchModal({
//						type: "content",
//						filename: "one_action",
//						params: {action_id: actionId, title: action_label, label: 'Продажа', action_name: action_label}
//					});

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
						bootbox.dialog({
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
											if (res.code != '0') return;
											var formId = MB.Core.guid();
											var form = new MB.FormN({
												id: formId,
												name: 'form_order',
												type: 'form',
												ids: [res.order_id]
											});
											form.create(function () {
												var modal = MB.Core.modalWindows.windows.getWindow(formId);
												$(modal).on('close', function () {
													tableInstance.reload();
												});

												$(form).on('update', function () {
													tableInstance.reload();
												});
											});
										});
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
			}
		},
		{
			name: 'option1',
			title: 'Открыть в форме',
			disabled: function () {
				return false;
			},
			callback: function () {
				tableInstance.openRowInModal();
			}
		},
		{
			name: 'option3',
			title: 'Показать по зонам',
			disabled: function () {
				return true;
			},
			callback: function () {
				var selArr = tableInstance.ct_instance.selection;
			}
		}
	];
}());

//(function () {
//
//    $('.filterContainer[data-column="ACTION_DATE"] input.form-control').on('change', function(){
//        var container = $('.filterContainer[data-column="ACTION_DATE"]');
//        var from = container.find('input[data-side="start"]').val();
//        var to = container.find('input[data-side="end"]').val();
//
//        return;
//
//        function initAfisha(){
//            toClientscreen({
//                type: 'list',
//                fromDate:from,
//                toDate: to
//            });
//            if(MB.Core.cSreenWindow){
//                MB.Core.cSreenWindow.window.onbeforeunload = function(){
//                    MB.Core.cSreenWindow = undefined
//                }
//            }
//
//        }
//        if(MB.Core.cSreenWindow == undefined){
//            MB.Core.cSreenWindow = window.open(MB.Core.doc_root+"clientscreenview");
//            MB.Core.cSreenWindow.window.onload = function(){
//                window.setTimeout(function(){
//                    initAfisha();
//                }, 300);
//            }
//        }else{
//            initAfisha();
//        }
//
//    });
//
//    var instance = MB.O.tables["table_repertoire"];
//    instance.custom = function (callback) {
//        var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
//        handsontableInstance.updateSettings({contextMenu: false});
//        handsontableInstance.updateSettings({
//            contextMenu: {
//                callback: function(key, options) {
//                    var arr, data, handsontableInstance, i, value, _i, _len;
//                    if (key === "openInModal") {
//                        MB.Table.createOpenInModalContextMenuItem(instance, key, options);
//                    } else if(key === "schemeByAreagroup"){
//
//                        var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
//                        data = handsontableInstance.getData();
//                        var row_num = handsontableInstance.getSelected()[0];
//                        var actionId = instance.data.data[row_num][0];
//
//                        /*socketQuery({
//                            command: 'get',
//                            object: 'area_adrkjasldjklas',
//                            sid: MB.User.sid,
//                            params: {
//                                where: 'ACTION_ID = '+actionId
//                            }
//                        }, function(res){
//                            console.log("<><><><>",res);
//                        });*/
//
//                    } else if(key === "goToPayd"){
//                        var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
//                        data = handsontableInstance.getData();
//                        var row_num = handsontableInstance.getSelected()[0];
//                        var actionId = instance.data.data[row_num][0];
//                        if(instance.data.data[row_num][instance.data.names.indexOf("ACTION_TYPE")] !== "ACTION_WO_PLACES"){ // with places
//                            var field_num = instance.data.names.indexOf('ACTION_WITH_DATE');
//                            var hallIndex = instance.data.names.indexOf('HALL');
//                            var action_label = instance.data.data[row_num][field_num]+" | "+instance.data.data[row_num][hallIndex];
//                            MB.Core.switchModal({type:"content", filename:"one_action", params:{action_id:actionId,title: action_label, label:'Продажа', action_name:action_label}});
//                        }
//                        else // without places
//                        {
//                            var o = {
//                                command: 'get',
//                                object: 'action_scheme_ticket_zone',
//                                sid: MB.User.sid,
//                                params:{
//                                    where: 'action_id = '+instance.data.data[row_num][0]
//                                }
//                            };
//                            MB.Core.sendQuery(o, function(res){
//                                console.log('wpData', res);
//                                var n = res.NAMES;
//                                var d = res.DATA;
//                                var tpl = '{{#zones}}<div data-id="{{id}}" class="row marTop10 wp-zone-item"><div class="col-md-12"><div class="form-group"><label class="control-label">{{label}} (Осталось билетов: {{max}} стоимость: {{price}})</label><input max="{{max}}" min="0" class="col-md-6 form-control orderTicketCount marTop5" type="number" value=""/></div></div></div>{{/zones}}';
//                                var mo = {
//                                    zones: []
//                                };
//                                for(var i in d){
//                                    var it = d[i];
//                                    var to = {
//                                        id: it[n.indexOf('ACTION_SCHEME_TICKET_ZONE_ID')],
//                                        label: it[n.indexOf('NAME')],
//                                        max: it[n.indexOf('TICKET_COUNT')],
//                                        price: it[n.indexOf('TICKET_PRICE')]
//                                    };
//                                    mo.zones.push(to);
//                                }
//                                bootbox.dialog({
//                                    title: 'Выберите входные билеты',
//                                    message: Mustache.to_html(tpl, mo),
//                                    buttons: {
//                                        ok: {
//                                            label:"Ок",
//                                            className:"blue",
//                                            callback: function(){
//                                                var o = {
//                                                    command: 'operation',
//                                                    object: 'create_to_pay_order_without_places',
//                                                    sid: MB.User.sid,
//                                                    ACTION_ID: actionId
//                                                };
//                                                for(var i=0; i<$('.wp-zone-item').length; i++){
//                                                    var r = $('.wp-zone-item').eq(i);
//                                                    var id = r.data('id');
//                                                    var count = r.find('.orderTicketCount').val();
//                                                    o['action_scheme_ticket_zone_id_'+(i+1)] = id;
//                                                    o['ticket_count_'+(i+1)] = count;
//                                                }
//                                                MB.Core.sendQuery(o, function(res){
//                                                    toastr[res['TOAST_TYPE']](res['MESSAGE'], res['TITLE']);
//                                                });
//                                            }
//                                        },
//                                        cancel:{
//                                            label:"Отмена",
//                                            className:"blue",
//                                            callback: function(){
//
//                                            }
//                                        }
//                                    }
//                                });
//                            });
//
//                            return;
//
//                            console.log('данные', instance.data.data[row_num], instance.data.names.indexOf("TICKET_PRICE"), instance.data.names);
//
//                            var freePlaceCount = instance.data.data[row_num][instance.data.names.indexOf("FREE_PLACE_COUNT")];
//                            var ticketPrice = instance.data.data[row_num][instance.data.names.indexOf("TICKET_PRICE")];
//                            var actionName = instance.data.data[row_num][instance.data.names.indexOf("ACTION_WITH_DATE")];
//                            var actionHall = instance.data.data[row_num][instance.data.names.indexOf("HALL")];
//                            var html = ''+
//                            '<div class="row">'+
//                            '<div class="col-md-4"><label for="FREE_PLACE_COUNT">Мест доступно:</label></div>'+
//                            '<div class="col-md-2"><input id="FREE_PLACE_COUNT" class="form-control" name="FREE_PLACE_COUNT" value="'+freePlaceCount+'"/></div>'+
//                            '</div>'+
//                            '<div class="row">'+
//                            '<div class="col-md-4"><label for="TICKET_PRICE">Цена:</label></div>'+
//                            '<div class="col-md-2"><input id="TICKET_PRICE" class="form-control" name="TICKET_PRICE" value="'+ticketPrice+'"/></div>'+
//                            '</div>'+
//                            '<div class="row">'+
//                            '<div class="col-md-4"><label for="TICKET_COUNT">Выберите количество мест:</label></div>'+
//                            '<div class="col-md-4 input-group input-small spinner">'+
//                                '<input id="TICKET_COUNT" class="spinner-input form-control" name="TICKET_COUNT" value="1"/>'+
//                                '<div class="spinner-buttons input-group-btn btn-group-vertical">'+
//                                  '<button class="btn spinner-up btn-xs blue"><i class="fa fa-caret-up"></i></button>'+
//                                  '<button class="btn spinner-down btn-xs blue"><i class="fa fa-caret-down"></i></button>'+
//                                '</div>'+
//                            '</div>'+
//                            '</div>';
//                            var modalObj = {
//                                selector: "#portlet-config",
//                                title: "Продажа бтлетов на <b>"+actionName+"</b> зал <b>"+actionHall+"</b>",
//                                content: html,
//                                modalType: 'modal-sm',
//                                modalWidth: '50%',
//                                buttons: {
//                                    ok1: {
//                                        label:"Создать заказ ",
//                                        color:"green",
//                                        dopAttr:"",
//                                        callback: function(){
//                                            var ticket_count = $(modalObj.selector).find("#TICKET_COUNT").val();
//                                            var o = {
//                                                command: "operation",
//                                                object: "create_reserv_order_without_places",
//                                                sid: MB.User.sid,
//                                                ticket_count:ticket_count
//                                            };
//                                            o["ACTION_ID"] = actionId;
//                                            MB.Core.sendQueryForObj(o,function(data){
//                                                if(data.RC == 0){
//                                                    $(modalObj.selector).modal("hide");
//                                                    console.log('START', new Date());
//                                                    MB.Core.switchModal({type:"form",name:"form_order",ids:[data.ID]});
//                                                }
//                                            });
//                                        }
//                                    },
//                                    ok2: {
//                                        label:"Распечатать заказ",
//                                        color:"red",
//                                        dopAttr:"",
//                                        callback: function(){
//                                            var ticket_count = $(modalObj.selector).find("#TICKET_COUNT").val();
//                                            var o = {
//                                                command: "operation",
//                                                object: "create_to_pay_order_without_places",
//                                                sid: MB.User.sid,
//                                                ticket_count:ticket_count
//                                            };
//                                            o["ACTION_ID"] = actionId;
//                                            MB.Core.sendQueryForObj(o,function(data){
//                                                if(data.RC == 0){
//                                                    //$(modalObj.selector).modal("hide");
//                                                    var orderId = data.ID;
//                                                    MB.Core.sendQuery({command:"get",object:"order",sid:sid,params:{where:" ORDER_ID = "+orderId}}, function(data){
//                                                        var OrderPayment = new MB.OrderPaymentClass({orderId:orderId});
//                                                        html= OrderPayment.renderOrderPaymentType(data);
//                                                        var modalObj = {
//                                                            selector: "#portlet-config",
//                                                            title: "Печать билетов и расчет с клиентом. Заказ №<b>"+orderId+"</b>",
//                                                            content: html,
//                                                            modalType: 'modal-sm',
//                                                            modalWidth: '91%',
//                                                            buttons: {
//                                                                ok1: {
//                                                                    label:"Распечатать",
//                                                                    color:"green",
//                                                                    dopAttr:"",
//                                                                    callback: function(){
//                                                                        var o = {
//                                                                            command: "operation",
//                                                                            object: "print_order",
//                                                                            sid: MB.User.sid
//                                                                        };
//                                                                        o["ORDER_ID"] = orderId;
//                                                                        //MB.Core.sendQueryForObj(o,function(data){updaView.all(data);});
//                                                                        OrderPayment.ButtonsState("off");
//                                                                        MB.Core.sendQueryForObj(o,function(data){OrderPayment.ButtonsState("on");updaView.db(orderId);});
//                                                                    }
//                                                                },
//                                                                ok2: {
//                                                                    label:"Отменить заказ",
//                                                                    color:"red",
//                                                                    dopAttr:"",
//                                                                    callback: function(){
//                                                                        var o = {
//                                                                            command: "operation",
//                                                                            object: "cancel_order",
//                                                                            sid: MB.User.sid
//                                                                        };
//                                                                        o["ORDER_ID"] = orderId;
//                                                                        OrderPayment.ButtonsState("off");
//                                                                        MB.Core.sendQueryForObj(o,function(data){updaView.db(orderId);});
//                                                                    }
//                                                                },
//                                                                cancel: {
//                                                                    label:"Закрыть",
//                                                                    color:"default",
//                                                                    dopAttr:'data-dismiss="modal"',
//                                                                    callback: function(){
//
//                                                                    }
//                                                                }
//                                                            }
//                                                        }
//
//                                                        MB.Core.ModalMiniContent(modalObj);
//                                                        console.log(OrderPayment);
//                                                        var ButtonsState = OrderPayment.ButtonsState();
//
//                                                        var updaView = OrderPayment.updateView();
//                                                        updaView.all(data);
//                                                        OrderPayment.handlerOrderAmount(data);
//                                                        // updaView.all(data);
//                                                        // handlerOrderAmount(data,updaView,ButtonsState);
//
//                                                    })
//                                                }
//                                            });
//                                        }
//                                    },
//                                    cancel: {
//                                        label:"Закрыть",
//                                        color:"default",
//                                        dopAttr:'data-dismiss="modal"',
//                                        callback: function(){
//
//                                        }
//                                    }
//                                }
//                            }
//                            MB.Core.ModalMiniContent(modalObj);
//                        }
//                    }
//                    $('.spinner .btn:first-of-type').on('click', function() {
//                        var val = parseInt($('.spinner input').val(), 10) + 1;
//                        $('.spinner input').val(val);
//                    });
//                    $('.spinner .btn:last-of-type').on('click', function() {
//                        if($('.spinner input').val() != 1){
//                            var val = parseInt($('.spinner input').val(), 10) - 1;
//                            $('.spinner input').val(val);
//                        }
//
//                    });
//                    $('.spinner input').on('blur', function(){
//                        if($('.spinner input').val()<=0){
//                            $('.spinner input').val(1);
//                        }
//                    })
//                },
//                items: {
//                    openInModal: {
//                        name: "Открыть в форме..."
//                    },
//                    goToPayd: {
//                        name: "Перейти к продаже..."
//                    },
//                    schemeByAreagroup : {
//                        name : "Показать по зонам"
//                    }
//                }
//            }
//        });
//        // instance.contextmenu["custom1"] = {
//        //     name: "Перейти к продаже",
//        //     callback: function (key, options) {
//        //         var id = options.$trigger.data("row");
//        //         var field_num = instance.data.names.indexOf('ACTION');
//        //         var row_num;
//        //         for (var i in instance.data.data){
//        //             if (instance.data.data[i][0]==id){
//        //                 row_num = i;
//        //                 break;
//        //             }
//        //         }
//        //         var action_label = instance.data.data[row_num][field_num];
//        //         MB.Core.switchModal({type:"content", filename:"one_action", params:{action_id:id, label:action_label, action_name:action_label}});
//        //     }
//        // };
//
//        // var query = "#" + instance.world + "_" + instance.name + "_wrapper table tbody tr";
//        // $.contextMenu("destroy", query);
//        // $.contextMenu({
//        //     selector: query,
//        //     items: instance.contextmenu
//        // });
//        callback();
//    };
//}());

