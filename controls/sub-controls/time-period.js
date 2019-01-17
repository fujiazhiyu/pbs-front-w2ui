var selectTimePeriod = function() {
    console.log("time_period executes");
    var time_period = $("#time-period").load("./views/subviews/time-period.html", function() {
        layui.use('slider', function() {
            var slider = layui.slider;

            //定义初始值
            var timeSlider = slider.render({
                elem: '#time-slider',
                value: [20,200], //初始值
                min: 0, //最小值
                max: (24*60), //最大值
                step: 10, //步长
                range: true, //范围选择
                theme: '#ccc',
                tips: false,
                change: function(value){
                    $('#start-time').val(formatTimeTips(value[0]));
                    $('#end-time').val(formatTimeTips(value[1]));
                    $('#end-time').trigger('change');
                },
                disabled: false
            });
            initTimeInputs(timeSlider);
        });
    });
}


var formatTimeTips = function(value) {
    return Math.floor(value/60) + ':' + (value%60==0 ? "00" : value%60);
}


var initTimeInputs = function(timeSlider) {
    $('#start-time').val(formatTimeTips(timeSlider.config.value[0]));
    $('#end-time').val(formatTimeTips(timeSlider.config.value[1]));
}


export default selectTimePeriod;
