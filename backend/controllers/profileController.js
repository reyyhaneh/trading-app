const priceService = require('../services/priceService')
const Trade = require('../models/Trade');
const axios = require('axios');

const User = require('../models/User'); // ✅ Import User model
const pool = require('../config/db'); // ✅ Ensure database connection is imported

const UserPortfolio = require('../models/UserPortfolio');

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
  try {
    // Get user portfolio
    const portfolio  = await UserPortfolio.getPortfolio(req.user.id)

    // Log portfolio details
    console.log('📊 User Portfolio:', JSON.stringify(portfolio, null, 2));

    // Get symbols for price check
    const assetSymbols = portfolio.map(item => item.stock_symbol);
    console.log('💹 Fetching Prices for Symbols:', assetSymbols);

    // Fetch current prices
    const prices = await priceService.getCurrentPrices(assetSymbols);
    console.log('💰 Fetched Prices:', JSON.stringify(prices, null, 2));

    // Calculate profit/loss for each asset
    const profitLossResults = portfolio.map(item => {
      const {
        stock_symbol, total_amount, total_spent, total_earned,
        avg_cost_per_unit, profit_loss
      } = item;
    
      const safeTotalAmount = !isNaN(parseFloat(total_amount)) ? parseFloat(total_amount) : 0;
      const safeTotalSpent = !isNaN(parseFloat(total_spent)) ? parseFloat(total_spent) : 0;
      const safeTotalEarned = !isNaN(parseFloat(total_earned)) ? parseFloat(total_earned) : 0;
      const safeAvgCostPerUnit = !isNaN(parseFloat(avg_cost_per_unit)) ? parseFloat(avg_cost_per_unit) : 0;
      const safeProfitLoss = !isNaN(parseFloat(profit_loss)) ? parseFloat(profit_loss) : 0;

      const currentPrice = parseFloat(prices[stock_symbol]) || 0;
      const currentValue = safeTotalAmount * currentPrice;

      console.log(`🔢 Debug: Calculating Profit/Loss for ${stock_symbol}`);
      console.log({ safeTotalAmount, safeTotalSpent, safeTotalEarned, safeAvgCostPerUnit, safeProfitLoss });
    
      return {
        assetSymbol: stock_symbol,
        profitLoss: safeProfitLoss.toFixed(2),
        totalAmount: safeTotalAmount.toFixed(2),
        totalSpent: safeTotalSpent.toFixed(2),
        totalEarned: safeTotalEarned.toFixed(2),
        avgCostPerUnit: safeAvgCostPerUnit.toFixed(2),
        currentPrice: currentPrice.toFixed(2),
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