import * as details from "./kws-cts-dts/details.js"
import * as contacts from "./kws-cts-dts/contacts.js"
import * as keywords from "./kws-cts-dts/keywords.js"


var kws_cts_dts_control = function() {
    var kws_cts_dts = $("#keywords-contacts-details").load("./views/subviews/keywords-contacts-details.html", function() {
        switchController("contacts");
        layui.use('element', function() {
            var element = layui.element;
            element.on('tab(kcd-filter)', function(data) {
                var innercontent = $(data.elem.context).children("a").html();
                switchController(innercontent);
            });
        });
    });

}


var switchController = function(focus_switch = "contacts") {
    switch (focus_switch) {
        case "keywords":
            contacts.hideContactsInfo();
            details.hideDetailsInfo();
            keywords.showKeywordsInfo();
            break;
        case "contacts":
            details.hideDetailsInfo();
            keywords.hideKeywordsInfo();
            contacts.showContactsInfo();
            break;
        case "details":
            keywords.hideKeywordsInfo();
            contacts.hideContactsInfo();
            details.showDetailsInfo();
            break;
        default:
            break;
    }
}


export default kws_cts_dts_control;
