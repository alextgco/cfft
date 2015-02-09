var config = require('./config');
var http = require('http');
var url = require('url');
var clients = require('./clients').clients;
var printServer = new http.Server(function(req,res){
    res.setHeader("Content-Type", "text/html; charset=UTF-8");
    res.statusCode = 200;
    console.log('Request from pClient');


    var urlParser = url.parse(req.url,true);
    //console.log(urlParser);
    var params,guid,client;
    try {
        params = JSON.parse(urlParser.query.params);
        guid = urlParser.query.guid;
        client = clients.getById(guid);
        if (!guid){
            res.end('NO guid');22
            return;
        }
    } catch (e) {
        console.log(params);
        res.end('Не верный формат JSON');
        return;
    }
    var command = params.command;
    if (!command) {
        console.log('Не верный command');
        res.end('Не верный command');
        return;
    }
var printers,printer_name;
    switch (command){
        case "pConnect":
            console.log('pConnect');
            if (typeof client!=="object"){
                return;
            }
            if (typeof client.pRes==="object"){
                client.pRes.end(JSON.stringify({command:'endRequest'}));
                client.oldPrinters = client.printers;

                //break;
            }
            clients.update(guid,
                {
                    pRes:res
                }

            );
            /*var o2 = {
                type:"PACK_INFO",
                data:client.printers || {}
            };
            clients.sendToClient(client,o2);*/

            break;
        case "setPrinters":
            /*if (typeof client.pRes==="object"){
                break;
            }*/
            printers = params.printers;
            console.log(printers);
            if (typeof printers!=="object" || typeof client!=="object"){
                res.end('Не верно указаны принтеры');
                console.log('Не верно указаны принтеры');
                break;
            }


            for (var i in printers) {
                if (typeof client.printers[i]==="object"){
                    console.log(client.printers[i]);
                    printers[i]=client.printers[i];
                }
            }
            clients.update(guid,{printers:printers});
            //clients.getUserPacks(client);
            break;
        case "printSuccess":
            printer_name = params.printer_name;
            if (typeof printer_name===undefined){
                res.end('Не верно передан параметр printer_name');
                break;
            }
            //clients.update(guid,{pRes:res});
            clients.printSuccess(client,printer_name);
            break;
        case "printError":
            printer_name = params.printer_name;
            if (typeof printer_name===undefined){
                res.end('Не верно передан параметр printer_name');
                break;
            }
            //clients.update(guid,{pRes:res});
            clients.printError(client,printer_name);
            break;
        case "close":

            break;
        // Это проверочная команда.
       /* case "":
            for (var i in clients.items) {
                //console.log(clients.items[i].pRes);
                if (clients.items[i].pRes){
                    console.log('toPrinter');
                    var o = {
                        command:"print",
                        obj:{
                            key1:"Русский текст"
                        }
                    };
                    clients.items[i].pRes.end(JSON.stringify(o));
                    clients.items[i].pRes = '';
                }
            }
            break;*/
        default:
            console.log("Не известная команда");
            res.end("Не известная команда");
            break;
    }

});




//printServer
module.exports = printServer;