import * as snapshot from '../../utils/snapshot.js';


var detailParameters = {
    'roadNum': 1,
    'color': [175, 238, 238],
    'opacities': [0.7, 0.3, 0.1, 0.8, 0.8, 0.5, 1.0, 0.9, 1.0, 0.9, 0.2, 0.3, 0.6, 0.4, 0.2, 0.6, 0.6, 0.3, 0.8, 0.4],
    'mEF': 100,
    'cEF': 70,
    'mTF': 100,
    'cTF': 50,
}


var initDetailsInfo = (function() {
    console.log("details executes");
    var called = false;
    return function() {
        if (!called) {
            var oneStreet = combineTimeseriesAndFitness(detailParameters);
            $('#details-grid').find('tbody').append(oneStreet).append(oneStreet);
            called = true;
            snapshot.currentStatus.details = detailParameters;
        } else {
            console.log("already executes initDetailsInfo");
        }
    };
})();


var hideDetailsInfo = function() {
    $("#details-grid").addClass("layui-hide");
}


var showDetailsInfo = function() {
    initDetailsInfo();
    $("#details-grid").removeClass("layui-hide");
}


var combineTimeseriesAndFitness = function(params) {
    var fitness = calFitness(params.mEF, params.cEF, params.mTF, params.cTF);
    var oneStreet = '<tr><td>'+
                    params.roadNum +
                    '</td><td><div class="ribbon" style="background: linear-gradient(90deg,' +
                    calTimeseries(params.color, params.opacities) +
                    ');"></div></td><td><div class="progress" style="width:' +
                    fitness[0]*100 +
                    '%;"><div class="progress-bar" role="progressbar" style="width:' +
                    fitness[1]*100 +
                    '%; background-color: rgb('+
                    params.color.join(',') +
                    ')"></div></div></td></tr>';
    return oneStreet;
}


var calTimeseries = function(color, opacities) {
    /* 返回一段彩带样式,参数应该是这个solution的一组透明度,和对应一个主题的一个颜色值 */
    var attr = "", o;
    for(o in opacities) {
        var percent = parseInt(o, 10) * 5;
        attr = attr.concat("rgba("+ color.join(',') + ',' + opacities[o] + ") " + percent + "% ,")
                   .concat("rgba("+ color.join(',') + ',' + opacities[o] + ") " + (percent+5) + "% ,");
    }
    return attr.substring(0, attr.lastIndexOf(','));
}


var calFitness = function(maxEntireFitness, currentEntireFitness, maxThemeFitness, currentThemeFitness) {
    /**
     * 返回这条街道对周围的点的fit程度,以及对某个theme的fit程度(带颜色);
     * 需要提供参数: 最大的整体fitness,当前街道的整体fitness, 针对某主题的最大fitness,针对某主题的当前fitness.
     * 表现在progressbar上的比例, 整体fitness是直接计算比例, 针对主题的fitness需要换成整体fitness的比例为除数,
     */
    var expEntireFitness = currentEntireFitness / maxEntireFitness;
    var expThemeFitness = currentThemeFitness / maxThemeFitness / expEntireFitness;
    return [expEntireFitness, expThemeFitness];
}


export {hideDetailsInfo, showDetailsInfo};
