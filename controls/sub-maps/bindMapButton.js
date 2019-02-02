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
            console.log("submission start...");
            if (overlay.getExtData() === 'maskLayer') {
                var maskPolygon = map.getAllOverlays()[0].getPath().slice(1);
                var polygonExtend = extendPolygon(maskPolygon);
                window.polygonExtend = polygonExtend;
                var limits = coordsLimits(polygonExtend);
                // 当前points已经是所选theme且在所选时间段内的points了
                var curPoiOnMap = status.map.pointSimplifierIns._data.source;
                var filteredPoints = [];
                curPoiOnMap.map(function(point) {
                    if (filterWithBounds(point, limits)) {
                        filteredPoints.push(point);
                    }
                });
                var pointsSelected = curPoiOnMap.map(function(point, idx) {
                    var isInner = false, lngLatPoint = new AMap.LngLat(point.lng, point.lat);
                    polygonExtend.forEach(function(ring) {
                        // 如果在这个环里, 就改变isInner状态, 最多可能在两个环里,也就是isInner==false
                        isInner = AMap.GeometryUtil.isPointInRing(lngLatPoint, ring) ? !isInner : isInner;
                    });
                    // 被围住的points塞进pointsInMask, 没被围住但是在周围的塞进pointsAroundMask;
                    if (isInner) {
                        return point.id;
                    }
                    return -1;
                });
                $.unique(pointsSelected.sort()).shift(); // 修改了pointsSelected

                var params = {
                    "dataset": $('input[type=list1]').val(),
                    "themes": status.map.themesselected,
                    "time_period": status.time_period,
                    "keywords_weights": confirmTagValues(),
                    "selected_points": pointsSelected.sort()
                };
                console.log("submission end...");
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


var confirmTagValues = function() {
    $('input[type=enum][name=tags-field]').data('selected',
        $('input[type=enum][name=tags-field]').data('selected')).change();
    return $('input[type=enum][name=tags-field]').data('selected').reduce(function(total, tag) {
        total[tag.text] = tag.count;
        return total;
    }, {});
}


var innerRings = function(tracks) {
    var inners = [];
    tracks.map(function(ring1, idx1) {
        tracks.map(function(ring2, idx2) {
            if (idx1 !== idx2 && AMap.GeometryUtil.isRingInRing(ring1, ring2)) {
                inners.push(idx1);
            }
        })
    });
    return inners;
}


var extendPolygon = function(tracks) {
    // 得到里圈的下标
    var inners = innerRings(tracks);
    var extendedPolygon = [];
    tracks.map(function(path, pidx) {
        var polygon = {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [path.map(function(val) {
                    return [val.lng, val.lat];
                })]
            },
        };
        // 是缩还是放, 取决于本path的下标是否在inners内
        var radius = inners.includes(pidx) ? -0.25 : 0.25;
        // 使用turf.js的simplify和buffer功能对polygon进行缩放: [https://github.com/Turfjs/turf/issues/507]
        var margined = turf.simplify(turf.buffer(polygon, radius, {
            units: 'kilometers'
        }), {
            "tolerance": 0.00005,
        });
        // 从geojson中提取路径, 注意有可能是'MultiPolygon'或'Polygon'类型; 默认按照'MultiPolygon'处理
        var paths = margined.geometry.coordinates.reduce(function(total, val, idx) {
            return total.concat(val);
        });
        if (margined.geometry.type === "Polygon") {
            paths = [paths];    // 都给变成[[]]嵌套数组, 表示多条路径
        }
        paths.map(function(path) {
            extendedPolygon.push(path.map(function(val) {
                return new AMap.LngLat(val[0], val[1]);
            })); // 新的单条路径都加入到extended路径行列
        });
    });
    return extendedPolygon;
}


var filterWithBounds = function(point, limits) {
    let lng = point.lng, lat = point.lat;
    if(lng>limits.maxlng || lng<limits.minlng || lat>limits.maxlat || lat<limits.minlat) {
        return false;
    }
    return true;
}


var coordsLimits = function(polygons) {
    var maxlat=0, maxlng=0, minlat=200, minlng=200;
    polygons.map(function(polygon) {
        polygon.map(function(point) {
            maxlat = point.lat > maxlat ? point.lat : maxlat;
            maxlng = point.lng > maxlng ? point.lng : maxlng;
            minlat = point.lat < minlat ? point.lat : minlat;
            minlng = point.lng < minlng ? point.lng : minlng;
        });
    });
    return {"maxlng": maxlng, "minlng": minlng, "maxlat": maxlat, "minlat": minlat};
}


var bindSelectButton = function(map) {
    $('.front-label.polygon-label').on('click', function(e) {
        if (!$(this).hasClass("button-selected")) {
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
