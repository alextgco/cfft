$(document).ready(function(){
    var accept = $('.acceptResult');
    var reject = $('.rejectResult');

    accept.off('click').on('click', function(){
        var id = $(this).data('id');
        bootbox.dialog({
            title: 'Подтверждение',
            message: 'Вы уверены, что хотите подтвердить данный результат?',
            buttons: {
                success: {
                    label: 'Подтвердить',
                    callback: function(){
                        var o = {
                            command: 'approve',
                            object: 'results',
                            params: {
                                id: id,
                                status: 'ACCEPTED'
                            }
                        };
                        sendQuery(o, function(res){
                            toastr[res.toastr.type](res.toastr.message);
                        });
                    }
                },
                error: {
                    label: 'Отмена',
                    callback: function(){

                    }
                }
            }
        });
    });

    reject.off('click').on('click', function(){
        var id = $(this).data('id');
        bootbox.dialog({
            title: 'Подтверждение',
            message: 'Укажите причину отклонения заявки: <input type="text" class="rejectReason form-control" />',
            buttons: {
                success: {
                    label: 'Отклонить',
                    callback: function(){
                        var o = {
                            command: 'approve',
                            object: 'result',
                            params: {
                                id: id,
                                status: 'REJECTED',
                                rejectReason: $('.rejectReason').val()
                            }
                        };
                        sendQuery(o, function(res){
                            toastr[res.toastr.type](res.toastr.message);
                        });
                    }
                },
                error: {
                    label: 'Отмена',
                    callback: function(){

                    }
                }
            }
        });

    });
});
