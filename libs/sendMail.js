var nodemailer = require('nodemailer');
var config = require('../config/index');

var send = function(obj, callback){
    var transporter = nodemailer.createTransport(config.get('mail:mailTransport'));

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