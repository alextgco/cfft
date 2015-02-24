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
                column: 'action_title',
                type: 'select',
                tableName: 'action'
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
                column: 'status_name',
                type: 'select',
                tableName: 'result_statuses'
            }
        ]
    });

    table.init();

});
