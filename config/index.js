module.exports = {
    loopDelayInMinutes: 5,
    exchanges: {
	'bitfinex': {
	    msDelayBetweenAPICalls: 1000,
	    credentials: {
		key: process.env.BITFINEX_KEY || 'BITFINEX-KEY-HERE',
		secret: process.env.BITFINEX_SECRET || 'BITFINEX-SECRET-HERE'
	    },
	    currencies: {
		eth: {
		    active: true,
		    minimumRate: 2.0,
		    minimumSizeUSD: 50,
		    maximumSizeUSD: 2000,
		    rateCreationStrategy: {
			name: 'percentDepth',
			lendbookPositioningPercentage: 10
		    },
		    rateUpdateStrategy: {
			name: 'lowerRateWithTime',
			lowerAfterMinutes: 30,
			lowerByPercent: 5
		    }
		},
		etc: {
		    active: true,
		    minimumRate: 2.0,
		    minimumSizeUSD: 50,
		    maximumSizeUSD: 750,
		    rateCreationStrategy: {
			name: 'percentDepth',
			lendbookPositioningPercentage: 10
		    },
		    rateUpdateStrategy: {
			name: 'outOfRange',
			driftPercent: 2
		    }
		}
	    }
	},
	poloniex: {
	    msDelayBetweenAPICalls: 100,
	    credentials: {
		key: process.env.POLONIEX_KEY || 'POLONIEX-KEY-HERE',
		secret: process.env.POLONIEX_SECRET || 'POLONIEX-SECRET-HERE'
	    },
	    currencies: {
		btc: {
		    active: true,
		    minimumRate: 2.0,
		    minimumSizeUSD: 50,
		    maximumSizeUSD: 1000,
		    rateCreationStrategy: {
			name: 'percentDepth',
			lendbookPositioningPercentage: 10
		    },
		    rateUpdateStrategy: {
			name: 'lowerRateWithTime',
			lowerAfterMinutes: 30,
			lowerByPercent: 5
		    }
		},
		eth: {
		    active: false,
		    minimumRate: 2.0,
		    minimumSizeUSD: 50,
		    maximumSizeUSD: 750,
		    rateCreationStrategy: {
			name: 'percentDepth',
			lendbookPositioningPercentage: 10
		    },
		    rateUpdateStrategy: {
			name: 'outOfRange',
			driftPercent: 2
		    }
		}
	    }
	}
    }
};
