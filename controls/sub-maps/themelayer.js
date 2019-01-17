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
            fontSize: 10,
            top: 0,
            fontWeight: 'lighter',
            fontFamily: 'monospace'
        }
    },
    grid: {x: '1%', y: '30%', width: '99%', height: '90%'},
    xAxis: {
        type: 'category',
        show: false,
        boundaryGap: false,
        data: Array.from(new Array(24), (val, index) => index + 'h')
    },
    yAxis: {
        show: false,
    },
    series: [{
        type: 'line',
        smooth: true,
        symbol: 'none',
        sampling: 'average',
        itemStyle: {
            normal: {
                color: 'rgb(200, 220, 230)'
            }
        },
        areaStyle: {
            normal: {
                color: 'rgba(200, 220, 230, 0.5)'
            }
        },
        data: []
    }]
};


var createRandomArray = function() {
    var data = Array.from(new Array(24));
    return data.map(() => Math.round((Math.random() - 0.5) * 100) + 100);
};


var initThemeLayer = function() {
    var themes = Array.from(new Array(6), (val, idx) => idx);
    var mycharts = [];
    themes.forEach(function(el) {
        $('.themes-layer').append('<div id="theme-' + el + '" class="theme-area-chart"></div>');
        var mychart = echarts.init(document.getElementById('theme-' + el));
        option.series[0].data = createRandomArray();
        option.title.text = 'theme' + el;
        mychart.setOption(option);
        mycharts.push(mychart);
    });
    echarts.connect(mycharts);
}


export {initThemeLayer}
