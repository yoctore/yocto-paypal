'use strict';

var _       = require('lodash');
var logger  = require('yocto-logger');
var joi     = require('joi');
var Q       = require('q');
var utils   = require('yocto-utils');

/**
* Yocto paypal : PayPal wrapper
*
* For more details on these dependencies read links below :
* - LodAsh : https://lodash.com/
* - yocto-logger : http://github.com/yoctore/yocto-logger
* - joi : https://github.com/hapijs/joi
* - Q : https://github.com/kriskowal/q
* - yocto-utils : https://github.com/yoctore/yocto-utils
*
* @date : 2016-04-04
* @author : Cedric Balard <cedric@yocto.re>
* @copyright : Yocto SAS, All right reserved
* @class YoctoPaypal
*/
function YoctoPaypal (yLogger) {

  /**
   * Contain config of wrapper
   */
  this.config = {};

  /**
   * Default logger
   */
  this.logger = yLogger || logger;

  /**
   * Create paypal instance
   */
  this.paypal  = require('paypal-rest-sdk');
}

/**
 * Load paypal config
 *
 * @param  {config} config the config file necessary to module
 * @return {boolean} promise of promess
 */
YoctoPaypal.prototype.loadConfig = function (config) {
  // create a promise deferred
  var deferred = Q.defer();

  // joi schema of the config file
  var schema = joi.object().required().keys(utils.obj.underscoreKeys({
    mode          : joi.string().required().valid([ 'sandbox', 'live' ]),
    clientId      : joi.string().required().empty(),
    clientSecret  : joi.string().required().empty()
  }));

  // validate joi schema with the given file
  var result   = schema.validate(config);

  // check if an error occured
  if (result.error) {
    // An error occured joi schema is not conform
    this.logger.error('[ YoctoPaypal.loadConfig.joi ] - an error occured when loading ' +
    'configuration, more details : ' + result.error.toString());
    // Config file was not loaded
    deferred.reject(result.error.toString());
    return deferred.promise;
  }

  // configure paypal
  this.paypal.configure(config);
  this.logger.info('[ YoctoPaypal.loadConfig ] - PayPal instance was configured');

  deferred.resolve(config);
  return deferred.promise;
};

// TODO : splité cette fonction en sous module comme "yocto-orika"
/**
 * Create an authorization for an credit card
 *
 * @param  {Object} paymentData the necessary data to create payment authorization
 * @return {boolean} true if file is loaded, otherwise false
 */
YoctoPaypal.prototype.createCreditCardAuthorization = function (paymentData) {
  // create a promise deferred
  var deferred = Q.defer();

  // Validation schema of created
  var schema = joi.object().required().keys({
    intent        : joi.string().required().valid('authorize'),
    payer         : joi.object().required().keys(utils.obj.underscoreKeys({
      paymentMethod       : joi.string().required().valid('credit_card'),
      fundingInstruments  : joi.array().required().min(1).items(joi.object().keys(
        utils.obj.underscoreKeys({
          creditCard : joi.object().required().keys(
          _.merge({
            cvv2        : joi.string().required().min(3).max(4)
          },
          utils.obj.underscoreKeys({
            type            : joi.string().required().valid(['visa', 'delta', 'electron',
            'mastercard', 'eurocard', 'maestro', 'amex']),
            number          : joi.number().integer().required(),
            expireMonth     : joi.number().min(1).max(12).required(),
            expireYear      : joi.date().format('YYYY').required(),
            firstName       : joi.string().required().empty(),
            lastName        : joi.string().required().empty(),
            billingAddress  : joi.object().optional().keys(_.merge({
              line1       : joi.string().required().empty(),
              city        : joi.string().required().empty(),
              state       : joi.string().required().empty(),
            },utils.obj.underscoreKeys({
              postalCode  : joi.string().required().empty(),
              countryCode : joi.string().required().empty()
            })))
          })))
        })
      ))
    })),
    transactions  : joi.array().required().min(1).items(joi.object().keys({
      amount        : joi.object().required().keys({
        total     : joi.number().required().min(0),
        currency  : joi.string().required().empty(),
        details   : joi.object().optional().keys({
          subtotal  : joi.number().required().min(0),
          tax       : joi.number().required().min(0),
          shipping  : joi.number().required().min(0)
        })
      }),
      description   : joi.string().required().empty()
    }))
  });

  // validate joi schema with the given file
  var result   = schema.validate(paymentData);

  // check if an error occured
  if (result.error) {
    // An error occured joi schema is not conform
    this.logger.error('[ YoctoPaypal.createCreditCardAuthorization.joi ] - an error occured' +
    ' schema is not conform, more details : ' + result.error.toString());
    // Config file was not loaded
    deferred.reject(result.error.toString());
    return deferred.promise;
  }

  this.logger.debug('[ YoctoPaypal.createCreditCardAuthorization ] - a new request will be send' +
  ' to create authorization payment');

  // Create the payment on paypal, this will be the authorization payment
  this.paypal.payment.create(paymentData, function (error, payment) {
    // check if an error occured
    if (error) {
      this.logger.error('[ YoctoPaypal.createCreditCardAuthorization.create ] - An error occured' +
      ' when creating the authorization payment, more details : ' + error);
      // an error occured when creating the payment
      return deferred.reject(error);
    }

    this.logger.info('[ YoctoPaypal.createCreditCardAuthorization.create ] - the payment was ' +
    'authorized');
    // The payment was created
    deferred.resolve(payment);
  }.bind(this));

  // return promise of process
  return deferred.promise;
};

