var option = {
    tooltip: {
        trigger: 'axis',
        position: function(pt) {
            return [pt[0], '100%'];
        },
        formatter: '{b}',
        backgroundColor: 'rgba(255,255,255,0)',
        padding: 0,
        textStyle: {
            color: 'rgba(0,0,0,0.5)',
            fontStyle: 'oblique',
            fontWeight: 'lighter',
            fontFamily: 'monospace',
            fontSize: 9
        }
    },
    title: {
        left: 'center',
        text: '',
        textStyle: {
            fontSize: 11,
            top: 0,
            fontWeight: 'bolder',
            fontFamily: 'monospace'
        }
    },
    grid: {
        x: '1%',
        y: '20%',
        width: '99%',
        height: '78%'
    },
    xAxis: {
        type: 'category',
        show: false,
        boundaryGap: false,
        data: Array.from(new Array(24), (val, index) => index + 'h')
    },
    yAxis: {
        show: false,
        min: 0,
        // max: 3600,
    },
    series: []
};

var serie = {
    type: 'line',
    smooth: true,
    symbol: 'none',
    sampling: 'average',
    itemStyle: {
        normal: {
            color: 'rgb(200, 220, 230)',
        }
    },
    lineStyle: {
        width: 1
    },
    areaStyle: {
        normal: {
            color: 'rgba(200, 220, 230, 0.5)'
        }
    },
    data: []
};


var initThemeLayer = function(url) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            var mycharts = [];
            $('.themes-layer').empty();
            clusterNames.forEach(function(theme, idx) {
                $('.themes-layer').append('<div id="theme-' + idx + '" class="theme-area-chart theme-selected"></div>');
                var mychart = echarts.init(document.getElementById('theme-' + idx));
                option.series = [];
                data.data[idx].map(function(val) {
                    // 深拷贝serie对象, 因为每次都要得到一个新的serie对象, 否则series里的serie都一样
                    var newserie = JSON.parse(JSON.stringify(serie));
                    newserie.itemStyle.normal.color = themeColors[val.subTheme];
                    newserie.areaStyle.normal.color = themeColors[val.subTheme]+'1F';
                    newserie.data = val.hours;
                    option.series.push(newserie);
                });
                option.title.text = theme;
                bindSelectEvents(mychart, idx);
                mychart.setOption(option);
                mycharts.push(mychart);
            });
            echarts.connect(mycharts);
        });
}

/**
 * 鼠标选择theme事件处理
 * @param {Echart Object} chartObject
 * @param {Number} themeIndex 主题序号
 */
var bindSelectEvents = function(chartObject, themeIndex) {
    $('#theme-'+themeIndex).on('click', function(e) {
        var that = $(this);
        if(that.hasClass('theme-selected')) {
            that.removeClass('theme-selected');
            chartObject.setOption({title: {
                textStyle: {
                    fontSize: 10,
                    fontWeight: 'lighter',
                }
            }});
        } else {
            that.addClass('theme-selected');
            chartObject.setOption({title: {
                textStyle: {
                    fontSize: 11,
                    fontWeight: 'bolder',
                }
            }});
        }
    });
}


export default initThemeLayer;
