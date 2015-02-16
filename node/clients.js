var oracle = require('./oracle2');
var funcs = require('./functions').functions;
var config = require('./config');
var pack_templates = require('./pack_templates');
var logF = require('./my_log').logF;
var copyHallScheme = require('./copyHallScheme');


makeQueryTMP = function (options, callback) {
    var xml = "<query>";
    //if (options && typeof options === "object" && options.object && options.command) {
    if (options && typeof options === "object" && options.command) {
        if (options.hasOwnProperty("params")) {
            for (var key in options.params) {
                xml += "<" + key + ">" + options.params[key] + "</" + key + ">";
            }
            //delete options.params;
        }
        for (var key in options) {
            if (key == "params") continue;
            xml += "<" + key + ">" + options[key] + "</" + key + ">";
        }
        xml += "</query>";
    }
    return xml;
};


var clients = {
    printing_orders: [],
    InPrintingOrders: function (order_id) {
        for (var i in this.printing_orders) {
            if (this.printing_orders[i] === order_id) {
                return true;
            }
        }
        return false;
    },
    removePrintingOrders: function (order_id) {
        for (var i in this.printing_orders) {
            if (+this.printing_orders[i] === +order_id) {
                delete this.printing_orders[i];
                return;
            }
        }
    },
    items: {},
    message_stack: {},
    getFromClient: function (obj, guid) {
        if (typeof obj !== "object" || !guid) {
            return;
        }
        console.log('__________getFromClient________________________________________');
        console.log(obj);
        var client = clients.getById(guid);
        if (typeof client !== "object") {
            return;
        }
        var command = obj.command;
        var data = obj.data || {};
        var back = obj.back;

        switch (command) {
            case "CLEAR_NOT_PRINTED_TICKETS":
                clients.clearNotPrintedTickets(client);
                break;
            case "CHANGE_PACK":
                this.setPacksToPrinters(client);
                break;
            case "CHANGE_PACK_CANCEL":
                var ticketstack_pack = client.ticket_stack[back];
                for (var i in ticketstack_pack) {
                    if (isNaN(+i)) {
                        continue;
                    }
                    this.cancel_ticket(client, ticketstack_pack[i].PRINT_QUEUE_ID);
                }
                delete client.ticket_stack[back];
                this.print_tickets(client);


                break;
            case "PACK_CONFIRM":
                for (var i in data) {
                    for (var p in client.printers) {
                        if (i != p) {
                            continue;
                        }
                        client.printers[p] = data[i];
                    }
                }
                clients.setStatus(client, "ACTIVE");
                clients.setUserPacks(client);
                var o = {
                    type: "PACK_INFO",
                    data: client.printers || {}
                };
                clients.sendToClient(client, o);
                this.print_tickets(client);
                break;
            case "PRINT_ORDER":
                this.printOrder(client, {order_id: 2800});
                break;
            case "PRINT_NEXT_PORTION":
                this.printNext(client, {ticket_pack_type:obj.type});
                break;
            case "SET_CURRENT_NUM":
                this.setCurrentNum(client, data);
                break;
            case "EXPORT_HALL_SCHEME":
                copyHallScheme.exportToJSON({
                    id: obj.id
                }, client);
                break;
            case "IMPORT_HALL_SCHEME":
                copyHallScheme.importFromJSON({
                    file_name: obj.file_name,
                    hall_id: obj.hall_id
                }, client);
                break;
        }
    },
    sendToClient: function (client, obj) {

        if (typeof client !== "object" || typeof obj !== "object") {
            console.log('в sendToClient не передан client или obj');
            return;
        }
        var mySocket = client.cSocket;
        if (typeof  mySocket !== "object") {
            console.log('в sendToClient client.socket не определен');
            return;
        }
        mySocket.emit('print', obj);

    },
    setCurrentNum: function (client, data) {
        if (typeof client !== "object" || typeof data !== "object") {
            return;
        }
        console.log('++++++++++++SET_CURRENT_NUM++++++++++');
        var o = {
            command: "operation",
            object: "set_current_sca_number",
            sid: client.sid,
            in_out_key: client.id,
            params: {
                ticket_pack_id: data.ticket_pack_id,
                sca_current_no: data.sca_current_no
            }
        };

        oracle.execute({
            o: o, callback: function (obj) {

                var client = clients.items[obj.io_key];
                if (typeof client !== "object") {
                    return;
                }
                clients.getUserPacks(client);


            }
        });
    },
    sendToPrinter: function (client, obj) {
        if (typeof client !== "object" || typeof obj !== "object") {
            return;
        }

        var count = 0;

        function send() {
            if (count > 100) {
                // Если все потеряно)
                clients.clearNotPrintedTickets(client);
                var o = {
                    message: 'Не удалось отправить на печать.',
                    type: "ERROR"
                };
                clients.sendToClient(client, o);
                console.log('Не удалось отправить на печать.');
                return;
            }
            if (typeof client.pRes !== "object") {
                setTimeout(function () {

                    count++;
                    send();
                }, 500);
            } else {
                client.pRes.end(JSON.stringify(obj));
                client.pRes = 0;
            }

        }

        send();
    },
    setStatus: function (client, status) {
        if (typeof client !== "object") {
            return;
        }
        if (status && client.status !== status) {
            client.status = status;
            return status;
        } else {
            if (client.user && typeof client.pRes === "object" && client.status !== "ACTIVE") {
                client.status = "OK";
                return client.status;
            } else if (client.status != "NEW" && client.status != "ACTIVE") {
                client.status = "NEW";
                return client.status;
            } else if (client.status === "ACTIVE" && client.printers.length === 0) {
                client.status = "OK";
                return client.status;
            }
        }
        return false;
    },
    getById: function (id) {
        for (var i in this.items) {
            /*var item = this.items[i];
             if (typeof item!=='object') continue;*/
            //console.log('----------------client: ',i);
            if (i == id) return this.items[i];
        }
        return false;
    },
    getByLogin: function (login) {
        for (var i in this.items) {
            /*var item = this.items[i];
             if (typeof item!=='object') continue;*/
            //console.log('----------------client: ',i);
            if (this.items[i].user == login) return this.items[i];
        }
        return false;
    },
    getByCSocketId: function (id) {
        for (var i in this.items) {
            var item = this.items[i];
            if (typeof item !== 'object') continue;
            //console.log('----------------client: ',i);
            if (item.cSocket.id == id) return this.items[i];
        }
        return false;
    },
    /*getByUser:function(user){
     for (var i in this.items) {
     var item = this.items[i];
     if (typeof item!=='object') continue;
     //console.log('----------------client: ',i);
     if (item.user==user) return this.items[i];
     }
     return false;
     },*/
    remove: function (id, obj) {
        if (typeof obj !== 'object' || !id) return false;
        var client;
        if (this.getById(id)) {
            for (var i in obj) {
                if (typeof this.items[id][i] !== "undefined") {
                    this.items[id][i] = obj[i];
                }
            }

        } else {
            /// Обновляем переданные поля


        }
        client = this.items[id];
        var status = this.setStatus(client);
        // TODO Сделать по Logout и дисконнект pSocket
    },
    checkConnection: function (client) {
        //console.log(client);
        if (typeof client !== "object") {
            return;
        }
        console.log('checkConnection');


        if (client.pRes !== 0) {
            console.log('send to pClient testConnection');
            var command = 'testConnection';
            if (client.printers.length == 0) {
                command = 'getPrinters';
            }
            console.log('command ' + command);
            client.pRes.end(JSON.stringify({command: command}));
            client.pRes = 0;
        }
    },
    getPrinters: function (client) {
        if (typeof client !== "object") {
            return;
        }
        client.pRes.end(JSON.stringify({command: "getPrinters"}));
        client.pRes = 0;
    },
    update: function (id, obj) {
        if (typeof obj !== 'object' || !id) {
            return false;
        }
        var client, newPRes;

        if (typeof obj.pRes === "object") {
            newPRes = true;
        }

        if (!this.getById(id)) {
            /// Новый client

            this.items[id] = {
                id: id,
                user: obj.user || '',
                sid: obj.sid || '',
                cSocket: obj.cSocket || 0,
                clientSock: obj.clientSock || [],
                status: obj.status || 'NEW',
                pRes: obj.pRes || 0,
                printers: obj.printers || [],
                ticket_stack: {},
                print_response_stack: []
            };


        } else {
            /// Обновляем переданные поля

            for (var i in obj) {
                if (typeof this.items[id][i] !== "undefined") {
                    this.items[id][i] = obj[i];
                    if (i === 'user') {
                        this.items[id].ticket_stack = {};

                    }

                    if (i == 'pRes' && this.items[id].status == "NEW" && this.items[id].printers.length == 0) {
                        this.setStatus(this.items[id], 'WAIT_SET_PRINTERS');
                        this.getPrinters(this.items[id]);
                    }
                    /*else if(typeof this.items[id].oldPrinters==="object" && this.items[id].oldPrinters.length>0 && this.items[id].length==0) {
                     var o = {
                     message:'ОК',
                     type:"OK"
                     };
                     clients.sendToClient(client,o);
                     console.log('_________________________________');
                     console.log('ПЕРЕПОДКЛЮЧЕНИЕ');

                     }*/

                }
            }

        }
        client = this.items[id];

        var msg = '';
        if (this.message_stack[client.user] && client.cSocket !== 0) {
            for (var j in this.message_stack[client.user]) {
                msg += this.message_stack[client.user][j].message || '';
                msg += '<br>';
                delete this.message_stack[client.user][j];
            }
            client.cSocket.emit('sendToAll', {message: msg});
            delete this.message_stack[client.user];
        }

        if ((client.status === "WAIT_SET_PRINTERS" && client.printers.length == 0) || obj['clientSock']) {
            return;
        }

        var status = this.setStatus(client);


        if (status === "OK") {
            // Делаем запрос пачек

            this.getUserPacks(client);

        } else {
            if (typeof client.printer == "object") {
                if (client.printers.length == 0 && client.pRes !== 0) {
                    /*var o = {
                     message:'NEED LOAD',
                     type:"OK"
                     };
                     clients.sendToClient(client,o);*/
                    this.getUserPacks(client);
                }
            }
            var o = {
                type: "PACK_INFO",
                data: client.printers || {}
            };

            if (status !== "ACTIVE") {
                clients.sendToClient(client, o);
                clients.setStatus(client, "ACTIVE");
            }
        }
        return client;


    },
    setUserPacks: function (client) {
        var self = this;
        var o = {
            command: "operation",
            object: "clear_user_printer",
            sid: client.sid,
            in_out_key: client.id,
            params: {
                login: client.user,
                guid: client.id
            }
        };
        oracle.execute({
            o: o, callback: function (obj) {
                var client = self.items[obj.io_key];
                //console.log(obj);
                for (var p in client.printers) {
                    if (!client.printers[p].TICKET_PACK_ID) {
                        continue;
                    }
                    var o = {
                        command: "new",
                        object: "user_printer",
                        sid: client.sid,
                        in_out_key: client.id,
                        params: {
                            login: client.user,
                            guid: client.id,
                            printer_name: p,
                            pack_id: client.printers[p].TICKET_PACK_ID
                        }
                    };
                    oracle.execute({
                        o: o, callback: function (obj) {
                            //console.log(obj);
                        }
                    });
                }
            }
        });
    },
    loadUserPack: function (client, callback) {
        var self = this;
        var o = {
            command: "get",
            object: "ticket_pack_for_user",
            sid: client.sid,
            in_out_key: client.id
            /*columns:"TICKET_PACK_ID,TICKET_PACK_NAME"*/
        };
        oracle.execute({
            o: o, callback: function (obj) {
                var data = funcs.jsonToObj(obj.resultJSON);
                var client = self.items[obj.io_key];
                client.packs = data;
                if (typeof callback === "function") {
                    callback(client, data);
                }
            }
        });

    },
    getUserPacks: function (client) {
        if (typeof client !== "object") {
            return;
        }
        if (!client.sid) {
            return;
        }

        var self = this;
        this.loadUserPack(client, function (client, data) {

            getPackByID = function (client, pack_id) {
                for (var i in client.packs) {
                    if (client.packs[i].TICKET_PACK_ID == pack_id) {
                        return client.packs[i];
                    }
                }
                return {};
            };

            var o = {
                command: "get",
                object: "user_printer",
                sid: client.sid,
                in_out_key: client.id,
                params: {
                    where: "login = '" + client.user + "' AND guid='" + client.id + "'"
                }
            };
            oracle.execute({
                o: o, callback: function (obj) {
                    var data = funcs.jsonToObj(obj.resultJSON);
                    var client = self.items[obj.io_key];
                    for (var i in data) {
                        for (var p in client.printers) {

                            if (data[i].PRINTER_NAME == p) {
                                client.printers[p] = getPackByID(client, data[i].PACK_ID);
                            }
                        }

                    }
                    var o = {
                        type: "PACK_INFO",
                        data: client.printers || {}
                    };
                    clients.sendToClient(client, o);

                    clients.setStatus(client, "ACTIVE");
                }
            });

        });
        /*var o = {
         command: "get",
         object: "ticket_pack_for_user",
         sid: client.sid,
         in_out_key:client.id
         */
        /*columns:"TICKET_PACK_ID,TICKET_PACK_NAME"*/
        /*
         };
         oracle.execute({o:o,callback:function (obj) {
         var data = funcs.jsonToObj(obj.resultJSON);
         var client = self.items[obj.io_key];
         client.packs = data;

         }});*/
    },
    setPacksToPrinters: function (client, obj) {
        console.log('setPacksToPrinters');
        var self = this;
        var status = client.status;
        if (typeof obj !== "object") {
            obj = {};
        }

        var count = 0;
        var count2 = 0;

        function check() {
            if (count > 100) {
                //превышено кол-во попыток

                clients.clearNotPrintedTickets(client);
                var o = {
                    message: 'Не найдено ни одного принтера',
                    type: "ERROR"
                };
                clients.sendToClient(client, o);
                console.log('Не найдено ни одного принтера билеты отменяем.');
                return;
            }
            if (client.printers.length === 0) {
                // вызываем реконнект, ждем и запускаем заного
                count++;
                clients.checkConnection(client);
                setTimeout(function () {
                    check();
                }, 10);
                return;
            } else {
                console.log('==================================================');
                console.log(status);

                function send() {
                    if (status != "OK" && status != "ACTIVE" && status != "NEED_CONFIRM") {
                        return false;
                    }
                    self.loadUserPack(client, function (client, data) {
                        if (self.setStatus(client, "NEED_CONFIRM")) {

                            var o = {
                                message: obj.message || 'Подтвердите установленные принтера и пачки БСО',
                                type: obj.type || "NEED_CONFIRM",
                                printers: client.printers || {},
                                packs: data,
                                back: obj.back || ''
                            };
                            clients.sendToClient(client, o);
                        }

                    });
                }

                function wait() {
                    if (count2 > 100) {
                        // send как есть
                        send();
                        return;
                    }
                    if (status != "ACTIVE") {
                        count2++;
                        setTimeout(function () {
                            wait();
                        }, 20);
                    } else {
                        send();
                    }
                }

                wait();

            }
        }

        check();
    },
    clearNotPrintedTickets: function (client) {
        if (typeof client !== "object") {
            return;
        }

        var o = {
            command: "operation",
            object: "print_queue_cancel_by_user",
            sid: client.sid
        };
        oracle.execute({o: o});


    },
    addTickets: function (client, tickets) {
        if (typeof client !== "object" || typeof tickets !== "object") {
            return false;
        }
        /// Разбиваем по типам бланков
        /*
         * client.ticket_stack['STANDART'] = [{},{}...];
         * */
        function checkTicketInStack(id) {

            for (var i in client.ticket_stack[ticketpacktype]) {
                if (isNaN(+i)) {
                    continue;
                }
                if (client.ticket_stack[ticketpacktype][i].ORDER_TICKET_ID === id) {
                    return false;
                }
            }
            return true;
        }

        for (var t in tickets) {
            var ticketpacktype = tickets[t].TICKET_PACK_TYPE;
            if (client.ticket_stack[ticketpacktype] === undefined) {
                client.ticket_stack[ticketpacktype] = [];
            }
            client.ticket_stack[ticketpacktype].portion = 2;
            client.ticket_stack[ticketpacktype].numInPortion = 0;
            client.ticket_stack[ticketpacktype].status = "ACTIVE";

            if (checkTicketInStack(tickets[t].ORDER_TICKET_ID)) {
                /// ЕСли номер заказа из внешней системы то подставим его!
                tickets[t].ORDER_ID = tickets[t].EXTERNAL_ORDER_ID || tickets[t].ORDER_ID;
                client.ticket_stack[ticketpacktype].push(tickets[t]);
            }

        }
       /* *//*
         * Сортируем по количеству билетов каждого типа
         * *//*
        client.ticket_stack = client.ticket_stack.sort(function (a, b) {
            if (a.length > b.length) return 1;
            if (a.length < b.length) return -1;
            return 0;
        });*/


        return true;

    },
    print_tickets: function (client) {
        // Остались ли билеты
        var hasTickets = false;
        for (var i0 in client.ticket_stack) {
            if (client.ticket_stack[i0].length !== 0) {
                hasTickets = true;
                break;
            }
        }

        function sendCallback() {
            setTimeout(function () {
                if (typeof client.print_order_callback === "function") {
                    client.print_order_callback();
                    delete client.print_order_callback;
                    delete client.printing;
                }
                if (typeof client.print_ticket_callback === "function") {
                    client.print_ticket_callback();
                    delete client.print_ticket_callback;
                    delete client.printing;
                }
            }, 200);

        }

        if (!hasTickets) {
            // Все билеты напечатаны
            if (typeof client.print_order_callback === "function" || typeof client.print_ticket_callback === "function") {
                var count = 0;

                function checkEndPrinting() {
                    if (count > 50) {
                        sendCallback();
                        return;
                    }
                    if (client.printing !== false) {
                        count++;
                        setTimeout(function () {
                            checkEndPrinting();
                        }, 100);
                    } else {
                        sendCallback();
                    }
                }

                checkEndPrinting();
            }

        }




        var flag; // будет установлен если есть хоть один принтер с нужной пачкой
        for (var i in client.ticket_stack) {
            flag = client.ticket_stack[i];
            if (client.ticket_stack[i].length == 0 || typeof client.ticket_stack[i].printing_ticket === "object") {
                continue;
            }
            if (client.ticket_stack[i].status !== "ACTIVE") {
                continue;
            }
            var printer = false;
            for (var p in client.printers) {
                if (client.printers[p].TICKET_PACK_TYPE == i) {
                    printer = client.printers[p];
                    printer.name = p;
                    break;
                }
            }

            if (printer && +printer.SCA_CURRENT_NO <= +printer.FINISH_NO) {
                if (client.ticket_stack[i].numInPortion == client.ticket_stack[i].portion){
                    // Приостанавливаем мечать и отправляем на клиент запрос на продолжение
                    var o2 = {
                        type: "PRINT_WAIT_NEXT",
                        blank_type:i
                    };
                    clients.sendToClient(client, o2);
                    return;
                }
                flag = false;
                client.ticket_stack[i].status = "IN_PRINT";
                client.ticket_stack[i].printing_ticket = client.ticket_stack[i].shift();
                client.ticket_stack[i].numInPortion++;
                //// Отправляем на принтер (print_ticket)
                this.print_ticket(client, client.ticket_stack[i].printing_ticket, printer.name);
            } else {
                //client.ticket_stack[i].status = "NEED_CHANGE";
            }
            if (typeof flag === "object") {
                /// Не один принтер не установлен (не совпадают типы бланков), надо менять или закончились бланки
                clients.setPacksToPrinters(client, {
                    message: 'Нет пачки для билета на ' + flag[0].ACTION_NAME + ' или в пачке этого типа недостаточно бланков',
                    type: "NEED_CHANGE_PACK",
                    back: i
                });
                return;
            }
        }

    },
    print_ticket: function (client, ticket, printer) {

        //var pack = client.;
        var template = pack_templates.templates[config.ticket_template];
        if (!template) {
            console.log('Нет шаблона для клиента ' + config.ticket_template);
            return;
        }
        if (!template[ticket.TICKET_PACK_TYPE]) {
            console.log('Нет шаблона данного типа бланка ' + ticket.TICKET_PACK_TYPE);
            return;
        }
        var sBlank = funcs.cloneObj(template[ticket.TICKET_PACK_TYPE]);
        var objects = {};
        var c = 0;
        for (var k in sBlank) {
            var s1 = '';
            if (sBlank[k].items !== undefined) {
                for (var i in sBlank[k].items) {
                    s1 += (ticket[sBlank[k].items[i]] !== undefined) ? ticket[sBlank[k].items[i]] : sBlank[k].items[i];
                }
                delete sBlank[k].items;
            } else {
                s1 = ticket[k] || sBlank[k].value;
            }
            sBlank[k].value = s1;
            if (s1 != '') {
                objects[c] = sBlank[k];
                c++;
            }
        }
        var o = {
            command: "print_ticket",
            printer: printer,
            print_queue_id: ticket.PRINT_QUEUE_ID,
            ticket_objects: objects
        };
        client.printing = true;
        clients.checkConnection(client);
        clients.sendToPrinter(client, o);

    },
    cancel_ticket: function (client, print_queue_id) {
        var self = this;
        if (typeof client !== "object" || !print_queue_id) {
            console.log('cancel_ticket не верные объекты');
            return;
        }
        var o = {
            command: "operation",
            object: "print_ticket_cancel",
            sid: client.sid,
            print_queue_id: print_queue_id,
            in_out_key: client.id
        };
        oracle.execute({
            o: o, callback: function (obj) {
                var client = self.items[obj.io_key];
                if (typeof client === "object") {
                    if (!self.checkPrintingTickets(client)) {
                        client.printing = false;
                    }
                }
            }
        });
    },
    /**
     * Функция вызывается с клиента. по нажатию им "Распечатать билет"
     * @param client
     * @param obj
     */
    printTicket: function (client, obj) {
        var self = this;

        if (typeof client !== "object" || typeof obj !== "object") {
            return;
        }
        var o = {
            command: "operation",
            object: "print_ticket",
            sid: client.sid,
            order_ticket_id: obj.ticket_id,
            in_out_key: client.id
        };
        oracle.execute({
            o: o, callback: function (obj) {
                console.log(obj);
                var data = funcs.jsonToObj(obj.resultJSON);
                var client = self.items[obj.io_key];
                self.addTickets(client, data);
                self.print_tickets(client);
            }
        });
    },
    /**
     * Функция вызывается с клиента. по нажатию им "Распечатать заказ"
     * @param client
     * @param obj
     */
    printOrder: function (client, obj) {

        var self = this;
        if (typeof client !== "object" || typeof obj !== "object") {
            return;
        }

        var orderId = obj.order_id;
        if (clients.InPrintingOrders(orderId)) {
            console.log('Повторная попытка распечатать заказ');
            return;
        }
        clients.printing_orders.push(orderId);
        var o = {
            command: "operation",
            object: "print_order",
            sid: client.sid,
            order_id: orderId,
            in_out_key: client.id
        };
        oracle.execute({
            o: o, callback: function (obj) {
                var data = funcs.jsonToObj(obj.resultJSON);
                if (typeof data[0] === "object") {
                    orderId = +data[0].ORDER_ID || 0;
                    clients.removePrintingOrders(orderId);
                }
                var client = self.items[obj.io_key];

                self.addTickets(client, data);
                var o2 = {
                    type: "PRINT_START",
                    portion:2,
                    ticket_stack: client.ticket_stack || {}
                };
                clients.sendToClient(client, o2);
                self.print_tickets(client);
            }
        });
    },
    printNext: function(client,obj){
        client.ticket_stack[obj.ticket_pack_type].numInPortion = 0;
        this.print_tickets(client);
    },
    checkPrintingTickets: function (client) {
        if (typeof client !== "object") {
            console.log('в checkPrintingTickets не передан client');
            return false;
        }
        for (var i in client.ticket_stack) {
            if (client.ticket_stack[i].length !== 0) {
                return true;
            }
        }
        return false;
    },
    printSuccess: function (client, printer_name) {
        var self = this;
        if (typeof client.printers !== "object") {
            console.log('Ошибка принтеров');
            return;
        }
        if (typeof client.printers[printer_name] !== "object") {
            // TODO Не известно дошло ли сообщение об успешной печати
            console.log('// TODO Не известно дошло ли сообщение об успешной печати client.printers[printer_name]');
            return;
        }

        //client.printers[printer_name].SCA_CURRENT_NO = +client.printers[printer_name].SCA_CURRENT_NO + 1;
        var printer = client.printers[printer_name];

        var ticketpacktype = printer.TICKET_PACK_TYPE;
        if (typeof client.ticket_stack[ticketpacktype] !== "object") {
            // TODO Не известно дошло ли сообщение об успешной печати
            console.log('// TODO Не известно дошло ли сообщение об успешной печати client.ticket_stack[ticketpacktype]');
            return;
        }
        // Повышаем текущий номер
        client.printers[printer_name].SCA_CURRENT_NO = +client.printers[printer_name].SCA_CURRENT_NO + 1;
        if (printer.SCA_CURRENT_NO > printer.FINISH_NO) {
            client.printers[printer_name] = {};
        }

        var ticket = client.ticket_stack[ticketpacktype].printing_ticket;
        client.print_response_stack.push(ticket.ORDER_TICKET_ID);
        delete client.ticket_stack[ticketpacktype].printing_ticket;
        client.ticket_stack[ticketpacktype].status = "ACTIVE";
        if (client.ticket_stack[ticketpacktype].length == 0) {
            delete client.ticket_stack[ticketpacktype];
        }
        var o = {
            command: "operation",
            object: "print_ticket_response",
            sid: client.sid,
            print_queue_id: ticket.PRINT_QUEUE_ID,
            ticket_pack_id: printer.TICKET_PACK_ID,
            in_out_key: client.id
        };

        oracle.execute({
            o: o, callback: function (obj) {
                var client = self.items[obj.io_key];
                if (typeof client === "object") {
                    if (!self.checkPrintingTickets(client)) {
                        client.printing = false;
                    }
                }
                var o2 = {
                    type: "PACK_INFO",
                    data: client.printers || {}
                };
                clients.sendToClient(client, o2);
                var order_ticket_id = client.print_response_stack.shift();
                var o = {
                    command: "get",
                    object: "order_ticket",
                    sid: client.sid,
                    /*columns:'ORDER_TICKET_ID,ACTION,ACTION_DATE_TIME,LINE_WITH_TITLE' +
                    'PLACE_WITH_TITLE,AREA_GROUP,PRICE,SCA_SERIES,SCA_NUMBER,' +
                    'PRINT_STATUS,PRINT_STATUS_RU,BARCODE',*/
                    params:{
                        where:'ORDER_TICKET_ID = '+order_ticket_id
                    },
                    in_out_key: client.id
                };
                oracle.execute({o:o,callback:function(obj){
                    var client = self.items[obj.io_key];
                    if (typeof client !== "object") {
                        return;
                    }
                    var data = funcs.jsonToObj(obj.resultJSON)[0];
                    var ticket = {
                        order_ticket_id:data.ORDER_TICKET_ID,
                        action:data.ACTION,
                        place:data.AREA_GROUP+' '+ (data.LINE_WITH_TITLE)+' '+ (data.PLACE_WITH_TITLE),
                        price:data.PRICE,
                        sca:(data.SCA_SERIES) ? data.SCA_SERIES +'-'+data.SCA_NUMBER : '',
                        print_status:data.PRINT_STATUS,
                        print_status_ru:data.PRINT_STATUS_RU,
                        barcode:data.BARCODE
                    };
                    var o2 = {
                        type: "PRINT_TICKET_RESPONSE",
                        where:{order_ticket_id:ticket.order_ticket_id},
                        ticket: ticket
                    };
                    clients.sendToClient(client, o2);
                    console.log('________________printSuccess__________________');
                }});
            }
        });
        this.print_tickets(client);
    },
    printError: function (client, printer_name) {
        if (typeof client.printers[printer_name] !== "object") {
            console.log('Принтер не существует ' + printer_name);
            return;
        }
        var ticketpacktype = client.printers[printer_name].TICKET_PACK_TYPE;
        client.ticket_stack[ticketpacktype].status = "ACTIVE";
        var print_queue_id = client.ticket_stack[ticketpacktype].printing_ticket.PRINT_QUEUE_ID;
        delete client.ticket_stack[ticketpacktype].printing_ticket;
        this.cancel_ticket(client, print_queue_id);

        if (typeof client.print_ticket_callback === "function") {
            client.print_ticket_callback();
            delete client.print_ticket_callback;
        }

        this.print_tickets(client);
    }


};
exports.clients = clients;
module.exports.getById = clients.getById;