$(document).ready(function(){

    var tableWrapper = $('.initMeTable');

    var action_id = tableWrapper.data('action_id');
    var part_id = tableWrapper.data('part_id');
    var getObj = tableWrapper.data('get_object');
    var rangeWhere = tableWrapper.data('range_where');

    for(var i=0; i< tableWrapper.length; i++){
        var tbl = tableWrapper.eq(i);

        action_id = tbl.data('action_id');
        part_id = tbl.data('part_id');
        getObj = tbl.data('get_object');
        rangeWhere = tbl.data('range_where');

        var whereObj = {
            action_parts: {
                action_id: action_id,
                id: part_id
            },
            result_statuses: {
                sys_name: '<>IN_HISTORY'
            }
        };

        switch(rangeWhere){
            case 'male':
                whereObj['gender'] = {
                    sys_name: 'MALE'
                };
                whereObj['users'] = {
                    age: '<40'
                };
                break;
            case 'male40':
                whereObj['gender'] = {
                    sys_name: 'MALE'
                };
                whereObj['users'] = {
                    age: '>=40'
                };
                break;
            case 'famale':
                whereObj['gender'] = {
                    sys_name: 'FAMALE'
                };
                whereObj['users'] = {
                    age: '<40'
                };
                break;
            case 'famale40':

                whereObj['gender'] = {
                    sys_name: 'FAMALE'
                };
                whereObj['users'] = {
                    age: '>=40'
                };
                break;
            default:

                break;
        }


        var table = new CF.Table({
            getObject: getObj,
            wrapper: tbl,
            visible_columns: ['user_surname', 'concat_result', 'status_name', 'video_url', 'user_firstname'],
            sort: 'position',
            specialColumns: [
                {
                    column: 'video_url',
                    type: 'link'
                }
            ],
            defaultWhere: whereObj,
            where: whereObj,
            goToObject: '',
            primaryKey: 'id',
            filters: [
                {
                    label: 'Фамилия атлета',
                    column: 'surname',
                    type: 'like',
                    whereType: 'external',
                    whereTable: 'users'
                },
                {
                    label: 'Статус',
                    column: 'status_id',
                    type: 'select',
                    tableName: 'result_statuses',
                    returnId: 'id',
                    returnName: 'name',
                    whereType: 'internal',
                    whereTable: ''
                }
            ]
        });
        table.init();
    }



});
