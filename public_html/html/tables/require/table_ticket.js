(function () {

    var tableNId = $('.page-content-wrapper .classicTableWrap').data('id');
    var tableInstance = MB.Tables.getTable(tableNId);
    tableInstance.ct_instance.ctxMenuData = [
        {
            name: 'option1',
            title: 'Пустой билет(ы)',
            disabled: function(){

            },
            callback: function(){
                var selArr = tableInstance.ct_instance.selection;
                var blankCount = prompt('Сколько пустых билетов нужно вставить в этом месте?',1);
                if (blankCount!=null){
                    var o = {
                        command:"operation",
                        object:"inc_sca_number_in_ticket_pack",
                        params:{
                            ticket_id:tableInstance.data.DATA[selArr[0]][tableInstance.data.NAMES.indexOf('TICKET_ID')],
                            inc_sca_number:blankCount
                        }
                    };
                    //console.log(MB.Core.makeQuery(o));

                    socketQuery(o,function(res){
                        res = JSON.parse(res);
                        res = res['results'][0];
                        toastr[res['toastr']['type']](res['toastr']['message']);
                        tableInstance.ct_instance.notify({type: false});
                        tableInstance.reload();
                    })
                }
                /*bootbox.dialog({
                    message:"Подтвердите создание схемы мероприятия.",
                    title:"Создание схемы мероприятия",
                    buttons:{
                        ok:{
                            label:"Создать схему",
                            className:"yellow",
                            callback:function(){
                                for(var i in selArr){
                                    var id = tableInstance.data.DATA[selArr[i]][tableInstance.data.NAMES.indexOf('ACTION_ID')];
                                    var o = {
                                        command: 'operation',
                                        object: 'create_action_scheme',
                                        params: {
                                            action_id: id
                                        }
                                    };
                                    tableInstance.ct_instance.notify({type: true, text: 'Идет процесс создания схемы мероприятия...'});
                                    socketQuery(o, function(res){
                                        res = JSON.parse(res);
                                        res = res['results'][0];
                                        toastr[res['toastr']['type']](res['toastr']['message']);
                                        tableInstance.ct_instance.notify({type: false});
                                        tableInstance.reload();
                                    });
                                }
                            }
                        },
                        cancel:{
                            label:"Отмена",
                            className:"blue",
                            callback:function(){

                            }
                        }
                    }
                });*/
            }
        },
        {
            name: 'option2',
            title: 'Отменить пустой билет(ы)',
            disabled: function(){

            },
            callback: function(){
                var selArr = tableInstance.ct_instance.selection;
                var blankCount = prompt('На сколько пустых билетов нужно сдвинуть вверх?',1);
                if (blankCount!=null){
                    var o = {
                        command:"operation",
                        object:"dec_sca_number_in_ticket_pack",
                        params:{
                            ticket_id:tableInstance.data.DATA[selArr[0]][tableInstance.data.NAMES.indexOf('TICKET_ID')],
                            inc_sca_number:blankCount
                        }
                    };
                    socketQuery(o,function(res){
                        res = JSON.parse(res);
                        res = res['results'][0];
                        toastr[res['toastr']['type']](res['toastr']['message']);
                        tableInstance.ct_instance.notify({type: false});
                        tableInstance.reload();
                    })
                }
            }
        },
        {
            name: 'option3',
            title: 'Поменять местами',
            disabled: function(){},
            callback: function(){
                var selArr = tableInstance.ct_instance.selection;
                if (selArr.length!=2){
                    toastr['info']('Должно быть выбрано 2 билета');
                }
                var ticketId = prompt('Укажите № билета с которым надо поменять местами номера БСО?',tableInstance.data.DATA[selArr[1]][tableInstance.data.NAMES.indexOf('TICKET_ID')]);
                if (ticketId!=null){
                    var o = {
                        command:"operation",
                        object:"change_sca_between_tickets",
                        params:{
                            ticket_id:tableInstance.data.DATA[selArr[0]][tableInstance.data.NAMES.indexOf('TICKET_ID')],
                            ticket_id2:ticketId
                        }
                    };
                    socketQuery(o,function(res){
                        res = JSON.parse(res);
                        res = res['results'][0];
                        toastr[res['toastr']['type']](res['toastr']['message']);
                        tableInstance.ct_instance.notify({type: false});
                        tableInstance.reload();
                    })
                }
            }
        },
        {
            name: 'option4',
            title: 'Удалить со смещением. (ВНИМАНИЕ)',
            disabled: function(){},
            callback: function(){
                var selArr = tableInstance.ct_instance.selection;

                var agree = confirm('Внимание! Это не обратимая операция. ' +
                'Бланк будет удален, для всех последующих билентов номер БСО будет смещен на одну позицию. ' +
                'Эта операция может понадобиться если система отправила билет на печать, а принтер ничего не распечатал. ' +
                'Вы Уверены что хотите удалить?');
                if (agree){
                    var agree2 = confirm('Уверены?');
                    if (agree2){
                        var o = {
                            command:"operation",
                            object:"remove_ticket_with_shift",
                            params:{
                                ticket_id:tableInstance.data.DATA[selArr[0]][tableInstance.data.NAMES.indexOf('TICKET_ID')]
                            }
                        };
                        socketQuery(o,function(res){
                            res = JSON.parse(res);
                            res = res['results'][0];
                            toastr[res['toastr']['type']](res['toastr']['message']);
                            tableInstance.ct_instance.notify({type: false});
                            tableInstance.reload();
                        })
                    }
                }

            }
        },
        {
            name: 'option5',
            title: 'Переместить',
            disabled: function(){},
            callback: function(){
                var selArr = tableInstance.ct_instance.selection;
                var SCAnum = prompt('Укажите номер БСО, с которым должен оказаться этот билет. ' +
                'Билет с указанным номером и все последующие, вплоть до текущего, будут соответственно смещены на одну позицию');
                if (SCAnum!=null){
                    var o = {
                        command:"operation",
                        object:"move_ticket_with_shift",
                        params:{
                            ticket_id:tableInstance.data.DATA[selArr[0]][tableInstance.data.NAMES.indexOf('TICKET_ID')],
                            sca_number:SCAnum
                        }
                    };
                    socketQuery(o,function(res){
                        res = JSON.parse(res);
                        res = res['results'][0];
                        toastr[res['toastr']['type']](res['toastr']['message']);
                        tableInstance.ct_instance.notify({type: false});
                        tableInstance.reload();
                    })
                }

            }
        }

    ];


}());

