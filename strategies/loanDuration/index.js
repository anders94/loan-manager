module.exports.rateBased = function(data, settings, exchangeName) {
    var duration = 2;
    if (data.rate > 25) {
        duration = 10;
    }
    if (data.rate > 30) {
	duration = 30;
    }
    if (data.rate > 35 && exchangeName === 'poloniex') {
        duration = 60;
    }

    return duration;
};
