var api = require('../libs/userApi');
exports.get = function(req, res, next){
    api('get', 'action', {
        where:
            {
                action_types:{
                    sys_name:'WOD_OF_WEEK'
                },
                action_statuses: {
                    sys_name: '<>DRAFT'
                }
            },
        user_id:req.user
    }, function(err,result){
        if (err){
            console.log(err, 'WOWS');
        }else{
            var mths = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
            for(var i in result.data){
                var a = result.data[i];
                var s_date = a['date_start'];
                var y = s_date.substr(0,4);
                var m = s_date.substr(5,2);
                var d = s_date.substr(8,2);
                var textDate = (s_date.length > 0 && s_date != 'null')? d +' '+ mths[parseInt(m)-1] + ' ' + y : '';
                result.data[i]['date_start_text'] = (s_date.length > 0)? textDate : '';
            }

            res.render('wows', {
                items: result
            });
        }

    });
};