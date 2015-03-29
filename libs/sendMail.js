var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var config = require('../config/index');

var send = function(obj, callback){
    console.log(config.get('mail:mailTransport'));
    var transporter = nodemailer.createTransport(config.get('mail:mailTransport'));
    /*var transporter = nodemailer.createTransport({
        host: 'smtp.hc.ru',
        debug:true,
        port: 465,
        secure:true,
        auth: {
            user: 'info@cfft.ru',
            pass: '0xd2skQv'
        }
    });*/

    var mailOptions = {
        from: config.get('mail:from'),
        to: obj.email,
        subject: obj.subject || 'Тема письма', // Subject line
        text: obj.text || 'Текст письма', // plaintext body
        html: obj.html || 'Текст письма html'
    };
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            callback(error);
        }else{
            callback(null);
        }
    });
};
module.exports = send;