/**
 * Capture an valid payment authorization
 *
 * @param  {String} id id of the authorization payment
 * @param  {Object} paymentData the necessary data to create payment authorization
 * @return {boolean} true if file is loaded, otherwise false
 */
YoctoPaypal.prototype.capturePayment = function (id, paymentData) {
  // create a promise deferred
  var deferred = Q.defer();

  // schema of request
  var schema = joi.object().required().keys(utils.obj.underscoreKeys({
    amount          : joi.object().required().keys({
      total     : joi.number().required().min(0),
      currency  : joi.string().required().empty(),
      details   : joi.object().optional().keys({
        subtotal  : joi.number().required().min(0),
        tax       : joi.number().required().min(0),
        shipping  : joi.number().required().min(0)
      })
    }),
    isFinalCapture  : joi.boolean().required(),
    id              : joi.string().required().empty()
  }));

  // validate joi schema with the given file
  var result   = schema.validate(_.merge(paymentData, { id : id }));

  // check if an error occured
  if (result.error) {
    // An error occured joi schema is not conform
    this.logger.error('[ YoctoPaypal.capturePayment.joi ] - an error occured' +
    ' schema is not conform, more details : ' + result.error.toString());
    // Config file was not loaded
    deferred.reject(result.error.toString());
    return deferred.promise;
  }

  this.logger.debug('[ YoctoPaypal.capturePayment ] - a new request will be send' +
  ' to create authorization payment');

  // Create the payment on paypal, this will be the authorization payment
  this.paypal.authorization.capture(id, paymentData, function (error, payment) {
    // check if an error occured
    if (error) {
      this.logger.error('[ YoctoPaypal.capturePayment.capture ] - An error occured' +
      ' when creating the authorization payment, more details : ' + error);

      // an error occured when creating the payment
      return deferred.reject(error);
    }

    this.logger.info('[ YoctoPaypal.capturePayment.capture ] - the payment was ' +
    'authorized');
    // The payment was created
    deferred.resolve(payment);
  }.bind(this));

  // return promise of process
  return deferred.promise;
};

/**
 * Cancel an previous payment authorization
 *
 * @param  {String} id id of the authorization payment
 * @return {boolean} true if file is loaded, otherwise false
 */
YoctoPaypal.prototype.cancelPayment = function (id) {
  // create a promise deferred
  var deferred = Q.defer();

  this.logger.debug('[ YoctoPaypal.cancelPayment ] - a new request will be send' +
  ' to cancel an payment authorization');

  // schema of request
  var schema = joi.object().required().keys({
    id : joi.string().required().empty()
  });

  // validate joi schema with the given file
  var result   = schema.validate({ id : id });

  // check if an error occured
  if (result.error) {
    // An error occured joi schema is not conform
    this.logger.error('[ YoctoPaypal.cancelPayment.joi ] - an error occured' +
    ' schema is not conform, more details : ' + result.error.toString());
    // Config file was not loaded
    deferred.reject(result.error.toString());
    return deferred.promise;
  }

  // Create the payment on paypal, this will be the authorization payment
  this.paypal.authorization.void(id, function (error, payment) {
    // check if an error occured
    if (error) {
      this.logger.error('[ YoctoPaypal.cancelPayment.void ] - An error occured' +
      ' when creating the authorization payment, more details : ' + error);

      // an error occured when creating the payment
      return deferred.reject(error);
    }

    this.logger.info('[ YoctoPaypal.cancelPayment.void ] - the authorization was ' +
    'cancelled');
    // The payment was created
    deferred.resolve(payment);
  }.bind(this));

  // return promise of process
  return deferred.promise;
};

// Default export
module.exports = function (l) {
  // is a valid logger ?
  if (_.isUndefined(l) || _.isNull(l)) {
    logger.warning('[ YoctoPaypal.constructor ] - Invalid logger given. Use internal logger');
    // assign
    l = logger;
  }
  // default statement
  return new (YoctoPaypal)(l);
};
