var utils  = require('yocto-utils');
var chai   = require('chai').assert;
var expect = require('chai').expect;
var should = require('chai').should;
var _      = require('lodash');
var paypal = require('../../src/')();
var util   = require('util');

paypal.logger.enableConsole(false);

var types = [ null, undefined, 1, true, false, NaN, 'a', '', {}, [] ];

// This is a valid sandbox credential
var config = {
  mode          : 'sandbox',
  client_id     : 'AeVpx5laauzoVRqNgugaM_3sMaaaaaaaaaPu',
  client_secret : 'EDG6KfsGmqOPNJFY6nhlaaaaaaztw7DrS798ZVjSd6J3nXUYaO'
};

// Valid payment by credit card
var validPayment = {
  "intent": "authorize",
  "payer": {
    "payment_method": "credit_card",
    "funding_instruments": [{
      "credit_card": {
        "type": "visa",
        "number": "4446283280247004",
        "expire_month": "01",
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

describe('Load config', function () {

  // valid conf
  describe('loadConfig() must return a return success promise : ', function () {
    // test load paypal with promised
    it('Use valid configuration', function( ) { // no done

      // note the return
      return paypal.loadConfig(config).then(function( data){
        expect(data).to.equal(config);
      });// no catch, it'll figure it out since the promise is rejected
    });
  });

  // wrong conf
  describe('loadConfig() must return a return fail promise because < mode > will not be an ' +
  'valid value : ', function () {

    types.forEach(function (t) {
      it('Using type for : < ' +  util.inspect(t, { depth : null }) + ' > for field < mode >',
      function () {

        var config = {
          mode          : t,
          client_id     : 'EDfsGmqOPNJFY6nhl5h7pKOSamFOBUl8zGdCGUFYhLRQjX0n09rztw7DrSSd6J3nXUYaO',
          client_secret : 'EDG6KfsGmqOPNJFY6nhl5h7pKOSal8zGdCGUFYhLRQjX0n09rztw7DrSSd6J3nXUYaO'
        };
        // note the return
        return paypal.loadConfig(config).catch(function (data) {
          expect(data).to.be.an('string');
        });// no catch, it'll figure it out since the promise is rejected
      });
    });
  });

  // wrong conf
  describe('loadConfig() must return a return fail promise because < mode > is valid but ' +
  'other value not : ', function () {

    // overide types by removing string value
    var types = [ null, undefined, 1, true, false, NaN, '', {}, [] ];

    types.forEach(function (t) {
      it('Using type for : < ' +  util.inspect(t, { depth : null }) + ' > for field < mode >',
      function () {

        var config = {
          mode          : 'sandbox',
          client_id     : t,
          client_secret : t
        };
        // note the return
        return paypal.loadConfig(config).catch(function (data) {
          expect(data).to.be.an('string');
        });// no catch, it'll figure it out since the promise is rejected
      });
    });
  });
});

describe('Create authorization payment', function () {

  paypal.loadConfig(config).then(function () {

    // valid conf
    describe('createCreditCardAuthorization() must return an fail promise because config' +
    'is wrong : ',function () {

      types.forEach(function (t) {
        it('Using type for : < ' +  util.inspect(t, { depth : null }) + ' > for all fields',
        function () {

          var payment = {
            "intent": "authorize",
            "payer": {
              "payment_method": "credit_card",
              "funding_instruments": [{
                "credit_card": {
                  "type": "visa",
                  "number": t,
                  "expire_month": t,
                  "expire_year": t,
                  "cvv2": t,
                  "first_name": t,
                  "last_name": t,
                  "billing_address": {
                    "line1": t,
                    "city": t,
                    "state": t,
                    "postal_code": t,
                    "country_code": t
                  }
                }
              }]
            },
            "transactions": [{
              "amount": {
                "total": t,
                "currency": t,
                "details": {
                  "subtotal": t,
                  "tax": t,
                  "shipping": t
                }
              },
              "description": t
            }]
          };

          // note the return
          return paypal.createCreditCardAuthorization(payment).catch(function (data) {
            expect(data).to.be.an('string');
          });// no catch, it'll figure it out since the promise is rejected
        });
      });
    });
  }).catch(function (error) {
    console.log('An error occured in config');
    // error in config so throw it
    throw (error);
  });
});

describe('Crapture payment', function () {

  paypal.loadConfig(config).then(function () {

    // valid conf
    describe('capturePayment() must return an fail promise because the config is wrong',
    function () {

      types.forEach(function (t) {
        it('Using type for : < ' +  util.inspect(t, { depth : null }) + ' > for all fields',
        function () {

          var captureDetails = {
            "amount": {
              "currency": t,
              "total": t
            },
            "is_final_capture": t
          };

          // note the return
          return paypal.capturePayment('000', captureDetails).catch(function (data) {
            expect(data).to.be.an('string');
          });// no catch, it'll figure it out since the promise is rejected
        });
      });
    });
  }).catch(function (error) {
    console.log('An error occured in config');
    // error in config so throw it
    throw (error);
  });
});

describe('Cancel payment', function () {

  paypal.loadConfig(config).then(function () {

    // valid conf
    describe('cancelPayment() must return an fail promise because the config is wrong',
    function () {

      // overide types by removing string value
      var types = [ null, undefined, 1, true, false, NaN, '', {}, [] ];

      types.forEach(function (t) {
        it('Using type for : < ' +  util.inspect(t, { depth : null }) + ' > for < id >',
        function () {

          // note the return
          return paypal.cancelPayment(t).catch(function (data) {
            expect(data).to.be.an('string');
          });// no catch, it'll figure it out since the promise is rejected
        });
      });
    });
  }).catch(function (error) {
    console.log('An error occured in config');
    // error in config so throw it
    throw (error);
  });
});

describe('Create authorization payment', function () {

  paypal.loadConfig(config).then(function () {

    // valid conf
    describe('createCreditCardAuthorization() must return an fail promise because config ' +
    'is wrong : ',function () {

      types.forEach(function (t) {
        it('Using type for : < ' +  util.inspect(t, { depth : null }) + ' > for all fields',
        function () {

          var payment = {
            "intent": "authorize",
            "payer": {
              "payment_method": "credit_card",
              "funding_instruments": [{
                "credit_card": {
                  "type": "visa",
                  "number": t,
                  "expire_month": t,
                  "expire_year": t,
                  "cvv2": t,
                  "first_name": t,
                  "last_name": t,
                  "billing_address": {
                    "line1": t,
                    "city": t,
                    "state": t,
                    "postal_code": t,
                    "country_code": t
                  }
                }
              }]
            },
            "transactions": [{
              "amount": {
                "total": t,
                "currency": t,
                "details": {
                  "subtotal": t,
                  "tax": t,
                  "shipping": t
                }
              },
              "description": t
            }]
          };

          // note the return
          return paypal.createCreditCardAuthorization(payment).catch(function (data) {
            expect(data).to.be.an('string');
          });// no catch, it'll figure it out since the promise is rejected
        });
      });
    });
  }).catch(function (error) {
    console.log('An error occured in config');
    // error in config so throw it
    throw (error);
  });
});
