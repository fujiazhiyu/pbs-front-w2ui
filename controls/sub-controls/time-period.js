var selectTimePeriod = function() {
    console.log("time_period executes");
    var time_period = $("#time-period").load("./views/subviews/time-period.html", function() {
        layui.use('slider', function() {
            var $ = layui.$,
                slider = layui.slider;

            //定义初始值
            slider.render({
                elem: '#time-slider',
                value: [20,200], //初始值
                min: 0, //最小值
                max: (24*60), //最大值
                step: 10, //步长
                // showstep: true, //开启间隔点
                setTips: function(value) { //自定义提示文本
                    return Math.floor(value/60) + ':' + (value%60==0 ? "00" : value%60);
                },
                range: true, //范围选择
                theme: '#ccc',
                change: function(value){
                    // console.log(value[0]) //得到开始值
                    // console.log(value[1]) //得到结尾值
                    //do something
                },
                disabled: false
            });
        });
    });
}


export default selectTimePeriod;
