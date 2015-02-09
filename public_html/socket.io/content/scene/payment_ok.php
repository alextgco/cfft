
<?php
  $obj = $_POST;
  $order_id = $obj['cf'];
  $action_id = $obj['cf2'];
  //$host = $_SERVER['HTTP_HOST'];
  $url = str_replace("payment_ok.php","",$_SERVER['PHP_SELF']);
?>

<style>
  body, html {
    margin: 0;
    padding: 0;
  }
  .block {
    position: absolute;
    width: 99%;
    height: 99%;
    text-align: center;
    font-size: 16px;
    background: #fff;
    overflow: hidden;
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
  <br/>
  <div>
    <?php
      echo 'Номер заказа <span class="booked">'.$order_id.'</span>';
    ?>
  </div>
  <div>
    Электронные билеты были высланы на указанный Вами адрес электронной почты <b><span class="email"></span></b>
  </div>
  <div>
    <?php
      echo '<a href="'.$url.'?action_id='.$action_id.'">Вернуться к залу!</a>';
    ?>
  </div>
</div>
</body>
</html>