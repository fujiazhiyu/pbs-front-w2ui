var words = ['急用钱', '广告', '非法服务', '钓鱼诈骗', '恶意骚扰'];


var setThemesKeywordsPanel = function() {
    console.log("themes_keywords executes");
    var themes_keywords = $("#themes-keywords").load("./views/subviews/themes-keywords.html", function() {
        initPanel('tags-panel', 'tags-field');
        $('#tags-panel').on('drop', handle_drop);
        $('#tags-panel').on('dragover', handle_over);
        $('#tags-panel').on('dragenter', handle_enter);
    });
}


var handle_drop = function(event) {
    event.preventDefault();
    // event.stopPropagation();
    var domId = event.originalEvent.dataTransfer.getData('text/plain');
    setTag2Panel('tags-panel', domId);
    // 降低原panel中keyword的opacity,设置元素被选中
    $('#'+domId).attr('isselected', true).css("opacity", 0.6);
    console.log("drop event");
}


var setTag2Panel = function(panelId, domId) {
    var tagPanel = $('#'+ panelId +' input[type=enum]');
    var currentData = tagPanel.data('selected');
    var length = currentData.push({id: domId, text: $('#'+domId).html(), color: $('#'+domId).css('color')});
    currentData = tagPanel.data('selected', currentData).w2field().refresh();
    return currentData;
}


var handle_over = function(event) {
    event.preventDefault();
}


var handle_enter = function(event) {
    event.preventDefault();
}


var initPanel = function(id, fieldname) {
    $('#' + id).w2form({
        name: id,
        fields: [{
            field: fieldname,
            type: 'enum',
            options: {
                items: words,
                openOnFocus: false,
                filter: false,
                renderItem: function(item, index, remove) {
                    item.style = 'border: 1px solid ' + item.color + '; padding: 0;';
                    var pb = $(".w2ui-field-helper.w2ui-list").find("li[index=" + index + "]").find(".progress-bar");
                    if (pb.length) {
                        item.count = parseInt(pb[0].style.height.slice(0, -1));
                    } else {
                        item.count = 50;
                    }
                    var backgroundColor = item.color.split(' ');
                    backgroundColor.splice(-1, 1, '0.15)')
                    var html = '<div class="progress-bar" role="progressbar" style="height: ' +
                        item.count +
                        '%; background-color: ' + backgroundColor.join(' ') + '">' +
                        '<span class="sr-only"></span><p style="opacity: 0;">&nbsp;' +
                        item.text +
                        '&nbsp;</p></div><p class="tag-name">&nbsp;' +
                        item.text +
                        '&nbsp;</p>' +
                        remove;
                    return html;
                },
                onRemove: function(event) {
                    $('#'+ event.item.id).attr('isselected', false).css("opacity", 1);
                }
            }
        }]
    });

    tagScroll();
};

var tagScroll = function() {
    $(".w2ui-field-helper.w2ui-list").on("mousewheel", "li[index]", function(innerevent) {
        innerevent.preventDefault();
        innerevent.stopPropagation();
        var pb = $(this).find(".progress-bar");
        var pbvalue = parseInt(pb[0].style.height.slice(0, -1));
        pbvalue += (innerevent.originalEvent.wheelDelta > 0 ? 5 : -5);
        pbvalue = pbvalue > 100 ? 100 : pbvalue;
        pbvalue = pbvalue < 0 ? 0 : pbvalue;
        pb.css("height", pbvalue + "%");
        pb.find(".sr-only").html(pbvalue / 100);
    });
};

export default setThemesKeywordsPanel;
