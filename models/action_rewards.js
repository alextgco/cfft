var Model = require('./MySQLModel');
module.exports = function(callback){
    var action_rewards = new Model({
        table: 'action_rewards',
        table_ru: 'Призовые места',
        ending:'ы',
        required_fields:['position','action_id','reward'],
        join_objs:[
            {
                action_id:{
                    table:"actions",
                    fields:[
                        {
                            column:"title",
                            alias:"action"
                        }
                    ]
                }
            }
        ],
        sort:'position'
    },function(err){
        if (err){
            console.log(err);
        }
        callback(action_rewards);
    });
};

