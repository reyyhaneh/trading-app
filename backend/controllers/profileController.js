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

// Helper function to safely format numbers
const formatNumber = (value) => {
  return parseFloat(value || 0).toFixed(2);
};


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

  console.log(`🔍 Fetching Profit/Loss for User ID: ${userId}`);

  try {
    // Get user portfolio
    const query = `
      SELECT stock_symbol, total_amount, total_spent, total_earned, avg_cost_per_unit, profit_loss
      FROM user_portfolio
      WHERE user_id = $1;
    `;
    const { rows: portfolio } = await pool.query(query, [userId]);

    // Log portfolio details
    console.log('📊 User Portfolio:', JSON.stringify(portfolio, null, 2));

    // If no assets, return 0
    if (!portfolio.length) {
      console.log('ℹ️ No assets found for this user.');
      return res.json({ profitLoss: 0, message: "No assets found." });
    }

    // Get symbols for price check
    const assetSymbols = portfolio.map(item => item.stock_symbol);
    console.log('💹 Fetching Prices for Symbols:', assetSymbols);

    // Fetch current prices
    const prices = await priceService.getCurrentPrices(assetSymbols);
    console.log('💰 Fetched Prices:', JSON.stringify(prices, null, 2));

    // Calculate profit/loss for each asset
    const profitLossResults = portfolio.map(item => {
      const { stock_symbol, total_amount, total_spent, total_earned, avg_cost_per_unit, profit_loss } = item;
      const currentPrice = parseFloat(prices[stock_symbol]) || 0;
      const currentValue = total_amount * currentPrice;

      console.log(`🔢 Calculating Profit/Loss for ${stock_symbol}:
        - Total Amount: ${total_amount}
        - Total Spent: ${total_spent}
        - Total Earned: ${total_earned}
        - Avg Cost Per Unit: ${avg_cost_per_unit}
        - Profit/Loss So Far: ${profit_loss}
        - Current Price: ${currentPrice}
        - Current Value: ${currentValue}
      `);

      // Final profit/loss calculation:
      const totalProfitLoss = parseFloat(profit_loss) + currentValue - parseFloat(total_spent);

      console.log(`📈 Final Profit/Loss for ${stock_symbol}: ${totalProfitLoss}`);

      return {
        assetSymbol: stock_symbol,
        profitLoss: formatNumber(totalProfitLoss),
        totalAmount: formatNumber(total_amount),
        totalSpent: formatNumber(total_spent),
        totalEarned: formatNumber(total_earned),
        avgCostPerUnit: formatNumber(avg_cost_per_unit),
        currentPrice: formatNumber(currentPrice),
      };
      
    });

    console.log('✅ Final Profit/Loss Results:', JSON.stringify(profitLossResults, null, 2));

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