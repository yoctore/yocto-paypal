[![NPM](https://nodei.co/npm/yocto-paypal.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/yocto-paypal/)

![alt text](https://david-dm.org/yoctore/yocto-paypal.svg "Dependencies Status")
[![Code Climate](https://codeclimate.com/github/yoctore/yocto-paypal/badges/gpa.svg)](https://codeclimate.com/github/yoctore/yocto-paypal)
[![Test Coverage](https://codeclimate.com/github/yoctore/yocto-paypal/badges/coverage.svg)](https://codeclimate.com/github/yoctore/yocto-paypal/coverage)
[![Issue Count](https://codeclimate.com/github/yoctore/yocto-paypal/badges/issue_count.svg)](https://codeclimate.com/github/yoctore/yocto-paypal)
[![Build Status](https://travis-ci.org/yoctore/yocto-paypal.svg?branch=master)](https://travis-ci.org/yoctore/yocto-paypal)

## Overview

This module is a part of yocto node modules for NodeJS.

Please see [our NPM repository](https://www.npmjs.com/~yocto) for complete list of available tools (completed day after day).

An utility tool to provide payment via paypal API

## Motivation

After each development, conclusion is the same : we need to create an utility tools with all our utility method to be able to reuse them in other program. That's why we create this utility tools.

*Although this module was completed day after day.*

## How to use
  - First you need to create an PayPal app, and retrieve <client_id> and <client_secret>

All methods returned promise for success of fail

### Load config

This wrapper use the two mode of paypal : 'sandbox' and 'live'
The module must be loaded like this :

```javascript
paypal.loadConfig({
  mode : 'sandbox',
  client_id : 'aaaaaa',
  client_secret : 'aaaaaa-a'
}).then(function (config) {
  console.log('success')
}).catch(function (error) {
  console.log('error : ', error)
});
```

### Create authorization payment

An PayPal authorization payment permit you to capture payment during in period of 29 days.
*NB :* PayPal will honor the funds for a 3-day period after the basic authorization

#### With credit card

To create payment with an credit card

```javascript
var paymentData = {
  "intent": "authorize",
  "payer": {
    "payment_method": "credit_card",
    "funding_instruments": [{
      "credit_card": {
        "type": "visa",
        "number": "4446283280247004",
        "expire_month": "11",
        "expire_year": "2018",
        "cvv2": "874",
        "first_name": "Joe",
        "last_name": "Shopper",
        "billing_address": {
          "line1": "52 N Main ST",
          "city": "Johnstown",
          "state": "OH",
          "postal_code": "43210",
          "country_code": "US"
        }
      }
    }]
  },
  "transactions": [{
    "amount": {
      "total": "7",
      "currency": "USD",
      "details": {
        "subtotal": "5",
        "tax": "1",
        "shipping": "1"
      }
    },
    "description": "This is the payment transaction description."
  }]
};

paypal.createCreditCardAuthorization(paymentData).then(function (config) {
  console.log('success')
}).catch(function (error) {
  console.log('error : ', error)
});
```

### Capture payment

TO capture an payment you should have an valid capture payment

```javascript
var captureData = {
  "amount": {
    "currency": "USD",
    "total": "4.54"
  },
  "is_final_capture": true
};

paypal.capturePayment('id-of-authorization', captureData).then(function (config) {
  console.log('success')
}).catch(function (error) {
  console.log('error : ', error)
});
```

### Cancel payment

An payment authorization can be void

```javascript
paypal.cancel('id-of-authorization').then(function (config) {
  console.log('success')
}).catch(function (error) {
  console.log('error : ', error)
});
```
