var Model = require('./MySQLModel');
var action_rewards = new Model({
    table: 'action_rewards',
    table_ru: 'Призовые места',
    ending:'ы',
    required_fields:['position','action_id','reward'],
    /*blob_fields:['description1','description2'],*/
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
    ]
},function(){
    module.exports = action_rewards;
});

