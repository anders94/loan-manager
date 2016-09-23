var moment = require('moment');

module.exports.outOfRange = function(offer, data, settings, exchangeName, cb) {
    if (data.targetRate > settings.minimumRate && offer.rate > data.targetRate * (1 + (settings.rateUpdateStrategy.driftPercent / 100))) {
	offer.action = 'cancel';
    }
    cb(null, offer);
};

module.exports.lowerRateWithTime = function(offer, data, settings, exchangeName, cb) {
    var age = moment().diff(moment(offer.createDate), 'minutes', true);

    // If the loan is older than 'lowerAfterMinutes' old, make a new loan with a rate 'lowerByPercent'
    if (age > settings.rateUpdateStrategy.lowerAfterMinutes) {
	offer.rate = offer.rate - (offer.rate * settings.rateUpdateStrategy.lowerByPercent / 100);
	offer.action = 'update';
    }

    // cancel if we are below our minimum rate
    if (offer.rate < settings.minimumRate) {
	offer.action = 'cancel';
    }

    cb(null, offer);
};
