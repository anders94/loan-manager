# connectors
Connectors regularize exchange interactions into a common standard. They must have a constructor which
takes a config containing a key and a secret and implement:

* lastUSDPrice = function(currency, cb)
* activeLoans = function(currency, cb)
* openLoanOffers = function(currency, cb)
* lendbook = function(currency, cb)
* availableBalance = function(currency, cb)
* createLoanOffer = function(currency, amount, rate, duration, cb)
* cancelLoanOffer = function(id, cb)

Current connectors include:

* Bitfinex
* Poloniex
