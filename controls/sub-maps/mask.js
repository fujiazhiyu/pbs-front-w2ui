var outer = [
    new AMap.LngLat(-360, 90, true),
    new AMap.LngLat(-360, -90, true),
    new AMap.LngLat(360, -90, true),
    new AMap.LngLat(360, 90, true),
];

/**
 * 根据绘制路径创建蒙版, 只高亮显示被圈起来的点
 * @param {Array} tracks 二维数组, 在地图上绘制的所有路径
 */
var customAreaMask = function(map, tracks) {
    clearTracks(tracks);
    if (tracks.length > 0) {
        var maskOverlay, pathArray = [outer]; // 外边界,(大地的尽头)
        // 需要把tracks降维push进pathArray
        pathArray.push.apply(pathArray, tracks);
        map.getAllOverlays().forEach(function(overlay) {
            if (overlay.getExtData() === 'maskLayer')
                maskOverlay = overlay;
        });
        if (maskOverlay) {
            maskOverlay.setPath(pathArray);
        } else {
            var polygon = new AMap.Polygon({
                path: pathArray,
                strokeColor: '#aaa',
                strokeWeight: 2,
                fillColor: '#ccc',
                fillOpacity: 0.5,
                extData: 'maskLayer',
                zIndex: 200,
            });
            polygon.setPath(pathArray);
            map.add(polygon);
            polygon.on('rightclick', function(e) {
                AMap.event.trigger(map, 'rightclick', e);
            });
        }
        return maskOverlay;
    }
}

/**
 * 移除被多层嵌套的环
 * @param {Array} tracks 所有路径
 */
var clearTracks = function(tracks) {
    var indexes = [];
    tracks.forEach(function(tlocs, idx) {
        var rings = 0;
        for (var i = 0, len = tracks.length; i < len; i++) {
            // 当前环路和其他路径相比较,如果被嵌套,则rings +1
            if (idx !== i && AMap.GeometryUtil.isRingInRing(tlocs, tracks[i]))
                rings++;
        }
        if (rings > 1) //如果被两层以上的环嵌套,则准备被移除
            indexes.unshift(idx);
    });
    indexes.forEach(function(ele) {
        tracks.splice(ele, 1);
    })
}

/**
 * 前提: tracks经过去多层嵌套处理, 这个point至多被两个环包围
 * 判断此点是否在高亮区域内, 高亮区域是: 1.仅被一个环围住的区域; 2.在两个嵌套环之间的区域
 * @param {AMap.LngLat} point 需要判断的点
 * @param {Array} tracks 所有路径
 * @return 点是否应在高亮区域
 */
var isPointInHightlight = function(point, tracks) {
    var status = false;
    tracks.forEach(function(tlocs) {
        status = AMap.isPointInRing(point, tlocs) ? !status : status;
    });
    return status;
}


export default customAreaMask;
