const bodyParser = require('body-parser');
const express = require('express');
const logger = require('morgan');
const path = require('path');
const mongoose = require('mongoose');
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
app.set('port', config.port);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//get all collections
app.get('/collections', (req, res, next) => {
  mongoose.connection.db.listCollections().toArray(function(err, names) {
      if(err) return next(err);
      res.send(names);
  });
});


// Get all transactions
app.get('/transactions', (req, res, next) => {
  Transaction.find((err, transactions) => {
    if(err) return next(err);
    res.send(transactions);
  });
});

// Get all transactions by contactId
app.get('/transactions/:contactId', (req, res, next) => {
  Transaction.find({contactId: req.params.contactId}, (err, transactions) => {
    if(err) return next(err);
    res.send(transactions);
  });
});

// Get transaction by id
app.get('/transaction/:id', (req, res, next) => {
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

// Delete transaction
app.delete('/transactions', (req, res, next) => {
  console.log('body', req.body);
  Transaction.remove({ _id: req.body.id }, (err, transaction) => {
    if(err) return next(err);
    console.log(transaction);
    res.send({ status: 200, response: `Successfully deleted transaction` });
  });
});

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

app.use('*', function(req, res, next) {
  res.sendFile(__dirname + '/public/index.html');
});
