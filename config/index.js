module.exports = {
    loopDelayInMinutes: 5,
    msDelayBetweenAPICalls: 1000,
    exchanges: {
	'bitfinex': {
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
		    lendbookPositioningPercentage: 10,
		    driftPercent: 2
		},
		etc: {
		    active: true,
		    minimumRate: 2.0,
		    minimumSizeUSD: 50,
		    maximumSizeUSD: 750,
		    lendbookPositioningPercentage: 10,
		    driftPercent: 2
		}
	    }
	},
	poloniex: {
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
		    lendbookPositioningPercentage: 10,
		    driftPercent: 2
		},
		eth: {
		    active: false,
		    minimumRate: 2.0,
		    minimumSizeUSD: 50,
		    maximumSizeUSD: 750,
		    lendbookPositioningPercentage: 10,
		    driftPercent: 2
		}
	    }
	}
    }
};
