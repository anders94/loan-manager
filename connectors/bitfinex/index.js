var Bitfinex = require('bitfinex');
var moment = require('moment');
var async = require('async');

module.exports = Connector = function(creds) {
    this.handle = new Bitfinex(creds.key, creds.secret);
};

Connector.prototype.lastUSDPrice = function(currency, cb) {
    this.handle.ticker(currency.toLowerCase()+'usd', function(err, res) {
	if (!err && res && res.last_price) {
	    cb(null, res.last_price);
	}
	else {
	    cb(err ? err : {message: 'response didn\'t include a last_price'});
	}
    });
};

Connector.prototype.activeLoans = function(currency, cb) {
    this.handle.active_credits(function(err, res) {
	if (!err && res) {
	    var loans = [];
	    for (var x in res) {
		var loan = res[x];
		if (currency === loan.currency.toLowerCase()) {
		    loans.push({id: loan.id, createDate: moment(Number(loan.timestamp) * 1000).format(),
				currency: loan.currency.toLowerCase(), rate: Number(loan.rate),
				duration: loan.period, amount: Number(loan.amount)});
		}
	    }
	    cb(null, loans);
	}
	else {
	    cb(err ? err : {message: 'response didn\'t look as expected'});
	}
    });
};

Connector.prototype.openLoanOffers = function(currency, cb) {
    this.handle.active_offers(function(err, res) {
	if (!err && res) {
	    var offers = [];
	    for (var x in res) {
		var offer = res[x];
		if (currency === offer.currency.toLowerCase()) {
		    offers.push({id: offer.id, createDate: moment(Number(offer.timestamp) * 1000).format(),
				 currency: offer.currency.toLowerCase(), rate: Number(offer.rate),
				 duration: offer.period, amount: Number(offer.remaining_amount)});
		}
	    }
	    cb(null, offers);
	}
	else {
	    cb(err ? err : {message: 'response didn\'t look as expected'});
	}
    });
};

Connector.prototype.lendbook = function(currency, cb) {
    this.handle.lendbook(currency.toLowerCase(), function(err, res) {
	if (!err && res && res.bids && res.asks) {
	    var lendbook = {offers: [], demands: []};
	    for (var x in res.bids) {
		var item = res.bids[x];
		lendbook.demands.push({createDate: moment(Number(item.timestamp) * 1000).format(),
                                       currency: currency.toLowerCase(), rate: Number(item.rate),
                                       duration: item.period, amount: Number(item.amount)});
	    }
	    for (var x in res.asks) {
		var item = res.asks[x];
		lendbook.offers.push({createDate: moment(Number(item.timestamp) * 1000).format(),
                                      currency: currency.toLowerCase(), rate: Number(item.rate),
                                      duration: item.period, amount: Number(item.amount)});
	    }
	    cb(null, lendbook);
	}
	else {
	    cb(err ? err : {message: 'response didn\'t look as expected'});
	}
    });
};

Connector.prototype.availableBalance = function(currency, cb) {
    this.handle.wallet_balances(function(err, res) {
	if (!err && res) {
	    var available;
	    for (var x in res) {
		var balance = res[x];
		if (balance.type === 'deposit' && balance.currency === currency) {
		    available = Number(balance.available);
		}
	    }
	    cb(null, available);
	}
	else {
	    cb(err ? err : {message: 'response didn\'t look as expected'});
	}
    });
};

Connector.prototype.createLoanOffer = function(currency, amount, rate, duration, cb) {
    this.handle.new_offer(currency.toUpperCase(), amount.toFixed(8), rate.toFixed(6), duration, 'lend', null, function(err, res) {
        cb(err, res);
    });
};

Connector.prototype.cancelLoanOffer = function(id, cb) {
    this.handle.cancel_offer(id, function(err, res) {
        cb(err, res);
    });
};
