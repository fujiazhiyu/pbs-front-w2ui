import * as snapshot from '../../utils/snapshot.js';


var initContactsInfo = (function() {
    console.log("contacts executes");
    var called = false;
    return function() {
        if (!called) {
            layui.use('table', function() {
                var table = layui.table;
                //第一个实例
                var contactTable = table.render({
                    id: 'contacts-table',
                    elem: '#contacts-grid',
                    height: 220,
                    minWidth: 10,
                    width: $("#overview-focus").outerWidth(true),
                    size: "sm",
                    url: URL_PREFIX + '/api/infos/contacts', //数据接口
                    cols: [[ //表头
                        {field: 'contacts', title: 'Contacts', width: '60%', sort: true, align: 'center'},
                        {field: 'theme',title: 'Theme',width: '25%' ,sort: true, align: 'center'},
                        {field: 'count',title: 'Count',width: '15%' ,sort: true, align: 'center'}
                    ]],
                    done: function(res, curr, count) {
                        snapshot.currentStatus.contacts = res.data;
                        // table.exportFile(contactTable.config.id, res.data, 'csv');
                    }
                });
            });
            reloadTableOnLayoutResize();
            called = true;
        } else {
            console.log("already executes initContactsInfo");
        }
    };
})();


var reloadTableOnLayoutResize = function() {
    w2ui['layout'].on('resize', function(event) {
        event.done(function () {
            console.log("on+++Complete");
            layui.table.reload('contacts-table', {width: $("#overview-focus").outerWidth(true)});
        });
    });
}


var hideContactsInfo = function() {
    $("#contacts-table-id").addClass("layui-hide");
}


var showContactsInfo = function() {
    initContactsInfo();
    $("#contacts-table-id").removeClass("layui-hide");
}


export {hideContactsInfo, showContactsInfo};
