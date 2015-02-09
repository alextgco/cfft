(function () {

    var formID = MB.Forms.justLoadedId;
    var formInstance = MB.Forms.getForm('form_action_ro', formID);
    var formWrapper = $('#mw-'+formInstance.id);

    formWrapper.find('.mw-save-form').hide(0);

    var hallAddrWrapper = formWrapper.find('.form-ro-get-hall-address');
    var hallId = hallAddrWrapper.data('hall_id');
    if(hallId.toString().length > 0){
        var o = {
            command: 'get',
            object: 'hall',
            params:{
                where: 'HALL_ID = '+hallId
            }
        };
        socketQuery(o, function(res){
            res = JSON.parse(res);
            res = res['results'][0];
            var addr = res.data[0][res.data_columns.indexOf('ADDR')];
            hallAddrWrapper.html('( ' + addr + ' )');
        });
    }

    for(var i = 0; i < formWrapper.find('.form-ro-value').length; i++){
        var item = formWrapper.find('.form-ro-value').eq(i);
        if(item.html() == ''){
            item.html(' - ');
        }
    }

    var goToPayBtn = formWrapper.find('.goToPay');
    goToPayBtn.off('click').on('click', function(){
        var action_id = formInstance.activeId;
        var data = formInstance.data.DATA[0];
        var names = formInstance.data.NAMES;
        var type = data[names.indexOf('ACTION_TYPE')];

        if(type !== "ACTION_WO_PLACES"){

            var field_num = names.indexOf('ACTION_WITH_DATE');
            var hallIndex = names.indexOf('HALL');
            var action_label = data[field_num]+" | "+data[hallIndex];

            MB.Core.modalWindows.windows.getWindow(formInstance.modalId).collapse();
            MB.Core.switchModal({type:"content", filename:"one_action", params:{action_id:action_id,title: action_label, label:'Продажа', action_name:action_label}});

        }else {
            var o = {
                command: 'get',
                object: 'action_scheme_ticket_zone',
                params:{
                    where: 'action_id = '+action_id
                }
            };
            socketQuery(o, function(res){
                res = JSON.parse(res);
                res = res['results'][0];

                console.log('wpData', res);
                var n = res.NAMES;
                var d = res.DATA;
                var tpl = '{{#zones}}<div data-id="{{id}}" class="row marTop10 wp-zone-item"><div class="col-md-12"><div class="form-group"><label class="control-label">{{label}} (Осталось билетов: {{max}} стоимость: {{price}})</label><input max="{{max}}" min="0" class="col-md-6 form-control orderTicketCount marTop5" type="number" value=""/></div></div></div>{{/zones}}';
                var mo = {
                    zones: []
                };
                for(var i in d){
                    var it = d[i];
                    var to = {
                        id: it[n.indexOf('ACTION_SCHEME_TICKET_ZONE_ID')],
                        label: it[n.indexOf('NAME')],
                        max: it[n.indexOf('TICKET_COUNT')],
                        price: it[n.indexOf('TICKET_PRICE')]
                    };
                    mo.zones.push(to);
                }
                bootbox.dialog({
                    title: 'Выберите входные билеты',
                    message: Mustache.to_html(tpl, mo),
                    buttons: {
                        ok: {
                            label:"Ок",
                            className:"blue",
                            callback: function(){
                                var o = {
                                    command: 'operation',
                                    object: 'create_to_pay_order_without_places',
                                    sid: MB.User.sid,
                                    ACTION_ID: actionId
                                };
                                for(var i=0; i<$('.wp-zone-item').length; i++){
                                    var r = $('.wp-zone-item').eq(i);
                                    var id = r.data('id');
                                    var count = r.find('.orderTicketCount').val();
                                    o['action_scheme_ticket_zone_id_'+(i+1)] = id;
                                    o['ticket_count_'+(i+1)] = count;
                                }
                                MB.Core.sendQuery(o, function(res){
                                    toastr[res['TOAST_TYPE']](res['MESSAGE'], res['TITLE']);
                                });
                            }
                        },
                        cancel:{
                            label:"Отмена",
                            className:"blue",
                            callback: function(){

                            }
                        }
                    }
                });
            });
        }
    });


//    var defaultImagePath = 'assets/img/default-action-image.png';
//    var posterImageWrapper = formWrapper.find('.posterImageWrapper');
//    var imageUrl = (posterImageWrapper.find('img').attr('data-image') == '')? defaultImagePath : 'upload/'+posterImageWrapper.find('img').attr('data-image');
//    var imageName = (posterImageWrapper.find('img').attr('data-image') == '')? 'Постер мероприятия': posterImageWrapper.find('img').attr('data-image');
//
//    posterImageWrapper.find('img').attr('src', imageUrl);
//    posterImageWrapper.find('.fn-field-image-name').html(imageName);


})();