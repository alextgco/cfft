$(document).ready(function(){

    var tableWrapper = $('.initMeTable');
    var getObj = tableWrapper.data('get_object');
    var table = new CF.Table({
        getObject: getObj,
        wrapper: tableWrapper,
        visible_columns: ['action_title', 'action_part', 'user_firstname', 'user_surname', 'concat_result', 'status_name'],
        //'id','action_id','status_name_sys','video_url'
        goToObject: 'admin_judge_result',
        primaryKey: 'id',
        filters: [
            {
                label: 'Мероприятие',
                column: 'action_id',
                type: 'select',
                tableName: 'action',
                returnId: 'id',
                returnName: 'title'
            },
            {
                label: 'Этап',
                column: 'action_part',
                type: 'like'
            },
            {
                label: 'Атлет',
                column: 'user_surname',
                type: 'like'
            },
            //{
            //    label: 'Результат',
            //    column: 'concat_result',
            //    type: 'like'
            //},
            {
                label: 'Статус',
                column: 'status_id',
                type: 'select',
                tableName: 'result_statuses',
                returnId: 'id',
                returnName: 'name'
            }
        ]
    });

    table.init();

});
