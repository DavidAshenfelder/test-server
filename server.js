const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();
const logger = require('morgan');
const path = require('path');
const mongoose = require('mongoose');
const mongoskin = require('mongoskin');
const DB = mongoskin.db((process.env.MONGOLAB_URI || 'localhost:27017/test'), {safe: true});
const config = require('./config');
// const config = require('./defaultConfig');
const request = require('request');
const moment = require('moment');

const Transaction = require('./models/transaction');

const app = express();
mongoose.connect(config.database);

const db = mongoose.connection;

db.on('error', function() {
  console.info('Error: Could not connect to MongoDB. Did you forget to run `mongod`?');
});

const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    // intercept OPTIONS method
    ('OPTIONS' == req.method) ? res.send(200) : next();
};

// Configuration
app.use(allowCrossDomain);
app.use(router);
app.set('port', config.port);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.static(path.join(__dirname, 'public')));

router.param('collectionName', function(req, res, next, collectionName) {
  console.log('DB', DB.collection );
  req.collection = DB.collection(collectionName);
  next();
});

//get all collections
app.get('/collections', (req, res, next) => {
  mongoose.connection.db.listCollections().toArray(function(err, names) {
      if(err) return next(err);
      res.send(names);
  });
});

router.route('/:collectionName')

// GET /collections/:collectionName
.get(function(req, res, next) {
  const hasQuery = !!Object.keys(req.query).length;
  const query = req.query || {};
  if (hasQuery) {
    console.log(req.collection);
    req.collection.findOne({_id: query.id}, {}, (err, results) => {
      console.log('documents', query, err);
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
// Delete transaction
.delete((req, res, next) => {

  const body = bodyParser(req.body);
  console.log('body', body);

  req.collection.remove({ _id: req.body.id }, (err, result) => {
    if(err) return next(err);
    console.log(result);
    res.send({ status: 200, response: `Successfully deleted transaction` });
  });
});

router.route('/:collectionName/:attrKey/:keyValue')
// Get all transactions by contactId
.get((req, res, next) => {
  const attrKey = req.params.attrKey;
  const value = req.params.keyValue;
  console.log(value);
  const query = {
    [attrKey]: value
  }
  console.log('query', query);
  req.collection.find(query).toArray((err, documents) => {
    console.log('err', err);
    console.log('documents', documents);
    if(err) return next(err);
    res.send(documents);
  });
});

// Get transaction by id
app.get('/:collectionName/:id', (req, res, next) => {
  Transaction.findOne({_id: req.params.id}, (err, transaction) => {
    if(err) return next(err);
    res.send(transaction);
  });
});

// Add transaction
app.post('/transactions', (req, res, next) => {
    var body = req.body;
    console.log('body', body);
    const transaction = new Transaction({
      name: body.name,
      dateAdded: moment(),
    });
    transaction.save(function (err) {
      if(err) return next(err);
      res.send({ status: 200, response: { transaction, text: `Successfully saved` } });
    });
});

// update transaction
app.put('/transaction/:id', (req, res, next) => {
  var transaction = req.body;
  Transaction.findOneAndUpdate({_id: req.params.id}, transaction, function(err) {
    console.log('error');
    if(err) return next(err);
    console.log('no error');
    res.send({ status: 200, response: { transaction, text: `Successfully saved` } });
  });
});



app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

// app.use('*', function(req, res, next) {
//   res.sendFile(__dirname + '/index.html');
// });
