const Trade = require('../models/Trade');

// Buy Stock
exports.buyStock = async (req, res) => {
  const { stockSymbol, amount, price } = req.body;

  try {
    console.log("stock symbol: ", stockSymbol)
    console.log("amount: ", amount)
    console.log("price: ", price)
    // Ensure all necessary data is provided
    if (!stockSymbol || !amount || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create the trade object
    const trade = {
      userId: req.user.id, // Retrieved from auth middleware
      type: 'buy',
      stockSymbol,
      amount,
      price,
      date: new Date().toISOString(), // Current time in ISO format
    };

    console.log("trade", trade)

    // Save the trade to the database
    const savedTrade = await Trade.addTrade(trade);

    res.status(201).json({ msg: 'Buy trade recorded successfully', trade: savedTrade });
  } catch (err) {
    console.error('Error recording buy trade:', err.message || err);
    res.status(500).json({ error: 'Failed to record buy trade. Please try again later.' });
  }
};

// Sell Stock
exports.sellStock = async (req, res) => {
  const { stockSymbol, amount, price } = req.body;

  try {
    // Ensure all necessary data is provided
    if (!stockSymbol || !amount || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create the trade object
    const trade = {
      userId: req.user.id, // Retrieved from auth middleware
      type: 'sell',
      stockSymbol,
      amount,
      price,
      date: new Date().toISOString(), // Current time in ISO format
    };

    // Save the trade to the database
    const savedTrade = await Trade.addTrade(trade);

    res.status(201).json({ msg: 'Sell trade recorded successfully', trade: savedTrade });
  } catch (err) {
    console.error('Error recording sell trade:', err.message || err);
    res.status(500).json({ error: 'Failed to record sell trade. Please try again later.' });
  }
};

// Get Trades
exports.getTrades = async (req, res) => {
  try {
    // Retrieve all trades for the logged-in user
    const trades = await Trade.getTradesByUserId(req.user.id);

    if (!trades || trades.length === 0) {
      return res.status(404).json({ msg: 'No trades found for this user.' });
    }

    res.status(200).json(trades);
  } catch (err) {
    console.error('Error fetching trades:', err.message || err);
    res.status(500).json({ error: 'Failed to fetch trades. Please try again later.' });
  }
};
