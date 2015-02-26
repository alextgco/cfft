<?php

include("PDF/dompdf_config.inc.php");

include("Barcode/Barcode39.php");
$files = array();
$info = array();

//$xml = simplexml_load_string($s);


//if(isset($_POST['TICKET_TEMPLATE'])){
//    $template = "ticket_".$_POST['TICKET_TEMPLATE'];
//}
//else {
//    $template = "ticket";
//}





$object = json_decode($_POST['JSON']);


$obj = jsonToObj($object);
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
    foreach ($obj->data as $i => $arr){
        foreach($obj->data_columns as $index => $val){
            if(!isset($obj_true[$i])){$obj_true[$i] = array();}
            $obj_true[$i][$val] = $arr[$index];
        }
    }
    return $obj_true;
}



//$html ='<a href="http://odenisova.ru/">Это ссылка</a>';


?>