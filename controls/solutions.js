import * as thumbnail from './sub-solutions/solutions-thumbnail.js';


var CURRENT_SELECTED = true;    // 当前正在操作的solution,new一个就为true, save之后就false


var initSolutionsPanel = function() {
    console.log('initSolutionsPanel executes');
    thumbnail.initSolutionsThumbnail(function() {
        if (compareAble()) {
            compareSolutions();
        }
    });
}


var saveSolution = function() {
    CURRENT_SELECTED = false;
    // var promise = new Promise(function(solve) {
    //
    // });
    //
    // promise.then(function() {
    //
    // })
    /* return当前solution的信息 */
}


var selectSolutions = function() {
    $('#solutions-thumbnail').on('click', '.solution-thumb', function(event) {
        if (! $(event.target).hasClass('boundary-selecting')) {
            if(CURRENT_SELECTED) {
                alert('operating! do u want to save first?');
            } else {
                /* 向服务器请求对应的solution */
            }
        }
    });
}


var compareAble = function() {
    if($('.solution-thumb').length > 1) {
        $('#compare-button').removeClass('layui-btn-disabled');
        return true;
    }
    return false;
}


var compareSolutions = function() {
    $('#compare-button').on('click', function(event) {
        /* 从服务器提取之前的solutions,作比对,服务器直接返回对比数据 */
    });

};


export {initSolutionsPanel};
