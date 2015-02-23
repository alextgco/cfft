var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World\n');
}).listen(8080, '104.131.178.191');
console.log('Server running at http://104.131.178.191:8080/');