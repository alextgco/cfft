$(document).ready(function(){

    var tableWrapper = $('.initMeTable');
    var getObj = tableWrapper.data('get_object');
    var table = new CF.Table({
        getObject: getObj,
        wrapper: tableWrapper,
        visible_columns: ['action_name', 'action_title', 'action_part', 'concat_result', 'status_name', 'video_url'],
        goToObject: '',
        sort: {
            created: 'ASC'
        },
        primaryKey: 'id',
        filters: [
        ]
    });

    table.init();

});
