const Trade = require('../models/Trade');
const User = require('../models/User');
const UserAssets = require('../models/UserAssets')



const { updateScore } = require('../models/User');

const calculateScore = (type, amount, price) => {
  const baseScore = Math.round(amount * price * 0.01); // 1% of trade value as points
  return type === 'buy' ? baseScore : baseScore * 1.5; // Selling gets 50% extra points
};
// Buy Stock
exports.buyStock = async (req, res) => {
  const { stockSymbol, amount, price } = req.body;

  try {
    // Validate input
    if (!stockSymbol || !amount || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Await the balance retrieval
    const balance = await User.getBalance(req.user.id);
    const cost = amount * price; // total cost of this buy

    if (balance < cost) {
      return res.status(400).json({ error: 'Insufficient funds for this trade.' });
    }

    const newBalance = balance - cost;
    await User.updateBalance(req.user.id, newBalance);

    const trade = {
      userId: req.user.id,
      type: 'buy',
      stockSymbol,
      amount,
      price,
      date: new Date().toISOString(),
    };

    const savedTrade = await Trade.addTrade(trade);
    console.log(stockSymbol)
    console.log(amount)

    await UserAssets.addOrUpdateAsset(req.user.id, stockSymbol, amount);


    const scoreChange = calculateScore('buy', amount, price);
    await updateScore(req.user.id, scoreChange, 'Executed a buy trade');

    res.status(201).json({ msg: 'Buy trade recorded successfully', trade: savedTrade, newBalance });
  } catch (err) {
    console.error('Error recording buy trade:', err.message || err);
    res.status(500).json({ error: 'Failed to record buy trade. Please try again later.' });
  }
};

// Sell Stock
exports.sellStock = async (req, res) => {
  const { stockSymbol, amount, price } = req.body;

  try {
    if (!stockSymbol || !amount || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Await the balance retrieval
    const balance = await User.getBalance(req.user.id);
    const proceeds = amount * price; 

    const newBalance = Number(balance) + proceeds; 
    await User.updateBalance(req.user.id, newBalance);

    const trade = {
      userId: req.user.id,
      type: 'sell',
      stockSymbol,
      amount,
      price,
      date: new Date().toISOString(),
    };

    const savedTrade = await Trade.addTrade(trade);
    await UserAssets.reduceAsset(req.user.id, stockSymbol, amount);


    const scoreChange = calculateScore('sell', amount, price);
    await updateScore(req.user.id, scoreChange, 'Executed a sell trade');

    res.status(201).json({
      msg: 'Sell trade recorded successfully',
      trade: savedTrade,
      newBalance,
    });
  } catch (err) {
    console.error('Error recording sell trade:', err.message || err);
    res.status(500).json({
      error: 'Failed to record sell trade. Please try again later.',
    });
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
