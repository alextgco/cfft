
<?php

include("PDF/dompdf_config.inc.php");
include("Barcode/Barcode39.php");

//print_r($_POST);
$obj = $_POST;
//print_r($_POST);
$html = "";
$counter = 0;
// ---------------------------------- //
//  Style css //
// ----------------------------------//
$html.= '
  <style>
    
    @media screen {
        #tickets{
            display: none;
        }
    }
    @media print {
      #tickets {
        display: block;
      }
      .ticketBody {
        
      }
      /*
      p.newPage {
        page-break-after: always;
        border: 1px solid red;
      }
      */
      .ticketBody {
        float:none;
        border: 1px solid red;
      }
    }
    @font-face {
      font-family: code; /* Имя шрифта */
      src: url(PDF/lib/fonts/code128.ttf); /* Путь к файлу со шрифтом */
    }
    @font-face {
      font-family: code39; /* Имя шрифта */
      src: url(PDF/lib/fonts/code39r.ttf); /* Путь к файлу со шрифтом */
    }

    .ticketBody {
      
      padding: 0;
    }

    .logo {
      margin: 0 20px 0 0;
    }
    .barcode_top {
        position: absolute;
        -moz-transform: rotate(90deg); /* Для Firefox */
        -ms-transform: rotate(90deg); /* Для IE */
        -webkit-transform: rotate(90deg); /* Для Safari, Chrome, iOS */
        -o-transform: rotate(90deg); /* Для Opera */
        transform: rotate(90deg);
        font-size: 14px;
        text-align: center;
        margin-top: 70px;
        margin-left: 690px;
    }
    .barcode_top div {
      font-family: code;
      font-size: 50px;
    }
    .ticket_IMG {
      position: absolute;
      width: 800px;
      height: 230px;
      z-index: -1;
    }
    .barcode_left {
        position: absolute;
        margin-top: 100px;
        margin-left: -50px;
        -moz-transform: rotate(90deg); /* Для Firefox */
        -ms-transform: rotate(90deg); /* Для IE */
        -webkit-transform: rotate(90deg); /* Для Safari, Chrome, iOS */
        -o-transform: rotate(90deg); /* Для Opera */
        transform: rotate(90deg);
        text-align: center;
        line-height: 0.6;
    }
    .barcode_left div{
      font-family: code;
      font-size: 50px;
    }
    
    .background {
      position: absolute;
      width: 100%;
      height: 310px;
      content:url("img/barviha_background.jpg");
      z-index: -1;
      /*
      opacity: 0.7;
      */
      /*
      background-image: url("img/barviha_background.jpg");
      background-repeat:repeat-y;
      background-position: right top;
      background-attachment:fixed;
      background-size:100%;
      */
    }

    .ticket {
      width: 650px;
      margin: 0px 110px 10px;
      line-height: 1.6;
      font-family: Corbel;
      font-size: 26px;
      
    }
    .ticket .tr {
      position: relative;
      height: 45px;
      clear: both;
    }
    .ticket .tr:first-child .back {
      border-radius: 10px 10px 0 0;
    }
    .ticket .tr:last-child .back {
      border-radius: 0 0 10px 10px;
    }

    .ticket .clearfix {
      clear: both;
    }

    .ticket .text {
      padding-left: 15px;
    }

    .ticket .left {
      float: left;
      width: 245px;
      z-index: 5;
    }
    .ticket .right {
      float: left;
      padding-left: 5px;
      z-index: 5;
    }

    .ticket .back {
      position: absolute;
      width: 100%;
      height: 40px;
      content:url("img/background.png");
      z-index: -1;
    }



    table.ticket td {
      font-family: Corbel;
      font-size: 26px;
    }
    /*
    table.ticket td .back {
      position: absolute;
      content:url("img/background.png");
    }
    */
    table.descr td{
      font-size: 14px;
      vertical-align: top;
    }

    .dotted {
      border: 1px dotted #000;
    }



    
  </style>
  <meta http-equiv="content-type" content="text/html; charset=UTF-8"/>
';
foreach ($obj as $i => $array) {
    //print_r($array);
      //echo "{$key}: {$val}";
    //$array['ACTION_NAME'] = str_replace("|",'"',$array['ACTION_NAME']);

    $bc = new Barcode39($array['BARCODE']);

    $bc->draw("barcode39.gif");

    include("PDF/tickets.php");

    //$output = $dompdf->output();
    //file_put_contents('files/ticket_'.$array['ORDER_ID'].'_'.$array['ORDER_TICKET_ID'].'_'.$array['BARCODE'].'.pdf', $output);
    //$info['event'] = $array['ACTION_NAME'];
    //$files[] = 'files/ticket_'.$array['ORDER_ID'].'_'.$array['ORDER_TICKET_ID'].'_'.$array['BARCODE'].'.pdf';
    
    //$info['arr'][$counter]['area'] = $array['AREA'];
    //$info['arr'][$counter]['row'] = $array['ROW'];
    //$info['arr'][$counter]['place'] = $array['PLACE'];
    
    $counter++;
}

echo "<div id='tickets'>".$html."</div>";

/*
$dompdf = new DOMPDF();
$dompdf->set_paper("A4");
$dompdf->load_html($html);
$dompdf->render();
$output = $dompdf->output();
file_put_contents('files/action.pdf', $output);
//$dompdf->stream("sample.pdf",array("Attachment"=>0));
echo "GOAL";
*/

function dotted_string ($max){
  $html= "<div>";
  for ($i=0;$i<=$max;++$i){
    $html.= '. ';
  }
  $html.= "</div>";
  return $html;
}

?>
<script>window.print();</script>