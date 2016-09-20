var Poloniex = require('poloniex.js');
var moment = require('moment');
var async = require('async');

module.exports = Connector = function(creds) {
    this.handle = new Poloniex(creds.key, creds.secret);
};

Connector.prototype.lastUSDPrice = function(currency, cb) {
    this.handle.returnTicker(function(err, res) {
	if (!err && res) {
	    var usd;
	    var btc;
	    var usdBtc;
	    async.forEachOf(res, function(_detail, _pair, cb) {
		if (_pair === 'USDT_'+currency.toUpperCase()) {
		    usd = _detail.last;
		}
		else if (_pair === 'USDT_BTC') {
		    usdBtc = _detail.last;
		}
		else if (_pair === 'BTC_'+currency.toUpperCase()) {
		    btc = _detail.last;
		}
		cb();
	    },
	    function(err) {
		var last = usd;
		if (!last && btc && usdBtc) {
		    last = btc * usdBtc;
		}
		cb(last ? null : {message: 'currency not found'}, last);
	    });
	}
	else {
	    cb(err !== false ? err : {message: 'response didn\'t include a last parameter'});
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
	    if (res[currency.toUpperCase()]) {
		for (var x in res[currency.toUpperCase()]) {
		    var offer = res[currency.toUpperCase()][x];
		    offers.push({id: offer.id, createDate: moment(offer.date).format(),
				 currency: currency.toLowerCase(), rate: Number(offer.rate) * 365 * 100,
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
            cb(err, 0);
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

Connector.prototype.updateLoanOffer = function(offer, cb) {
    var handle = this.handle;
    handle.cancelLoanOffer(offer.id, function(err, res) {
	if (err) {
	    var dailyRate = offer.rate / 365 / 100;
	    handle.createLoanOffer(offer.currency.toUpperCase(), offer.amount,
				   offer.duration, 0, dailyRate, function(err, res) {
	        cb(err, res);
	    });
	}
	else {
	    cb(err, res);
	}
    });
};
