<?php

require_once ('PHPMailer/class.phpmailer.php');


if(!isset($email_to)){$email_to = "st.nksp@gmail.com";}

$email_from = 'support@mirbileta.ru';

$round = ceil(count($files)/10);
for($i=1;$i<=$round;++$i){
  $files = send_mail_rek($email_from,$email_to,$files,$i,$info); 
}
    

function send_mail_rek($email_from,$email_to,$files,$i,$info){
  $mail = new PHPMailer();
  $mess = "Добрый день. <br/>";
  $mess.= "Спасибо за использование нашего сервиса для покупки билетов на сайте Концертного зала Барвиха. <br/>";
  $mess.= "Вами сделан заказ ".$info['order_id']." <br/><br/>";
  $mess.= "Мероприятие: ".$info['event']."<br/>";
  $mess.= "Дата и время мероприятия: ".$info['date_time']."<br/>";
  

  $mail->Sender = 'suport@mirbileta.ru';
  $mail->From = 'suport@mirbileta.ru';
  $mail->FromName = 'suport@mirbileta.ru';

  $mail->AddReplyTo('kate.malta@gmail.com', 'suport@mirbileta.ru0,');
  $mail->AddAddress($email_to,$email_to);
  $mail->CharSet = 'UTF-8';
  $mail->IsHTML(true);
  $mail->Subject = "Мир билета заказ ".$info['order_id'];
  foreach ($files as $counter => $value) {
    if($counter<$i*10){
      if($files[$counter]!=""){
        $mess.= $info['arr'][$counter]['area']." ряд <b>".$info['arr'][$counter]['row']."</b> место <b>".$info['arr'][$counter]['place']."</b>\n\r";
        $arr = explode("/",$value);
        $mail->AddAttachment($value,$arr[1]);
        $files[$counter]="";
      }
    }
  }
  $mess.="<br/>Для прохода в зал предъявите электронные билеты для считывания штрих-кода<br/>";
  $mess.="(распечатайте, либо предъявите их на экране мобильного телефона).<br/><br/>";
  $mess.="Желаем Вам приятного просмотра.<br/><br/>";
  $mess.="--С уважением,<br/>";
  $mess.="Служба технической поддержки компании Мир Билета.<br/>";
  $mail->Body = $mess;
  if(!$mail->Send()) {
    echo "error";
  }
  return $files;
}

