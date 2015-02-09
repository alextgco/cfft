<?php

/*include("PDF/dompdf_config.inc.php");

include("Barcode/Barcode39.php");
$files = array();
$info = array();*/



include 'PDF/PDFMerger.php';


$pdf = new PDFMerger;
$pdf->addPDF('files/ticket_2505_8670_3837168.pdf', '1')
    ->addPDF('files/ticket_2505_8669_3837164.pdf', '1')
    ->addPDF('files/ticket_2505_8668_3837163.pdf', '1')
    ->merge('file', 'files/TEST2.pdf');
    
    //REPLACE 'file' WITH 'browser', 'download', 'string', or 'file' for output options
    //You do not need to give a file path for browser, string, or download - just the name.

return;














//$xml = simplexml_load_string($s);


//if(isset($_POST['TICKET_TEMPLATE'])){
//    $template = "ticket_".$_POST['TICKET_TEMPLATE'];
//}
//else {
//    $template = "ticket";
//}

if( isset($_POST['JSON'])){
    $object = json_decode($_POST['JSON']);
}

$obj = jsonToObj($object);
$html = "";
$counter = 0;
foreach ($obj as $key => $value) {
    if($counter >2){
        break;
    }

    $array = array();

    if(isset($obj[$key]["TICKET_TEMPLATE"])){
        $template = "ticket_".$obj[$key]["TICKET_TEMPLATE"];
    }else{
        $template = "ticket";
    }

    if(isset($obj[$key]["BARCODE"])){
        $barcode = $obj[$key]["BARCODE"];
    }else{
        $barcode = "null";
    }

    $bc = new Barcode39($barcode);
    $bc->draw("barcode39.gif");

    if(isset($obj[$key]["ORDER_ID"])){
        $order_id = $obj[$key]["ORDER_ID"];
    }else{
        $order_id = "null";
    }

    $array["ORDER_ID"] = $order_id;

    if(isset($obj[$key]["CRM_USER_NAME"])){
        $user_name = $obj[$key]["CRM_USER_NAME"];
    }else{
        $user_name = "null";
    }

    $array["CRM_USER_NAME"] = $user_name;

    if(isset($obj[$key]["ACTION_NAME"])){
        $action_name = $obj[$key]["ACTION_NAME"];
    }else{
        $action_name = "null";
    }

    $array["ACTION_NAME"] = $action_name;

    if(isset($obj[$key]["ACTION_DATE"])){
        $action_date = $obj[$key]["ACTION_DATE"];
    }else{
        $action_date = "null";
    }

    $array["ACTION_DATE"] = $action_date;

    if(isset($obj[$key]["HALL"])){
        $hall = $obj[$key]["HALL"];
    }else{
        $hall = "null";
    }

    $array["HALL"] = $hall;

    if(isset($obj[$key]["AREA"])){
        $area = $obj[$key]["AREA"];
    }else{
        $area = "null";
    }

    $array["AREA"] = $area;

    if(isset($obj[$key]["LINE"])){
        $line = $obj[$key]["LINE"];
    }else{
        $line = "null";
    }

    $array["LINE"] = $line;

    if(isset($obj[$key]["PLACE"])){
        $place = $obj[$key]["PLACE"];
    }else{
        $place = "null";
    }

    $array["PLACE"] = $place;

    if(isset($obj[$key]["PRICE"])){
        $price = $obj[$key]["PRICE"];
    }else{
        $price = "null";
    }

    $array["PRICE"] = $price;

    if(isset($obj[$key]["AGENT_PRICE_MARGIN_PERCENT"])){
        $agent_percent = $obj[$key]["AGENT_PRICE_MARGIN_PERCENT"];
    }else{
        $agent_percent = "null";
    }

    $array["AGENT_PRICE_MARGIN_PERCENT"] = $agent_percent;

    if(isset($obj[$key]["AGE_CATEGORY"])){
        $age_category = $obj[$key]["AGE_CATEGORY"];
    }else{
        $age_category = "null";
    }

    $array["AGE_CATEGORY"] = $age_category;
    
    

    include("PDF/".$template.".php");

    $counter++;
}



$dompdf = new DOMPDF();
$dompdf->set_paper("A4");

$dompdf->load_html($html);
$dompdf->render();

//echo "metka1"; 
$output = $dompdf->output();

file_put_contents('files/ticket_1111.pdf', $output);

$html = "";

return;
//---------------------------------------------------------------------------------------------------------------------------------------------------


echo $object->extra_data->TICKET_TEMPLATE;

//print_r($_POST['JSON']);

if($object->extra_data->TICKET_TEMPLATE!=""){
    $template = "ticket_".$object->extra_data->TICKET_TEMPLATE;
}
else {
    $template = "ticket";
}
$agent_percent = $object->extra_data->AGENT_PRICE_MARGIN_PERCENT;
$additional_email_addresses= split(',',$object->extra_data->ADDITIONAL_EMAIL_ADDRESSES);

/*$f = fopen('ADDITIONAL_EMAIL_ADDRESSES.txt','w');
fwrite($f,$additional_email_addresses[0]);
fclose($f);*/

$info['order_id'] = $object->extra_data->ORDER_ID;
$info['email_to'] = $object->extra_data->EMAIL;

$order_id = $info['order_id'];
$email_to = $info['email_to'];
$counter = 0;






foreach ($obj as $i => $array) {

    $array['ACTION_NAME'] = str_replace("|",'"',$array['ACTION_NAME']);


    $bc = new Barcode39($array['BARCODE']);


    $bc->draw("barcode39.gif");
    $html = "";

    include("PDF/".$template.".php");
    $dompdf = new DOMPDF();
    $dompdf->set_paper("A4");
    $dompdf->load_html($html);
    $dompdf->render();
/*
    $f = fopen("1.html","w");
    fwrite($f,$html);
    fclose($f);*/

    $output = $dompdf->output();
    file_put_contents('files/ticket_'.$array['ORDER_ID'].'_'.$array['ORDER_TICKET_ID'].'_'.$array['BARCODE'].'.pdf', $output);
    //file_put_contents('files/test.pdf', $output);
    $info['event'] = $array['ACTION_NAME'];
    $files[] = 'files/ticket_'.$array['ORDER_ID'].'_'.$array['ORDER_TICKET_ID'].'_'.$array['BARCODE'].'.pdf';
    $info['arr'][$counter]['area'] = $array['AREA'];
    $info['arr'][$counter]['row'] = $array['LINE'];
    $info['arr'][$counter]['place'] = $array['PLACE'];
    $info['date_time'] = $array['ACTION_DATE'];
    $counter++;
}


$html = "";
/*
include("PDF/ticket.php");

$dompdf = new DOMPDF();
$dompdf->set_paper("A4");
$dompdf->load_html($html);
$dompdf->render();

$output = $dompdf->output();
file_put_contents('files/test.pdf', $output);
$dompdf->stream('files/test.pdf',array("Attachment"=>0));
*/
include("mail_to.php");

echo "OK";


function dotted_string ($max){
  $html= "<div>";
  for ($i=0;$i<=$max;++$i){
    $html.= '. ';
  }
  $html.= "</div>";
  return $html;
}



function jsonToObj($obj){

    $obj_true = array();
    $objIndex = array();

    foreach ($obj->DATA as $i => $arr){
        foreach($obj->NAMES as $index => $val){
            if(!isset($obj_true[$i])){$obj_true[$i] = array();}
            $obj_true[$i][$val] = $arr[$index];
        }
    }
   
    return $obj_true;
}



//$html ='<a href="http://odenisova.ru/">Это ссылка</a>';


?>