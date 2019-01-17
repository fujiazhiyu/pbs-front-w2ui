import * as snapshot from '../../utils/snapshot.js';


var initKeywordsInfo = (function() {
    var called = false;
    return function(word_array) {
        if (!called) {
            $("#keywords-cloud").jQCloud(word_array, {afterCloudRender: function(a) {
                snapshot.currentStatus.keywords = word_array;
            }});
            $("#keywords-cloud").on('dragstart', handle_start)
            $("#keywords-cloud").css("width", $("#keywords-cloud").parent().outerWidth(true));
            called = true;
        } else {
            console.log("already executes initKeywordsInfo");
        }
    };
})();


var handle_start = function(event) {
    console.log("drag start");
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
    fetch(URL_PREFIX + "/api/keywords/all")
        .then(response => response.json())
        .then(data => {
            initKeywordsInfo(data.records);
            $("#keywords-cloud").removeClass("layui-hide");
        });
}


export {
    hideKeywordsInfo,
    showKeywordsInfo
};
