<?php 
/*
if(isset($_POST)){
  foreach ($_POST as $key=>$val){
    $($key) = $val;
  }
}
*/
include("test_xml.php");
include("PDF/dompdf_config.inc.php");
if($_POST){
  $s = $_POST['xml'];
}
$xml = simplexml_load_string($s);
foreach ($xml->ROWS as $element) {
  foreach($element->children() as $key => $array) {
      //echo "{$key}: {$val}";
    $arr = $array;
  }
}

include("Barcode/Barcode39.php");
  $bc = new Barcode39($arr->BARCODE);

  $bc->draw("barcode39.gif");

  include("PDF/ticket.php");


  $dompdf = new DOMPDF();
  $dompdf->set_paper("A4");
  $dompdf->load_html($html);
  $dompdf->render();

  $canvas = $dompdf->get_canvas();
  $font = Font_Metrics::get_font("arial",'');
  $dompdf->stream("sample.pdf",array("Attachment"=>0));

  /*
  $output = $dompdf->output();
  file_put_contents('ticket_'.$arr->ORDER_ID.'.pdf', $output);
  */
  include("mail_to.php");

function dotted_string ($max){
  $html= "<div>";
  for ($i=0;$i<=$max;++$i){
    $html.= '. ';
  }
  $html.= "</div>";
  return $html;
}



//$html ='<a href="http://odenisova.ru/">Это ссылка</a>';
?>
