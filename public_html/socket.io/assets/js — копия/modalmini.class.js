var reportLib = {
    report:{
        Name:"Кассовый отчет",
        subcommand:"casher_report",
    },
    report_k17:{
        Name:"Отчет расхода бланков",
        subcommand:"casher_journal_of_operations",
    },
    report_journal_of_operations:{
        Name:"Полный журнал операций",
        subcommand:"casher_report_k_17",
    }
}

MB.modalmini = function(obj){
    if(obj.objectname != undefined){
        this.objectname = obj.objectname;
        this.fileName = this.objectname.substr(this.objectname.indexOf("_")+1);
        log(this.objectname)
        log(this.fileName)
    } else {log("Не передаете objectname!")}
    if(obj.world != undefined){
        this.world = obj.world;
        log(this.world)
    }else {log("Не передаете world!")}
    if(obj.pageswrap != undefined){
        this.pageswrap = obj.pageswrap;
        log(this.pageswrap)
    }else {log("Не передаете pageswrap!")}
}


MB.modalmini.prototype.init = function(){
    var _this = this;
    _this.show();
}

MB.modalmini.prototype.show = function(){
    var _this = this;
    if(_this.fileName.indexOf("report")!=-1){
        var title   = _this.titleReport();
        var content = _this.contentReport();
        var buttonY = "Сформировать";
        var buttonN = "Закрыть"; 
        ModalContent({selector:"#portlet-config",title:title,content:content,buttonY:buttonY,buttonN:buttonN});
        _this.actionsReport();  
    }
    else if(_this.fileName.indexOf("generate_repertuar")!=-1){
        var title   = _this.titleGenereteR();
        var content = _this.contentGenereteR();
        var buttonY = "Сгенерировать";
        var buttonN = "Закрыть"; 
        ModalContent({selector:"#portlet-config",title:title,content:content,buttonY:buttonY,buttonN:buttonN});
        _this.actionsGenereteR(); 
    }
    
}

MB.modalmini.prototype.titleReport = function(){
    var _this = this;
    log(_this)
    if(reportLib[_this.fileName]['Name']!=undefined){
        var titleTex = reportLib[_this.fileName]['Name'];
    }
    else {
        var titleTex = "В библеотеке не указанно название";
    }
    var html = '<h4>'+titleTex+'</h4>';
    return html;
}

MB.modalmini.prototype.contentReport = function(){
    var html = ''+
    '<div id="box_for_cashier_list container">'+
        '<div class="row>'+
            '<label for="cashier_list">Пользователь:</label><br/>'+
            '<select id="cashier_list"></select>'+
        '</div>'+
        '<div class="date_block row">'+
            '<div class="col-md-2">'+
                '<label for="from_date">Дата с:</label>'+
                '<input type="text" id="from_date" class="date_inp" size="10"/>'+
            '</div>'+
            '<div class="col-md-2">'+
                '<label for="to_date">Дата по:</label>'+
                '<input type="text" id="to_date" class="date_inp" size="10"/>'+
            '</div>'+
        '</div><br>'+
        '<div id="cash_visa_box" class="row">'+
            '<div class="col-md-3">'+
                '<input type="radio" id="CASH" name="cash_visa" value="CASH" checked="checked" /><label for="CASH">За наличные</label>'+
            '</div>'+
            '<div class="col-md-4">'+
                '<input type="radio" id="CARD" name="cash_visa" value="CARD" /><label for="CARD">По кредитной карте</label>'+
            '</div>'+
        '</div>'+
    '</div>';
    return html;
}

MB.modalmini.prototype.actionsReport = function(){
    var _this = this;
    $(".date_inp").datepicker({format:"dd-mm-yyyy"});
    MB.Core.sendQuery({command:"get",object:"user_active",sid:MB.User.sid},function(result){
        var obj = MBOOKER.Fn.jsonToObj(result);
        var currentUser = result['CURRENT_USER_ID'];
        for (var key in obj){
            if(currentUser == obj[key]['USER_ID']){
                $("#cashier_list").append('<option value="'+obj[key]['USER_ID']+'" selected>'+obj[key]['FULLNAME']+'</option>');
            }
            else {
                $("#cashier_list").append('<option value="'+obj[key]['USER_ID']+'">'+obj[key]['FULLNAME']+'</option>');
            }
        }
        $(".OkModal").click(function(){
            var arr ={};
            arr['user_id'] = $("#cashier_list").val();
            arr['from_date'] = $("#from_date").val();
            arr['to_date'] = $("#to_date").val();
            arr['payment_type'] = $("[name=cash_visa]:checked").val();
            var get = "?sid="+MB.User.sid;
            for(key in arr){
                get+= "&"+key+"="+arr[key];
            }
            get+= "&subcommand="+reportLib[_this.fileName]['subcommand'];
            var report_page = window.open('html/contents/report/report_print.html'+get,'new','width=1400,height=750,toolbar=1');
            //send_query({command:""})
        });
    });

}

