import * as snapshot from './utils/snapshot.js';
import initThemeLayer from './sub-maps/themelayer.js';
import loadMessages from './sub-maps/messages-load.js';
import bindMapButton from './sub-maps/bindMapButton.js';


var initMapview = function() {
    initMap();
}


var initMap = function() {
    var map = new AMap.Map('mapid', {
        center: [116.335183, 39.941735],
        zooms: [10, 16],
        zoom: 13,
        resizeEnable: true,
        mapStyle: 'amap://styles/b8aa66c1995b9d1561581cbdf2e04992',
        defaultCursor: 'pointer',
        doubleClickZoom: false,
    });

    map.on('complete', function(e) {
        $('input[type=list1]').on('change', function(e) {
            var dataset = $(this).val();
            if (dataset === snapshot.currentStatus.map.dataset) {
                return 0;
            }
            w2ui['layout'].lock('main', 'Loading...', true);
            snapshot.currentStatus.map.dataset = dataset;
            initThemeLayer(URL_PREFIX + '/api/keywords/themes?date=' + dataset);
            loadMessages(map, URL_PREFIX + '/api/messages/points?date=' + dataset, function() {
                w2ui['layout'].unlock('main');
            });
        });
        bindMapButton(map, snapshot.currentStatus);
    });

}


export {initMapview}
