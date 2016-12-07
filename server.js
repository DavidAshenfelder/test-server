const bodyParser = require('body-parser');
const express = require('express');
const logger = require('morgan');
const path = require('path');
const mongoose = require('mongoose');
const config = require('./config');
const request = require('request');
const moment = require('moment');

const Transaction = require('./models/transaction');

const app = express();

mongoose.connect(config.database);
mongoose.connection.on('error', function() {
  console.info('Error: Could not connect to MongoDB. Did you forget to run `mongod`?');
});

app.set('port', config.port);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Add transaction
app.post('/transactions', (req, res, next) => {
    var body = req.body;
    console.log('body', body);
    const transaction = new Transaction({
      name: body.name,
      dateAdded: moment(),
    });
    transaction.save(function (err) {
      if(err) return next({ err });
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

// Get all transactions
app.get('/transactions', (req, res, next) => {
  Transaction.find((err, transactions) => {
    if(err) return next(err);
    res.send(transactions);
  });
});

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

app.use('*', function(req, res, next) {
  res.sendFile(__dirname + '/public/index.html');
});
