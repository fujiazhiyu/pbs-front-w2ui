import * as thumbnail from './sub-solutions/solutions-thumbnail.js';
import * as compare from './sub-solutions/solutions-comparison.js';
import * as snapshot from './utils/snapshot.js';


var initSolutionsPanel = function() {
    console.log('initSolutionsPanel executes');
    thumbnail.initSolutionsThumbnail(function() {
        if (compareAble()) {
            compareSolutions();
        }
        $('#boundary-newone').on('click', onNewOneSolution);
    });
    $('#solutions-thumbnail').on('click', '.solution-thumb', onSelectOneSolution);
}


var onNewOneSolution = function(event) {
    if(snapshot.currentStatus.saveStatus) {
        snapshot.currentStatus.saveStatus = false;
        var newone = '<div class="boundary boundary-selecting solution-thumb"><div class="layui-icon layui-icon-loading layui-icon layui-anim layui-anim-rotate layui-anim-loop"></div></div>';
        $('.boundary-selecting').removeClass('boundary-selecting');
        $('#boundary-newone').before(newone);
    } else {
        alert('please finish current solution and save it.')
    }
}


var onSelectOneSolution = function(event) {
    if (!$(event.currentTarget).hasClass('boundary-selecting')) {
        if (!snapshot.currentStatus.saveStatus) {
            alert('operating! do u want to save first?');
        } else {
            $('.boundary-selecting').removeClass('boundary-selecting');
            $(event.currentTarget).addClass('boundary-selecting');

            /* 向服务器请求对应的solution */
            /* 调用utils的方法恢复快照 */
        }
    }
}

/**
 * compare 按钮是否灰色
 */
var compareAble = function() {
    if ($('.solution-thumb').length > 1) {
        $('#compare-button').removeClass('layui-btn-disabled');
        return true;
    }
    return false;
}

/**
 * 绑定compare按钮和Thumbnails按钮click事件, 切换按钮显示状态
 */
var compareSolutions = function() {
    $('#compare-button').on('click', function(event) {
        if (!snapshot.currentStatus.saveStatus) {
            alert("save current solution first!");
            return;
        }
        /* 从服务器提取之前的solutions,作比对,服务器直接返回对比数据 */
        compare.tabButtons(['solutions-comparison', 'solutions-thumbnail']);
        $('#solutions-comparison').load('./views/subviews/solutions-comparison.html', function() {
            compare.loadSolutions();
            console.log('load Solutions');
        });
    });
    $('#return-thumbnail').on('click', function(event) {
        compare.tabButtons(['solutions-comparison', 'solutions-thumbnail']);
        compare.tabButtons(['compare-button', 'return-thumbnail']);
    });
};


export {
    initSolutionsPanel
};
