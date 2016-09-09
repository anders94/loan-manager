# loan-manager
Effectively loaning virtual and fiat currencies on exchanges requires programatic management. `loan-manager`
automates positioning loan offers on exchanges on a periodic basis.

## Supported Exchanges
* [Bitfinex](https://www.bitfinex.com/)
* [Poloniex](https://www.poloniex.com/)

## Setup
Clone this project:

```git clone https://github.com/anders94/loan-manager.git```

Generate API keys on the exchanges you want managed. When creating Bitfinex keys, make sure "margin funding" 
has "write" capability. Poloniex keys don't require special access grants.

Make sure there are funds available in the lending wallets. On Bitfinex, the lending wallet is the Deposit 
wallet.

Next, edit the configuration file `config/index.js`

Add the keys and secrets to the exchanges. Modify and add as necessary sections for each exchange / currency 
you wish to lend. Be sure to closely follow the example configuration, `loan-manager` doesn't deal well with 
configuration errors.

Main configuration settings:
* loopDelayInMinutes: Time in minutes between each run through exchanges / currencies
* msDelayBetweenAPICalls: Time in milliseconds between API calls. Exchanges usually limit the number of calls 
  that can be made from the same IP / account.

Exchange specific configuration settings:
* credentials: key and secret API settings from the exchange - these can also be passed as environment variables
* active: this true or false turns loan management on or off for this currency
* minimumRate: minimum percentage rate below which `loan-manager` will not create loan offers
* minimumSizeUSD: the value in US Dollars of the minimum loan amount. Exchanges have a lower limit on the amount
  of currency that can be offered in a single offer.
* maximumSizeUSD: the value in US Dollars of the maximum loan amount. Use this if you want to limit the upper 
  bounds of what the `loan-manager` will offer in a single offer.
* lendbookPositioningPercentage: `loan-manager` will traverse the offers in the lendbook and position your offers
  this percentage rate into the book by volume.
* driftPercent: the percentage outside of the target rate that `loan-manager` will allow before canceling open
  orders.

Run the application:

```node app```

The application will run in the foreground positioning loans using all available funds in the lending wallets.
After running through each exchange and currency, `loan-manager` will wait the `loopDelayInMinutes` time and
start over again.

# Support
If you appreciate my efforts, please consider supporting this project by sending some BTC to 
`1FwVYgQCN5oDvbZCQrE3KwgkBECJ93kF5x`.
