import pickKeywords from "./theme-keywords.js";
import selectTimePeriod from "./time-period.js";
import kws_cts_dts_control from "./kws-cts-dts-controller.js";
import addControlButtons from "./control-buttons.js";


var selectPolygon = function(itemlist) {
    console.log("selectPolygon executes");
    var overview_focus = $("#overview-focus").load("./views/subviews/polygon-selections.html", function() {
        $('input[type=list3]').w2field('list', { items: itemlist });
        /* 用layui 的徽章功能 */
        layui.use('element', function(){
            var element = layui.element;
        });
        pickKeywords();
        selectTimePeriod();
        kws_cts_dts_control();
        addControlButtons();
    });
}


export default selectPolygon;
