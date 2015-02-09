
<?php
    error_reporting (E_ALL);
    $fp = fopen('data.txt', 'w+');
    var_dump($fp);
    fwrite($fp, "GO\r\n\r\n");
    if($_POST){
        echo "POST EXIST";
        fwrite($fp, "POST EXIST\r\n");
        foreach ($_POST as $key => $val){
            fwrite($fp, $key.' '.$val."\r\n");

        }
        $json = $_POST['JSON'];
        fwrite($fp, "\r\n".$json."\r\n");
        $jsonObj = json_decode($json);
        foreach ($jsonObj as $key => $val){
            fwrite($fp, $key.' '.$val."\r\n");
        }
    }
    fwrite($fp, "\r\n\r\nEND");
    fclose($fp);
?>