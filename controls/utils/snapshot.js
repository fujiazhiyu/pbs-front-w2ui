let validator = {
    set: function(obj, prop, value) {
        switch (prop) {
            case 'saveStatus':
                if (typeof value !== "boolean") {
                    throw new TypeError('The saveStatus is not an Boolean');
                }
                if (obj[prop] === false && value === true) {
                    onControllerSave();
                    onMapSave();
                    onSolutionSave();
                    obj[prop] = value;
                } else if (obj[prop] === true && value === false) {
                    obj[prop] = value;
                    // do sth
                }
                break;
            case 'keywords':
                obj[prop] = value;
                break;
            case 'contacts':
                obj[prop] = value;
                break;
            case 'details':
                obj[prop] = value;
                break;
            case 'map':
                obj[prop] = $.extend(value, obj[prop]);
                break;
            case 'time_period':
                obj[prop] = value;
                break;
            default:
        }
        return true;
    }
};

var currentStatus = new Proxy({
    'saveStatus': false,
    'control': {},
    'map': {
        'dataset': "",
        'themesselected': [true, true, true, true, true],
        'pointSimplifierIns': null,
    },
    'time_period': [20, 200],
}, validator);


var onControllerSave = function() {
    var controlConfigs = {
        'selectedDataset1': $('input[type=list1]').data('selected'),
        'selectedDataset2': $('input[type=list2]').data('selected'),
        'selectedArea': $('input[type=list3]').data('selected'),
        'selectedTags': $('#tags-panel input[type=enum]').data('selected'),
        'timeSlider': [$('#start-time').val(), $('end-time').val()],
        'keywords': currentStatus.keywords,
        'contacts': currentStatus.contacts,
        'details': currentStatus.details
    }
    return true;
}


var onMapSave = function() {

}


var onSolutionSave = function() {
    $(".boundary-selecting").children().removeClass('layui-icon layui-icon-loading layui-icon layui-anim layui-anim-rotate layui-anim-loop').addClass('iconfont icon-polygonline');
}


export {currentStatus};
