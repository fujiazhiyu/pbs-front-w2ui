var word_array = [
    {text: "Lorem", weight: 15, html: {draggable: "true"} },
    {text: "Ipsum", weight: 9, html: {draggable: "true"}},
    {text: "Dolor", weight: 6, html: {draggable: "true"}},
    {text: "Sit", weight: 7, html: {draggable: "true"}},
    {text: "Amet", weight: 5, html: {draggable: "true"}}
];

var initKeywordsInfo = (function() {
    var called = false;
    return function(word_array) {
        if (!called) {
            $("#keywords-cloud").jQCloud(word_array);
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
    initKeywordsInfo(word_array);
    $("#keywords-cloud").removeClass("layui-hide");
}


export {
    hideKeywordsInfo,
    showKeywordsInfo
};
