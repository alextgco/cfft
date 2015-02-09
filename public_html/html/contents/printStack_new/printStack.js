(function(){

    var contentID = MB.Contents.justAddedId;
    var contentInstance = MB.Contents.getItem(contentID);
    var contentWrapper = $('#mw-' + contentInstance.id);

    //["PRINT_QUEUE_ID", "CONTRACT_ID", "ORDER_ID", "ORDER_TICKET_ID", "PRINTED", "TICKET_PACK_ID", "SCA_SERIES",
    // "SCA_NUMBER", "PRINTER_ID", "IP_ADDRESS", "PORT", "PRINTER_TYPE", "ORGANIZER_NAME", "ORGANIZER_ADDRESS", "OKUN",
    // "SHOW_SEASON", "ACTION_NAME", "ACTION_NAME2", "HALL_NAME", "ACTION_DATE", "ACTION_TIME", "AGE_CAT", "AREA_NAME",
    // "LINE", "PLACE", "PRICE", "CASHER_NAME", "PRINT_DATE_TIME", "TICKET_NO", "PERSON_NAME", "PERSON_ADDRESS",
    // "PERSON_PHONE", "LOGO_ID", "EXT_ID", "USER_ID", "ACTION_ID", "BARCODE", "SUBSCRIPTION_ID", "TICKET_PACK_TYPE",
    // "PRINT_STATUS", "PRINT_STATUS_RU", "EXTERNAL_ORDER_ID"]




    var tickets = {
        portion:2,
        blank_types:{},

        /**
         * Функция подготавливает клиентскую модель билета на основе серверной и возвращает объект
         * !Внимание! Функция не добавляет получившийся объект в items
         * @param obj
         * @returns {{print_queue_id: (*|string), order_ticket_id: (.params.ORDER_TICKET_ID|*|o.ORDER_TICKET_ID|string), action: string, place: string, price: (templates.BARVIKHA.STANDART.PRICE|*|templates.BARVIKHA.SUBSCRIPTION.PRICE|SUBSCRIPTION.PRICE|tmpObj.PRICE|string), sca: string, print_status: (*|string), print_status_ru: (*|string), barcode: (*|thObj.barcode), blank_type: (resObj.TICKET_PACK_TYPE|*)}}
         */
        newItem:function(obj){
            if (typeof obj!=="object"){
                return false;
            }
            return {
                print_queue_id:obj.PRINT_QUEUE_ID || '-',
                order_ticket_id:obj.ORDER_TICKET_ID || '-',
                action:obj.ACTION_NAME + ' ('+ (obj.ACTION_DATE_TIME || obj.ACTION_DATE +' '+ obj.ACTION_TIME)+')',
                place:obj.AREA_NAME+' '+ (obj.LINE_WITH_TITLE || obj.LINE)+' '+ (obj.PLACE_WITH_TITLE || obj.PLACE),
                price:obj.PRICE || '',
                sca:(obj.SCA_SERIES) ? obj.SCA_SERIES +'-'+obj.SCA_NUMBER : '',
                print_status:obj.PRINT_STATUS || '-',
                print_status_ru:obj.PRINT_STATUS_RU || '-',
                barcode:obj.BARCODE,
                blank_type:obj.TICKET_PACK_TYPE
            };
        },


        /**
         * Добавляет билеты в скоуп
         * @param packs билеты
         * @param clear Очищать  скоуп перед заполнением или нет | false
         * @returns {*}
         */
        addItems:function(packs, clear){
            if (typeof packs!=='object'){
                return false;
            }
            if (clear){
                tickets.blank_types = {};
            }
            for (var i0 in packs) {
                var one_pack = packs[i0];
                for (var i in one_pack) {
                    if (typeof tickets.blank_types[i0]!=='object'){
                        tickets.blank_types[i0] = [];
                    }
                    var item = tickets.newItem(one_pack[i]);
                    if (item) {
                        tickets.blank_types[i0].push(item);
                    }
                }
            }
            return item;
        },
        getItem:function(obj, many){
            if (typeof obj!=='object'){
                return false;
            }
            var finded = [];
            var stop = false;
            var count = 0;
            for (var i in tickets.blank_types) {
                if (stop){
                    break;
                }
                var records = tickets.blank_types[i];
                for (var j in  records) {
                    var isFinded = false;
                    for (var k in obj) {
                        isFinded = (records[j][k]==obj[k]);
                    }
                    if (isFinded){
                        count++;
                        finded.push(records[j]);
                        if (!many || many === count){
                            stop = true;
                            break;
                        }
                    }
                }
            }
            return (many)?finded:finded[0];
        },
        updateItem:function(changes, where, many){
            if (typeof where!=='object' || changes!=='object'){
                return false;
            }
            var item = tickets.getItem(where,many);
            if (!item){
                return false;
            }
            if (many){
                for (var i in item) {
                    for (var j in changes) {
                        item[i][j] = changes[j];
                    }
                }
            }else{
                for (var j2 in changes) {
                    item[j2] = changes[j2];
                }
            }
            return item;
        },
        removeItem:function(where,many){
            if (typeof where!=='object'){
                return false;
            }
            var count = 0;
            var stop = false;
            for (var i in tickets.blank_types) {
                if (stop){
                    break;
                }
                var records = tickets.blank_types[i];
                for (var j in  records) {
                    var isFinded = false;
                    for (var k in where) {
                        isFinded = (records[j][k]==where[k]);
                    }
                    if (isFinded){
                        count++;
                        delete tickets.blank_types[i][j];
                        if (!many || many === count){
                            stop = true;
                            break;
                        }
                    }
                }
            }

            function clearEmpty(obj) {
                for (var i = 0; i < obj.length; i++) {
                    if (obj[i] === undefined) {
                        obj.splice(i, 1);
                        clearEmpty(obj);
                    }
                }
            }
            for (var i1 in tickets.blank_types) {
                clearEmpty(tickets.blank_types[i1]);
            }
            return count;
        }

    };

    function load_tickets(arr){
        if (typeof arr!=="object"){
            console.log('В load_tickets не приходит arr.');
            return;
        }
        var ids = arr.join(',');
        var o  = {command:"get",object:"order_ticket",params:{where:"order_ticket_id in ("+ids+")"}};
        socketQuery(o,function(res){
            res = JSON.parse(res).results[0];
            var data = jsonToObj(res);
            console.log(data);
            for (var i in data) {
                tickets.newItem(data[i]);

            }
            console.log(tickets.items);
        });
    }
    //load_tickets([14657,14655]);
   /* var o = {
        "0": {
            "ORDER_ID": "3819",
            "ORDER_TICKET_ID": "14657",
            "ACTION_SCHEME_ID": "445058",
            "ACTION": "Приключения Петра Мамонова (09-07-2015 10:40:00)",
            "ACTION_DATE_TIME": "09-07-2015 10:40:00",
            "ACTION_DATE": "09-07-2015 00:00:00",
            "LINE_WITH_TITLE": "Ряд 6",
            "PLACE_WITH_TITLE": "Место 13",
            "AREA_GROUP": "Амфитеатр",
            "STATUS": "CANCELED",
            "STATUS_RU": "Отменен",
            "TICKET_TYPE": "TICKET",
            "TICKET_TYPE_RU": "Билет",
            "PRICE": "356",
            "TICKET_DATE": "16-01-2015 17:33:08",
            "BARCODE": "369887",
            "SCA_SERIES": "",
            "SCA_NUMBER": "",
            "CREATED_USER_ID": "74",
            "USER_FULLNAME": "Гоптарев Александр ",
            "PRINT_STATUS": "NOT_PRINTED",
            "PRINT_STATUS_RU": "Не напечатан",
            "TICKET_ACTION_MARGIN": "",
            "TICKET_SERVICE_FEE": ""
        }
    };*/
    console.log('executed');

    contentInstance.addItems = tickets.addItems;
    contentInstance.getItem = tickets.getItem;
    contentInstance.removeItem = tickets.removeItem;
}());



//var o  = {command:"get",object:"order_ticket",params:{where:"order_ticket_id in (14657,14655)"}};