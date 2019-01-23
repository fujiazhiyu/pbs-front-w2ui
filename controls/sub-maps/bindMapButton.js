import initFreeDrawLayer from './free-draw-region.js';
import customAreaMask from './mask.js';


var customLayer

var bindMapButton = function(map, status) {
    customLayer = initFreeDrawLayer(map);
    presetDistrictMask(map);
    bindSelectButton(map);
    initRightClickMenu(map);
    bindPreferenceSubmit(map, status);
}


var presetDistrictMask = function(map) {
    var searchHook = new AMap.DistrictSearch({
        extensions: 'all',
        subdistrict: 0,
    });
    $('input[type=list3]').on('change', function() {
        // 阻止自由划线
        mapCleaner(map);
        $('.front-label.polygon-label').removeClass("button-selected").children().css("background-color", "#fff");
        searchHook.search($(this).val(), function(status, result) {
            var mask = customAreaMask(map, result.districtList[0].boundaries);
            map.setZoomAndCenter(11, result.districtList[0].boundaries[0][1]);
        });
    });
}


var bindPreferenceSubmit = function(map, status) {
    $('#submit-button').on('click', function(e) {
        map.getAllOverlays().map(function(overlay) {
            if (overlay.getExtData() === 'maskLayer') {
                // var pointsInMask = [], pointsAroundMask = [];
                var maskPolygon = map.getAllOverlays()[0].getPath().slice(1);
                // 当前points已经是所选theme且在所选时间段内的points了
                var curPoiOnMap = status.map.pointSimplifierIns._data.source;
                var pointsSelected = curPoiOnMap.map(function(point, idx) {
                    var isInner = false, lngLatPoint = new AMap.LngLat(point.lng, point.lat);
                    maskPolygon.forEach(function(ring) {
                        // 如果在这个环里, 就改变isInner状态, 最多可能在两个环里,也就是isInner==false
                        isInner = AMap.GeometryUtil.isPointInRing(lngLatPoint, ring) ? !isInner : isInner;
                    });
                    // 被围住的points塞进pointsInMask, 没被围住但是在周围的塞进pointsAroundMask;
                    if (isInner) {
                        // pointsInMask.push(point);
                        return point.id;
                    } else {
                        maskPolygon.forEach(function(ring) {
                            if (AMap.GeometryUtil.distanceToLine(lngLatPoint, ring) < 250) {
                                // pointsAroundMask.push(point);
                                return point.id;
                            }
                        });
                    }
                    return -1;
                });
                $.unique(pointsSelected.sort()).shift();    // 修改了pointsSelected
                var params = {
                    "dataset": $('input[type=list1]').val(),
                    "themes": status.map.themesselected,
                    "time_period": status.time_period,
                    "keywords_weights": w2ui['tags-panel'].get('tags-field').$el.data('selected').map(function (tag) {
                        return {"keyword": tag.text, "weight": tag.count};
                    }),
                    "selected_points": pointsSelected
                };

                fetch("http://127.0.0.1:5000/api/paths/recommend", {
                    method: "POST",
                    mode: "cors",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(params)
                }).then(response => response.json())
                .then(data => {
                    console.log('Success:', JSON.stringify(data));
                })
                .catch(error => console.error('Error:', error));
            }
        });
    });
}


var bindSelectButton = function(map) {
    $('.front-label.polygon-label').on('click', function(e) {
        if(!$(this).hasClass("button-selected")) {
            $(this).addClass("button-selected");
            $(this).children().css("background-color", "#eee");
            mapCleaner(map);
            $('input[type=list3]').val("");
            customLayer.setMap(map);
        } else {
            $(this).removeClass("button-selected");
            $(this).children().css("background-color", "#fff");
            mapCleaner(map);
        }
    });
}


var initRightClickMenu = function(map) {
    var contextMenu = new AMap.ContextMenu();
    //右键放大
    contextMenu.addItem("clear mask", function() {
        mapCleaner(map);
        $('input[type=list3]').val("");
        customLayer.setMap(map);
    }, 0);

    map.on('rightclick', function(e) {
        contextMenu.open(map, e.lnglat);
    });
}


var mapCleaner = function(map) {
    customLayer.setMap(null);
    map.clearMap();
    customLayer = initFreeDrawLayer(map);
}


export default bindMapButton;
