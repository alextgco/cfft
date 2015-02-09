(function(){
    var toFile = require('./saveToFile').toFile;
    console.log('СТАРТ');
    toFile({fileName:'../public_html/savedFiles/1',flags:'w',data:'123'});
})();

