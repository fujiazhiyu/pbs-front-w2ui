var initContactsInfo = (function() {
    console.log("contacts executes");
    var called = false;
    return function() {
        if (!called) {
            layui.use('table', function() {
                var table = layui.table;
                //第一个实例
                table.render({
                    id: 'contacts-table',
                    elem: '#contacts-grid',
                    height: 220,
                    minWidth: 10,
                    width: $("#overview-focus").outerWidth(true),
                    size: "sm",
                    url: 'http://localhost/chinavis17/pbs-front-w2ui/testdata/testdata.json', //数据接口
                    cols: [[ //表头
                        {field: 'contacts', title: 'Contacts', width: '20%', sort: true, align: 'center'},
                        {field: 'themes',title: 'Themes',width: '20%' ,sort: true, align: 'center'},
                        {field: 'keywords',title: 'Keywords',width: '45%' , minWidth: 10,sort: true, align: 'center'},
                        {field: 'count',title: 'Count',width: '15%' ,sort: true, align: 'center'}
                    ]]
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
