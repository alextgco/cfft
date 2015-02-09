<?php
// ---------------------------------- //
//  Style css //
// ----------------------------------//
$html = '
  <style>
    .logo {
      margin: 0 20px 0 0;
    }
    .barcode_top {
      position: absolute;
      transform: rotate(90deg);
      font-size: 14px;
      text-align: center;
      top: 80px;
      left: 690px;
    }
    .barcode_top div {
      font-family: code;
      font-size: 50px;
    }
    .barcode_left {
      position: absolute;
      top: 30px;
      left: 60px;
      transform: rotate(90deg);
      text-align: center;
      line-height: 0.6;
    }
    .barcode_left div{
      font-family: code;
      font-size: 50px;
    }
    table.ticket {
      width: 750px;
      height: 230px;
      margin: -15px 70px;
      line-height: 1.8;
      background: url("img/check.jpg");
    }
    table.descr td{
      font-size: 11px;
      vertical-align: top;
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
  <img class="logo" src="img/acquiropay_logo.jpg" height="90"/>
  <img class="logo" src="img/music_house_logo.jpg"   height="90" />
  <img class="logo" src="img/word_ticked_logo.jpg"  height="90" />
  <br>
  <br>
  <b>Внимательно ознакомьтесь с информацией приведенной ниже.</b>
  <br>
  <br>
  <span><b>Номер заказа:</b> '.$arr->ORDER_ID.'</span><span style="margin-left:100px;font-weight:bold;">Номер билета:</span> '.$arr->BARCODE.'
  <br>
  <br>
';
$html.= dotted_string(86);

$html.= '
<br>
  <div class="barcode_left"><div><img src="barcode39.gif"/></div></div>
  <table class="ticket">
    <tr>
      <td rowspan="6" width="70"></td>
      <td>Мероприятие:</td>
      <td colspan="2" nowrap> '.$arr->EVENT_DESCR.' <br></td>
    </tr>
    <tr>
      <td nowrap>Дата и время:</td>
      <td colspan="2" nowrap> '.$arr->EVENT_DATE.'<br></td>
    </tr>
    <tr>
      <td nowrap>Место проведения:</td>
      <td colspan="2" nowrap> '.$arr->VENUE.'<br></td>
    </tr>
    <tr>
      <td>Сектор:</td>
      <td nowrap> '.$arr->AREA_GROUP_NAME.'</td>
      
    </tr>
    <tr>
      <td></td>
      <td nowrap> ряд:'.$arr->ROW.' место:'.$arr->PLACE.'<br></td>
    </tr>

    <tr>
      <td>Стоимость услуг:</td>
      <td colspan="2" nowrap> '.$arr->SALE_PRICE.' руб.</td>
    </tr>
  </table>
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
