var pickKeywords = function() {
    console.log("themes_keywords executes");
    var themes_keywords = $("#themes-keywords").load("./views/subviews/themes-keywords.html", function() {
        setTagPanel('tags-panel', 'tags-field');
    });
}

var setTagPanel = function(id, fieldname) {
    // var pstyle = 'background-color: #fff; height: 200px;';
    var people = ['George Washington', 'John Adams', 'Thomas Jefferson', 'James Buchanan', 'Warren Harding', 'Gerald Ford', 'Calvin Coolidge'];
    $('#' + id).w2form({
        name: id,
        // style: pstyle,
        fields: [{
            field: fieldname,
            type: 'enum',
            // required: true,
            options: {
                items: people,
                openOnFocus: true,
                style: '',
                selected: [{
                    id: 0,
                    text: 'John Adams'
                }],
                onAdd: function(event) {
                    event.item.style = 'background-color: rgba(255,255,255, 1); border: 1px solid red; padding: 0;';
                },
                renderItem: function(item, index, remove) {
                    var pb = $(".w2ui-field-helper.w2ui-list").find("li[index=" + index + "]").find(".progress-bar");
                    if (pb.length) {
                        item.count = parseInt(pb[0].style.height.slice(0, -1));
                    } else {
                        item.count = 50;
                    }
                    var html = '<div class="progress-bar progress-bar-danger" role="progressbar" style="height: ' +
                        item.count +
                        '%;">' +
                        '<span class="sr-only"></span><p style="opacity: 0;">' +
                        item.text +
                        '</p></div><p class="tag-name">' +
                        item.text +
                        '</p>' +
                        remove;
                    return html;
                }
            }
        }]
    });

    Tagscroll();
};

var Tagscroll = function() {
    $(".w2ui-field-helper.w2ui-list").on("mousewheel", "li[index]", function(innerevent) {
        var pb = $(this).find(".progress-bar");
        var pbvalue = parseInt(pb[0].style.height.slice(0, -1));
        pbvalue += (innerevent.originalEvent.wheelDelta > 0 ? 5 : -5);
        pbvalue = pbvalue > 100 ? 100 : pbvalue;
        pbvalue = pbvalue < 0 ? 0 : pbvalue;
        pb.css("height", pbvalue + "%");
        pb.find(".sr-only").html(pbvalue / 100);
    });
};

export default pickKeywords;
