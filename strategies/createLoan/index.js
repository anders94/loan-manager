module.exports.staticRate = function (data, settings, exchangeName, cb) {
    cb(null, settings.rateCreationStrategy.rate);
};

module.exports.topOfTheBook = function (data, settings, exchangeName, cb) {
    if (data && data.lendbook && data.lendbook.offers && data.lendbook.offers.length > 0) {
	cb(null, data.lendbook.offers[0].rate);
    }
    else {
        cb({message: 'no offers in lendbook'});
    }
};

module.exports.percentDepth = function(data, settings, exchangeName, cb) {
    if (data && data.lendbook && data.lendbook.offers && data.lendbook.offers.length > 0) {
        var offerTotal = 0;
        for (var x in data.lendbook.offers) {
            offerTotal += data.lendbook.offers[x].amount;
        }
        var target = offerTotal * (settings.rateCreationStrategy.lendbookPositioningPercentage / 100);
        var runningTotal = 0;
        var targetRate = data.lendbook.offers[0].rate;
        for (var x in data.lendbook.offers) {
            var offer = data.lendbook.offers[x];
            runningTotal += offer.amount;
            if (runningTotal <= target) {
		targetRate = offer.rate;
            }
        }
	cb(null, targetRate);
    }
    else {
        cb({message: 'no offers in lendbook'});
    }
};
