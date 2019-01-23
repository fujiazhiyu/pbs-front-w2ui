import initFreeDrawLayer from './free-draw-region.js';


var initRightClickMenu = function(map, customLayer) {
    var contextMenu = new AMap.ContextMenu();

    //右键放大
    contextMenu.addItem("clear mask", function() {
        customLayer.setMap(null);
        customLayer = initFreeDrawLayer(map);
        map.getAllOverlays().forEach(function(overlay) {
            if (overlay.getExtData() === 'maskLayer') {
                overlay.setMap(null);
            }
        });
        // map.clearMap();
    }, 0);

    map.on('rightclick', function(e) {
        contextMenu.open(map, e.lnglat);
    });

    return contextMenu;
}


export default initRightClickMenu;
