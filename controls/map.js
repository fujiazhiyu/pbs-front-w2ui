import * as themelayer from './sub-maps/themelayer.js';


var initMapview = function() {
    themelayer.initThemeLayer();
    initMap();
}


var initMap = function() {
    var map = new AMap.Map('mapid', {
        center: [116.335183, 39.941735],
        zooms: [10, 16],
        zoom: 13,
        resizeEnable: true,
        mapStyle: 'amap://styles/b8aa66c1995b9d1561581cbdf2e04992',
        defaultCursor: 'pointer',
        // dragEnable: false,
    });

    var outer = [
        new AMap.LngLat(-360, 90, true),
        new AMap.LngLat(-360, -90, true),
        new AMap.LngLat(360, -90, true),
        new AMap.LngLat(360, 90, true),
    ];

    var colors = ['#dac00a', '#FDD835', '#ef6c00', '#0add0', '#26a69a', '#064cd6', '#42a5f5', '#7705d5', '#e040fb', '#ff1744'];

    window.map = map;

    map.on('complete', function(e) {

        AMapUI.loadUI(['misc/PointSimplifier'], function(PointSimplifier) {
            if (!PointSimplifier.supportCanvas) {
                alert('当前环境不支持 Canvas！');
                return;
            }
            var pointSimplifierIns = new PointSimplifier({
                map: map, //所属的地图实例
                autoSetFitView: false,
                zIndex: 10,
                getPosition: function(item) {
                    if (item) {
                        return [parseFloat(item.lng), parseFloat(item.lat)];
                    }
                    return null;
                },
                getHoverTitle: function(item, idx) {
                    return item.theme + ': ' + item.keywords.join(';');
                },
                renderConstructor: PointSimplifier.Render.Canvas.GroupStyleRender,
                renderOptions: {
                    //点的样式
                    pointStyle: {
                        width: 6,
                        height: 6
                    },
                    hoverTitleStyle: {
                        position: 'top'
                    },
                    getGroupId: function(item, idx) {
                        return item.theme;
                    },
                    groupStyleOptions: function(groupId) {
                        return {
                            pointStyle: {
                                fillStyle: colors[groupId.split('-')[1]]
                            }
                        }
                    }
                }
            });

            $('<div id="loadingTip">加载数据，请稍候...</div>').appendTo($('#mapid'));
            $.ajaxSetup({
                crossDomain: true,
                // xhrFields: {
                //    withCredentials: true
                // },
                dataType: 'json',
                contentType: 'application/json; charset=utf-8'
            });
            $.get('http://127.0.0.1:5000/api/messages/points?num=5000', function(messages) {
                if (messages && messages.status === '1') {
                    // timeSlider(messages);
                    $('.time-input').on('change', '#end-time', function() {
                        var startTime = $('#start-time').val();
                        var endTime = $('#end-time').val();
                        var newdata = getTimePeriodPoints([startTime, endTime], messages);
                        pointSimplifierIns.setData(newdata);
                    });
                    // pointSimplifierIns.setData(messages.data);
                    pointSimplifierIns.setData(getTimePeriodPoints(['0:20', '3:20'], messages));
                    $('#loadingTip').remove();
                }
            });
        });

        /**
         * 得到在给定时间段内的点
         * @param {Array} vals 二维数组, [开始时间, 结束时间]
         * @param {Object} messages 服务器返回的所有messages
         * @return {Array} 在时间段内的点
         */
        var getTimePeriodPoints = function(vals, messages) {
            var newdata = [];
            // 筛选messages中的点是否在时间段内 (只过滤hour, minute, 不过滤day, month...)
            var [startHour, startMinute] = vals[0].split(':');
            var [endHour, endMinute] = vals[1].split(':');
            var startTime = startHour * 60 + parseInt(startMinute), endTime = endHour * 60 + parseInt(endMinute);
            for (var i = 0, len = messages.data.length; i < len; i++) {
                var date = new Date(messages.data[i].recitime);
                var curHours = date.getHours(), curMinutes = date.getMinutes();
                var curTime = curHours * 60 + curMinutes;
                if (curTime >= startTime && curTime < endTime)
                    newdata.push(messages.data[i]);
            }
            return newdata;
        }

        /* tracks记录清空前的所有路径, locs (locations)记录最新一笔画出的路径 */
        var customLayer, searchHook, canvas, tracks = [], locs = [];
        /* 高德地图自定义图层插件 */
        AMap.plugin(['AMap.DistrictSearch', 'AMap.CustomLayer'], function() {
            canvas = document.createElement('canvas');
            customLayer = new AMap.CustomLayer(canvas, {
                map: map,
                zooms: [10, 16],
                alwaysRender: true, //缩放过程中是否重绘，复杂绘制建议设为false
                zIndex: 300,
            });
            searchHook = new AMap.DistrictSearch({
                extensions: 'all',
                subdistrict: 0,
            });

            addLayer();
        });

        function addLayer() {
            // 给CustomLayer插件的对象设置render属性,不能直接在options中设置,只能这么设置
            customLayer.render = onRender;

            map.on('mouseout', function() {
                $(canvas).trigger('mousedown');
                $(canvas).removeClass("cursor-move");
            })
            /**
            * CustomLayer.render属性使用
            * 每次缩放, 平移, 容器大小改变 都会调用render方法
            */
            function onRender() {
                // 每次render首先移除这三个事件,防止重复绑定.
                removeListener(canvas, ['mouseup', 'mousedown', 'mousemove']);
                var ctx = getCanvasContext(map, canvas);
                // 绘制上一次画出的path.
                redrawInCurrentSize(ctx, tracks);

                var canvasx = $(canvas).offset().left - $(window).scrollLeft(),
                    canvasy = $(canvas).offset().top - $(window).scrollTop(),
                    last_mousex = 0, last_mousey = 0,
                    mousex = 0, mousey = 0,
                    mousedown = false;

                $(canvas).one('mousedown', function() {
                    canvasx = $(canvas).offset().left - $(window).scrollLeft();
                    canvasy = $(canvas).offset().top - $(window).scrollTop();
                });

                // Mousedown, 获取鼠标位置, 设置mousedown标志为true, 鼠标位置存储到locs
                $(canvas).on('mousedown', function(e) {
                    if(e.which === 1) {
                        e.stopPropagation();
                        $(this).addClass('cursor-crosshair');
                        last_mousex = mousex = parseInt(e.clientX - canvasx);
                        last_mousey = mousey = parseInt(e.clientY - canvasy);
                        mousedown = true;
                        storeWithLoc(locs, mousex, mousey);
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
                    if(e.which === 1) {
                        e.stopPropagation();
                        $(this).removeClass('cursor-crosshair');
                        mousedown = false;
                        if (locs.length !== 0) {    // 是否中途取消了绘制
                            // 绘制鼠标抬起点和一开始鼠标按下的点之间的path, 来闭合路径
                            locs = closeCanvas(ctx, locs);
                            // 检测本次绘制的path和之前的tracks是否有相交, 如有相交则merge之后返回
                            locs = mergeIntersections(locs, tracks);
                            // 本次绘制的路径存入tracks
                            tracks.push(locs);
                            // 本次绘制路径点置空, 以便下次添加新点
                            locs = [];
                            customAreaMask(tracks);
                            // 重新绘制所有路径, (因为刚才merge了, 并且多层嵌套环被移除了)
                            redrawInCurrentSize(ctx, tracks);
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
                        presetPath(ctx, last_mousex, last_mousey, 'black', 2);
                        ctx.lineTo(mousex, mousey);
                        ctx.stroke();
                        // 如果鼠标移动太快,则前后两点之间距离很远,需要在两点之间补充一些点
                        locs = locs.concat(supplementPoints(mousex, mousey, last_mousex, last_mousey));
                        // 再把当前鼠标位置存入locs
                        storeWithLoc(locs, mousex, mousey);
                    } // 更新上次鼠标位置
                    last_mousex = mousex;
                    last_mousey = mousey;
                });
            };
        }

        /**
        * 移除在缩放或者resize过程中执行的重复绑定. 否则乱画
        * @param {DOM Object} Dom 准备移除事件的DOM对象
        * @param {String} eventsname 准备移除的事件名称
        */
        var removeListener = function(Dom, eventsname) {
            eventsname.map(function(val) {
                $(Dom).off(val);
            });
        };

        /**
        *  如果本次鼠标位置和上次鼠标位置相差太远, 则在中间补充几个点
        *  @param {Number} cx current mousex,
        *  @param {Number} cy current mousey,
        *  @param {Number} lx last mousex,
        *  @param {Number} ly last mousey,
        *  @return {Array} an array of supplementary points [AMap.LngLat, ...],
        */
        var supplementPoints = function(cx, cy, lx, ly) {
            var currentMouse = map.containerToLngLat(new AMap.Pixel(cx, cy));
            var lastMouse = map.containerToLngLat(new AMap.Pixel(lx, ly));
            var supplements = getPointsInline(currentMouse, lastMouse, 150);
            return supplements;
        }


        /**
        * 合并相交的polygons, 返回合并后的polygon
        * @param {Array} locs 当前绘制的路径 点数组,
        * @param {Array} tracks 之前绘制的路径数组,
        * @return {Array} 把相交路径merge之后的路径点, 作为当前路径点返回
        */
        var mergeIntersections = function(locs, tracks) {
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

        /**
        * 由于缩放平移等操作会清空CustomLayer的画布, 把缓存的坐标点转换成像素点 还原到CustomLayer
        * @param {context Object} ctx canvas context 对象
        * @param {Array} tracks 之前绘制的所有路径
        * @return {Number} 当前总共绘制了的路径条数
        */
        var redrawInCurrentSize = function(ctx, tracks) {
            // 清空画布
            ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
            if (tracks.length) {
                tracks.forEach(function(tlocs) {
                    // 画tracks中的每条路径, 找到起点
                    var beginP = map.lngLatToContainer(tlocs[0]);
                    presetPath(ctx, beginP.getX(), beginP.getY(), 'black', 2);
                    for (var i = 1, len = tlocs.length; i < len; i++) {
                        var point = map.lngLatToContainer(tlocs[i]);
                        ctx.lineTo(point.getX(), point.getY());
                    }
                    ctx.closePath();
                    ctx.stroke();
                });
            }
            return tracks.length;
        }

        /**
        * 把像素点转换成坐标点 存起来
        * @param {Array} locs 当前绘制的路径点的数组
        * @param {Number} x 当前鼠标的x坐标
        * @param {Number} y 当前鼠标的y坐标
        * @return {Array} 更新的locs
        */
        var storeWithLoc = function(locs, x, y) {
            locs.push(map.containerToLngLat(new AMap.Pixel(x, y)));
            return locs;
        }

        /**
        * 获取canvas对象设置
        */
        var getCanvasContext = function(map, canvas) {
            var retina = AMap.Browser.retina;
            var size = map.getSize(); //resize
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
        }

        /**
        * mouseup之后,将当前路径绘制闭合,在首尾之间补充一些点,防止凹壳凹陷
        * @param {context Object} ctx canvas context
        * @param {Array} locs
        * @return {Array} 更新后的locs路径点数组
        */
        var closeCanvas = function(ctx, locs) {
            if (locs.length > 1) {
                /* @see getPointsInline 补充的一些点 */
                // var points = getPointsInline(locs[0], locs[locs.length - 1]);
                var points = getPointsInline(locs[locs.length - 1], locs[0], 150);
                // 向locs倒数第二位置插入points数组中的点
                Array.prototype.splice.apply(locs, [-2, 0].concat(points));
                var startPixel = map.lngLatToContainer(locs[0]);
                ctx.moveTo(startPixel.getX(), startPixel.getY());
                points.forEach(function(ele) {
                    var elePixel = map.lngLatToContainer(ele);
                    ctx.lineTo(elePixel.getX(), elePixel.getY());
                });
                ctx.stroke();
            }
            return locs;
        }

        /**
        * 预设canvas样式,为绘制做准备
        * @param {context Object} ctx
        * @param {Number} x 开始绘制的x坐标
        * @param {Number} y 开始绘制的y坐标
        * @param {String} strokeStyle 绘制的线样式
        * @param {Number} weight 绘制的线宽
        */
        var presetPath = function(ctx, x, y, strokeStyle, weight) {
            ctx.beginPath();
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = strokeStyle;
            ctx.lineJoin = ctx.lineCap = 'round';
            ctx.lineWidth = weight;
            ctx.moveTo(x, y);
        }

        /**
        * 给出两端坐标, 均匀获取这条直线上的点的坐标
        * @param {AMap.LngLat} start 直线起始点坐标
        * @param {AMap.LngLat} end 直线终点坐标
        * @return {Array} 直线上分布均匀的点坐标数组(不包含首尾点) [AMap.LngLat]
        */
        var getPointsInline = function(start, end, baseDis=150) {
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

        /*------------------------------------- Mask ------------------------------------------------*/

        /**
        * 根据绘制路径创建蒙版, 只高亮显示被圈起来的点
        * @param {Array} tracks 二维数组, 在地图上绘制的所有路径
        */
        var customAreaMask = function(tracks) {
            clearTracks(tracks);
            if(tracks.length > 0) {
                var maskOverlay, pathArray = [outer]; // 外边界,(大地的尽头)
                // 需要把tracks降维push进pathArray
                pathArray.push.apply(pathArray, tracks);
                map.getAllOverlays().forEach(function(overlay) {
                    if(overlay.getExtData() === 'maskLayer')
                    maskOverlay = overlay;
                });
                if (maskOverlay) {
                    maskOverlay.setPath(pathArray);
                } else {
                    var polygon = new AMap.Polygon({
                        path: pathArray,
                        strokeColor: '#00eeff',
                        strokeWeight: 1,
                        fillColor: '#ccc',
                        fillOpacity: 0.5,
                        extData: 'maskLayer',
                        zIndex: 200,
                    });
                    polygon.setPath(pathArray);
                    map.add(polygon);
                }
            }
        }

        /**
        * 移除被多层嵌套的环
        * @param {Array} tracks 所有路径
        */
        var clearTracks = function(tracks) {
            var indexes = [];
            tracks.forEach(function(tlocs, idx) {
                var rings = 0;
                for (var i=0,len=tracks.length; i<len; i++) {
                    // 当前环路和其他路径相比较,如果被嵌套,则rings +1
                    if(idx !== i && AMap.GeometryUtil.isRingInRing(tlocs, tracks[i]))
                    rings ++;
                }
                if(rings > 1) //如果被两层以上的环嵌套,则准备被移除
                indexes.unshift(idx);
            });
            indexes.forEach(function(ele) {
                tracks.splice(ele, 1);
            })
        }

        /**
        * 前提: tracks经过去多层嵌套处理, 这个point至多被两个环包围
        * 判断此点是否在高亮区域内, 高亮区域是: 1.仅被一个环围住的区域; 2.在两个嵌套环之间的区域
        * @param {AMap.LngLat} point 需要判断的点
        * @param {Array} tracks 所有路径
        * @return 点是否应在高亮区域
        */
        var isPointInHightlight = function(point, tracks) {
            var status = false;
            tracks.forEach(function(tlocs) {
                status = AMap.isPointInRing(point, tlocs) ? !status : status;
            });
            return status;
        }

        // addLayer();
    });

}


export {initMapview}
