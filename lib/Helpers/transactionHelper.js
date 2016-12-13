'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var transactionHelper = {
  parser: function parser(transaction) {
    var keys = Object.keys(transaction);
    if (keys.includes('contactId')) {
      transaction.contactId = Number(transaction.contactId);
    }
    return transaction;
  }
};

exports.default = transactionHelper;