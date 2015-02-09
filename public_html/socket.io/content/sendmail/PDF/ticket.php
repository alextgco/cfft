<?php
// ---------------------------------- //
//  Style css //
// ----------------------------------//
$html.= '
  <style>
    @font-face {
      font-family: code; /* Имя шрифта */
      src: url(PDF/lib/fonts/code128.ttf); /* Путь к файлу со шрифтом */
    }
    @font-face {
      font-family: code39; /* Имя шрифта */
      src: url(PDF/lib/fonts/code39r.ttf); /* Путь к файлу со шрифтом */
    }
    .logo {
      margin: 0 20px 0 0;
    }
    .barcode_top {
      position: absolute;
      transform: rotate(90deg);
      font-size: 14px;
      text-align: center;
      top: 60px;
      left: 690px;
    }
    .barcode_top div {
      font-family: code;
      font-size: 50px;
    }
    .barcode_left {
      position: absolute;
      top: 25px;
      left: 30px;
      transform: rotate(90deg);
      text-align: center;
      line-height: 0.6;
    }
    .barcode_left div{
      font-family: code;
      font-size: 50px;
    }
    .background {
      width: 100%;
      background:url("img/barviha_background.jpg");
    }

    .ticketDiv {
      width: 600px;
      margin: 10px 50px;
    }
    .ticketDiv .tr {
      position: relative;
      margin: 5px 0px;
      padding: 5px 10px;
      clear: both;
      background: url("img/background.png");
    }

    .ticketDiv .tr .left, .ticketDiv .tr .right {
      font-size: 18px;
    }
    .ticketDiv .tr .left {
      display: inline-block;
      width: 250px;
    } 
    .ticketDiv .tr .right {
      display: inline-block;
      width: 250px;
    }

    table.descr td{
      font-size: 11px;
      vertical-align: top;
      border: none;
    }
  </style>
  <meta http-equiv="content-type" content="text/html; charset=UTF-8"/>
';
// ---------------------------------- //
//  HTML //
// ----------------------------------//
$html.= '
  <div class="barcode_top"><div><img src="barcode39.gif"/></div></div>
  <img class="logo" src=""/>
  <img class="logo" src="img/acquiropay_logo.jpg" height="50"/>
  <img class="logo" src="img/word_ticked_logo.jpg"  height="60" />
  <img class="logo" src="img/barviha.png"  height="50" />
  <br>
  <br>
  <b>Внимательно ознакомьтесь с информацией приведенной ниже.</b>
  <br>
  <br>
  <span><b>Номер заказа:</b> '.$order_id.'</span><span style="margin-left:100px;font-weight:bold;">Номер билета:</span> '.$array['ORDER_TICKET_ID'].'
  <br>
  <br>
';
$html.= dotted_string(86);

$html.= '

<br>
<div class="background">
  <div class="barcode_left"><div><img src="barcode39.gif"/></div></div>
  
  <div class="ticketDiv">
    <div class="tr">
      <div class="left">Мероприятие:</div>
      <div class="right">'.$array['ACTION_NAME'].'</div>
    </div>
    <div class="tr">
      <div class="left">Дата и время:</div>
      <div class="right">'.$array['ACTION_DATE'].'</div>
    </div>
    <div class="tr">
      <div class="left">Место проведения:</div>
      <div class="right">'.$array['HALL'].'</div>
    </div>
    <div class="tr">
      <div class="left">Сектор:</div>
      <div class="right">'.$array['AREA'].'</div>
    </div>
    <div class="tr">
      <div class="left"></div>
      <div class="right"> ряд:'.$array['LINE'].' место:'.$array['PLACE'].'</div>
    </div>
    <div class="tr">
      <div class="left">Стоимость услуг:</div>
      <div class="right">'.$array['PRICE'].' руб.</div>
    </div>
  </div>

  


  <!--
  <table class="ticket">
    <tr>
      <td>Мероприятие:</td>
      <td nowrap> '.$array['ACTION_NAME'].' <br></td>
    </tr>
    <tr>
      <td nowrap>Дата и время:</td>
      <td nowrap> '.$array['ACTION_NAME'].'<br></td>
    </tr>
    <tr>
      <td nowrap>Место проведения:</td>
      <td nowrap> '.$array['HALL'].'<br></td>
    </tr>
    <tr>
      <td>Сектор:</td>
      <td nowrap> '.$array['AREA'].'</td>
      
    </tr>
    <tr>
      <td></td>
      <td nowrap> ряд:'.$array['LINE'].' место:'.$array['PLACE'].'<br></td>
    </tr>

    <tr>
      <td>Стоимость услуг:</td>
      <td nowrap> '.$array['PRICE'].' руб.</td>
    </tr>
  </table>
  -->
</div>
';
$html.= dotted_string(86);

$html.= '
<br>
  <table class="descr" style="">
    <tr >
      <td width="260">
        Электронный билет представляет собой цифровую запись  в базе данных, подтверждающую бронирование и оплату билета на соответствующее зрелищное мероприятие.
        <br/><br/>
        Материальным носителем электронного билета является распечатка бланка электронного билета, который направляется на электронный адрес покупателя, указанный при оформлении заказа и который необходимо распечатать для посещения мероприятия.
        <br/><br/>
        Электронный билет не является бланком строгой отчетности. Все спорные вопросы решаются только при наличии билета, сформированного на бланке строгой отчетности.
      </td>
      <td width="10">
      </td>
      <td width="260">
        Возврат денежных средств в случае отмены или замены мероприятия осуществляется непосредственно зрелищным учреждением при наличии билета, сформированного на бланке строгой отчетности. 
        <br/><br/>
        Пользуясь электронным билетом, Вы соглашаетесь с положениями договора публичной оферты, опубликованном  на сайте www.mirbileta.ru
        <br/><br/>
        В случае копирования бланков электронных билетов, доступ на мероприятие будет открыт только по тому билету, который был предъявлен первым.
        <br/><br/>
        <span style="color:red;"><b>Берегите свои билеты от копирования Сохраняйте билет до окончания мероприятия</b></span>
      </td>
    </tr>
  </table>
';

$html.= dotted_string(86);
$html.= '<br/>';
$html.= '<img src="img/ticket_bottom.jpg" height="220" align="center"/>';



?>
