var api = require('../libs/api');
api('updateUserAges', 'user', {},function(err,result){
    if (err){
        console.log(err);
    }else{
        console.log('Обновлено ',result, ' пользователей.');
    }
});