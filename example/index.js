var paypal = require('../src')();
var utils  = require('yocto-utils');
var _      = require('lodash');

console.log(' ==> loadConfig');

var create_payment_json = {
  "intent": "authorize",
  "payer": {
    "payment_method": "credit_card",
    "funding_instruments": [{
      "credit_card": {
        "type": "visa",
        "number": "4012888888881881",
        "expire_month": "06",
        "expire_year": "2018",
        "cvv2": "000",
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
      "currency": "EUR",
      "details": {
        "subtotal": "5",
        "tax": "1",
        "shipping": "1"
      }
    },
    "description": "This is the payment transaction description.",
    "invoice_number" : "25522643135413513214",
    "custom"         : "id25522643135413513213"
  }]
};

var orderData = {
  'client_metadata_id': '1111111111'
};

var captureDetails = {
  "amount": {
    "currency": "EUR",
    "total": "4.54"
  },
  "is_final_capture": true
};

paypal.loadConfig({
  mode : 'sandbox',
  client_id : 'AeVpx5laauzoVRqNgugaM_3sMoP2AaJqkKimX2hH5vHAuEcVzjWY2bY2EiAVeIkHc6njXPBU6EFJeSPu',
  client_secret : 'EDG6KfsGmqOPNJFY6nhl5h7pKOSamFOBUl8zGdCGUFYhLRQjX0n09rztw7DrS798ZVjSd6J3nXUYaO-a'
}).then(function (config) {

  // process to create an authorization
  paypal.createCreditCardAuthorization(create_payment_json).then(function (payment) {

    console.log("\n ===> (A) createCreditCardAuthorization.success", utils.obj.inspect(payment))
    var captureId = _.first(payment.transactions);
    captureId = _.first(captureId.related_resources);
    captureId = captureId.authorization.id;
    console.log('\n (A) Capture id is ==> ', captureId);

    paypal.capturePayment(captureId, captureDetails).then(function (value) {

      console.log('\n (A) ===> payment captured, value : ', utils.obj.inspect(value));
    }).catch(function (error) {
      console.log('\n (A) ===> capturePayment.error : ', error);
    });
  }).catch(function (error) {
    console.log('\n (A) ===> createCreditCardAuthorization.error : ', utils.obj.inspect(error));
  });

  // // process to create and after cancel an payment
  // paypal.createCreditCardAuthorization(create_payment_json).then(function (payment) {
  //
  //   console.log("\n ===> (B) createCreditCardAuthorization.success", payment)
  //   var captureId = _.first(payment.transactions);
  //   captureId = _.first(captureId.related_resources);
  //   captureId = captureId.authorization.id;
  //   console.log('\n (B) Capture id is ==> ', captureId);
  //
  //   paypal.cancelPayment(captureId).then(function (value) {
  //
  //     console.log('\n (B)  ===> payment captured, value : ', utils.obj.inspect(payment));
  //   }).catch(function (error) {
  //     console.log('\n (B)  ===> capturePayment.error : ', error);
  //   });
  // }).catch(function (error) {
  //   console.log('\n (B)  ===> createCreditCardAuthorization.error : ', error);
  // });
}).catch(function (error) {
  console.log('\n (B)  ===> loadConfig.error : ', utils.obj.inspect(error));
});
