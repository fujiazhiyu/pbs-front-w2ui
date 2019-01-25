import * as snapshot from '../../utils/snapshot.js';


var lastParams = '';

var initKeywordsInfo = (function() {
    return function(word_array) {
        $("#keywords-cloud").empty();
        var keywordsWidth = $("#keywords-cloud").parent().outerWidth(true);
        $("#keywords-cloud").jQCloud(word_array, {
            afterCloudRender: function(a) {
                snapshot.currentStatus.keywords = word_array;
            },
            shape: "rectangular",
            width: keywordsWidth,
            height: 230,
            center: {
                x: keywordsWidth / 2 - 10,
                y: 115
            }
        });
        $("#keywords-cloud").on('dragstart', handle_start)
        $("#keywords-cloud").css("width", keywordsWidth);
    };
})();


var handle_start = function(event) {
    var isSelected = $(event.target).attr('isselected') === 'true' ? true : false;
    if (!isSelected) {
        event.originalEvent.dataTransfer.setData('text/plain', event.target.id);
    } else {
        event.preventDefault();
    }
}


var hideKeywordsInfo = function() {
    $("#keywords-cloud").addClass("layui-hide");
    console.log("hide keywords");
}


var showKeywordsInfo = function() {
    if (!snapshot.currentStatus.map.dataset) return;
    var selectedThemes = [];
    snapshot.currentStatus.map.themesselected.forEach(function(ele, idx) {
        if(ele) {
            selectedThemes = selectedThemes.concat(clusterIndexes[idx].reduce(function(total, val) {
                return total.concat(val);
            }, []));
        }
    });
    var newParams = {
        "date": snapshot.currentStatus.map.dataset,
        "themes": selectedThemes.join(','),
        "time": snapshot.currentStatus.time_period.join(',')
    }
    if (lastParams !== JSON.stringify(newParams)) {
        fetch(URL_PREFIX + "/api/keywords/all?date=" + snapshot.currentStatus.map.dataset +
        "&themes=" + selectedThemes.join(',') +
        "&time=" + snapshot.currentStatus.time_period.join(',') )
        .then(response => response.json())
        .then(data => {
            initKeywordsInfo(data.records);
        });
        lastParams = JSON.stringify(newParams);
    } else {
        console.log('keywords are not changed...');
    }
    $("#keywords-cloud").removeClass("layui-hide");
}


export {
    hideKeywordsInfo,
    showKeywordsInfo
};
