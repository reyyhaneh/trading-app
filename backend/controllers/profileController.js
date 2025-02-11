const priceService = require('../services/priceService')
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

    let assetData = {}; // To hold profit/loss data for each asset symbol

    // Process each trade to calculate profit/loss per asset
    for (let trade of trades) {

      const { amount, price, type, stock_symbol } = trade;  // Directly use stock_symbol

      if (!stock_symbol) {
        console.warn(`Trade with missing stock_symbol: ${JSON.stringify(trade)}`);
        continue;  // Skip this trade if stock_symbol is undefined or null
      }

      // Initialize asset data if not already set
      if (!assetData[stock_symbol]) {
        assetData[stock_symbol] = { totalAmount: 0, totalCost: 0, currentPrice: 0, profitLoss: 0 };
      }

      const tradeAmount = parseFloat(amount);
      const tradePrice = parseFloat(price);

      // Update total amount and total cost based on trade type
      if (type === 'buy') {
        assetData[stock_symbol].totalAmount += tradeAmount;
        assetData[stock_symbol].totalCost += tradeAmount * tradePrice;
      } else if (type === 'sell') {
        assetData[stock_symbol].totalAmount -= tradeAmount;
        assetData[stock_symbol].totalCost -= tradeAmount * tradePrice;
      }
    }

    // Now calculate profit/loss for each asset
    const profitLossResults = [];
    for (let assetSymbol in assetData) {
      const { totalAmount, totalCost } = assetData[assetSymbol];
      console.log("asset symbil:", assetSymbol)
      // Fetch current price for the asset (using original stock_symbol)
      const currentPrice = await priceService.getCurrentPrice(assetSymbol);
      console.log("current price:",currentPrice)

      // Calculate the profit or loss for this asset
      const currentValue = totalAmount * currentPrice;
      const profitLoss = currentValue - totalCost;

      profitLossResults.push({
        assetSymbol,
        profitLoss: profitLoss.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        totalCost: totalCost.toFixed(2),
        currentPrice: currentPrice.toFixed(2),
      });
      console.log("profit loss:", profitLossResults)
    }

    res.json({ profitLossResults });

  } catch (err) {
    console.error('Error getting profit loss:', err);
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

    res.status(200).json({ balance: parseFloat(balance) });
    
    } catch (err) {
      console.error('Error fetching balance:', err);
      res.status(500).json({error: 'Server error'});
    }
};