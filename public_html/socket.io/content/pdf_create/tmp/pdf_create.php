<?php 
include("Barcode/code128barcode.class.php");
include("Barcode/php-barcode.php");
include("PDF/ticket.php");
include("PDF/tcpdf.php");
array(  
  'width' => w,  
  'height'=> h,  
  'p1' => array('x' => x, 'y' => y),  
  'p2' => array('x' => x, 'y' => y),  
  'p3' => array('x' => x, 'y' => y),  
  'p4' => array('x' => x, 'y' => y)  
);   
$im     = imagecreatetruecolor(300, 300);  
$black  = ImageColorAllocate($im,0x00,0x00,0x00);  
$white  = ImageColorAllocate($im,0xff,0xff,0xff);  
imagefilledrectangle($im, 0, 0, 300, 300, $white);  
$data = Barcode::gd($im, $black, 150, 150, 0, "code128", "12345678", 2, 50); 


$barcode = new code128barcode();
$code = $barcode->output('12154215');


define('TOC_PDF_FONT', 'times');

$style = array(
    'position' => '',
    'align' => 'C',
    'stretch' => false,
    'fitwidth' => true,
    'cellfitalign' => '',
    'border' => true,
    'hpadding' => 'auto',
    'vpadding' => 'auto',
    'fgcolor' => array(0,0,0),
    'bgcolor' => false, //array(255,255,255),
    'text' => true,
    'font' => 'helvetica',
    'fontsize' => 8,
    'stretchtext' => 4,
    'transform' => 'rotate(40deg)',
);

// создаем объект TCPDF - документ с размерами формата A4
// ориентация - книжная
// единицы измерения - миллиметры
// кодировка - UTF-8
$pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);

//$pdf->SetFont('arialb', '', '14' );
// убираем на всякий случай шапку и футер документа
$pdf->setPrintHeader(false);
$pdf->setPrintFooter(false);
$pdf->SetMargins(10, 10, 10); // устанавливаем отступы (20 мм - слева, 25 мм - сверху, 25 мм - справа)

$pdf->AddPage(); // создаем первую страницу, на которой будет содержимое
//$html ='<a href="http://odenisova.ru/">Это ссылка</a>';



$pdf->writeHTML($html1, true, false, true, false, '');

$pdf->Rotate(-90,-20,10);
$pdf->write1DBarcode('9876543210', 'C128C', '', '', '', 18, 0.4, $style, 'N');

$pdf->Rotate(90,5,5);
$pdf->writeHTML($html2, true, false, true, false, '');

$pdf->Output('doc.pdf', 'I'); // выводим документ в браузер, заставляя его включить плагин для отображения PDF (если имеется)


//$html ='<a href="http://odenisova.ru/">Это ссылка</a>';
?>
