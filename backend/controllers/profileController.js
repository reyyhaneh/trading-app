// profileController.js
const Trade = require('../models/Trade');
const axios = require('axios');


/*
Implement a calculator function 
that calculates the profit / loss
per each trade.
---
const calculate = async (trade) => {
  current btc price = await "coingecko"
  }
*/

const calculateProfitLossOverTime = (trades, currentPrice) => {
  let cumulativeProfitLoss = 0;
  const profitLossData = trades.map(trade => {
    const tradeAmount = Number(trade.amount);
    const tradePrice = Number(trade.price);

    // Calculate profit or loss per trade
    if (trade.type === 'buy') {
      cumulativeProfitLoss -= tradeAmount * tradePrice;
    } else if (trade.type === 'sell') {
      cumulativeProfitLoss += tradeAmount * tradePrice;
    }

    return {
      date: trade.date,
      profitLoss: cumulativeProfitLoss + tradeAmount * currentPrice
    };
  });
  console.log(profitLossData);

  return profitLossData;
};

exports.getProfitLoss = async (req, res) => {
  
  const email = req.user.email;
  
  try {
    // Fetch user trades
    const trades = await Trade.getUserTrades(email);
    console.log("trades: ", trades)
    console.log("trades length:", trades.length)

    if (!trades.length) return res.json({ profitLoss: 0, message: 'No trades found.' });

    // Fetch the current Bitcoin price
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: 'bitcoin',
        vs_currencies: 'usd'
      }
    });
    const currentPrice = response.data.bitcoin.usd;

    let totalAmount = 0;
    let totalCost = 0;
    
    trades.forEach((trade) => {
      const tradeAmount = Number(trade.amount);
      const tradePrice = Number(trade.price);
    
      if (trade.type === 'buy') {
        totalAmount += tradeAmount;
        totalCost += tradeAmount * tradePrice;
      } else if (trade.type === 'sell') {
        totalAmount -= tradeAmount;
        totalCost -= tradeAmount * tradePrice;
      }
    });
    
    const averageCost = totalAmount > 0 ? totalCost / totalAmount : 0;
    const currentValue = totalAmount > 0 ? totalAmount * currentPrice : 0;
    const profitLoss = totalAmount > 0 ? currentValue - totalCost : 0;
    
  
    res.json({ profitLoss, averageCost, currentValue });
    
  } catch (err) {
    console.error('error getting profit loss:', err);
    res.status(500).send('Server error');
  }
};


// Assuming trades is an array of user's trades
exports.getProfitLossByTrades = async (req,res) => {
  const email = req.user.email;

  try{
    const trades = await Trade.getUserTrades(email);    

    if (!trades.length) return res.json({ profitLoss: 0, message: 'No trades found.' });

    
    // Fetch the current Bitcoin price
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: 'bitcoin',
        vs_currencies: 'usd'
      }
    });
    const currentPrice = response.data.bitcoin.usd;

    return calculateProfitLossOverTime(trades, currentPrice);

  } catch(error){
    console.error("error in getProfitLossByTrades", error);
  }
};



