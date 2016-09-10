var Poloniex = require('poloniex.js');
var moment = require('moment');
var async = require('async');

module.exports = Connector = function(creds) {
    this.handle = new Poloniex(creds.key, creds.secret);
};

Connector.prototype.lastUSDPrice = function(currency, cb) {
    var last;
    this.handle.returnTicker(function(err, res) {
	if (!err && res) {
	    async.forEachOf(res, function(_detail, _pair, cb) {
		if (_pair === 'USDT_'+currency.toUpperCase()) {
		    last = _detail.last;
		}
		cb();
	    },
	    function(err) {
		cb(null, last);
	    });
	}
	else {
	    cb(err !== false ? err : {message: 'response didn\'t include a last_price'});
	}
    });

};

Connector.prototype.activeLoans = function(currency, cb) {
    this.handle.returnActiveLoans(function(err, res) {
	if (!err && res && res.provided) {
            var loans = [];
            for (var x in res.provided) {
		var loan = res.provided[x];
		if (currency === loan.currency.toLowerCase()) {
		    loans.push({id: loan.id, createDate: moment(loan.date).format(),
				currency: loan.currency.toLowerCase(), rate: Number(loan.rate) * 365 * 100,
				duration: loan.duration, amount: Number(loan.amount)});
		}
            }
            cb(null, loans);
	}
	else {
            cb(err ? err : {message: 'response didn\'t include provided loans'});
	}
    });

};

Connector.prototype.openLoanOffers = function(currency, cb) {
    this.handle.returnOpenLoanOffers(function(err, res) {
	if (!err && res) {
            var offers = [];
            for (var x in res) {
		var offer = res[x];
		if (currency === offer.currency.toLowerCase()) {
		    offers.push({id: offer.id, createDate: moment(offer.date).format(),
				 currency: offer.currency.toLowerCase(), rate: Number(offer.rate) * 365 * 100,
				 duration: offer.duration, amount: Number(offer.amount)});
		}
            }
            cb(null, offers);
	}
	else {
            cb(err ? err : {message: 'response didn\'t include expected loan offers'});
	}
    });

};

Connector.prototype.lendbook = function(currency, cb) {
    this.handle.returnLoanOrders(currency.toUpperCase(), function(err, res) {
	if (!err && res && res.offers && res.demands) {
            var lendbook = {offers: [], demands: []};
            for (var x in res.offers) {
		var item = res.offers[x];
		lendbook.offers.push({createDate: moment(item.date).format(),
				      currency: currency.toLowerCase(),
				      rate: Number(item.rate) * 365 * 100,
				      duration: item.duration,
				      amount: Number(item.amount)});
	    }
            for (var x in res.demands) {
		var item = res.demands[x];
		lendbook.demands.push({createDate: moment(item.date).format(),
				       currency: currency.toLowerCase(),
				       rate: Number(item.rate) * 365 * 100,
				       duration: item.duration,
				       amount: Number(item.amount)});
            }
            cb(null, lendbook);
	}
	else {
            cb(err ? err : {message: 'response didn\'t have what was expected'});
	}
    });
};

Connector.prototype.availableBalance = function(currency, cb) {
    this.handle.returnAvailableAccountBalances('lending', function(err, res) {
	if (!err && res && res.lending && res.lending[currency.toUpperCase()]) {
            cb(null, res.lending[currency.toUpperCase()]);
	}
	else {
            cb(err ? err : {message: 'response didn\'t include expected loan offers'});
	}
    });
};

Connector.prototype.createLoanOffer = function(currency, amount, rate, duration, cb) {
    var dailyRate = rate / 365 / 100;
    this.handle.createLoanOffer(currency.toUpperCase(), amount, duration, 0, dailyRate, function(err, res) {
	cb(err, res);
    });
};

Connector.prototype.cancelLoanOffer = function(id, cb) {
    this.handle.cancelLoanOffer(id, function(err, res) {
	cb(err, res);
    });
};
