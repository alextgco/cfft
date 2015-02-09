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
    @font-face {
      font-family: arialUni; /* Имя шрифта */
      src: url(PDF/lib/fonts/arialuni.ttf); /* Путь к файлу со шрифтом */
    }
    div{
        font-family: arialUni;
    }
    table.sansSerif{
        font-family: arialUni;
    }
    .logo {
      margin: 0 20px 0 0;
    }
    .barcode_top {
      position: absolute;
      transform: rotate(90deg);
      font-size: 14px;
      text-align: center;
      top: 55px;

      left: 690px;
    }
    .barcode_top div {
      /*font-family: code;
      font-size: 50px;*/
    }
    .barcode_top img{
        height: 60px;
    }

    .barcode_left {
      position: absolute;
      top: 40px;
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
      padding: 30px 0 20px 0;
      /*padding: 40px 0 47px 0;*/
      background-color: #ffffff;
      background:url("img/mirBilBg.png");
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
      /*background: url("img/background.png");*/
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
      line-height: 15px;
      font-family: arialUni;
      margin-top: 40px;
      margin-bottom: 40px;
    }
    table.descr .supportBlock{
        font-size: 10px;
        color: #363636;
        line-height: 13px;
    }
    .partLogo{
        height: auto;
        width: 260px;
    }
    .tennLogo{
        margin-right: 30px;
        height: 80px;
    }
    .mosLogo{
        position: relative;
        top: -30px;
    }
    .moskvichLogo{
        position: relative;
        top: -30px;
        margin-bottom: 37px;
    }

    .barvihaLogo{
        position: relative;
        top: -30px;
        margin-bottom: 27px;
    }
    .mmdmLogo{
        position: relative;
        top: -75px;
        margin-bottom: 0;
    }
    .mirBLogo{
        position: relative;
        top: -30px;
        margin-left: 110px;
    }

    #mirBileta{
        position: absolute;
        color: #8a8a8a;
        text-align: center;
        top:123px;
        right:20px;
        line-height: 30px;
    }
    #attentionInfo{
        position: absolute;
        text-align: center;
        top:193px;
        right:20px;
        color:#ec2721;
        font-size: 12px;
        line-height: 18px;
    }
    table.sansSerif tr td{
        padding: 10px;
    }
    table.sansSerif{
        margin-top: 13px;
    }
    table.sansSerif.marTopMin10{
        margin-top: -10px;
    }
    tr.mediumSize{
        font-size: 14px;
    }
    tr.smallSize{
        font-size: 11px;
    }
    .redText{
        color: #ce0033;
    }

    .bottomImage{
        float: left;
        margin-left: 30px;
    }
    .bottomTitle{
        color:#ce0033;
        font-size: 14px;
        line-height: 28px;
        float: left;
    }
    #instruction{
        width: 100%;
        position: absolute;
        bottom: 180px;
    }
    .legalInfo{
        margin-left: 50px;
    }
    .ticketInfo{
        width: 600px;
        margin: 0 50px;
        line-height: 20px;
    }
    .ticketInfo2{
        width: 300px;
        line-height: 20px;
        margin: 0 50px;
    }
    .ticketInfo2 td{
        padding-left: 10px;
    }
    .ticketInfo2 td.first{
        padding-left: 0;
    }
    .engNote{
        font-size: 13px;
        color: #464646;
    }
    .tribune{
        color: #6a6a6a;
        font-size: 16px;
    }

    .mirBLegal{
       font-size: 11px;
       line-height: 15px;
       color: #464646;
    }
    .KKLegal{
       font-size: 13px;
       color: #464646;
       line-height: 17px;
    }
    #ageCat{
        position: absolute;
        top:400px;
        right: 20px;
        font-size: 40px;
        color: #2f2f2f;
    }
    .invisible{

    }

  </style>
  <meta http-equiv="content-type" content="text/html; charset=UTF-8"/>
';
// ---------------------------------- //
//  HTML //
// ----------------------------------//
$s = "";
foreach($_POST as $k=>$v){
    $s.=$k.":".$v."; ";
}
$f = fopen("1.txt","w");
fwrite($f,$s);
fclose($f);
$html.= '
  <div class="barcode_top"><div><img src="barcode39.gif"/></div></div>
  <img class="logo " src=""/>

  <img class="logo mmdmLogo" src="img/mmdmLogo.png" height="135"/>
  <img class="logo mirBLogo" src="img/mirBiletaLogo.png" height="50"/>

  <br>
  <br>

    <table class="sansSerif marTopMin10">
        <tbody>
            <tr>
                <td colspan="4">Внимательно ознакомьтесь с информацией приведенной ниже.</td>
            </tr>
            <tr class="mediumSize">
                <td colspan="2">Номер заказа: '.$order_id.'</td>
                <td colspan="2">Ф.И.О: '.$array['CRM_USER_NAME'].'</td>
            </tr>

        </tbody>
    </table>

    <div id="mirBileta">
      ООО &#171;Мир Билета&#187;<br>
      www.mirbileta.ru
    </div>
    <div id="attentionInfo">
        <!--ВНИМАНИЕ! Для прохода на трибуну зарегистрируйте штрих-код<br />
        на стойке регистрации ФТР на территории НТЦ им. Х.А. Самаранча-->
    </div>
';
$html.= dotted_string(78);
$html.= '


