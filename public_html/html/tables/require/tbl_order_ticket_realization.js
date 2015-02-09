(function(){

}());

(function () {
    return;
    var instance = MB.O.tables["tbl_order_ticket_realization"];
    var parent = MB.O.forms["form_order"];
    instance.custom = function (callback) {
        var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
        handsontableInstance.updateSettings({contextMenu: false});
        handsontableInstance.updateSettings({
            contextMenu: {
                callback: function (key, options) {
                    var arr, data, handsontableInstance, i, value, _i, _len;
                    switch (key) {
                        case "openInModal":
                            MB.Table.createOpenInModalContextMenuItem(instance, key, options);
                            break;
                        case "goToPay":
                            var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            for (var i = selectedRows[0]; i <= selectedRows[1]; ++i) {
                                var ticketId = instance.data.data[i][instance.data.names.indexOf("ORDER_TICKET_ID")];
                                var o = {
                                    command: "operation",
                                    object: "to_pay_ticket",
                                    sid: MB.User.sid
                                }
                                o["ORDER_TICKET_ID"] = ticketId;
                                sendQueryForObj(o);
                            }
                            break;
                        case "goToCancel":
                            var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            for (var i = selectedRows[0]; i <= selectedRows[1]; ++i) {
                                var ticketId = instance.data.data[i][instance.data.names.indexOf("ORDER_TICKET_ID")];
                                bootbox.dialog({
                                    message: 'Вы уверены?',
                                    title: "Отмена заказа",
                                    buttons: {
                                        ok: {
                                            label: "Да, уверен",
                                            className: "yellow",
                                            callback: function () {
                                                var o = {
                                                    command: "operation",
                                                    object: "cancel_ticket",
                                                    sid: MB.User.sid
                                                };
                                                o["ORDER_TICKET_ID"] = ticketId;
                                                sendQueryForObj(o);
                                            }
                                        },
                                        cancel: {
                                            label: "Отменить",
                                            className: "blue",
                                            callback: function () {
                                            }
                                        }
                                    }
                                });


                            }
                            break;
                        case "goToReturn":
                            var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            for (var i = selectedRows[0]; i <= selectedRows[1]; ++i) {
                                var ticketId = instance.data.data[i][instance.data.names.indexOf("ORDER_TICKET_ID")];
                                var o = {
                                    command: "operation",
                                    object: "return_ticket",
                                    sid: MB.User.sid
                                };
                                o["ORDER_TICKET_ID"] = ticketId;
                                sendQueryForObj(o);
                            }
                            break;
                        case "goToPrint":
                            var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            for (var i = selectedRows[0]; i <= selectedRows[1]; ++i) {
                                var ticketId = instance.data.data[i][instance.data.names.indexOf("ORDER_TICKET_ID")];
                                /* var o = {
                                 command: "operation",
                                 object: "print_ticket",
                                 sid: MB.User.sid
                                 };
                                 o["ORDER_TICKET_ID"] = ticketId;
                                 sendQueryForObj(o);*/
                                send('print_ticket', {
                                    guid: MB.Core.getUserGuid(),
                                    ticket_id: ticketId
                                }, function (result) {
                                    instance.reload('data');

                                });
                            }
                            break;
                        case "goToDefectBlank":
                            var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            var ticketNumber = instance.data.data[selectedRows[0]][instance.data.names.indexOf("SCA_NUMBER")];

                            var instance2 = parent;
                            var defectTypes = undefined;
                            var series = undefined;
                            var removeBtnHtml = '<div class="removeRow"><i class="fa fa-times"></i></div>';
                            var o = {
                                command: 'get',
                                object: 'ticket',
                                params: {
                                    where: "ORDER_ID = " + instance2.activeId + " and STATUS = 'PRINTED'"
                                }
                            };

                            MB.Core.sendQuery({
                                command: "get",
                                object: "ticket_defect_type",
                                sid: MB.User.sid
                            }, function (result) {
                                var obj = MB.Core.jsonToObj(result);
                                defectTypes = obj;


                                MB.Core.sendQuery({
                                    command: "get",
                                    object: "ticket_pack_series_lov",
                                    sid: MB.User.sid
                                }, function (seriesRes) {
                                    series = MB.Core.jsonToObj(seriesRes);


                                    MB.Core.sendQuery(o, function (res) {
                                        console.log('DATA', res);
                                        if (res.DATA.length > 0) {
                                        }

                                        var thHtml = '<div class="row"><div class="col-md-5">Билет</div><div class="col-md-6">Причина брака</div></div>';
                                        var thHtml2 = '<div class="row"><div class="col-md-3">Серия</div><div class="col-md-3">Номер</div><div class="col-md-5">Причина брака</div></div>';
                                        var musObj = {
                                            seriesOptions: [],
                                            defectTypeOptions: [],
                                            series: [],
                                            isAvaliableAdd: res.DATA.length > 1,
                                            isAvaliableRemove: true
                                        };
                                        var tpl = '<div class="row posRel marBot5 rejectRow">' +
                                            '<div class="col-md-5">' +
                                            '<div class="form-group">' +
                                            '<select class="bsoSeriesList form-control">{{#seriesOptions}}<option {{isSelected}} data-series="{{serial}}" data-number="{{number}}" value="{{id}}">{{serial}} - {{number}}</option>{{/seriesOptions}}</select>' +
                                            '</div>' +
                                            '</div>' +
                                            '<div class="col-md-6">' +
                                            '<div class="form-group">' +
                                            '<select class="bsoDefectType form-control">{{#defectTypeOptions}}<option value="{{id}}">{{title}}</option>{{/defectTypeOptions}}</select>' +
                                            '</div>' +
                                            '</div>' +
                                            '{{#isAvaliableAdd}}<div class="addRow"><i class="fa fa-plus"></i></div>{{/isAvaliableAdd}}' +
                                            '{{#isAvaliableRemove}}<div class="removeRow"><i class="fa fa-times"></i></div>{{/isAvaliableRemove}}' +
                                            '</div>';

                                        var tpl2 = '<div class="row posRel marBot5 rejectRow2">' +
                                            '<div class="col-md-3">' +
                                            '<div class="form-group">' +
                                            '<select class="bsoSeriesList2 form-control">' +
                                            '<option value="-10"> </option>' +
                                            '{{#series}}<option value="{{id}}">{{title}}</option>{{/series}}' +
                                            '</select>' +
                                            '</div>' +
                                            '</div>' +
                                            '<div class="col-md-3">' +
                                            '<div class="form-group">' +
                                            '<input class="bsoNumber form-control smallInput" type="text"/>' +
                                            '</div>' +
                                            '</div>' +
                                            '<div class="col-md-5">' +
                                            '<div class="form-group">' +
                                            '<select class="bsoDefectType2 form-control">{{#defectTypeOptions}}<option value="{{id}}">{{title}}</option>{{/defectTypeOptions}}</select>' +
                                            '</div>' +
                                            '</div>' +
                                            '<div class="addRow"><i class="fa fa-plus"></i></div>' +
                                            '<div class="removeRow"><i class="fa fa-times"></i></div>' +
                                            '</div>';

                                        for (var i in res.DATA) {
                                            var item = res.DATA[i];
                                            var tmpObj = {
                                                isSelected: (item[res.NAMES.indexOf('SCA_NUMBER')] == ticketNumber) ? 'selected' : '',
                                                id: item[res.NAMES.indexOf('TICKET_ID')],
                                                serial: item[res.NAMES.indexOf('SCA_SERIES')],
                                                number: item[res.NAMES.indexOf('SCA_NUMBER')]
                                            };
                                            musObj.seriesOptions.push(tmpObj);
                                        }
                                        for (var k in defectTypes) {
                                            var kItem = defectTypes[k];
                                            var kTmpObj = {
                                                id: defectTypes[k].TICKET_DEFECT_TYPE_ID,
                                                title: defectTypes[k].TICKET_DEFECT_TYPE
                                            };
                                            musObj.defectTypeOptions.push(kTmpObj);
                                        }

                                        for (var j in series) {
                                            var jItem = series[j];
                                            var jObj = {
                                                id: jItem.SCA_SERIES,
                                                title: jItem.SCA_SERIES
                                            };
                                            musObj.series.push(jObj);
                                        }

                                        bootbox.dialog({
                                            message: (musObj.seriesOptions.length > 0) ? thHtml + Mustache.to_html(tpl, musObj) + thHtml2 + Mustache.to_html(tpl2, musObj) : thHtml2 + Mustache.to_html(tpl2, musObj),
                                            title: "Забраковать БСО",
                                            buttons: {
                                                ok: {
                                                    label: "Подтвердить",
                                                    className: "yellow",
                                                    callback: function () {
                                                        var sendObj = [];
                                                        var iterator = 0;

                                                        function sendReject(iterator) {
                                                            if (iterator >= sendObj.length) {
                                                                return;
                                                            }
                                                            var o = {
                                                                command: 'operation',
                                                                object: 'defect_blank_by_number',
                                                                sid: MB.User.sid,
                                                                params: sendObj[iterator]
                                                            };
                                                            MB.Core.sendQuery(o, function (res) {
                                                                if (res) {
                                                                    toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE);
                                                                    iterator++;
                                                                    sendReject(iterator);
                                                                }
                                                            });
                                                        }

                                                        function validate(str, type) {
                                                            var regExp = new RegExp('/^$|\s+');
                                                            return regExp.test(str);
                                                        }

                                                        for (var i = 0; i < $('.rejectRow').length; i++) {
                                                            var row = $('.rejectRow').eq(i);
                                                            var series = row.find('select.bsoSeriesList option:selected').data('series');
                                                            var number = row.find('select.bsoSeriesList option:selected').data('number');
                                                            var type = row.find('.bsoDefectType');

                                                            var tmpObj = {
                                                                sca_series: series,
                                                                sca_number: number,
                                                                ticket_defect_type_id: type.select2('val')
                                                            };

                                                            sendObj.push(tmpObj);
                                                        }
                                                        for (var k = 0; k < $('.rejectRow2').length; k++) {
                                                            var kRow = $('.rejectRow2').eq(k);
                                                            var kSeries = kRow.find('.bsoSeriesList2').select2('val');
                                                            var kNumber = kRow.find('.bsoNumber').val();
                                                            var kType = kRow.find('.bsoDefectType2').select2('val');

                                                            var kObj = {
                                                                sca_series: kSeries,
                                                                sca_number: kNumber,
                                                                ticket_defect_type_id: kType
                                                            };

                                                            if (kObj.sca_series == '-10' || kObj.sca_number == '' || kObj.sca_number == ' ') {
                                                                continue;
                                                            }

                                                            sendObj.push(kObj);
                                                        }
                                                        sendReject(iterator);
                                                        instance2.reload('data');
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


                                        $('.bsoSeriesList').parents('.bootbox.modal').eq(0).removeAttr('tabindex');
                                        $('.bsoSeriesList, .bsoDefectType').select2();
                                        $('.bsoSeriesList2, .bsoDefectType2').select2();


                                        function setHandlers() {
                                            $('.rejectRow').removeClass('underline');
                                            $('.rejectRow:last').addClass('underline');
                                            $('.rejectRow .addRow').off('click').on('click', function () {
                                                var container = $(this).parents('.bootbox-body');
                                                if (container.find('.rejectRow').length >= res.DATA.length) {
                                                    return;
                                                }
                                                container.find('.rejectRow:last').after(Mustache.to_html(tpl, musObj));
                                                $(this).before(removeBtnHtml);
                                                $(this).remove();

                                                $('.bsoSeriesList:last, .bsoDefectType:last').select2();
                                                //                                populateSelects(function(){
                                                //                                    setHandlers();
                                                //                                });
                                                setHandlers();
                                            });
                                            $('.rejectRow .removeRow').off('click').on('click', function () {
                                                var container = $(this).parents('.bootbox-body');
                                                $(this).parents('.row').eq(0).remove();
                                                container.find('.rejectRow:last').find('.addRow').remove();
                                                container.find('.rejectRow:last').append('<div class="addRow"><i class="fa fa-plus"></i></div>');
                                                setHandlers();
                                            });


                                            $('.rejectRow2 .addRow').off('click').on('click', function () {
                                                var container = $(this).parents('.bootbox-body');
                                                container.find('.rejectRow2:last').after(Mustache.to_html(tpl2, musObj));
                                                $(this).before(removeBtnHtml);
                                                $(this).remove();

                                                $('.bsoSeriesList2:last, .bsoDefectType2:last').select2();
                                                setHandlers();
                                            });
                                            $('.rejectRow2 .removeRow').off('click').on('click', function () {
                                                var container = $(this).parents('.bootbox-body');
                                                $(this).parents('.row').eq(0).remove();
                                                container.find('.rejectRow2:last').find('.addRow').remove();
                                                container.find('.rejectRow2:last').append('<div class="addRow"><i class="fa fa-plus"></i></div>');
                                                setHandlers();
                                            });
                                        }

                                        setHandlers();
                                    });
                                });
                            });
                            break;
                        case "goToDefectTicket":
                            var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            for (var i = selectedRows[0]; i <= selectedRows[1]; ++i) {
                                var ticketId = instance.data.data[i][instance.data.names.indexOf("ORDER_TICKET_ID")];
                                var o = {
                                    command: "operation",
                                    object: "defect_ticket",
                                    sid: MB.User.sid
                                };
                                o["ORDER_TICKET_ID"] = ticketId;
                                sendQueryForObj(o);
                            }
                            break;
                        case "goToRealization":
                            var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            for (var i = selectedRows[0]; i <= selectedRows[1]; ++i) {
                                var ticketId = instance.data.data[i][instance.data.names.indexOf("ORDER_TICKET_ID")];
                                var o = {
                                    command: "operation",
                                    object: "on_realization_ticket",
                                    sid: MB.User.sid
                                };
                                o["ORDER_TICKET_ID"] = ticketId;
                                sendQueryForObj(o);
                            }
                            break;
                        case "goToRealizationPrint":
                            console.log('Функция временно не доступна');

                            /* send('print_order',{guid:MB.Core.getUserGuid(),order_id:instance.activeId},function(){
                             instance.reload('data');

                             });*/

                            /*var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
                             var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                             for(var i = selectedRows[0];i<=selectedRows[1];++i){
                             var ticketId = instance.data.data[i][instance.data.names.indexOf("ORDER_TICKET_ID")];
                             var o = {
                             command: "operation",
                             object: "on_realization_print_ticket",
                             sid: MB.User.sid
                             };
                             o["ORDER_TICKET_ID"] = ticketId;
                             sendQueryForObj(o);
                             }*/
                            break;
                        case "goToCloseRealization":
                            bootbox.dialog({
                                message: 'Вы уверены?',
                                title: "Закрыть квоту",
                                buttons: {
                                    ok: {
                                        label: "Да, уверен",
                                        className: "yellow",
                                        callback: function () {
                                            var handsontableInstance = instance.$container.find(".handsontable").handsontable("getInstance");
                                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                                            for (var i = selectedRows[0]; i <= selectedRows[1]; ++i) {
                                                var ticketId = instance.data.data[i][instance.data.names.indexOf("ORDER_TICKET_ID")];
                                                var o = {
                                                    command: "operation",
                                                    object: "close_realization_ticket",
                                                    sid: MB.User.sid
                                                };
                                                o["ORDER_TICKET_ID"] = ticketId;
                                                sendQueryForObj(o);
                                            }
                                        }
                                    },
                                    cancel: {
                                        label: "Отменить",
                                        className: "blue",
                                        callback: function () {
                                        }
                                    }
                                }
                            });


                            break;
                    }
                },
                items: {
                    openInModal: {
                        name: "Открыть в форме"
                    },
                    goToPay: {
                        name: "Билет к оплате",
                        disabled: function () {
                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            var disableStatus = false;
                            if (selectedRows[0] != selectedRows[1]) {
                                var countCallbacks = 0;
                                for (var i = selectedRows[0]; i <= selectedRows[1]; ++i) {
                                    //var ticketId = instance.data.data[i][instance.data.names.indexOf("ORDER_TICKET_ID")];
                                    var ticketStatus = instance.data.data[i][instance.data.names.indexOf("STATUS")];
                                    if (ticketStatus !== "RESERVED") {
                                        disableStatus = true
                                    }

                                }
                            } else {
                                var i = selectedRows[0];
                                ticketStatus = instance.data.data[i][instance.data.names.indexOf("STATUS")];
                                if (ticketStatus !== "RESERVED") {
                                    disableStatus = true
                                }
                            }
                            return disableStatus;
                        }
                    },
                    goToCancel: {
                        name: "Отменить билет",
                        disabled: function () {
                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            var disableStatus = false;
                            if (selectedRows[0] != selectedRows[1]) {
                                var countCallbacks = 0;
                                for (var i = selectedRows[0]; i <= selectedRows[1]; ++i) {
                                    //var ticketId = instance.data.data[i][instance.data.names.indexOf("ORDER_TICKET_ID")];
                                    var ticketStatus = instance.data.data[i][instance.data.names.indexOf("STATUS")];
                                    if (!(ticketStatus === "RESERVED" || ticketStatus === "TO_PAY")) {
                                        disableStatus = true;
                                    }

                                }
                            } else {
                                var i = selectedRows[0];
                                var ticketStatus = instance.data.data[i][instance.data.names.indexOf("STATUS")];
                                if (!(ticketStatus === "RESERVED" || ticketStatus === "TO_PAY")) {
                                    disableStatus = true;
                                }
                            }
                            return disableStatus;
                        }
                    },
                    goToReturn: {
                        name: "Вернуть билет",
                        disabled: function () {
                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            var disableStatus = false;
                            if (selectedRows[0] != selectedRows[1]) {
                                var countCallbacks = 0;
                                for (var i = selectedRows[0]; i <= selectedRows[1]; ++i) {
                                    //var ticketId = instance.data.data[i][instance.data.names.indexOf("ORDER_TICKET_ID")];
                                    var ticketStatus = instance.data.data[i][instance.data.names.indexOf("STATUS")];
                                    if (!(ticketStatus === "CLOSED" || ticketStatus === "CLOSED_REALIZATION" || ticketStatus === "ON_REALIZATION")) {
                                        disableStatus = true;
                                    }

                                }
                            } else {
                                var i = selectedRows[0];
                                ticketStatus = instance.data.data[i][instance.data.names.indexOf("STATUS")];
                                if (!(ticketStatus === "CLOSED" || ticketStatus === "CLOSED_REALIZATION" || ticketStatus === "ON_REALIZATION")) {
                                    disableStatus = true;
                                }
                            }
                            return disableStatus;
                        }
                    },
                    goToPrint: {
                        name: "Напечатать билет",
                        disabled: function () {
                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            var disableStatus = false;
                            if (selectedRows[0] != selectedRows[1]) {
                                var countCallbacks = 0;
                                for (var i = selectedRows[0]; i <= selectedRows[1]; ++i) {
                                    //var ticketId = instance.data.data[i][instance.data.names.indexOf("ORDER_TICKET_ID")];
                                    var ticketStatus = instance.data.data[i][instance.data.names.indexOf("STATUS")];
                                    var ticketPrinted = instance.data.data[i][instance.data.names.indexOf("PRINTED")];
                                    log(ticketPrinted)
                                    log(ticketStatus)
                                    if (!(ticketStatus == "TO_PAY" || (ticketStatus == "ON_REALIZATION" && ticketPrinted == "NOT_PRINTED") || (ticketStatus == "CLOSED_REALIZATION" && ticketPrinted == "NOT_PRINTED"))) {
                                        disableStatus = true;
                                    }

                                }
                            } else {
                                var i = selectedRows[0];
                                var ticketStatus = instance.data.data[i][instance.data.names.indexOf("STATUS")];
                                var ticketPrinted = instance.data.data[i][instance.data.names.indexOf("PRINTED")];
                                if (!(ticketStatus == "TO_PAY" || (ticketStatus == "ON_REALIZATION" && ticketPrinted == "NOT_PRINTED") || (ticketStatus == "CLOSED_REALIZATION" && ticketPrinted == "NOT_PRINTED"))) {
                                    disableStatus = true;
                                }
                            }
                            return disableStatus;
                        }
                    },
                    goToDefectBlank: {
                        name: "Забраковать бланк",
                        disabled: function () {
                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            var disableStatus = false;
                            if (selectedRows[0] != selectedRows[1]) {
                                var countCallbacks = 0;
                                for (var i = selectedRows[0]; i <= selectedRows[1]; ++i) {
                                    //var ticketId = instance.data.data[i][instance.data.names.indexOf("ORDER_TICKET_ID")];
                                    var ticketStatus = instance.data.data[i][instance.data.names.indexOf("STATUS")];
                                    var ticketPrinted = instance.data.data[i][instance.data.names.indexOf("PRINTED")];
                                    if (!(ticketStatus == "CLOSED" || (ticketStatus == "ON_REALIZATION" && ticketPrinted == "PRINTED") || (ticketStatus == "CLOSED_REALIZATION" && ticketPrinted == "PRINTED"))) {
                                        disableStatus = true;
                                    }

                                }
                            } else {
                                var i = selectedRows[0];
                                var ticketStatus = instance.data.data[i][instance.data.names.indexOf("STATUS")];
                                var ticketPrinted = instance.data.data[i][instance.data.names.indexOf("PRINTED")];
                                if (!(ticketStatus == "CLOSED" || (ticketStatus == "ON_REALIZATION" && ticketPrinted == "PRINTED") || (ticketStatus == "CLOSED_REALIZATION" && ticketPrinted == "PRINTED"))) {
                                    disableStatus = true;
                                }
                            }
                            return disableStatus;
                        }
                    },
                    goToDefectTicket: {
                        name: "Забраковать билет",
                        disabled: function () {
                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            var disableStatus = false;
                            if (selectedRows[0] != selectedRows[1]) {
                                var countCallbacks = 0;
                                for (var i = selectedRows[0]; i <= selectedRows[1]; ++i) {
                                    //var ticketId = instance.data.data[i][instance.data.names.indexOf("ORDER_TICKET_ID")];
                                    var ticketStatus = instance.data.data[i][instance.data.names.indexOf("STATUS")];
                                    var ticketPrinted = instance.data.data[i][instance.data.names.indexOf("PRINTED")];
                                    if (!(ticketStatus == "CLOSED" || (ticketStatus == "ON_REALIZATION" && ticketPrinted == "PRINTED") || (ticketStatus == "CLOSED_REALIZATION" && ticketPrinted == "PRINTED"))) {
                                        disableStatus = true;
                                    }

                                }
                            } else {
                                var i = selectedRows[0];
                                var ticketStatus = instance.data.data[i][instance.data.names.indexOf("STATUS")];
                                var ticketPrinted = instance.data.data[i][instance.data.names.indexOf("PRINTED")];
                                if (!(ticketStatus == "CLOSED" || (ticketStatus == "ON_REALIZATION" && ticketPrinted == "PRINTED") || (ticketStatus == "CLOSED_REALIZATION" && ticketPrinted == "PRINTED"))) {
                                    disableStatus = true;
                                }
                            }
                            return disableStatus;
                        }
                    },
                    goToRealization: {
                        name: "Выдать по квоте",
                        disabled: function () {
                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            var parent = instance.parent
                            var agentrealizationaccess = parent.data.data[0][parent.data.names.indexOf("AGENT_REALIZATION_ACCESS")].bool();
                            var disableStatus = false;
                            if (!agentrealizationaccess) {
                                return true;
                            }

                            if (selectedRows[0] != selectedRows[1]) {
                                var countCallbacks = 0;
                                for (var i = selectedRows[0]; i <= selectedRows[1]; ++i) {
                                    //var ticketId = instance.data.data[i][instance.data.names.indexOf("ORDER_TICKET_ID")];
                                    var ticketStatus = instance.data.data[i][instance.data.names.indexOf("STATUS")];
                                    var ticketPrinted = instance.data.data[i][instance.data.names.indexOf("PRINTED")];
                                    if (!(ticketStatus == "TO_PAY") && !(ticketStatus == "CLOSED_REALIZATION")) {
                                        disableStatus = true;
                                    }

                                }
                            } else {

                                var i = selectedRows[0];
                                var ticketStatus = instance.data.data[i][instance.data.names.indexOf("STATUS")];
                                var ticketPrinted = instance.data.data[i][instance.data.names.indexOf("PRINTED")];
                                if (!(ticketStatus == "TO_PAY") && !(ticketStatus == "CLOSED_REALIZATION")) {
                                    disableStatus = true;
                                }
                            }
                            return disableStatus;
                        }
                    },
                    goToRealizationPrint: {
                        name: "Выдать по квоте и распечатать",
                        disabled: function () {
                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            var parent = instance.parent
                            var agentrealizationaccess = parent.data.data[0][parent.data.names.indexOf("AGENT_REALIZATION_ACCESS")].bool();
                            var disableStatus = false;
                            if (!agentrealizationaccess) {
                                return true;
                            }
                            if (selectedRows[0] != selectedRows[1]) {
                                var countCallbacks = 0;
                                for (var i = selectedRows[0]; i <= selectedRows[1]; ++i) {
                                    //var ticketId = instance.data.data[i][instance.data.names.indexOf("ORDER_TICKET_ID")];
                                    var ticketStatus = instance.data.data[i][instance.data.names.indexOf("STATUS")];
                                    var ticketPrinted = instance.data.data[i][instance.data.names.indexOf("PRINTED")];
                                    if (!(ticketStatus == "TO_PAY")) {
                                        disableStatus = true;
                                    }

                                }
                            } else {
                                var i = selectedRows[0];
                                var ticketStatus = instance.data.data[i][instance.data.names.indexOf("STATUS")];
                                var ticketPrinted = instance.data.data[i][instance.data.names.indexOf("PRINTED")];
                                if (!(ticketStatus == "TO_PAY")) {
                                    disableStatus = true;
                                }
                            }
                            return disableStatus;
                        }
                    },
                    goToCloseRealization: {
                        name: "Закрыть квоту",
                        disabled: function () {
                            var selectedRows = MB.Table.getSelectedRowsInterval(handsontableInstance);
                            var parent = instance.parent
                            var agentrealizationaccess = parent.data.data[0][parent.data.names.indexOf("AGENT_REALIZATION_ACCESS")].bool();
                            var disableStatus = false;
                            if (!agentrealizationaccess) {
                                return true;
                            }
                            if (selectedRows[0] != selectedRows[1]) {
                                var countCallbacks = 0;
                                for (var i = selectedRows[0]; i <= selectedRows[1]; ++i) {
                                    //var ticketId = instance.data.data[i][instance.data.names.indexOf("ORDER_TICKET_ID")];
                                    var ticketStatus = instance.data.data[i][instance.data.names.indexOf("STATUS")];
                                    var ticketPrinted = instance.data.data[i][instance.data.names.indexOf("PRINTED")];
                                    if (!(ticketStatus === "ON_REALIZATION")) {
                                        disableStatus = true;
                                    }

                                }
                            } else {
                                var i = selectedRows[0];
                                var ticketStatus = instance.data.data[i][instance.data.names.indexOf("STATUS")];
                                var ticketPrinted = instance.data.data[i][instance.data.names.indexOf("PRINTED")];
                                if (!(ticketStatus === "ON_REALIZATION")) {
                                    disableStatus = true;
                                }
                            }
                            return disableStatus;
                        }
                    }
                }
            }
        });

        function sendQueryForObj(o) {
            MB.Core.sendQuery(o, function (res) {
                if (parseInt(res.RC) === 0) {
                    toastr.success(res.MESSAGE, "Ок");
                    MB.O.forms["form_order"].reload("data");
                }
                else {
                    toastr.error(res.MESSAGE, "");
                }
            });
        }

        callback();
    }
})();
