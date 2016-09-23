# loan-manager
Effectively loaning virtual and fiat currencies on exchanges requires programatic management. `loan-manager`
automates positioning loan offers on exchanges on a periodic basis.

## Supported Exchanges
* [Bitfinex](https://www.bitfinex.com/)
* [Poloniex](https://www.poloniex.com/)

## Setup
**Clone this project:**

```git clone https://github.com/anders94/loan-manager.git```

**Install dependancies:**

```npm install```

Generate API keys on the exchanges you want managed. When creating Bitfinex keys, make sure "margin funding" 
has "write" capability. Poloniex keys don't require special access grants.

Make sure there are funds available in the lending wallets. On Bitfinex, the lending wallet is the Deposit
wallet.

**Edit configuration file:**

Edit `config/index.js` adding the keys and secrets to the exchanges. Modify and add as necessary sections for
each exchange / currency you wish to lend. Be sure to closely follow the example configuration, `loan-manager`
doesn't deal well with configuration errors.

Main configuration settings:
* *loopDelayInMinutes:* Time in minutes between each run through exchanges / currencies
* *msDelayBetweenAPICalls:* Time in milliseconds between API calls. Exchanges usually limit the number of calls 
  that can be made from the same IP / account.

Exchange specific configuration settings:
* *credentials:* key and secret API settings from the exchange - these can also be passed as environment variables
* *active:* this true or false turns loan management on or off for this currency
* *minimumRate:* minimum percentage rate below which `loan-manager` will not create loan offers
* *minimumSizeUSD:* the value in US Dollars of the minimum loan amount. Exchanges have a lower limit on the amount
  of currency that can be offered in a single offer.
* *maximumSizeUSD:* the value in US Dollars of the maximum loan amount. Use this if you want to limit the upper 
  bounds of what the `loan-manager` will offer in a single offer.
* *rateCreationStrategy:* names and configures the strategy to be used when creating loans. Valid options include
  `topOfTheBook` and `percentDepth`.
  * *topOfTheBook:* Positions offers at the top of the book. no other parameters are necessary.
  * *percentDepth:* Requires 'lendbookPositioningPercentage' which describes how deep into the book to position the
    offer. For example, `10` would position the offers at whatever rate is 10% deep into the book.
* *rateUpdateStrategy:* names and configures the strategy to be used when evaluating open loan offers. Valid options
  include `outOfRange` and `lowerRateWithTime`.
  * *outOfRange:* Requires `driftPercent`. If an offer is more than `driftPercent` above the target rate, cancel the
    offer.
  * *lowerRateWithTime:* Requires `lowerAfterMinutes` and `lowerByPercent`. If an offer is older than `lowerAfterMinutes`,
    lower the offer's rate by `lowerByPercent`. For example, if the offer is at 5.85% and is older than the limit
    and `lowerByPercent` is set to 10, the offer will be lowered by 10% to 5.256%.

**Run the application:**

```node app```

The application will run in the foreground positioning loans using all available funds in the lending wallets.
After running through each exchange and currency, `loan-manager` will wait the `loopDelayInMinutes` time and
start over again.

## Example Output
```
-----------------------------------
Tue Sep 13 2016 15:46:35 GMT-0400 (EDT)
-----------------------------------

bitfinex eth
  active loans
    8.03161070 eth ($96.50) at 26.99% 2016-09-13T12:46:53-04:00 for 10 days (expires in 9.88 days)
    8.96001335 eth ($107.65) at 27.02% 2016-09-13T12:52:55-04:00 for 10 days (expires in 9.88 days)
    0.97693109 eth ($11.74) at 27.02% 2016-09-13T12:52:55-04:00 for 10 days (expires in 9.88 days)
    22.42226187 eth ($269.40) at 26.82% 2016-09-13T12:42:55-04:00 for 10 days (expires in 9.87 days)
    19.97951998 eth ($240.05) at 27.00% 2016-09-13T13:38:54-04:00 for 10 days (expires in 9.91 days)
    4.95182119 eth ($59.50) at 27.25% 2016-09-13T14:26:54-04:00 for 10 days (expires in 9.94 days)
    0.73261049 eth ($8.80) at 27.25% 2016-09-13T14:26:54-04:00 for 10 days (expires in 9.94 days)

    total: 66.05476867 eth ($793.64) at 27.01%

  target rate: 35.18%

  open loan offers

  available balance: 0 eth ($0.00)

  not creating a new offer

bitfinex etc
  active loans
    154.09189602 etc ($200.33) at 70.12% 2016-09-04T20:20:16-04:00 for 10 days (expires in 1.19 days)
    12.06334878 etc ($15.68) at 70.12% 2016-09-04T21:00:17-04:00 for 10 days (expires in 1.22 days)
    27.89596296 etc ($36.27) at 67.06% 2016-09-09T16:24:55-04:00 for 30 days (expires in a month)
    21.17597233 etc ($27.53) at 67.06% 2016-09-09T16:30:56-04:00 for 30 days (expires in a month)
    38.93296000 etc ($50.62) at 36.46% 2016-09-13T10:28:56-04:00 for 30 days (expires in a month)
    80.46133283 etc ($104.61) at 36.46% 2016-09-13T10:32:53-04:00 for 30 days (expires in a month)

    total: 334.62147292 etc ($435.03) at 64.40%

  target rate: 27.10%

  open loan offers

  available balance: 0 etc ($0.00)

  not creating a new offer

poloniex btc
  active loans
    0.30769988 btc ($189.63) at 24.16% 2016-09-13T10:21:19-04:00 for 2 days (expires in 1.77 days)
    0.29442223 btc ($181.45) at 25.44% 2016-09-13T07:31:21-04:00 for 10 days (expires in 9.66 days)
    0.55750000 btc ($343.58) at 24.78% 2016-09-13T05:55:07-04:00 for 2 days (expires in 1.59 days)
    0.30859286 btc ($190.18) at 24.78% 2016-09-13T05:55:04-04:00 for 2 days (expires in 1.59 days)
    0.20912275 btc ($128.88) at 19.16% 2016-09-04T14:27:20-04:00 for 60 days (expires in 1.69 months)
    0.52476103 btc ($323.40) at 25.18% 2016-09-01T13:49:26-04:00 for 60 days (expires in 1.59 months)
    0.34513618 btc ($212.70) at 24.24% 2016-08-24T21:13:07-04:00 for 60 days (expires in 1.34 months)

    total: 2.54723493 btc ($1,569.81) at 24.23%

  target rate: 24.53%

  open loan offers

  available balance: 0 btc ($0.00)

  not creating a new offer

summary
  grand total: $2,798.48 loaned at 31.26%

done
```

# Donate

Send me some thanks:
* BTC: `1FwVYgQCN5oDvbZCQrE3KwgkBECJ93kF5x`
