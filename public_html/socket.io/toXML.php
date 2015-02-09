<?php
header("Content-type: application/vnd.ms-excel");
header("Content-disposition: attachment; filename=report_".date("Y-m-d").".xls");
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Пример</title>
    <style>
        br {
            mso-data-placement:same-cell;
        }
        .style0 {
            mso-number-format:General;
            white-space:nowrap;
            mso-style-id:0;
        }
        td {
            mso-style-parent:style0;
            mso-number-format:"@";
            text-align: left;
        }
        td.date {
            mso-number-format:"dd.mm.yyyy";
        }
        td.time {
            mso-number-format:"[h]:mm:ss";
        }
        .number {
            mso-number-format:"0";
        }
    </style>
</head>

<body>
<table width="200" border="1">
    <tr>
        <td>№</td>
        <td>Товар</td>
        <td>Количество</td>
        <td>Цена</td>
    </tr>
    <tr>
        <td>1</td>
        <td>Молоко</td>
        <td>2</td>
        <td>18-00</td>
    </tr>
    <tr>
        <td>2</td>
        <td>Хлеб</td>
        <td>3</td>
        <td>20-00</td>
    </tr>
</table>
</body>
</html>