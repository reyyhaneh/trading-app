// profileController.js
const Trade = require('../models/Trade');
const axios = require('axios');

const User = require('../models/User'); // ✅ Import User model
const pool = require('../config/db'); // ✅ Ensure database connection is imported

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

  return profitLossData;
};

exports.getProfitLoss = async (req, res) => {
  
  const userId = req.user.id;
  
  try {
    // Fetch user trades
    const trades = await Trade.getTradesByUserId(userId);

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


exports.getProfitLossChart = async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from authenticated request

    // Fetch trades from the database
    const trades = await Trade.getTradesByUserId(userId);

    if (!trades.length) {
      return res.status(200).json([]); // No trades found
    }

    // Format trades for the chart
    const chartData = trades.map(trade => ({
      date: trade.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
      profitLoss: parseFloat(trade.profit_loss), // Ensure numeric format
    }));

    return res.status(200).json(chartData);
  } catch (err) {
    console.error('Error fetching profit/loss data:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.getUserScore = async (req, res) => {
  try {

    const { id } = req.user;

    // Ensure User model is being used correctly
    const result = await pool.query('SELECT score FROM users WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      console.warn("⚠️ User not found in database with ID:", id);
      return res.status(404).json({ error: 'User not found' });
    }

    const userScore = result.rows[0].score;

    res.status(200).json({ score: userScore });
  } catch (error) {
    console.error("❌ Error fetching user score:", error);
    res.status(500).json({ error: 'Failed to fetch user score' });
  }
};


exports.getBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const balance = await User.getBalance(userId);

    if (balance === null) {
      return res.status(404).json({ error: 'User not found or no balance available' });
    }

    console.log(balance)
    res.status(200).json({ balance: parseFloat(balance) });
    
    } catch (err) {
      console.error('Error fetching balance:', err);
      res.status(500).json({error: 'Server error'});
    }
};