MB.modalmini.prototype.titleGenereteR = function(){
    var html = '<h4> Генерация репертуара </h4>';
    return html;
}
MB.modalmini.prototype.contentGenereteR = function(){
    var html = ''+
    '<div class="row">'+
        '<div class="col-md-12">'+
            '<select id="repertoire_select"></select>'+
            '<hr>'+
        '</div>'+
    '</div>'+
    '<div id="repertoire_params">'+
        '<div class="dates">'+
            '<div class="row">'+
                '<div class="col-md-3">'+
                    '<div class="form-group">'+
                        '<label for="" class="for_date">Начальная дата</label>'+
                        '<input type="text" id="dates_begin_date" class="form-control date_input"/>'+
                    '</div>'+
                '</div>'+
                '<div class="col-md-3">'+
                    '<div class="form-group">'+
                        '<label for="" class="for_date">Конечная дата</label>'+
                        '<input type="text" id="dates_end_date" class="form-control date_input"/>'+
                    '</div>'+
                '</div>'+
            '</div>'+
        '</div>'+
        '<div class="times">'+
            '<h4> Время </h4>'+
            '<input type="text" class="time_input" size="5"/>'+
        '</div>'+
        '<div class="week">'+
            '<h4>'+
            '<div class="pull-left"><input type="checkbox" id="week_day1" checked/></div>'+
            ' Дни недели '+
            '</h4>'+
            '<div> <input type="checkbox" id="week_day1" checked/><label for="week_day1">Понедельник</label> </div>'+
            '<div> <input type="checkbox" id="week_day2" checked/><label for="week_day2">Вторник</label> </div>'+
            '<div> <input type="checkbox" id="week_day3" checked/><label for="week_day3">Среда</label> </div>'+
            '<div> <input type="checkbox" id="week_day4" checked/><label for="week_day4">Четверг</label> </div>'+
            '<div> <input type="checkbox" id="week_day5" checked/><label for="week_day5">Пятница</label> </div>'+
            '<div> <input type="checkbox" id="week_day6" checked/><label for="week_day6">Суббота</label> </div>'+
            '<div> <input type="checkbox" id="week_day7" checked/><label for="week_day7">Воскресенье</label> </div>'+
        '</div>'+
        '<div id="save_repertoire" class="btn btn-success">Создать</div>'+
    '</div>';
    return html;
}

MB.modalmini.prototype.actionsGenereteR = function(){
    $(".date_input").datepicker({format:"dd.mm.yyyy"});
    $(".time_input").timepicker({showMeridian:false});
    MB.Core.sendQuery({command:"get",object:"action",sid:sid}, function(result){
        var obj = MB.Core.jsonToObj(result);
        var html = "";
        for (i in obj){
            html+= '<option value="'+obj[i]['ACTION_ID']+'">'+obj[i]['ACTION_WITH_DATE']+'</option>'
        }
        $("#repertoire_select").html(html);
    });
    $(".time_input").live("change",function(){
        if($(this).val()!=""){
            var parent = $(this).parents(".times");
            var html = '<input type="text" class="time_input" size="5"/>';
            var check = 1;
            parent.find("input").each(function(){
                if($(this).val()=="") {
                    check = 0;
                }
            })
            if(check==1){
                parent.append(html);
                $(".time_input").timepicker({showMeridian:false});
            }
            
        }
    })

/*

    $(".date_input").datepicker({dateFormat: 'dd-mm-yy',showAnim:'slideDown', changeMonth: true,changeYear: true, showOn: "button",buttonImage: "img/calendar.gif",buttonImageOnly: true});
    $(".date_input").mask("99-99-9999");
    $(".time_input").timepicker({ 'timeFormat': 'H:i' });


    $(".time_input").live("change",function(){
        if($(this).val()!=""){
            var parent = $(this).parents(".times");
            var html = '<input type="text" class="form-control time_input ui-timepicker-input"/>';
            var check = 1;
            parent.find("input").each(function(){
                if($(this).val()=="") {
                    check = 0;
                }
            })
            log(check)
            if(check==1){
                parent.append(html);
                $(".time_input").timepicker({ 'timeFormat': 'H:i' });
            }
            
        }
    })
    $("#save_repertoire").click(function(){
        $("#repertoire_refresh").show();
        $("#repertoire_params").hide();
        var params = {};
        $(".week").find("input").each(function(){
            var key = $(this).attr("id").replace("week_","");
            if($(this).attr("checked")){var val = "TRUE";}else {var val = "FALSE";}
            params[key] = val;
        });
        $(".dates").find("input").each(function(){
            var key = $(this).attr("id").replace("dates_","");
            var val = $(this).val();
            params[key] = val;
        });
        var times = "";
        $(".times").find("input").each(function(){
            if($(this).val()!=""){
                times+= $(this).val()+",";
            }
            
        })
        params['time_list'] = times.substring(0, times.length - 1);
        params['action_id'] = $("#repertoire_select").val();
        send_query({command:"operation",subcommand:"generate_repertuar",sid:sid,params:params},function(data){
            var obj = xmlToObject(data,"result")[0];
            if(obj['rc']==0){
                alert_yesno("Успех","<center>Репертуары успешно сгенерированы</center>","Ок","",function(){
                    
                },0);
            }
            else {
                alert_yesno("<span style='color:#f00;'>Ошибка.</span>","<center>"+obj["message"]+"</center>","Ок","",function(){
                    
                },0);
            }
            $("#repertoire_refresh").hide();
            $("#repertoire_params").show();
        });
    })
*/
}

function ModalContent(obj){
    var ModalDiv = $(obj.selector);
    var ModalHeader =   ModalDiv.find(".modal-header");
    var ModalBody =     ModalDiv.find(".modal-body");
    var ModalOk =       ModalDiv.find(".OkModal");
    var ModalCancel =   ModalDiv.find(".close_modal");
    ModalHeader.html(obj.title);
    ModalBody.html(obj.content);
    ModalOk.html(obj.buttonY);
    ModalCancel.html(obj.buttonN);
    ModalDiv.modal("show");
}