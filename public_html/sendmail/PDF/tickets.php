<?php

// ---------------------------------- //
//  HTML //
// ----------------------------------//

$html.= '
<div class="ticketBody">
  <div>
    <div class="barcode_top"><div><img src="barcode39.gif"/></div></div>

    <img class="logo" src="img/acquiropay_logo.jpg" height="60"/>
    <img class="logo" src="img/word_ticked_logo.jpg"  height="100" />
    <img class="logo" src="img/barviha.png"  height="80" />
    <br>
    <br>
    <br> 
    <b style="font-size: 18px;">Внимательно ознакомьтесь с информацией приведенной ниже.</b>
    <br>
    <br>
    <span><b>Номер заказа:</b> '.$array['ORDER_ID'].'</span><span style="margin-left:100px;font-weight:bold;">Номер билета:</span> '.$array['ORDER_TICKET_ID'].'
    <br>
  </div>
';
$html.= dotted_string(104);

$html.= '
<div class="background"></div>
<br>
  <div class="barcode_left"><div><img src="barcode39.gif"/></div></div>
  
  <div class="ticket">
    <div class="tr">
      <div class="back"></div>
      <div class="left"><div class="text">Мероприятие:</div></div>
      <div class="right" nowrap><div class="text">'.$array['ACTION_NAME'].' <br></div></div>
      <div class="clearfix"></div>
    </div>
    <div class="tr">
      <div class="back"></div>
      <div class="left"><div class="text">Дата и время:</div></div>
      <div class="right" nowrap><div class="text">'.$array['ACTION_DATE'].'<br></div></div>
      <div class="clearfix"></div>
    </div>
    <div class="tr">
      <div class="back"></div>
      <div class="left"><div class="text">Место проведения:</div></div>
      <div class="right" nowrap><div class="text"> '.$array['HALL'].'<br></div></div>
      <div class="clearfix"></div>
    </div>
    <div class="tr">
      <div class="back"></div>
      <div class="left"><div class="text">Сектор:</div></div>
      <div class="right"><div class="text"> '.$array['AREA'].'</div></div>
      <div class="clearfix"></div>
      
    </div>
    <div class="tr">
      <div class="back"></div>
      <div class="left"><div class="text"></div></div>
      <div class="right"><div class="text"> ряд:'.$array['LINE'].' место:'.$array['PLACE'].'<br></div></div>
      <div class="clearfix"></div>
    </div>

    <div class="tr">
      <div class="back"></div>
      <div class="left"><div class="text">Стоимость услуг:</div></div>
      <div class="right" nowrap><div class="text"> '.$array['PRICE'].' руб.</div></div>
      <div class="clearfix"></div>
    </div>
  </div>
  
';
$html.= dotted_string(104);

$html.= '
<br>
  <table class="descr" style="">
    <tr >
      <td>
        Электронный билет представляет собой цифровую запись  в базе данных, подтверждающую бронирование и оплату билета на соответствующее зрелищное мероприятие.
        <br/><br/>
        Материальным носителем электронного билета является распечатка бланка электронного билета, который направляется на электронный адрес покупателя, указанный при оформлении заказа и который необходимо распечатать для посещения мероприятия.
        <br/><br/>
        Электронный билет не является бланком строгой отчетности. Все спорные вопросы решаются только при наличии билета, сформированного на бланке строгой отчетности.
      </td>
      <td>
      </td>
      <td>
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

$html.= dotted_string(104);
$html.= '<br/>';
$html.= '<img src="img/ticket_bottom.jpg" height="350" align="center"/>';
$html.= '</div>';
$html.= '<p class="newPage" style="page-break-after: always;"></p>';



?>
