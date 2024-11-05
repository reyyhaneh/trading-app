const { readTradesFromFile, writeTradesToFile, findTradeById, saveTrade } = require('../models/Trade');
const { v4: uuidv4 } = require('uuid');


exports.buyStock = (req, res) => {
  const { stockSymbol, amount, price } = req.body;

  const trade = {
    id: uuidv4(),
    type: 'buy',
    stockSymbol,
    amount,
    price,
    date: new Date().toISOString(),
    user: req.user.email,  // Assuming user is added to the request by auth middleware
  };

  // Here you would add the logic to handle the actual buying of stocks via the API

  saveTrade(trade);

  res.status(201).json({ msg: 'Buy trade recorded', trade });
};

exports.sellStock = (req, res) => {
  const { stockSymbol, amount, price } = req.body;

  const trade = {
    id: uuidv4(),
    type: 'sell',
    stockSymbol,
    amount,
    price,
    date: new Date().toISOString(),
    user: req.user.email,  // Assuming user is added to the request by auth middleware
  };

  // Here you would add the logic to handle the actual selling of stocks via the API

  saveTrade(trade);

  res.status(201).json({ msg: 'Sell trade recorded', trade });
};

exports.getTrades = (req, res) => {
  const trades = readTradesFromFile();
  const userTrades = trades.filter(trade => trade.user === req.user.email);
  res.json(userTrades);
};
