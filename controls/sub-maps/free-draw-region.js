import customAreaMask from './mask.js';
import FreeDrawUtils from './free-draw-utils.js';


var initFreeDrawLayer = function(mapContext) {
    /* tracks记录清空前的所有路径, locs (locations)记录最新一笔画出的路径 */
    var customLayer, searchHook, canvas, map = mapContext, tracks = [], locs = [],
    freeDrawUtils = new FreeDrawUtils();
    window.map = map;
    /* 高德地图自定义图层插件 */
    AMap.plugin(['AMap.DistrictSearch', 'AMap.CustomLayer'], function() {
        canvas = document.createElement('canvas');
        customLayer = new AMap.CustomLayer(canvas, {
            // map: map,
            zooms: [10, 16],
            alwaysRender: true, //缩放过程中是否重绘，复杂绘制建议设为false
            zIndex: 300,
        });
        freeDrawUtils.init(map);
        addLayer();
    });

    function addLayer() {
        // 给CustomLayer插件的对象设置render属性,不能直接在options中设置,只能这么设置
        customLayer.render = onRender;

        map.on('mouseout', function() {
            $(canvas).trigger('mousedown');
            $(canvas).removeClass("cursor-move");
        });

        /**
        * CustomLayer.render属性使用
        * 每次缩放, 平移, 容器大小改变 都会调用render方法
        */
        function onRender() {
            // 每次render首先移除这三个事件,防止重复绑定.
            freeDrawUtils.removeListeners(canvas, ['mouseup', 'mousedown', 'mousemove']);
            var ctx = freeDrawUtils.getCanvasContext(map, canvas);
            // 绘制上一次画出的path.
            freeDrawUtils.redrawInCurrentSize(ctx, tracks);

            var canvasx = $(canvas).offset().left - $(window).scrollLeft(),
            canvasy = $(canvas).offset().top - $(window).scrollTop(),
            last_mousex = 0,
            last_mousey = 0,
            mousex = 0,
            mousey = 0,
            mousedown = false;

            // 上面总是得不到正确的位置, 可能是canvas当时还没有加载好, 所以这里绑定一个一次性事件再获取一次canvas位置
            $(canvas).one('mousedown', function() {
                canvasx = $(canvas).offset().left - $(window).scrollLeft();
                canvasy = $(canvas).offset().top - $(window).scrollTop();
            });

            // Mousedown, 获取鼠标位置, 设置mousedown标志为true, 鼠标位置存储到locs
            $(canvas).on('mousedown', function(e) {
                if (e.which === 1) {
                    e.stopPropagation();
                    $(this).addClass('cursor-crosshair');
                    last_mousex = mousex = parseInt(e.clientX - canvasx);
                    last_mousey = mousey = parseInt(e.clientY - canvasy);
                    mousedown = true;
                    freeDrawUtils.storeWithLoc(locs, mousex, mousey);
                } else {
                    $(this).removeClass("cursor-crosshair").addClass("cursor-move");
                    /* 中途取消绘制 */
                    mousedown = false;
                    locs = [];
                    customLayer.render();
                }
            });

            //Mouseup, 设置mousedown标志为false,
            $(canvas).on('mouseup', function(e) {
                if (e.which === 1) {
                    e.stopPropagation();
                    $(this).removeClass('cursor-crosshair');
                    mousedown = false;
                    if (locs.length > 1) { // 是否中途取消了绘制 + 防止误点击
                        // 绘制鼠标抬起点和一开始鼠标按下的点之间的path, 来闭合路径
                        locs = freeDrawUtils.closeCanvas(ctx, locs);
                        // 检测本次绘制的path和之前的tracks是否有相交, 如有相交则merge之后返回
                        locs = freeDrawUtils.mergeIntersections(locs, tracks);
                        // 本次绘制的路径存入tracks
                        tracks.push(locs);
                        // 本次绘制路径点置空, 以便下次添加新点
                        locs = [];
                        customAreaMask(map, tracks);
                        // 重新绘制所有路径, (因为刚才merge了, 并且多层嵌套环被移除了)
                        freeDrawUtils.redrawInCurrentSize(ctx, tracks);
                    } else {    //  防止误点击
                        locs = []
                    }
                } else {
                    $(this).removeClass("cursor-move");
                }
            });

            //Mousemove 鼠标在按下并且移动绘制过程中绘制路径
            $(canvas).on('mousemove', function(e) {
                // 获取当前鼠标位置
                mousex = parseInt(e.clientX - canvasx);
                mousey = parseInt(e.clientY - canvasy);
                if (mousedown) {
                    // 初始化canvas设置
                    freeDrawUtils.presetPath(ctx, last_mousex, last_mousey, '#aaa', 2);
                    ctx.lineTo(mousex, mousey);
                    ctx.stroke();
                    // 如果鼠标移动太快,则前后两点之间距离很远,需要在两点之间补充一些点
                    locs = locs.concat(freeDrawUtils.supplementPoints(mousex, mousey, last_mousex, last_mousey));
                    // 再把当前鼠标位置存入locs
                    freeDrawUtils.storeWithLoc(locs, mousex, mousey);
                } // 更新上次鼠标位置
                last_mousex = mousex;
                last_mousey = mousey;
            });
        }
    }
    return customLayer;
}


export default initFreeDrawLayer;
