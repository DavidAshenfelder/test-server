'use strict';

var _parser = require('./Helpers/parser.js');

var _parser2 = _interopRequireDefault(_parser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

router.route('/:collectionName')

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

router.route('/:collectionName/:id')
// Get all transactions by contactId
.get(function (req, res, next) {
  req.collection.findOne({ '_id': new ObjectId(req.params.id) }, function (err, result) {
    console.log('err', err);
    console.log('result', result);
    if (err) return next(err);
    res.send(result);
  });
})

// Delete transaction
.delete(function (req, res, next) {
  console.log(req.body);
  req.collection.remove({ transactionId: ObjectId(req.params.id) }, function (err, result) {
    if (err) return next(err);
    console.log(result);
    res.send({ status: 200, response: 'Successfully deleted transaction' });
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

app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});

app.use('*', function (req, res, next) {
  res.sendFile(__dirname + '/index.html');
});