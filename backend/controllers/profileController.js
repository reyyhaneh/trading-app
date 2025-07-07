const priceService = require('../services/priceService')
const Trade = require('../models/Trade');
const axios = require('axios');

const User = require('../models/User'); // ✅ Import User model
const pool = require('../config/db'); // ✅ Ensure database connection is imported

const UserPortfolio = require('../models/UserPortfolio');


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
  try {
    const portfolio = await UserPortfolio.getPortfolio(req.user.id);
    const assetSymbols = portfolio.map(item => item.stock_symbol);
    const prices = await priceService.getCurrentPrices(assetSymbols);

    const profitLossResults = portfolio.map(item => {
      const {
        stock_symbol, total_amount, total_spent, total_earned
      } = item;

      const amount = parseFloat(total_amount || 0);
      const spent = parseFloat(total_spent || 0);
      const earned = parseFloat(total_earned || 0);
      const currentPrice = parseFloat(prices[stock_symbol]) || 0;

      const currentValue = amount * currentPrice;
      const profitLoss = currentValue + earned - spent;

      return {
        assetSymbol: stock_symbol,
        profitLoss: profitLoss.toFixed(2),
        totalAmount: amount.toFixed(2),
        totalSpent: spent.toFixed(2),
        totalEarned: earned.toFixed(2),
        avgCostPerUnit: amount > 0 ? (spent / amount).toFixed(2) : "0.00",
        currentPrice: currentPrice.toFixed(2),
        currentValue: currentValue.toFixed(2),
      };
    });

    res.json({ profitLossResults });
  } catch (err) {
    console.error('🔥 Profit/Loss Calculation Error:', err);
    res.status(500).json({ message: 'Error calculating profit/loss' });
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