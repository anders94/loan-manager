var connectors = require('./connectors');
var strategies = require('./strategies');
var config = require('./config');
var moment = require('moment');
var async = require('async');

var debug = false;
var makeAndCancelOffers = true;

async.forever(function(cb) {
    var usdTotal = 0;
    var rateTotal = 0;
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
		    manage(exchangeName, handle, currency, settings, function(err, data) {
			if (err) {
			    console.log(err);
			}
			else {
			    var usd = data.loanTotal * data.usdPrice;
			    var rate = data.rateTotal / (data.loanTotal !== 0 ? data.loanTotal : 1); // covers divide by zero
			    usdTotal += usd;
			    rateTotal += usd * rate;
			}
			cb();
		    });
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
	console.log();
	console.log('summary');
	console.log('  grand total: $'+toUsd(usdTotal), 'loaned at', (rateTotal / usdTotal).toFixed(2)+'%');
	console.log();
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
	      console.log('  usd rate: $'+toUsd(usdPrice));
	      console.log();
	      setTimeout(function() {
		  cb(err);
	      }, config.exchanges[exchangeName].msDelayBetweenAPICalls);
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
	    }, config.exchanges[exchangeName].msDelayBetweenAPICalls);
	});
    },
    function(cb) {
	// 3. show active loans (with USD value)
	console.log('  active loans ('+data.activeLoans.length+')');
	data.loanTotal = 0;
	data.rateTotal = 0;
	async.eachSeries(data.activeLoans, function(loan, cb) {
	    console.log('   ', loan.amount.toFixed(8), loan.currency, '($'+toUsd(loan.amount * data.usdPrice)+') at',
			loan.rate.toFixed(2)+'%', loan.createDate, 'for', loan.duration, 'days',
			'(expires '+moment(loan.createDate).add(loan.duration, 'days').fromNow()+')');
	    data.loanTotal += loan.amount;
	    data.rateTotal += loan.rate * loan.amount;
	    cb();
        },
        function(err) {
	    if (data.loanTotal > 0) {
		console.log();
		console.log('      total:', data.loanTotal.toFixed(8), currency, '($'+toUsd(data.loanTotal * data.usdPrice)+')',
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
            }, config.exchanges[exchangeName].msDelayBetweenAPICalls);
        });
    },
    function(cb) {
	// 5. find desired rate
	var strategy = strategies.createLoan.topOfTheBook;
	if (settings.rateCreationStrategy.name === 'percentDepth') {
	    strategy = strategies.createLoan.percentDepth;
	}
	strategy(data, settings, exchangeName, function(err, rate) {
	    if (!err) {
		data.targetRate = rate;
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
	// 6. find duration
	var strategy = strategies.loanDuration.rateBased;
	data.duration = strategy(data, settings, exchangeName);
	cb();
    },
    function(cb) {
	// 7. get open (unfilled) loan offers
	handle.openLoanOffers(currency, function(err, loanOffers) {
            data.loanOffers = loanOffers;
            setTimeout(function() {
                cb(err);
            }, config.exchanges[exchangeName].msDelayBetweenAPICalls);
        });
    },
    function(cb) {
	// 8. show open (unfilled) loan offers
	if (data.loanOffers.length > 0) {
	    console.log('  open loan offers ('+data.loanOffers.length+')');
	    for (var x in data.loanOffers) {
		var offer = data.loanOffers[x];
		console.log('   ', offer.amount.toFixed(8), offer.currency, '($'+toUsd(offer.amount * data.usdPrice)+') at',
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
	// 9. test all open offers to see if they should be updated or canceled
	var activity = false;
	async.eachSeries(data.loanOffers, function(offer, cb) {
	    var strategy = strategies.updateLoan.outOfRange;
            if (settings.rateUpdateStrategy.name === 'lowerRateWithTime') {
		strategy = strategies.updateLoan.lowerRateWithTime;
            }
            strategy(offer, data, settings, exchangeName, function(err, offer) {
		if (offer.action === 'cancel' || offer.rate < settings.minimumRate) {
		    // cancel this offer
		    if (makeAndCancelOffers) {
			activity = true;
			console.log('   cancelling', offer.amount.toFixed(8), offer.currency, '($'+toUsd(offer.amount * data.usdPrice)+') at',
				    offer.rate.toFixed(2)+'%', offer.createDate, 'for', offer.duration, 'days');
			handle.cancelLoanOffer(offer.id, function(err, res) {
			    if (debug) {
				console.log(res);
			    }
			    setTimeout(function() {
				cb(err);
			    }, config.exchanges[exchangeName].msDelayBetweenAPICalls);
			});
		    }
		    else {
			cb();
		    }
		}
		else if (offer.action === 'update') {
		    // update this offer
		    if (makeAndCancelOffers) {
			activity = true;
			console.log('   updating', offer.amount.toFixed(8), offer.currency, '($'+toUsd(offer.amount * data.usdPrice)+') at',
				    offer.rate.toFixed(2)+'%', offer.createDate, 'for', offer.duration, 'days');
			handle.updateLoanOffer(offer, function(err, res) { // TODO: make this an update not a cancel!
			    if (debug) {
				console.log(res);
			    }
			    setTimeout(function() {
				cb(err);
			    }, config.exchanges[exchangeName].msDelayBetweenAPICalls);
			});
		    }
		    else {
			cb();
		    }
		}
		else {
		    cb();
		}
	    });
	},
	function(err) {
	    if (activity) {
		console.log();
	    }
	    cb(err)
	});
    },
    function(cb) {
	// 10. get available balance for this currency
	handle.availableBalance(currency, function(err, availableBalance) {
            data.availableBalance = availableBalance;
	    console.log('  available balance:', data.availableBalance, currency, '($'+toUsd(data.availableBalance * data.usdPrice)+')');
	    console.log();
            setTimeout(function() {
                cb(err);
            }, config.exchanges[exchangeName].msDelayBetweenAPICalls);
        });
    },
    function(cb) {
	// 11. optionally create offer
	if (data.availableBalance * data.usdPrice > settings.minimumSizeUSD && data.targetRate > settings.minimumRate) {
	    var amount = data.availableBalance;
	    if (amount * data.usdPrice > settings.maximumSizeUSD) {
		amount = Number((settings.maximumSizeUSD / data.usdPrice).toFixed(4));
	    }
	    console.log('  creating offer for', amount, currency, '($'+toUsd(amount * data.usdPrice)+') at',
			data.targetRate.toFixed(2)+'% for', data.duration, 'days');
	    if (makeAndCancelOffers) {
		handle.createLoanOffer(currency, amount, Number(data.targetRate.toFixed(2)), data.duration, function(err, res) {
		    if (debug) {
			console.log(res);
		    }
		    setTimeout(function() {
			cb(err);
		    }, config.exchanges[exchangeName].msDelayBetweenAPICalls);
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
	cb(err, data);
    });
}

moment.relativeTimeRounding(function (value) {
    return Number(value.toFixed(2));
});

function toUsd(x) {
    return numberWithCommas(Number(x).toFixed(2));
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
