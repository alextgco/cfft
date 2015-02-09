

<?php
if(isset($_POST['TOKEN']) && $_POST['TOKEN'] == "UrD5aPYZhxbvetYLDx1crUD1YBuNtpoIDzRf2OmWf0wTZHcc2U"){
   include ("pdf_create.php");
}

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

echo ini_get('upload_tmp_dir');

?>