import * as mapview from './map.js';
import * as control from './control-panel.js';
import * as solutions from './solutions.js';


export default function main() {
    $(window).load(function () {
        var pstyle = 'background-color: #FFF; border: 2px solid #eee; padding: 1px;';
        // var mapview = $("#map-view").load("./views/map.html");
        $('#mylayout').w2layout({
            name: 'layout',
            padding : 2,
            resizer : 3,
            panels: [
                { type: 'left', size: 270, resizable: true, style: pstyle },
                { type: 'main', style: pstyle },
                { type: 'preview', size: 240, resizable: true, style: pstyle }
            ]

        });

        w2ui['layout'].load('main', './views/map.html', 'pop-in', function() {
            mapview.initMapview();
        });
        w2ui['layout'].load('left', './views/control.html', 'pop-in', function() {
            control.InitControlPanel('list1', 'list2');
        });
        w2ui['layout'].load('preview', './views/solutions.html', 'pop-in', function() {
            solutions.initSolutionsPanel();
        });

    });
}
