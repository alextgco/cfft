<?php
$html.='
    <style>
        .dottedString{
            position: absolute;
            width: 700px;
            background-image: url(img/dot.png);
            height: 2px;
            left:0;
        }
        #ds1{
            top:225px;
        }
        #ds2{
            top:525px;
        }
        #ds3{
            top:815px;
        }
        .barcode_top {
            position: absolute;
            transform: rotate(90deg);
            font-size: 14px;
            text-align: center;
            top: 77px;
            left: 695px;
        }
        .barcode_top img{
            height: 60px;
        }
        .barcode_left {
            position: absolute;
            transform: rotate(90deg);
            font-size: 14px;
            text-align: center;
            top: 48px;
            left: 30px;
        }
        .barcode_left img{
            height: 60px;
        }
        #tl-davisCup{
            width: 190px;
            left: 235px;
            top:-10px;
        }
        #tl-itf{
            width: 95px;
            left: 120px;
            top:40px;
        }
        #tl-ftr{
            width: 80px;
            left: 445px;
            top:40px;
        }
        #tl-olimpik{
            width: 150px;
        }
        #schema{
            position:absolute;
            top: 540px;
            width: 250px;
            left: 460px;
        }
        #schema img{
            width: 100%;
        }
        .topLogos {
            position: absolute;
        }
        .topLogos img{
            width: 100%;
        }
        table.top_part{
            margin-top: 155px;
        }
        #mirBileta{
            position: absolute;
            color: #8a8a8a;
            text-align: center;
            top:170px;
            left: 465px;
            line-height: 15px;
        }
        .engNote{
            font-size: 13px;
            color: #464646;
        }
        .ticketInfo{
            width: 600px;
            position:relative;
            margin: 0 50px;
            line-height: 11px;
        }
        .ticketInfo2{
            position:relative;
            width: 300px;
            line-height: 11px;
            margin: 0 50px;
        }
        .legalInfo{
            position:relative;
            margin-left: 50px;
        }
        .mirBLegal{
            position:relative;
            font-size: 11px;
            line-height: 15px;
            color: #464646;
            opacity:0;
        }
        .KKLegal{
            position:relative;
            font-size: 13px;
            color: #464646;
            line-height: 17px;
        }
        #ageCat{
            position: absolute;
            top:360px;
            right: 20px;
            font-size: 40px;
            color: #2f2f2f;
        }
        .marTop50{
            margin-top:50px;
        }
        .marTop30{
            margin-top:30px;
        }
        #mirBiletaBg{
            position:absolute;
            width: 700px;
            height: 290px;
            top: 230px;
            background-color: #fff!important;
            background:url("img/mirBilBg.png");
            z-index:-1;
        }
        table.rules{
            font-size: 10px;
            line-height: 8.2px;
            font-family: "Times New Roman";
        }
        #support24_7{
            font-size: 10px;
            color: #464646;
            position:absolute;
            top: 770px;
            right:20px;
        }
        #instruction{
            width: 700px;
            position: absolute;
            top: 870px;
        }
        #bottomImage{
            position:absolute;
            top: 825px;
        }
        #takeCareAboutCopy{
            position:absolute;
            top: 825px;
            color:#ce0033;
            font-size: 14px;
            line-height: 15px;
            right: 50px;
        }
        .tribune{
            color: #6a6a6a;
            font-size: 13px;
        }
    </style>

    <meta http-equiv="content-type" content="text/html; charset=UTF-8"/>

    <div class="dottedString" id="ds1"></div>
    <div class="dottedString" id="ds2"></div>
    <div class="dottedString" id="ds3"></div>

    <div class="barcode_top"><div><img src="barcode128.png"/></div></div>
    <div class="barcode_left"><div><img src="barcode128.png"/></div></div>

    <div class="topLogos" id="tl-davisCup"><img src="img/tl-davisCup.jpg"/></div>
    <div class="topLogos" id="tl-itf"><img src="img/tl-itf.jpg"/></div>
    <div class="topLogos" id="tl-ftr"><img src="img/tl-ftr.jpg"/></div>

    <div id="ageCat">'.$array['AGE_CATEGORY'].'+</div>
    <div id="schema"><img src="img/tl-olimpik.png"/></div>

    <table class="top_part">
        <tbody>
            <tr>
                <td colspan="4">Внимательно ознакомьтесь с информацией приведенной ниже.</td>
            </tr>
            <tr>
                <td colspan="2">Номер заказа: '.$order_id.'</td>
                <td colspan="2">Ф.И.О: '.$array['CRM_USER_NAME'].'</td>
            </tr>
        </tbody>
    </table>
    <div id="mirBileta">
      ООО &#171;Мир Билета&#187;<br>
      www.mirbileta.ru
    </div>

    <div id="mirBiletaBg"></div>

    <table class="ticketInfo marTop50">
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
                Подъезд:<br />
                <span class="engNote">Gate:</span>
            </td>
            <td><span class="tribune">'.$array['ACCESS_ZONE'].'</span></td>
            <td>
                Трибуна:<br />
                <span class="engNote">Tribune:</span>
            </td>

            <td><span class="tribune">'.$array['AREA'].'</span></td>

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
            <td>
               Стоимость услуги:<br />
                <span class="engNote">price:</span>
            </td>
            <td>'.$array['PRICE'].' руб.</td>
            <td>
               Сервисный сбор:<br />
                <span class="engNote">service fee:</span>
            </td>
            <td>'.$array['PRICE']/100*$agent_percent.' руб.</td>
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
                    Организатор: САНО «Кубок Кремля XXI век»,<br />
                    ИНН 7709288590, ОКПО 51226734<br />
                </span>
            </td>
        </tr>
    </table>

    <table class="rules marTop30" style="">
        <tr >
            <td>
                Внимание! Правила использования!<br/>
                1. Вся страница является билетом на мероприятие.<br/>
                2. Вход на мероприятие по билету возможен только один раз<br/>
                и только для одного человека.<br/>
                3. Не допускайте копирования электронного билета!<br/>
                На мероприятие сможет попасть только один человек<br/>
                по одному билету. Допуская копирование, вы рискуете не попасть<br/>
                на мероприятие! Предупреждаем: ни в коем случае не покупайте<br/>
                билеты с рук. Используйте только официальный сайт.<br/>
                4. Билеты с помарками и исправлениями недействительны!<br/>
                5. Владелец билета обязан соблюдать правила поведения<br/>
                на мероприятии, которые указаны на официальном сайте турнира<br/>
                www.dc.tennis-russia.ru в разделе «Билеты».<br/>
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
                4. Tickets with corrections and bolts are void.<br/>
                5. The ticket ower should follow the Rules for spectators<br/>
                which are published on the official web-site<br/>
                www.dc.tennis-russia.ru in section «Tickets»
            </td>
        </tr>
    </table>

    <div id="support24_7">
        <span class="supportBlock">По всем вопросам обращайтесь в Службу поддержки 24/7 8 (495) 636-27-53</span><br />
        <span class="supportBlock">For all inquiries please contact our Customer Support 24/7 8 800 1000-6-88</span>
    </div>

    <img id="bottomImage" src="img/bottomLogos.png" height="38"/>

    <div id="takeCareAboutCopy">Берегите свои билеты от копирования <br />Сохраняйте билет до окончания мероприятия</div>

    <img src="img/ticket_bottom.jpg" id="instruction"/>

';
?>
