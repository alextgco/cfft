<?php 
//require 'PHPMailer.php';
require_once 'PHPMailer/class.phpmailer.php';

$arr = array(
        'sfinktor@bk.ru',
        );

foreach($arr as $email) {
    _sendMail($email, $subj, $msg);
}

function _sendMail($email, $subj, $mess)
{
    $mail = new PHPMailer();
    $mail->Sender = 'suport@multibooker.ru';
    $mail->From = 'suport@multibooker.ru';
    $mail->FromName = 'suport@multibooker.ru';
    
    $mail->CharSet = 'UTF-8';
    
    $mail->AddAddress($email, $email);
    
    $mail->IsHTML(true);
    $mail->Subject = "Order";
    $mail->Body = "message 123344";
    if(!$mail->Send()) {
        _log('Mail send error: '.$mail->ErrorInfo);
        return false;
    }
    return true;
}

function _log($msg)
{    
    $msg = date('Y-m-d H:i:s').' '.$msg."\n";
    file_put_contents('send_notify.log', $msg, FILE_APPEND);
}