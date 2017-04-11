'use strict';

var _parser = require('./Helpers/parser.js');

var _parser2 = _interopRequireDefault(_parser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var bodyParser = require('body-parser');
var express = require('express');
var router = express.Router();
var logger = require('morgan');
var path = require('path');
var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
// const config = require('../config');
var config = require('../defaultConfig');
var request = require('request');
var moment = require('moment');

var Transaction = require('../models/transaction');

var app = express();
mongoose.connect(config.database);

var db = mongoose.connection;

db.on('error', function () {
  console.info('Error: Could not connect to MongoDB. Did you forget to run `mongod`?');
});

var allowCrossDomain = function allowCrossDomain(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, X-Requested-With, Access-Token');
  // intercept OPTIONS method
  'OPTIONS' == req.method ? res.sendStatus(200) : next();
};

// Configuration
app.use(allowCrossDomain);
app.set('port', config.port);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(router);
// app.use(express.static(path.join(__dirname, 'public')));

router.param('collectionName', function (req, res, next, collectionName) {
  req.collection = db.collection(collectionName);
  console.log('req.body blah', req.body, req.query, req.params);
  next();
});

router.route('/collections')
//get all collections
.get(function (req, res, next) {
  mongoose.connection.db.listCollections().toArray(function (err, names) {
    if (err) return next(err);
    res.send(names);
  });
});

router.route('/collections/:collectionName')

// GET /collections/:collectionName
.get(function (req, res, next) {
  var hasQuery = !!Object.keys(req.query).length;
  var query = req.query || {};
  if (hasQuery) {
    // Query is passed as a string so we need to transform this if need be to
    // the correct format (ie Number, boolean, etc), and that is what this parseObj
    //function does.
    if (_parser2.default[req.params.collectionName]) {
      console.log('parseObj', _parser2.default);
      query = _parser2.default[req.params.collectionName].parser(query);
    }
    req.collection.find(query).toArray(function (err, results) {
      if (err) return next(err);
      console.log(results);
      res.send(results);
    });
  } else {
    req.collection.find(query, { sort: [['_id', -1]] }).toArray(function (err, results) {
      if (err) {
        return next(err);
      }
      res.send(results);
    });
  }
})

// Add transaction
.post(function (req, res, next) {
  var item = req.body;
  if (item) {
    req.collection.insert(item, function (err) {
      if (err) return next(err);
      res.send({ status: 200, response: { transaction: transaction, text: 'Successfully saved' } });
    });
  }
});

router.route('/collections/:collectionName/:id')
// Get all transactions by contactId
.get(function (req, res, next) {
  req.collection.findOne({ '_id': new ObjectId(req.params.id) }, function (err, result) {
    console.log('err', err);
    console.log('result', result);
    if (err) return next(err);
    res.send(result);
  });
})

// update transaction
.put(function (req, res, next) {
  delete req.body._id;
  var item = req.body;
  console.log('item', item);
  req.collection.findOneAndUpdate({ _id: ObjectId(req.params.id) }, { $set: item }, function (err) {
    if (err) return next(err);
    res.send({ status: 200, response: { item: item, text: 'Successfully saved' } });
  });
});

router.route('/collections/:collectionName/:key/:value')

// Delete transaction
.delete(function (req, res, next) {
  console.log(req.body);
  var apiValue = req.params.value;
  var key = req.params.key;
  if (req.params.key === '_id') {
    apiValue = ObjectId(req.params.value);
  }
  req.collection.remove(_defineProperty({}, key, apiValue), function (err, result) {
    if (err) return next(err);
    console.log(result);
    res.send({ status: 200, response: 'Successfully deleted transaction' });
  });
}).get(function (req, res, next) {
  var apiValue = req.params.value;
  var key = req.params.key;
  if (req.params.key === '_id') {
    apiValue = ObjectId(req.params.value);
  }
  req.collection.findOne(_defineProperty({}, key, apiValue), function (err, result) {
    console.log('result', result);
    if (err) return next(err);
    if (!!result) {
      res.send(result);
    } else {
      res.send([]);
    }
  });
}).post(function (req, res, next) {
  var apiValue = req.params.value;
  var key = req.params.key;
  if (req.params.key === '_id') {
    apiValue = ObjectId(req.params.value);
  }
  var item = req.body;
  req.collection.findOne(_defineProperty({}, key, apiValue), function (err, result) {
    console.log('result', result);
    if (err) return next(err);
    if (item && (!result || result.length === 0)) {
      req.collection.insert(item, function (err) {
        if (err) return next(err);
        res.send({ status: 200, response: { item: item, text: 'Successfully saved' } });
      });
    } else if (item && !!result) {
      req.collection.findOneAndUpdate(_defineProperty({}, key, apiValue), { $set: item }, function (err) {
        if (err) return next(err);
        res.send({ status: 200, response: { item: item, text: 'Successfully saved' } });
      });
    }
  });
});

app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});

app.use('*', function (req, res, next) {
  res.sendFile(__dirname + '/index.html');
});