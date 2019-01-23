var FreeDrawUtils = function() {}

FreeDrawUtils.prototype = {
    map: null,
    init: function(mapContext) {
        this.map = mapContext;
    },
    /**
     * 移除在缩放或者resize过程中执行的重复绑定. 否则乱画
     * @param {DOM Object} Dom 准备移除事件的DOM对象
     * @param {String} eventsname 准备移除的事件名称
     */
    removeListeners: function(Dom, eventsname) {
        eventsname.map(function(val) {
            $(Dom).off(val);
        });
    },
    /**
     *  如果本次鼠标位置和上次鼠标位置相差太远, 则在中间补充几个点
     *  @param {Number} cx current mousex,
     *  @param {Number} cy current mousey,
     *  @param {Number} lx last mousex,
     *  @param {Number} ly last mousey,
     *  @return {Array} an array of supplementary points [AMap.LngLat, ...],
     */
    supplementPoints: function(cx, cy, lx, ly) {
        var currentMouse = this.map.containerToLngLat(new AMap.Pixel(cx, cy));
        var lastMouse = this.map.containerToLngLat(new AMap.Pixel(lx, ly));
        var supplements = getPointsInline(currentMouse, lastMouse, 150);
        return supplements;
    },
    /**
     * 合并相交的polygons, 返回合并后的polygon
     * @param {Array} locs 当前绘制的路径 点数组,
     * @param {Array} tracks 之前绘制的路径数组,
     * @return {Array} 把相交路径merge之后的路径点, 作为当前路径点返回
     */
    mergeIntersections: function(locs, tracks) {
        /* @see determineIntersections */
        var indexes = determineIntersections(locs, tracks);
        // indexes已经是倒序的了, tracks将会从后面向前遍历, 避免因下标改变的bug
        indexes.forEach(function(ele) {
            for (var i = tracks[ele].length - 1; i >= 0; i--) {
                // 把与当前locs相交的polygons路径点都放进当前locs
                locs.push(tracks[ele][i]);
            }
            // 从原路径中剔除相交的polygons
            tracks.splice(ele, 1);
        });
        /* @requires hull.js, module: https://github.com/AndriiHeonia/hull */
        locs = hull(locs, 0.001, ['.lng', '.lat']);
        // 把得到的凹壳的经纬度对象转换成高德经纬度对象
        locs = locs.map(function(val) {
            return new AMap.LngLat(val.lng, val.lat);
        });
        return locs;
    },
    /**
     * 由于缩放平移等操作会清空CustomLayer的画布, 把缓存的坐标点转换成像素点 还原到CustomLayer
     * @param {context Object} ctx canvas context 对象
     * @param {Array} tracks 之前绘制的所有路径
     * @return {Number} 当前总共绘制了的路径条数
     */
    redrawInCurrentSize: function(ctx, tracks) {
        var that = this;
        // 清空画布
        ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
        if (tracks.length) {
            tracks.forEach(function(tlocs) {
                // 画tracks中的每条路径, 找到起点
                var beginP = that.map.lngLatToContainer(tlocs[0]);
                that.presetPath(ctx, beginP.getX(), beginP.getY(), '#aaa', 2);
                for (var i = 1, len = tlocs.length; i < len; i++) {
                    var point = that.map.lngLatToContainer(tlocs[i]);
                    ctx.lineTo(point.getX(), point.getY());
                }
                ctx.closePath();
                ctx.stroke();
            });
        }
        return tracks.length;
    },
    /**
     * 把像素点转换成坐标点 存起来
     * @param {Array} locs 当前绘制的路径点的数组
     * @param {Number} x 当前鼠标的x坐标
     * @param {Number} y 当前鼠标的y坐标
     * @return {Array} 更新的locs
     */
    storeWithLoc: function(locs, x, y) {
        locs.push(this.map.containerToLngLat(new AMap.Pixel(x, y)));
        return locs;
    },
    /**
     * 获取canvas对象设置
     */
    getCanvasContext: function(map, canvas) {
        var retina = AMap.Browser.retina;
        var size = this.map.getSize(); //resize
        var width = size.width;
        var height = size.height;
        canvas.style.width = width + 'px'
        canvas.style.height = height + 'px'
        if (retina) { //高清适配
            width *= 2;
            height *= 2;
        }
        canvas.width = width;
        canvas.height = height; //清除画布
        var ctx = canvas.getContext("2d");
        return ctx;
    },
    /**
     * mouseup之后,将当前路径绘制闭合,在首尾之间补充一些点,防止凹壳凹陷
     * @param {context Object} ctx canvas context
     * @param {Array} locs
     * @return {Array} 更新后的locs路径点数组
     */
    closeCanvas: function(ctx, locs) {
        var that = this;
        if (locs.length > 1) {
            /* @see getPointsInline 补充的一些点 */
            // var points = getPointsInline(locs[0], locs[locs.length - 1]);
            var points = getPointsInline(locs[locs.length - 1], locs[0], 150);
            // 向locs倒数第二位置插入points数组中的点
            Array.prototype.splice.apply(locs, [-2, 0].concat(points));
            var startPixel = this.map.lngLatToContainer(locs[0]);
            ctx.moveTo(startPixel.getX(), startPixel.getY());
            points.forEach(function(ele) {
                var elePixel = that.map.lngLatToContainer(ele);
                ctx.lineTo(elePixel.getX(), elePixel.getY());
            });
            ctx.stroke();
        }
        return locs;
    },
    /**
     * 预设canvas样式,为绘制做准备
     * @param {context Object} ctx
     * @param {Number} x 开始绘制的x坐标
     * @param {Number} y 开始绘制的y坐标
     * @param {String} strokeStyle 绘制的线样式
     * @param {Number} weight 绘制的线宽
     */
    presetPath: function(ctx, x, y, strokeStyle, weight) {
        ctx.beginPath();
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = strokeStyle;
        ctx.lineJoin = ctx.lineCap = 'round';
        ctx.lineWidth = weight;
        ctx.moveTo(x, y);
    },
}

