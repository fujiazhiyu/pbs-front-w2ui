$(function () {
    var styleleft = 'background-color: #fff; border: 2px solid #efefef; padding: 1px;';
    var pstyle = 'background-color: #FFF; border: 2px solid #eee; padding: 1px;';
    // var mapview = $("#map-view").load("./views/map.html");
    $('#layout').w2layout({
        name: 'layout',
        padding : 2,
        resizer : 3,
        panels: [
            { type: 'left', size: 270, resizable: true, style: styleleft, content: 'left' },
            { type: 'main', style: styleleft },
            { type: 'preview', size: 240, resizable: true, style: pstyle, content: 'preview',
                toolbar: {
                    items: [
                        { id: 'bt1', type: 'button', caption: 'Button 1', img: 'icon-page' },
                        { id: 'bt2', type: 'button', caption: 'Button 2', img: 'icon-page' },
                        { id: 'bt3', type: 'button', caption: 'Button 3', img: 'icon-page' }
                    ],
                    onClick: function (event) {
                        console.log('event');
                    }
                }
            }
        ]
    });

    w2ui['layout'].load('main', './views/map.html');

});
