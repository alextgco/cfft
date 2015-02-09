

    /**
     * Функция выводит в консоль переданную информацию
     * @param string
     */
    function log(string,name){
        console.log(name,string);
    }


    /**
     * Функция посылает запрос на сервер и возвращает результат
     * @param params
     *  Объект содержащий информацию о команде, подкоманде, sid, и параметрах команды
     * @param callback
     *  Если вторым параметром передана функция, то она запустится после выполнения запроса к серверу и передаст в нее результаты
     * @return {Boolean}
     * Возвращает false если объект передан неверно, true если все прошло успешно, и данные, если запрос прошел, но функция callback не передана
     *
     * Пример вызова:
     * send_query({sid:"<номер сессии>",command:"<Имя команды>",subcommand:"<Имя подкоманды>",params:{event_item_id:123}},function(data){

     });
     */
    function send_query(params,callback){
        if (typeof params != "object") return false;
        var p_xml = "<query>";
        if (params.sid != undefined){
            p_xml += "<sid>"+params.sid+"</sid>"
        }
        if (params.command == undefined) return false;
        p_xml += "<command>"+params.command+"</command>";
        if (params.subcommand != undefined){
            p_xml += "<subcommand>"+params.subcommand+"</subcommand>";

        }
        if (typeof params.params == "object"){
            for(var key in params.params){
                p_xml += "<"+key+">"+params.params[key]+"</"+key+">"
            }
        }
        p_xml += "</query>";
        $.get("/cgi-bin/b2c",{p_xml:p_xml},function(data){
            if (typeof callback != "function") return data;
            callback(data);
        });
        return true;
    }

    /**
     * Функция возвращает sid или false, если авторизация не пройдена.
     * @param login
     * @param password
     */
    function get_sid(login,password){
        send_query({command:"logon",params:{login:login,password:password}},function(data){
            if (data.find('sid').length>0) return data.find('sid');
            return false;
        });

    }



