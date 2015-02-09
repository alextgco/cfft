START
<?php

PutEnv("ORACLE_SID=ORCL.MIRBILETA.RU");
PutEnv("ORACLE_HOME=/u01/app/oracle/product/12.1.0/dbhome_1");
//PutEnv("TNS_ADMIN=/var/opt/oracle"); 
//$ENV{NLS_LANG} = 'AMERICAN_AMERICA.UTF8';

  // Подключаемся к базе данных
  $c=OCILogon("ticket_b2c", "QPsJrxfrtMyazMNsFjo81fqOcTmGB1", "ORCL.MIRBILETA.RU");
  if ( ! $c ) {
     echo "Unable to connect: " . var_dump( OCIError() );
     die();
  }


  // Вызываем процедуру
  $query = "<query><command>get_action_scheme</command><action_id>1</action_id></query>";
  $s = OCIParse($c, "begin :res := TICKET_B2C.b2c_gateway_api.Request(xmltype(:req)); end;");
  OCIBindByName($s, ":req", $query);
  OCIBindByName($s, ":res", $out_var, 524288 * 20); // 32 is the return length
  OCIExecute($s, OCI_DEFAULT);
  echo "Procedure returned value: " . $out_var;

  // Отключаемся от базы данных
  OCILogoff($c);


?>
END