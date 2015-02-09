<?php
   
   //echo "asd";
/*   if( isset($_POST['JSON'])){
   		$object = json_decode($_POST['JSON']);
   		echo $object->ACTION_ID;
   		//echo $_POST['JSON'];	
   }
return;*/
   include ("pdf_create_mass.php");

/*
if ( !function_exists('sys_get_temp_dir')) {
  function sys_get_temp_dir() {
    if (!empty($_ENV['TMP'])) { return realpath($_ENV['TMP']); }
    if (!empty($_ENV['TMPDIR'])) { return realpath( $_ENV['TMPDIR']); }
    if (!empty($_ENV['TEMP'])) { return realpath( $_ENV['TEMP']); }
    $tempfile=tempnam(__FILE__,'');
    if (file_exists($tempfile)) {
      unlink($tempfile);
      return realpath(dirname($tempfile));
    }
    return null;
  }
} 

//echo  sys_get_temp_dir();

echo ini_get('upload_tmp_dir');*/

?>