
<?php
  $obj = $_POST;
  $order_id = $_POST['cf'];
  $amount = $_POST['amount'];
  $action_id = $obj['cf2'];
    $cf3 = $obj['cf3'];
    //print_r($obj);
  //$host = $_SERVER['HTTP_HOST'];
  $url = str_replace("payment_ok.php","",$_SERVER['PHP_SELF']);
?>

<script type="text/javascript">
    var params = location.search;
    var back = (params.match(/back=/)!=null) ? String(params.match(/back=.+/)).replace(/back=/,'') : 0;
</script>
<style>
  body, html {
    margin: 0;
    padding: 0;
  }
  .block {
      position: relative;
      width: 600px;
      min-height: 240px;
      background: #fff;
      overflow: hidden;
      margin: 30px auto;
      background-color: #fff;
      box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.5);
      border-radius: 5px;
      font-family: 'Open Sans', sans-serif;
      font-size: 14px;
      padding-bottom: 65px;
  }
  .pok_header{
      padding: 16px 16px 18px 16px;
      position: relative;
      border-bottom: 1px solid #F3F3F3;
      background-color: #FCFCFC;
  }
  .pok_content{
      padding: 15px;
  }
  .pok_header img{
  }
  .pok_footer{
      position: absolute;
      bottom: 0;
      height: 45px;
      width: 100%;
      padding-top: 10px;
      border-top: 1px solid #F1F1F1;
      background-color: #f8f8f8;

  }
  .pok_footer .pokBtn{
      height: 27px;
      width: 140px;
      border-radius: 3px!important;
      background-color: rgb(38, 139, 34);
      color: #fff;
      position: relative;
      float: right;
      margin-right: 10px;
      text-align: center;
      padding-top: 9px;
      cursor: pointer;
  }
  .pok_footer .pokBtn:hover{
      background-color: rgb(26, 103, 26);
  }

  .switchLang{
      position: absolute;
      top: 16px;
      right: 13px;
  }
  .switchLang .lang{
      height: 20px;
      float: left;
      color: #ffffff;
      padding: 2px 4px;
      font-family: 'Open Sans', sans-serif;
      font-size: 12px;
      cursor: pointer;
      background-color: #cecece;
  }
  .switchLang .lang.active{
    background-color: #3b7788;
    color: #ffffff;
  }
  .switchLang .lang.rus{
      border-radius: 2px 0 0 2px;
  }
  .switchLang .lang.eng{
      border-radius: 0 2px 2px 0;
  }
  .switchableContent {
      display: none;
  }
  .switchableContent.active {
      display: block;
  }
  .smallGrey{
      font-size: 12px;
      color: #8e8e8e;
  }

  .block .timer {
    color: red;
  }
</style>
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
</head>
<body>
<div class="block">
    <div class="pok_header">
        <div class="switchLang">
            <div class="lang rus active">Рус</div>
            <div class="lang eng">Eng</div>
        </div>
        <img src="img/mirBileta.png" />
    </div>
    <div class="pok_content">

        <div id="engContent" class="switchableContent ">
            Order №<?php echo $order_id;?> total amount <?php echo $amount;?>rub. paid successfully.<br />
          <!--  Event: ********* <br />
            Selected places: ******** <br />-->
            <br />
            To enter the event print an e-ticket and present it for a bar code scan. <br />
            <br />
            <span class="smallGrey">More information available on  8 (495) 636-27-53</span>
        </div>

        <div id="rusContent" class="switchableContent active">

            Заказ №<?php echo $order_id;?> на сумму <?php echo $amount;?>руб. оплачен успешно.<br />
           <!-- Мероприятие: *********<br />
            Выбранные места: ********<br />-->
            <br />
            Для прохода в зал распечатайте электронный билет и предъявите его для считывания штрих-кода контроллеру.<br />
            <br />
            <span class="smallGrey">Все справки по телефону: 8 (495) 636-27-53</span>
        </div>


        <!--<div>
            <?php
/*            echo 'Номер заказа <span class="booked">'.$order_id.'</span>';
            */?>
        </div>
        <div>
            Электронные билеты были высланы на указанный Вами адрес электронной почты <b><span class="email"></span></b>
        </div>
        <div>
            <?php
/*            echo '<a href="'.$url.'?action_id='.$action_id.'&frame='.$cf3.'">Вернуться к залу!</a>';
            */?>
        </div>-->
    </div>
    <div class="pok_footer">
        <div id="confirmBtn" class="pokBtn" onclick="document.location.href = back;">Ок</div>
    </div>

</div>
</body>
<script type="text/javascript">

    var initSwitchLang = function(){
        var switchers = document.getElementsByClassName('lang');
        for(var i in switchers){

            //console.log(switchers[i], switchers[i].addEventListener('click'));

            switchers[i].onclick =  function(){
                if(this.className.indexOf('active') == -1){
                    var activeSwitch = document.getElementsByClassName('lang active');
                    activeSwitch[0].className = activeSwitch[0].className.replace(' active', '');
                    this.className += ' active';

                    if(activeSwitch[0].className.indexOf('eng') != -1){
                        document.getElementById('rusContent').className = document.getElementById('rusContent').className.replace(' active','');
                        document.getElementById('engContent').className += ' active';
                    }else{
                        document.getElementById('engContent').className = document.getElementById('engContent').className.replace(' active','');
                        document.getElementById('rusContent').className += ' active';
                    }
                }
            }
        }
    };
    initSwitchLang();

   /* var confirmBtn = document.getElementById('confirmBtn');
    confirmBtn.addEventListener('click', function(e){
        e = e || window.event;
        window.close();
    });*/

</script>
</html>