var word_array = [
    {text: "Lorem", weight: 15},
    {text: "Ipsum", weight: 9, link: "http://jquery.com/"},
    {text: "Dolor", weight: 6, html: {title: "I can haz any html attribute"}},
    {text: "Sit", weight: 7},
    {text: "Amet", weight: 5}
];

var initKeywordsInfo = (function() {
    var called = false;
    return function(word_array) {
        if (!called) {
            console.log("???");
            $("#keywords-cloud").jQCloud(word_array);
            called = true;
        } else {
            console.log("already executes initKeywordsInfo");
        }
    };
})();


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
