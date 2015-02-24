$(document).ready(function(){

    var tableWrapper = $('.initMeTable');
    var action_id = tableWrapper.data('action_id');
    var part_id = tableWrapper.data('part_id');
    var getObj = tableWrapper.data('get_object');
    var table = new CF.Table({
        getObject: getObj,
        wrapper: tableWrapper,
        visible_columns: ['user_surname', 'concat_result', 'status_name', 'video_url', 'user_firstname'],
        specialColumns: [
            {
                column: 'video_url',
                type: 'link'
            }
        ],
        defaultWhere: {
            action_parts: {
                action_id: action_id,
                id: part_id
            }
        },
        where: {
            action_parts: {
                action_id: action_id,
                id: part_id
            }
        },
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

});