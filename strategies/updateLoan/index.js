var moment = require('moment');

module.exports.outOfRange = function(offer, data, settings, exchangeName, cb) {
    if (data.targetRate > settings.minimumRate && offer.rate > data.targetRate * (1 + (settings.rateUpdateStrategy.driftPercent / 100))) {
	offer.action = 'cancel';
    }
    cb(null, offer);
};

module.exports.lowerRateWithTime = function(offer, data, settings, exchangeName, cb) {
    var age = moment().diff(moment(offer.createDate), 'minutes', true);

    // If the loan is older than 'lowerAfterMinutes' old and is still higher than the 'targetRate',
    // make a new loan with the rate lowered by 'lowerByPercent'
    if (age > settings.rateUpdateStrategy.lowerAfterMinutes) {
        offer.rate = offer.rate - (offer.rate * settings.rateUpdateStrategy.lowerByPercent / 100);
        if (settings.minimumRate < offer.rate) {
            offer.action = 'update';
        }
    }

    cb(null, offer);
};
