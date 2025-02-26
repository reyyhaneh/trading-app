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
// Calculate profit/loss using average cost
exports.getProfitLoss = async (req, res) => {
  const userId = req.user.id;

  try {
    console.log(`📢 Fetching trades for user: ${userId}`);

    // Fetch user trades
    const trades = await Trade.getTradesByUserId(userId);

    if (!trades.length) {
      console.log("ℹ️ No trades found for user.");
      return res.json({ profitLoss: 0, message: "No trades found." });
    }

    let assetData = {}; // Store total spent, total earned, and amount per asset
    let assetSymbols = new Set(); // Store unique asset symbols for batch request

    // Process each trade
    for (let trade of trades) {
      const { amount, price, type, stock_symbol } = trade;

      if (!stock_symbol) {
        console.warn(`⚠️ Trade with missing stock_symbol: ${JSON.stringify(trade)}`);
        continue;
      }

      if (!assetData[stock_symbol]) {
        assetData[stock_symbol] = { totalAmount: 0, totalSpent: 0, totalEarned: 0, profitLoss: 0 };
      }

      const tradeAmount = parseFloat(amount);
      const tradePrice = parseFloat(price);
      const totalValue = tradeAmount * tradePrice;

      // Update total spent & earned based on trade type
      if (type === "buy") {
        assetData[stock_symbol].totalAmount += tradeAmount;
        assetData[stock_symbol].totalSpent += totalValue;
      } else if (type === "sell") {
        assetData[stock_symbol].totalAmount -= tradeAmount;
        assetData[stock_symbol].totalEarned += totalValue;
      }

      console.log(`📊 Updated Data for ${stock_symbol}:`, assetData[stock_symbol]);
    }
    const symbolsArray = Array.from(assetSymbols);
    console.log(`🛒 Fetching prices for: ${symbolsArray.join(", ")}`);

    const prices = await priceService.getCurrentPrices(symbolsArray); // Fetch all prices at once!

    // Now calculate profit/loss
    const profitLossResults = [];
    for (let assetSymbol in assetData) {
      const { totalAmount, totalSpent, totalEarned } = assetData[assetSymbol];
      const currentPrice = prices[assetSymbol] || 0;

      // Calculate the current value of the asset
      const currentValue = totalAmount * currentPrice;

      // Correct profit/loss calculation:
      const profitLoss = totalEarned + currentValue - totalSpent;

      console.log(`🔎 Calculations for ${assetSymbol}:
        - Total Amount: ${totalAmount}
        - Total Spent: ${totalSpent}
        - Total Earned: ${totalEarned}
        - Current Price: ${currentPrice}
        - Current Value: ${currentValue}
        - Profit/Loss: ${profitLoss}
      `);

      profitLossResults.push({
        assetSymbol,
        profitLoss: profitLoss.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        totalSpent: totalSpent.toFixed(2),
        totalEarned: totalEarned.toFixed(2),
        currentPrice: currentPrice.toFixed(2),
      });
    }

    console.log("✅ Final Profit/Loss Results:", profitLossResults);

    res.json({ profitLossResults });
  } catch (err) {
    console.error("❌ Error getting profit loss:", err);
    res.status(500).send("Server error");
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