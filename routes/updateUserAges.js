var api = require('../libs/api');

module.exports.post = function(req, res, next){
    api('updateUserAges', 'user', {},function(err,result){
        if (err){
            return res.status(200).send(JSON.stringify(err));
        }else{
            console.log('Обновлено ',result, ' пользователей.');
            return res.status(200).send('Обновлено ',result, ' пользователей.');
        }
    });

};
