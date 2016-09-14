var connectors = require('./connectors');
var strategies = require('./strategies');
var config = require('./config');
var moment = require('moment');
var async = require('async');

var debug = false;
var makeAndCancelOffers = true;

async.forever(function(cb) {
    console.log('-----------------------------------');
    console.log(new Date());
    console.log('-----------------------------------');
    console.log();
    async.forEachOfSeries(config.exchanges, function(exchange, exchangeName, cb) {
	async.forEachOfSeries(exchange.currencies, function(settings, currency, cb) {
	    if (settings.active) {
		var handle;
		if (exchangeName === 'bitfinex') {
		    handle = new connectors.bitfinex(config.exchanges.bitfinex.credentials);
		}
		else if (exchangeName === 'poloniex') {
		    handle = new connectors.poloniex(config.exchanges.poloniex.credentials);
		}
		if (handle) {
		    manage(exchangeName, handle, currency, settings, cb);
		}
		else {
		    cb({message: 'exchange '+exchangeName+' not found'});
		}
	    }
	    else {
		cb();
	    }
	},
	function(err) {
	    cb(err);
	});
    },
    function(err) {
	if (err) {
	    console.log(err);
	}
	console.log('done');
	console.log();
	setTimeout(function() {
	    cb();
	}, config.loopDelayInMinutes * 60 * 1000);
    });
}, function(err) {
    console.log(err);
});

function manage(exchangeName, handle, currency, settings, cb) {
    console.log(exchangeName, currency);

    var data = {};
    async.series([function(cb) {
	// 1. get this exchange's usd rate for this currency
	if (currency.toLowerCase() !== 'usd') {
	  handle.lastUSDPrice(currency, function(err, usdPrice) {
	      data.usdPrice = usdPrice;
	      setTimeout(function() {
		  cb(err);
	      }, config.msDelayBetweenAPICalls);
	  });
	}
	else {
	    data.usdPrice = 1;
	    cb();
	}
    },
    function(cb) {
	// 2. get active loans
	handle.activeLoans(currency, function(err, activeLoans) {
	    data.activeLoans = activeLoans;
	    setTimeout(function() {
		cb(err);
	    }, config.msDelayBetweenAPICalls);
	});
    },
    function(cb) {
	// 3. show active loans (with USD value)
	console.log('  active loans ('+data.activeLoans.length+')');
	data.loanTotal = 0;
	data.rateTotal = 0;
	async.eachSeries(data.activeLoans, function(loan, cb) {
	    console.log('   ', loan.amount.toFixed(8), loan.currency, '($'+(loan.amount * data.usdPrice).toFixed(2)+') at',
			loan.rate.toFixed(2)+'%', loan.createDate, 'for', loan.duration, 'days',
			'(expires '+moment(loan.createDate).add(loan.duration, 'days').fromNow()+')');
	    data.loanTotal += loan.amount;
	    data.rateTotal += loan.rate * loan.amount;
	    cb();
        },
        function(err) {
	    if (data.loanTotal > 0) {
		console.log();
		console.log('    total:', data.loanTotal.toFixed(8), currency, '($'+(data.loanTotal * data.usdPrice).toFixed(2)+')',
			    'at', (data.rateTotal / data.loanTotal).toFixed(2)+'%');
	    }
	    console.log();
	    cb();
	});
    },
    function(cb) {
	// 4. get order book
	handle.lendbook(currency, function(err, lendbook) {
            data.lendbook = lendbook;
            setTimeout(function() {
                cb(err);
            }, config.msDelayBetweenAPICalls);
        });
    },
    function(cb) {
	// 5. find desired rate
	var strategy = strategies.topOfTheBook;
	if (settings.rateStrategy.name === 'percentDepth') {
	    strategy = strategies.percentDepth;
	}
	strategy(data, settings.rateStrategy, exchangeName, function(err, rate, duration) {
	    if (!err) {
		data.targetRate = rate;
		data.duration = duration;
		console.log('  target rate:', rate.toFixed(2)+'%');
		console.log();
		cb();
	    }
	    else {
		cb(err);
	    }
	});
    },
    function(cb) {
	// 6. get open (unfilled) loan offers
	handle.openLoanOffers(currency, function(err, loanOffers) {
            data.loanOffers = loanOffers;
            setTimeout(function() {
                cb(err);
            }, config.msDelayBetweenAPICalls);
        });
    },
    function(cb) {
	// 7. show open (unfilled) loan offers
	if (data.loanOffers.length > 0) {
	    console.log('  open loan offers ('+data.loanOffers.length+')');
	    for (var x in data.loanOffers) {
		var offer = data.loanOffers[x];
		console.log('   ', offer.amount.toFixed(8), offer.currency, '($'+(offer.amount * data.usdPrice).toFixed(2)+') at',
                            offer.rate.toFixed(2)+'%', offer.createDate, 'for', offer.duration, 'days');
	    }
	    console.log();
	    cb();
	}
	else {
	    cb();
	}
    },
    function(cb) {
	// 8. cancel open offers outside of desired rate bounds
	var canceled = false;
	async.eachSeries(data.loanOffers, function(offer, cb) {
	    if (data.targetRate > settings.minimumRate && offer.rate > data.targetRate * (1 + (settings.driftPercent / 100))) {
		console.log('    cancelling', offer.amount.toFixed(8), offer.currency, '($'+(offer.amount * data.usdPrice).toFixed(2)+') at',
                            offer.rate.toFixed(2)+'%', offer.createDate, 'for', offer.duration, 'days');
		canceled = true;
		if (makeAndCancelOffers) {
		    handle.cancelLoanOffer(offer.id, function(err, res) {
			if (debug) {
			    console.log(res);
			}
			setTimeout(function() {
			    cb(err);
			}, config.msDelayBetweenAPICalls);
		    });
		}
		else {
		    cb();
		}
	    }
	    else {
		cb();
	    }
	},
	function(err) {
	    if (canceled) {
		console.log();
	    }
	    cb(err)
	});
    },
    function(cb) {
	// 9. get available balance for this currency
	handle.availableBalance(currency, function(err, availableBalance) {
            data.availableBalance = availableBalance;
	    console.log('  available balance:', data.availableBalance, currency, '($'+(data.availableBalance * data.usdPrice).toFixed(2)+')');
	    console.log();
            setTimeout(function() {
                cb(err);
            }, config.msDelayBetweenAPICalls);
        });
    },
    function(cb) {
	// 10. optionally create offer
	if (data.availableBalance * data.usdPrice > settings.minimumSizeUSD && data.targetRate > settings.minimumRate) {
	    var amount = data.availableBalance;
	    if (amount * data.usdPrice > settings.maximumSizeUSD) {
		amount = Number((settings.maximumSizeUSD / data.usdPrice).toFixed(4));
	    }
	    console.log('  creating offer for', amount, currency, '($'+(amount * data.usdPrice).toFixed(2)+') at',
			data.targetRate.toFixed(2)+'% for', data.duration, 'days');
	    if (makeAndCancelOffers) {
		handle.createLoanOffer(currency, amount, Number(data.targetRate.toFixed(2)), data.duration, function(err, res) {
		    if (debug) {
			console.log(res);
		    }
		    setTimeout(function() {
			cb(err);
		    }, config.msDelayBetweenAPICalls);
		});
	    }
	    else {
		cb();
	    }
	}
	else {
	    console.log('  not creating a new offer');
	    cb();
	}
    }],
    function(err) {
	console.log();
	cb(err);
    });
}

moment.relativeTimeRounding(function (value) {
    return Number(value.toFixed(2));
});
