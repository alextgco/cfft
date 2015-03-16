var api = require('../libs/api');

var daily = {
    updateAges:function(){
        api('updateUserAges', 'user', {},function(err,result){
            if (err){
                console.log(err);
            }else{
                console.log('Обновлено ',result, ' пользователей.');
            }
        });
    }
};
module.exports.daily = daily;