(function () {
    var tableNId = $('.page-content-wrapper .classicTableWrap').data('id');
    var tableInstance = MB.Tables.getTable(tableNId);
    tableInstance.ct_instance.ctxMenuData = [
        {
            name: 'option6',
            title: 'Перейти к новому редактору',
            disabled: function () {
                return false;
            },
            callback: function () {
                var sel = tableInstance.ct_instance.selection[0];
                var id = tableInstance.data.DATA[sel][tableInstance.data.NAMES.indexOf('HALL_SCHEME_ID')];
                var titlePrice = tableInstance.data.DATA[sel][tableInstance.data.NAMES.indexOf('PRICE_ZONE')] + ' для ' + tableInstance.data.DATA[sel][tableInstance.data.NAMES.indexOf('NAME')];

                MB.Core.sendQuery({
                    command: "get",
                    object: "hall_scheme",
                    sid: MB.User.sid,
                    params: {where: "hall_scheme_id = " + id}
                }, function (data) {
                    var obj = MB.Core.jsonToObj(data);
                    var hall_id = obj[0].HALL_ID;
                    MB.Core.switchModal({
                        type: "content",
                        isNew: true,
                        filename: "mapEditor",
                        params: {hall_scheme_id: id, hall_id: hall_id, title: titlePrice, label: 'Редактор зала '}
                    });
                });
            }
        },
        {
            name: 'option7',
            title: 'New FundZones',
            disabled: function () {
                return false;
            },
            callback: function () {
                var sel = tableInstance.ct_instance.selectedRowIndex;
                var id = tableInstance.data.DATA[sel][tableInstance.data.NAMES.indexOf('HALL_SCHEME_ID')];
                var titlePrice = tableInstance.data.DATA[sel][tableInstance.data.NAMES.indexOf('PRICE_ZONE')] + ' для ' + tableInstance.data.DATA[sel][tableInstance.data.NAMES.indexOf('NAME')];

                socketQuery({
                    command: "get",
                    object: "hall_scheme",
                    params: {
                        where: "hall_scheme_id = " + id
                    }
                }, function (res) {
                    var obj = MB.Core.jsonToObj(JSON.parse(res)['results'][0]);
                    var hall_id = obj[0].HALL_ID;
                    MB.Core.switchModal({
                        type: "content",
                        isNew: true,
                        filename: "fundZones",
                        params: {
                            hall_scheme_id: id,
                            hall_id: hall_id,
                            title: titlePrice,
                            hall_scheme_res: JSON.parse(res)['results'][0],
                            label: 'Редактор зала '
                        }
                    });
                });
            }
        },
        {
            name: 'option8',
            title: 'New Price Zones',
            disabled: function () {
                return false;
            },
            callback: function () {
                var sel = tableInstance.ct_instance.selection[0];
                var id = tableInstance.data.DATA[sel][tableInstance.data.NAMES.indexOf('HALL_SCHEME_ID')];
                var titlePrice = tableInstance.data.DATA[sel][tableInstance.data.NAMES.indexOf('PRICE_ZONE')] + ' для ' + tableInstance.data.DATA[sel][tableInstance.data.NAMES.indexOf('NAME')];

                MB.Core.switchModal({
                    type: "content",
                    filename: "priceZones",
                    isNew: true,
                    params: {
                        hall_scheme_id: id,
                        title: titlePrice,
                        label: 'Схема распоясовки'
                    }
                });
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
            name: 'option2',
            title: 'Перейти к схемам распределения',
            disabled: function () {
                return false;
            },
            callback: function () {
                var sel = tableInstance.ct_instance.selection[0];
                var id = tableInstance.data.DATA[sel][tableInstance.data.NAMES.indexOf('HALL_SCHEME_ID')];
                var titleFund = tableInstance.data.DATA[sel][tableInstance.data.NAMES.indexOf('FUND_ZONE')] + ' для ' + tableInstance.data.DATA[sel][tableInstance.data.NAMES.indexOf('NAME')];

                MB.Core.switchModal({
                    type: "content",
                    filename: "fundZones",
                    params: {hall_scheme_id: id, title: titleFund, label: 'Схема распределения'}
                });
            }
        },
        {
            name: 'option3',
            title: 'Перейти к схемам распоясовки',
            disabled: function () {
                return false;
            },
            callback: function () {
                var sel = tableInstance.ct_instance.selection[0];
                var id = tableInstance.data.DATA[sel][tableInstance.data.NAMES.indexOf('HALL_SCHEME_ID')];
                var titlePrice = tableInstance.data.DATA[sel][tableInstance.data.NAMES.indexOf('PRICE_ZONE')] + ' для ' + tableInstance.data.DATA[sel][tableInstance.data.NAMES.indexOf('NAME')];

                MB.Core.switchModal({
                    type: "content",
                    filename: "priceZones",
                    params: {hall_scheme_id: id, title: titlePrice, label: 'Схема распоясовки'}
                });
            }
        },
        {
            name: 'option4',
            title: 'Перейти к редактору',
            disabled: function () {
                return false;
            },
            callback: function () {
                var sel = tableInstance.ct_instance.selection[0];
                var id = tableInstance.data.DATA[sel][tableInstance.data.NAMES.indexOf('HALL_SCHEME_ID')];
                var titlePrice = tableInstance.data.DATA[sel][tableInstance.data.NAMES.indexOf('PRICE_ZONE')] + ' для ' + tableInstance.data.DATA[sel][tableInstance.data.NAMES.indexOf('NAME')];

                MB.Core.sendQuery({
                    command: "get",
                    object: "hall_scheme",
                    sid: MB.User.sid,
                    params: {where: "hall_scheme_id = " + id}
                }, function (data) {
                    var obj = MB.Core.jsonToObj(data);
                    var hall_id = obj[0].HALL_ID;
                    MB.Core.switchModal({
                        type: "content",
                        filename: "mapEditor",
                        params: {hall_scheme_id: id, hall_id: hall_id, title: titlePrice, label: 'Редактор зала '}
                    });
                });
            }
        },
        {
            name: 'option5',
            title: 'Создать копию',
            disabled: function () {
                return false;
            },
            callback: function () {

                var sel = tableInstance.ct_instance.selection[0];
                var id = tableInstance.data.DATA[sel][tableInstance.data.NAMES.indexOf('HALL_SCHEME_ID')];
                var titlePrice = tableInstance.data.DATA[sel][tableInstance.data.NAMES.indexOf('PRICE_ZONE')] + ' для ' + tableInstance.data.DATA[sel][tableInstance.data.NAMES.indexOf('NAME')];
                var hallName = tableInstance.data.DATA[sel][tableInstance.data.NAMES.indexOf('NAME')] + ' (Копия)';

                function ModalMiniContent(obj) {
                    var ModalDiv = $(obj.selector);
                    var ModalHeader = ModalDiv.find(".modal-header");
                    var ModalBody = ModalDiv.find(".modal-body");
                    ModalHeader.html(obj.title);
                    ModalBody.html(obj.content);
                    $(".modal-footer").html("");
                    for (key in obj['buttons']) {
                        (function (key) {
                            var val = obj['buttons'][key];
                            var html = "";
                            html += '<button type="button" class="btn ' + val['color'] + ' btn_' + key + '" ' + val['dopAttr'] + '>' + val['label'] + '</button>';
                            $(".modal-footer").append(html);
                            $(".btn_" + key).click(function () {
                                val.callback();
                            })
                        })(key)
                    }

                    ModalDiv.modal("show");
                }

                bootbox.dialog({
                    message: "<p>Схему зала можно скопировать в двух режимах. В первом будет скопирована только физическая модель зала (расположения мест, надписей, изображений), а во втором, также, будут скопированы все схемы распределения/распоясовки/расценки.</p><input type='text' class='copySchemeName bootbox-input bootbox-input-text form-control' value='" + hallName + "'>",
                    title: "Копирование схемы зала",
                    buttons: {
                        success: {
                            label: "Скопировать только места",
                            className: "btn-success",
                            callback: function () {
                                var info = toastr["info"]("Идет процесс копирования", "Подождите...", {
                                    timeOut: 1000000
                                });
                                var copySchemeName = $(".copySchemeName").val();
                                socketQuery({
                                    command: "operation",
                                    object: "copy_hall_scheme",
                                    params: {
                                        hall_scheme_id: id,
                                        all: 0,
                                        name: copySchemeName
                                    }
                                }, function (data) {
                                    data = JSON.parse(data).results[0];
                                    info.fadeOut(600);
                                    var tstr = data.toastr;
                                    if (data.code == 0) tableInstance.reload();
                                    toastr[tstr.type](tstr.message, tstr.title);
                                });
                            }
                        },
                        success2: {
                            label: "Полная копия",
                            className: "btn-success",
                            callback: function () {
                                var info = toastr["info"]("Идет процесс копирования", "Подождите...", {
                                    timeOut: 1000000
                                });
                                var copySchemeName = $(".copySchemeName").val();
                                socketQuery({
                                    command: "operation",
                                    object: "copy_hall_scheme",
                                    params: {
                                        hall_scheme_id: id,
                                        name: copySchemeName
                                    }
                                }, function (data) {
                                    data = JSON.parse(data).results[0];
                                    info.fadeOut(600);
                                    var tstr = data.toastr;
                                    if (data.code == 0) tableInstance.reload();
                                    toastr[tstr.type](tstr.message, tstr.title);
                                });
                            }
                        },
                        close: {
                            label: "Закрыть",
                            className: "btn-primary",
                            callback: function () {}
                        }
                    }
                });
            }
        }
    ];

}());