/*
include ("class.mail.php");

$files = array();
$files[] = 'files/ticket_7362811111.pdf';
$files[] = 'files/ticket_7362811111.pdf';
$files[] = 'files/ticket_7362811111.pdf';
$files[] = 'files/ticket_7362811111.pdf';
$files[] = 'files/ticket_7362811111.pdf';
$files[] = 'files/ticket_7362811111.pdf';
$files[] = 'files/ticket_7362811111.pdf';
$files[] = 'files/ticket_7362811111.pdf';
$files[] = 'files/ticket_7362811111.pdf';
$files[] = 'files/ticket_7362811111.pdf';
$files[] = 'files/ticket_7362811111.pdf';
$files[] = 'files/ticket_7362811111.pdf';
$files[] = 'files/ticket_7362811111.pdf';
$files[] = 'files/ticket_7362811111.pdf';
$files[] = 'files/ticket_7362811111.pdf';
$files[] = 'files/ticket_7362811111.pdf';

if(!isset($email_to)){$email_to = "st.nksp@gmail.com";}
$send_mail = new Send_mail();
send_mail_rek($send_mail,$email_to,$files);

echo 'GOAL';  
     
function send_mail_rek($send_mail,$email_to,$files){

  $files = $send_mail->email($email_to)  // Адресат (можно массив адресов)
            ->from_name('Мир билета')  // Имя отправителя
            ->from_mail('support@mirbileta.ru')   // Адрес отправителя
            ->subject('Электронные билеты')  // Тема сообщения
            ->message('Ваши электронные билеты') // Тело сообщения
            ->files($files) // Путь до прикрепляемого файла (можно массив)
            ->charset('utf-8') // Кодировка (по умолчанию utf-8)
            ->time_limit(30)  // set_time_limit (по умолчанию == 30с.)
            ->content_type('html')  // тип сообщения (по умолчанию 'plain')
            ->send(); // Отправка почты  
  print_r($files);
  if(count($files)>0){
    send_mail_rek($send_mail,$email_to,$files);
  }
}
*/
/*
  //$email_to = "st.nksp@gmail.com";
  //$email_to = "sfinktor@bk.ru";
  $filename = "ticket.pdf"; //Имя файла для прикрепления
  $to = "<".$email_to.">"; //Кому
  $from = "support@mirbileta.ru"; //От кого
  $subject = "Test"; //Тема
  $message = "Текстовое сообщение"; //Текст письма
  $boundary = "---"; //Разделитель
  // Заголовки 
  $headers =  "From: Мир билета <$from>\n";
  $headers .= "FromName: <$from>\n";
  $headers .= "Reply-To: <$from>\n";
  $headers .= "Cc: <$from>\r\n";
  $headers .= "Bcc: <$from>\r\n";
  $headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\n";

  $body = "--$boundary\n";
  // Присоединяем текстовое сообщение 
  $body .= "Content-type: text/html;  charset=utf-8'\n";
  $body .= "Content-Transfer-Encoding: quoted-printablenn";
  $body .= "Content-Disposition: attachment; filename==?utf-8?B?".base64_encode($filename)."?=\n\n";
  $body .= $message."\n";
  $body .= "--$boundary\n";

  $file = fopen($filename, "r"); //Открываем файл
  $text = fread($file, filesize($filename)); //Считываем весь файл
  fclose($file); //Закрываем файл

  // Добавляем тип содержимого, кодируем текст файла и добавляем в тело письма 
  $body .= "Content-Type: application/octet-stream; name==?utf-8?B?".base64_encode($filename)."?=\n"; 
  $body .= "Content-Transfer-Encoding: base64\n";
  $body .= "Content-Disposition: attachment; filename==?utf-8?B?".base64_encode($filename)."?=\n\n";
  $body .= chunk_split(base64_encode($text))."\n";
  $body .= "--".$boundary ."--\n";
  mail($to, $subject, $body, $headers);
*/
/*
$emailAddress = 'st.nksp@gmail.com';
$siteEmail = 'akorolkov@multibooker.ru';
$headers = array(
  'MIME-Version: 1.0',
  'Content-Type: text/html; charset=utf-8'
);
if(mail($emailAddress, $emailTheme, $message, implode("\r\n", $headers), "-f $siteEmail",sendmail))
{echo "status=ok";}
else {echo "status=error"; }
*/

// multiple recipients
/*
$to  = 'st.nksp@gmail.com'; // note the comma

// subject
$subject = 'Birthday Reminders for August';

// message
$message = '
<html>
<head>
  <title>Birthday Reminders for August</title>
</head>
<body>
  <p>Here are the birthdays upcoming in August!</p>
  <table>
    <tr>
      <th>Person</th><th>Day</th><th>Month</th><th>Year</th>
    </tr>
    <tr>
      <td>Joe</td><td>3rd</td><td>August</td><td>1970</td>
    </tr>
    <tr>
      <td>Sally</td><td>17th</td><td>August</td><td>1973</td>
    </tr>
  </table>
</body>
</html>
';

// To send HTML mail, the Content-type header must be set
$headers  = 'MIME-Version: 1.0' . "\r\n";
$headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";

// Additional headers
$headers .= 'To: St <st.nksp@gmail.com>' . "\r\n";
$headers .= 'From: Birthday Reminder <akorolkov@multibooker.ru>' . "\r\n";

// Mail it
echo mail($to, $subject, $message, $headers);
*/
?>