import parseObj from './Helpers/parser.js';

const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();
const logger = require('morgan');
const path = require('path');
const mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
// const config = require('../config');
const config = require('../defaultConfig');
const request = require('request');
const moment = require('moment');

const Transaction = require('../models/transaction');

const app = express();
mongoose.connect(config.database);

const db = mongoose.connection;

db.on('error', function() {
  console.info('Error: Could not connect to MongoDB. Did you forget to run `mongod`?');
});

const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, X-Requested-With, Access-Token');
    // intercept OPTIONS method
    ('OPTIONS' == req.method) ? res.sendStatus(200) : next();
};

// Configuration
app.use(allowCrossDomain);
app.set('port', config.port);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(router);
// app.use(express.static(path.join(__dirname, 'public')));

router.param('collectionName', function(req, res, next, collectionName) {
  req.collection = db.collection(collectionName);
  console.log('req.body blah', req.body, req.query, req.params);
  next();
});

router.route('/collections')
//get all collections
.get((req, res, next) => {
  mongoose.connection.db.listCollections().toArray(function(err, names) {
      if(err) return next(err);
      res.send(names);
  });
});

router.route('/collections/:collectionName')

// GET /collections/:collectionName
.get(function(req, res, next) {
  const hasQuery = !!Object.keys(req.query).length;
  let query = req.query || {};
  if (hasQuery) {
    // Query is passed as a string so we need to transform this if need be to
    // the correct format (ie Number, boolean, etc), and that is what this parseObj
    //function does.
    if (parseObj[req.params.collectionName]) {
      console.log('parseObj', parseObj);
      query = parseObj[req.params.collectionName].parser(query);
    }
    req.collection.find(query).toArray( (err, results) => {
      if(err) return next(err);
      console.log(results);
      res.send(results);
    });
  } else {
    req.collection.find(query, {sort: [['_id',-1]]}).toArray(function(err, results){
      if (err) { return next(err); }
      res.send(results);
    });
  }
})

// Add transaction
.post((req, res, next) => {
  const item = req.body;
  if (item) {
    req.collection.insert(item, function (err) {
      if(err) return next(err);
      res.send({ status: 200, response: { transaction, text: `Successfully saved` } });
    });
  }
});


router.route('/collections/:collectionName/:id')
// Get all transactions by contactId
.get((req, res, next) => {
  req.collection.findOne({'_id': new ObjectId(req.params.id)}, (err, result) => {
    console.log('err', err);
    console.log('result', result);
    if(err) return next(err);
    res.send(result);
  });
})

// update transaction
.put((req, res, next) => {
  delete req.body._id;
  var item = req.body;
  console.log('item', item);
  req.collection.findOneAndUpdate({_id: ObjectId(req.params.id)}, {$set: item}, function(err) {
    if(err) return next(err);
    res.send({ status: 200, response: { item, text: `Successfully saved` } });
  });
});

router.route('/collections/:collectionName/:key/:value')

// Delete transaction
.delete((req, res, next) => {
  console.log(req.body);
  let apiValue = req.params.value;
  const key = req.params.key;
  if (req.params.key === '_id') {
    apiValue = ObjectId(req.params.value);
  }
  req.collection.remove({ [key]: apiValue }, (err, result) => {
    if(err) return next(err);
    console.log(result);
    res.send({ status: 200, response: `Successfully deleted transaction` });
  });
})

.get((req, res, next) => {
  let apiValue = req.params.value;
  const key = req.params.key;
  if (req.params.key === '_id') {
    apiValue = ObjectId(req.params.value);
  }
  req.collection.findOne({ [key]: apiValue }, (err, result) => {
    console.log('result', result);
    if(err) return next(err);
    if (!!result) {
      res.send(result);
    } else {
      res.send([]);
    }
  });
})

.post((req, res, next) => {
  let apiValue = req.params.value;
  const key = req.params.key;
  if (req.params.key === '_id') {
    apiValue = ObjectId(req.params.value);
  }
  const item = req.body;
  req.collection.findOne({ [key]: apiValue }, (err, result) => {
    console.log('result', result);
    if(err) return next(err);
    if (item && (!result || result.length === 0)) {
      req.collection.insert(item, function (err) {
        if(err) return next(err);
        res.send({ status: 200, response: { item, text: `Successfully saved` } });
      });
    } else if (item && !!result) {
      req.collection.findOneAndUpdate({ [key]: apiValue }, {$set: item}, function(err) {
        if(err) return next(err);
        res.send({ status: 200, response: { item, text: `Successfully saved` } });
      });
    }
  });
});

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

app.use('*', function(req, res, next) {
  res.sendFile(__dirname + '/index.html');
});
