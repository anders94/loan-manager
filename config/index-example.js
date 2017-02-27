module.exports = {
    debug: false,
    makeAndCancelOffers: true,
    apiServer: false,
    apiPort: 8080,
    loopDelayInMinutes: 5,
    exchanges: {
	'bitfinex': {
	    msDelayBetweenAPICalls: 2000,
	    credentials: {
		key: process.env.BITFINEX_KEY || 'BITFINEX-KEY-HERE',
		secret: process.env.BITFINEX_SECRET || 'BITFINEX-SECRET-HERE'
	    },
	    duration: {
		minimum: 2,
		maximum: 30,
		lowThreshold: 20,
		highThreshold: 30
	    },
	    currencies: {
		usd: {
		    active: true,
		    minimumRate: 1.0,
		    maximumRate: 28.0,
		    minimumSizeUSD: 50,
		    maximumSizeUSD: 500,
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
		    active: true,
		    minimumRate: 0.1,
		    minimumSizeUSD: 50,
		    maximumSizeUSD: 500,
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
		    minimumRate: 0.1,
		    minimumSizeUSD: 50,
		    maximumSizeUSD: 500,
		    rateCreationStrategy: {
			name: 'percentDepth',
			lendbookPositioningPercentage: 15
		    },
		    rateUpdateStrategy: {
			name: 'lowerRateWithTime',
			lowerAfterMinutes: 30,
			lowerByPercent: 5
		    }
		},
		bfx: {
		    active: false,
		    minimumRate: 0.1,
		    minimumSizeUSD: 50,
		    maximumSizeUSD: 500,
		    rateCreationStrategy: {
			name: 'percentDepth',
			lendbookPositioningPercentage: 15
		    },
		    rateUpdateStrategy: {
			name: 'lowerRateWithTime',
			lowerAfterMinutes: 30,
			lowerByPercent: 5
		    }
		},
		btc: {
		    active: true,
		    minimumRate: 0.1,
		    minimumSizeUSD: 50,
		    maximumSizeUSD: 500,
		    rateCreationStrategy: {
			name: 'percentDepth',
			lendbookPositioningPercentage: 15
		    },
		    rateUpdateStrategy: {
			name: 'lowerRateWithTime',
			lowerAfterMinutes: 30,
			lowerByPercent: 5
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
            duration: {
		minimum: 2,
		maximum: 60,
		lowThreshold: 20,
		highThreshold: 30
            },
	    currencies: {
		btc: {
		    active: true,
		    minimumRate: 0.1,
		    minimumSizeUSD: 5,
		    maximumSizeUSD: 500,
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
		    active: true,
		    minimumRate: 0.1,
		    minimumSizeUSD: 5,
		    maximumSizeUSD: 500,
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
		str: {
		    active: true,
		    minimumRate: 0.1,
		    minimumSizeUSD: 50,
		    maximumSizeUSD: 500,
		    rateCreationStrategy: {
			name: 'percentDepth',
			lendbookPositioningPercentage: 15
		    },
		    rateUpdateStrategy: {
			name: 'lowerRateWithTime',
			lowerAfterMinutes: 30,
			lowerByPercent: 5
		    }
		},
		clam: {
		    active: false,
		    minimumRate: 0.1,
		    minimumSizeUSD: 5,
		    maximumSizeUSD: 500,
		    rateCreationStrategy: {
			name: 'percentDepth',
			lendbookPositioningPercentage: 1
		    },
		    rateUpdateStrategy: {
			name: 'lowerRateWithTime',
			lowerAfterMinutes: 30,
			lowerByPercent: 5
		    }
		},
		xmr: {
		    active: true,
		    minimumRate: 0.1,
		    minimumSizeUSD: 5,
		    maximumSizeUSD: 100,
		    rateCreationStrategy: {
			name: 'percentDepth',
			lendbookPositioningPercentage: 1
		    },
		    rateUpdateStrategy: {
			name: 'lowerRateWithTime',
			lowerAfterMinutes: 30,
			lowerByPercent: 5
		    }
		}
	    }
	}
    }
};
