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
    
    div{
        font-family: times new roman, serif;
    }
    table.sansSerif{
        font-family: times new roman, serif;
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
      padding: 30px 0 10px 0;
      /*padding: 40px 0 47px 0;*/
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
      line-height: 12px;
      font-family: "Times New Roman";
      margin-top: 40px;
      margin-bottom: 40px;
    }
    table.descr .supportBlock{
        font-size: 11px;
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
    .kremlinLogo{
        position: relative;
        top: -30px;
        height: 130px;
        /*margin-bottom: 37px;*/
    }
    .mirBLogo{
        position: relative;
        top: -30px;
        margin-left: 0;
        height: 80px;
    }
    .topAcuiro{
        position: absolute;
        top: 90px;
        left: 485px;
        height: 30px;
    }
    #mirBileta{
        position: absolute;
        color: #8a8a8a;
        text-align: center;
        top:123px;
        right:20px;
        line-height: 28px;
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
        padding: 3px 10px;
    }
    table.sansSerif{
        margin-top: 13px;
        line-height:10px;
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
        line-height: 22px;
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
    .ticketInfo tr td{
        padding: 5px 0;
    }
    .ticketInfo{
        width: 600px;
        margin: 0 50px;
        line-height: 11px;
    }
    .ticketInfo2{
        width: 300px;
        line-height: 11px;
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
        font-size: 13px;
    }


    .mirBLegal{
       font-size: 11px;
       line-height: 15px;
       color: #464646;
    }
    .KKLegal{
       font-size: 11px;
       color: #464646;
       line-height: 12px;
    }
    #ageCat{
        position: absolute;
        top:340px;
        right: 20px;
        font-size: 40px;
        color: #2f2f2f;
    }
    .invisible{
        opacity: 0!important;
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
  <div class="barcode_top"><div><img src="barcode128.png"/></div></div>
  <img class="logo " src=""/>

  <img class="logo kremlinLogo" src="img/kremlinLogo_w.jpg" height="50"/>
  <img class="logo mirBLogo" src="img/mirBiletaLogo.png" height="50"/>
  <img class="topAcuiro" src="img/acquiropay_logo_w.jpg" height="38"/>

  <!--<img class="logo tennLogo" src="img/tennisLogo.png"  height="60" />
  <img class="logo partLogo" src="img/partnerLogo.png"  height="50" />-->


    <table class="sansSerif">
        <tbody>
            <tr>
                <td colspan="4">Внимательно ознакомьтесь с информацией приведенной ниже.</td>
            </tr>
            <tr class="mediumSize">
                <td colspan="2">Номер заказа: '.$order_id.'</td>
                <td colspan="2">Ф.И.О: '.$array['CRM_USER_NAME'].'</td>
            </tr>
            <tr class="smallSize">
                <td colspan="2"><span class="invisible">Серия: - </span></td>
                <td colspan="2"><span class="invisible">Номер: '.$order_id.'</span></td>
            </tr>
        </tbody>
    </table>

    <div id="mirBileta">
      <!--ООО &#171;Мир Билета&#187;<br>
      www.mirbileta.ru-->
    </div>
    <div id="attentionInfo">
        <!--ВНИМАНИЕ! Для прохода на трибуну зарегистрируйте штрих-код<br />
        на стойке регистрации ФТР на территории НТЦ им. Х.А. Самаранча-->
    </div>
';
$html.= dotted_string(86);
$html.= '


<div class="background">

  <div class="barcode_left"><div><img src="barcode128.png"/></div></div>
    <table class="ticketInfo"> 
        <tr>
            <td width="120">
               Мероприятие:
            </td>
            <td width="480">
               '.$array['ACTION_NAME'].'
            </td>
        </tr>
        <tr>
            <td width="120">
                Дата и время:
            </td>
            <td width="480">
                '.$array['ACTION_DATE'].'
            </td>
        </tr>
        <tr>
            <td width="120">
                Место проведения:
            </td>
            <td width="480">
                '.$array['HALL'].'
            </td>
        </tr>
    </table>

    <table class="ticketInfo2">
        <tr>
            <td class="first">
                Сектор:
            </td>

            <td><span class="tribune">'.$array['AREA'].'</span></td>

            <td>
                Ряд:
            </td>

            <td>'.$array['LINE'].'</td>

            <td>
                Место:
            </td>

            <td>'.$array['PLACE'].'</td>
        </tr>
    </table>

    <table class="ticketInfo">
        <tr>
            <td width="120">
               Стоимость услуги:
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
                   Адрес Государственного Кремлевского Дворца:<br />
                   г. Москва, ул. Воздвиженка д. 1<br />
                   Телефон для справки: 8 (495) 628-52-32<br />
                </span>
            </td>
        </tr>
    </table>
    <br/>

    <div id="ageCat">'.$array['AGE_CATEGORY'].'+</div>
</div>
';
$html.= dotted_string(86);

$html.= '

  <table class="descr" style="">
    <tr >
      <td width="260">
      <br/>
        Attention, important rules:<br/>
        1. The whole page is a ticket to the show.<br/>
        2. The entrance to the show is possible at one time<br/>
        and by one person only.<br/>
        3. Copying this electronic ticket is not allowed!<br/>
        Only one person can enter the show with just one e-ticket<br/>
        By allowing copying of the e-ticket, you take<br/>
        the risk not to enter the show! Notice: Do not buy tickets<br/>
        off somebody`s hands. Use the official website only!<br/>
        4. The use of this ticket means that you agree<br/>
        to the agreement of the public offer and to the rules<br/>
        which were established by the Kremlin Palace.<br/>
        5. Tickets with corrections and blots are void.<br/>
        <span class="supportBlock">For all inquiries please contact our Customer Support 24/7<br/>
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
      <br/>
        Внимание! Правила использования!<br/>
        1. Вся страница является билетом на мероприятие.<br/>
        2. Вход на мероприятие по билету возможен только один раз<br/>
        и только для одного человека.<br/>
        3. Не допускайте копирования электронного билета!<br/>
        На мероприятие сможет попасть только один человек<br/>
        по одному билету. Допуская копирование, вы рискуете не попасть<br/>
        на мероприятие! Предупреждаем: ни в коем случае не покупайте<br/>
        билеты с рук. Используйте только официальный сайт.<br/>
        4. Использование этого билета подразумевает Ваше принятие<br/>
        договора публичной оферты, а так же согласие с правилами,<br/>
        установленными Государственным Кремлевским Дворцом.<br/>
        5. Билеты с помарками и исправлениями недействительны!<br/>
        <span class="supportBlock">По всем вопросам обращайтесь в Службу поддержки 24/7<br/>
        8 (495) 636-27-53</span>
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

';

$html.= dotted_string(86);
$html.= '<table>
            <tr>
                <td width="260">

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
