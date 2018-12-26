import mapview from './map.js';
import * as control from './control-panel.js';


export default function main() {
    $(function () {
        var styleleft = 'background-color: #fff; border: 2px solid #efefef; padding: 1px;';
        var pstyle = 'background-color: #FFF; border: 2px solid #eee; padding: 1px;';
        // var mapview = $("#map-view").load("./views/map.html");
        $('#mylayout').w2layout({
            name: 'layout',
            padding : 2,
            resizer : 3,
            panels: [
                { type: 'left', size: 270, resizable: true, style: styleleft },
                { type: 'main', style: styleleft },
                { type: 'preview', size: 240, resizable: true, style: pstyle, content: 'preview' }
            ]

        });

        w2ui['layout'].load('main', './views/map.html', 'pop-in', function() {
            mapview();
        });
        w2ui['layout'].load('left', './views/control.html', 'pop-in', function() {
            control.InitControlPanel('list1', 'list2');
        });

        
    });
}
