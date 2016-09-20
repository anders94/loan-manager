var moment = require('moment');

module.exports.outOfRange = function(offer, data, settings, exchangeName, cb) {
    if (data.targetRate > settings.minimumRate && offer.rate > data.targetRate * (1 + (settings.rateUpdateStrategy.driftPercent / 100))) {
	offer.action = 'cancel';
    }
    cb(null, offer);
};

module.exports.lowerRateWithTime = function(offer, data, settings, exchangeName, cb) {
    // Lower the rate below the target as the length of time the loan goes unfilled rises
    var age = moment().diff(moment(offer.createDate), 'days', true);
    var newRate = data.targetRate - (age * settings.rateUpdateStrategy.percentPerDay);

    if (newRate < offer.rate && newRate < data.targetRate - 0.01) {
	if (newRate > settings.minimumRate) {
	    // adjust rate down
	    //console.log('moving rate from', offer.rate, 'to', newRate);
	    offer.rate = newRate;
	    offer.action = 'update';
	}
	else {
	    // below minimum - cancel
	    offer.action = 'cancel';
	}
    }

    cb(null, offer);
};
