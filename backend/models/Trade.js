const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/trades.json');

const initializeFile = () => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
};

const readTradesFromFile = () => {
  try {
    initializeFile();
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading trades from file:', error);
    return [];
  }
};

const writeTradesToFile = (trades) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(trades, null, 2));
  } catch (error) {
    console.error('Error writing trades to file:', error);
  }
};

const getUserTrades = (email) => {
  try{
    const data = fs.readFileSync(filePath, 'utf-8');
    const trades = JSON.parse(data);

    const userTrades = trades.filter(trade => trade.user === email);
    return userTrades;

  } catch (error) {
    console.error('Error reading user trades:', error);
  }
}

module.exports = {
  readTradesFromFile,
  writeTradesToFile,
  getUserTrades,
  findTradeById: (id) => {
    const trades = readTradesFromFile();
    return trades.find(trade => trade.id === id);
  },
  saveTrade: (trade) => {
    const trades = readTradesFromFile();
    trades.push(trade);
    writeTradesToFile(trades);
  },
};
