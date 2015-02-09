<?php
error_reporting (E_ALL);
$fp = fopen('data.txt', 'w+');
var_dump($fp);

echo "POST:";
fwrite($fp, "POST EXIST\r\n");
foreach ($_POST as $key => $val){
    fwrite($fp, $key.' '.$val."\r\n");
}
echo "GET:";
fwrite($fp, "GET EXIST\r\n");
foreach ($_GET as $key => $val){
    fwrite($fp, $key.' '.$val."\r\n");
}

fclose($fp);
