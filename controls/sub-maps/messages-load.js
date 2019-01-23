import * as snapshot from '../utils/snapshot.js';

var themesselected = snapshot.currentStatus.map.themesselected;    // 初始化所有主题默认被选中

var loadMessages = function(map, url, callback) {
    AMapUI.loadUI(['misc/PointSimplifier'], function(PointSimplifier) {
        if (!PointSimplifier.supportCanvas) {
            alert('当前环境不支持 Canvas！');
            return;
        }
        var pointSimplifierIns = initLoader(map, PointSimplifier);
        getServerData(pointSimplifierIns, url, callback);
    });
}


var initLoader = function(map, PointSimplifier) {
    if (snapshot.currentStatus.map.pointSimplifierIns) {
        return snapshot.currentStatus.map.pointSimplifierIns;
    }
    var pointSimplifierIns = new PointSimplifier({
        map: map, //所属的地图实例
        autoSetFitView: false,
        zIndex: 100,
        getPosition: function(item) {
            // 只展示被选中的主题, item.theme是1-18的原生theme, 要给转换成0-9的sub-theme, 再转换成0-4的top-theme
            if (item) {
                return [parseFloat(item.lng), parseFloat(item.lat)];
            }
            return null;
        },
        getHoverTitle: function(item, idx) {
            // return themeNames[themeIndexes[item.theme-1]] + ': ' + item.keywords?item.keywords:'';
            return themeNames[themeIndexes[item.theme-1]];
        },
        renderConstructor: PointSimplifier.Render.Canvas.GroupStyleRender,
        renderOptions: {
            //点的样式
            pointStyle: {
                width: 6,
                height: 6
            },
            hoverTitleStyle: {
                position: 'top'
            },
            getGroupId: function(item, idx) {
                return themeIndexes[item.theme-1];
            },
            groupStyleOptions: function(groupId) {
                return {
                    pointStyle: {
                        fillStyle: themeColors[groupId] + '9F'
                    }
                }
            }
        }
    });
    snapshot.currentStatus.map.pointSimplifierIns = pointSimplifierIns;
    window.pointSimplifierIns = pointSimplifierIns;
    return pointSimplifierIns;
}

/**
 * 从服务器获取数据
 * @param {PointSimplifier Object} pointSimplifierIns 海量点对象
 * @param {string} url 数据集api
 * @param {function} callback 锁定main panel的回调
 */
var getServerData = function(pointSimplifierIns, url, callback) {
    $.ajaxSetup({
        crossDomain: true,
        // xhrFields: {
        //    withCredentials: true
        // },
        dataType: 'json',
        contentType: 'application/json; charset=utf-8'
    });
    $.get(url, function(messages) {
        if (messages && messages.status === '1') {
            var filteredPoints = messages.data, datapoints = messages.data;
            var [startTime, endTime] = ['0:20', '3:20'];
            $('.time-input').on('change', '#end-time', function() {
                startTime = $('#start-time').val();
                endTime = $('#end-time').val();
                // 在被选中的主题点中过滤出时间段内的点
                var newdata = getTimePeriodPoints([startTime, endTime], filteredPoints);
                pointSimplifierIns.setData(newdata);
            });
            $('.themes-layer').on('click', '.theme-area-chart', function(e) {
                // 将服务器返回的所有点都过滤一遍, 找到被选中theme的点
                filteredPoints = filterDisplayedPoints(datapoints);
                // 再根据当前时间筛选
                var newdata = getTimePeriodPoints([startTime, endTime], filteredPoints);
                pointSimplifierIns.setData(newdata);
            });
            pointSimplifierIns.setData(getTimePeriodPoints([startTime, endTime], datapoints));
            callback();
        }
    });
}

/**
 * 根据选中的themes过滤显示的点
 * @param {Array} datapoints 地图上将要被过滤的points, 实际上总是服务器返回的所有messages.data
 * @return {Array} theme在被选中的themes中的点
 */
var filterDisplayedPoints = function(datapoints) {
    themesselected = Array.prototype.reduce.call($('.themes-layer').children('.theme-area-chart'), function(total, val, idx) {
        return total.concat($(val).hasClass('theme-selected'));
    }, []);
    var filteredPoints = [];
    datapoints.forEach(function(point) {
        if(themesselected[subThemeIndexes[themeIndexes[point.theme-1]]]) {
            filteredPoints.push(point);
        }
    });
    snapshot.currentStatus.map.themesselected = themesselected;
    return filteredPoints;
}


/**
 * 得到在给定时间段内的点
 * @param {Array} vals 二维数组, [开始时间, 结束时间]
 * @param {Object} messages 服务器返回的所有messages
 * @return {Array} 在时间段内的点
 */
var getTimePeriodPoints = function(vals, datapoints) {
    var newdata = [];
    // 筛选messages中的点是否在时间段内 (只过滤hour, minute, 不过滤day, month...)
    var time = snapshot.currentStatus.time_period
    for (var i = 0, len = datapoints.length; i < len; i++) {
        // var date = new Date(datapoints[i].recitime);
        var date = new Date(datapoints[i].conntime);
        var curHours = date.getHours(),
            curMinutes = date.getMinutes();
        var curTime = curHours * 60 + curMinutes;
        if (curTime >= time[0] && curTime < time[1])
            newdata.push(datapoints[i]);
    }
    return newdata;
}


export default loadMessages;