<div class="background">

  <div class="barcode_left"><div><img src="barcode39.gif"/></div></div>
    <table class="ticketInfo">
        <tr>
            <td width="120">
               Мероприятие:<br />
                <span class="engNote">event:</span>
            </td>
            <td width="480">
               '.$array['ACTION_NAME'].'
            </td>
        </tr>
        <tr>
            <td width="120">
                Дата и время:<br />
                <span class="engNote">Date and start time:</span>
            </td>
            <td width="480">
                '.$array['ACTION_DATE'].'
            </td>
        </tr>
        <tr>
            <td width="120">
                Место проведения:<br />
                <span class="engNote">Venue:</span>
            </td>
            <td width="480">
                '.$array['HALL'].'
            </td>
        </tr>
    </table>

    <table class="ticketInfo2">
        <tr>
            <td class="first">
                Сектор:<br />
                <span class="engNote">Zone:</span>
            </td>

            <td><span class="engNote">'.$array['AREA'].'</span></td>

            <td>
                Ряд:<br />
                <span class="engNote">Row:</span>
            </td>

            <td>'.$array['LINE'].'</td>

            <td>
                Место:<br />
                <span class="engNote">Seat:</span>
            </td>

            <td>'.$array['PLACE'].'</td>
        </tr>
    </table>

    <table class="ticketInfo">
        <tr>
            <td width="120">
               Стоимость услуги:<br />
                <span class="engNote">price:</span>
            </td>
            <td width="480">'.$array['PRICE'].' руб.</td>
        </tr>
    </table>

    <table class="legalInfo">
        <tr>
            <td>
               <span class="mirBLegal">
                   Билет подлежит возврату только в случае отмены мероприятия<br />
                   ООО «Мир Билета» 109012, г. Москва, Черкасский Малый пер., д. 2<br />
                   ИНН 7710932025 | КПП 771001001 | ОГРН 1137746087050 | ОКПО 17138205<br />
               </span>
            </td>
            <td>
                <span class="KKLegal">
                    &nbsp;
                </span>
            </td>
        </tr>
    </table>

    <div id="ageCat">'.$array['AGE_CATEGORY'].'+</div>

</div>
';
$html.= dotted_string(78);

$html.= '
<br>
  <table class="descr" style="">
    <tr >
      <td width="260">
        Электронный билет представляет собой цифровую запись<br/>
        в базе данных, подтверждающий бронирование и оплату<br/>
        билета на соответствующее зрелищное мероприятие.<br/>
        <br/>
        Материальным носителем электронного билета является<br/>
        распечатка бланка электронного билета, который направ-<br/>
        ляется на электронный адрес покупателя, указанный при<br/>
        оформлении заказа и который необходимо распечатать для<br/>
        посещения мероприятия.<br/>
        <br/>
        По билетам на дневные мероприятия допускаются<br/>
        дети с 3-х лет, на вечерние мероприятия - с 7-и лет.<br/>
        <br/>
        <span class="supportBlock">По всем вопросам обращайтесь в Службу поддержки 24/7<br/>
        8 800 1000-6-88</span>
        <br />

        <!--Электронный билет представляет собой цифровую запись  в базе данных, подтверждающую бронирование и оплату билета на соответствующее зрелищное мероприятие.
        <br/><br/>
        Материальным носителем электронного билета является распечатка бланка электронного билета, который направляется на электронный адрес покупателя, указанный при оформлении заказа и который необходимо распечатать для посещения мероприятия.
        <br/><br/>
        Электронный билет не является бланком строгой отчетности. Все спорные вопросы решаются только при наличии билета, сформированного на бланке строгой отчетности.-->
      </td>
      <td width="10">
      </td>
      <td width="260">
        <br />
        Пользуясь электронным билетом, Вы соглашаетесь с<br/>
        положениями договора публичной оферты, опубликованном<br/>
        на сайте www.mirbileta.ru<br/>
        <br/>
        В случае копирования бланков электронных билетов, доступ<br/>
        на мероприятие будет открыт только по тому билету, который<br/>
        был предъявлен первым.<br/>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <!--Возврат денежных средств в случае отмены или замены мероприятия осуществляется непосредственно зрелищным учреждением при наличии билета, сформированного на бланке строгой отчетности.
        <br/><br/>
        Пользуясь электронным билетом, Вы соглашаетесь с положениями договора публичной оферты, опубликованном  на сайте www.mirbileta.ru
        <br/><br/>
        В случае копирования бланков электронных билетов, доступ на мероприятие будет открыт только по тому билету, который был предъявлен первым.
        <br/><br/>
        <span style="color:red;"><b>Берегите свои билеты от копирования Сохраняйте билет до окончания мероприятия</b></span>-->
      </td>
    </tr>
  </table>
<br>
';

$html.= dotted_string(78);
$html.= '<table>
            <tr>
                <td width="260">
                     <img class="bottomImage" src="img/acquiropay_logo_w.jpg" height="38"/>
                </td>

                <td width="10"></td>

                <td width="260">
                    <div class="bottomTitle">
                        Берегите свои билеты от копирования <br />
                        Сохраняйте билет до окончания мероприятия
                    </div>
                </td>
            </tr>
        </table>';

$html.= '<img src="img/ticket_bottom.jpg" id="instruction" align="center"/>';



?>