/**
* 给出两端坐标, 均匀获取这条直线上的点的坐标
* @param {AMap.LngLat} start 直线起始点坐标
* @param {AMap.LngLat} end 直线终点坐标
* @return {Array} 直线上分布均匀的点坐标数组(不包含首尾点) [AMap.LngLat]
*/
var getPointsInline = function(start, end, baseDis = 150) {
    // 传进来经纬度对象 Amap.LngLat
    var points = [];
    /* 递归 取线段中点 */
    var generatePoints = function(A, B) {
        var distance = AMap.GeometryUtil.distance(A, B);
        var midpoint = getMidPoint(A, B);
        if (distance < baseDis) {
            points.push(midpoint);
        } else {
            generatePoints(A, midpoint);
            points.push(midpoint);
            generatePoints(midpoint, B);
        }
    };
    generatePoints(start, end);
    return points;
}

/**
 * 获取线段中点
 */
var getMidPoint = function(locA, locB) {
    var lng = (locA.lng + locB.lng) / 2;
    var lat = (locA.lat + locB.lat) / 2;
    return new AMap.LngLat(lng, lat);
}

/**
 * 检测locs是否与tracks中包含的polygons相交, 返回相交polygons下标
 * @param {Array} locs 当前绘制的路径点的数组
 * @param {Array} tracks 之前绘制的所有路径数组
 * @return {Array} 与locs相交的路径polygons在tracks中的序号,(倒序插入的)
 */
var determineIntersections = function(locs, tracks) {
    var idxs = [];
    tracks.forEach(function(ele, index) {
        // tracks的每一个元素都是一个polygon, 使用高德数学工具判断与当前locs的相交情况
        if (AMap.GeometryUtil.doesRingRingIntersect(locs, ele)) {
            // 倒序插入相交的polygon在tracks中的下标
            idxs.unshift(index);
        }
    });
    return idxs;
}


export default FreeDrawUtils;
