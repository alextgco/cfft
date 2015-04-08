var funcs = require('../libs/functions');
var api = require('../libs/api');
module.exports.post = function(req, res, next){
    var subject = req.body.subject;
    var html = req.body.html;
    if (!subject){
        return res.status(200).send(funcs.formatResponse(-1, 'error', 'Не передана тема рассылки.'));
    }
    if (!html){
        return res.status(200).send(funcs.formatResponse(-1, 'error', 'Не передано тело сообщения.'));
    }
    api('doSubscribe', 'user', {subject:subject, html:html},function(err,result){
        if (err){
            return res.status(200).send(funcs.formatResponse(-1, 'error', 'Ошибка при рассылки.', err));
        }else{
            return res.status(200).send(funcs.formatResponse(0, 'success', 'Сообщения успешно отправлено'));
        }

    });

};