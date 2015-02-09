var express = require('express');
var app = express();
app.use(express.static(__dirname + '/../public_html'));
app.use("/", express.static(__dirname + '/index.html'));
app.listen(80);