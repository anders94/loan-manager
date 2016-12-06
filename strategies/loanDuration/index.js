var config = require('../../config');

module.exports.rateBased = function(data, settings, exchangeName) {
    var duration = 2;
    var rate = data.targetRate;

    if (config && config.exchanges && config.exchanges[exchangeName] &&
	config.exchanges[exchangeName].duration) {
	var minimumDuration = Number(config.exchanges[exchangeName].duration.minimum);
	var maximumDuration = Number(config.exchanges[exchangeName].duration.maximum);
	var lowThreshold = Number(config.exchanges[exchangeName].duration.lowThreshold);
	var highThreshold = Number(config.exchanges[exchangeName].duration.highThreshold);

	if (rate <= lowThreshold) {
	    duration = minimumDuration;
	}
	else if (rate > lowThreshold && rate < highThreshold) {
	    duration = Math.floor((rate - lowThreshold) / (highThreshold - lowThreshold) * (maximumDuration - minimumDuration) + minimumDuration);
	}
	else {
	    duration = maximumDuration;
	}
    }
    else {
	console.log('WARNING: config.exchanges['+exchangeName+'].duration doesn\'t exist');
    }

    return duration;
};
