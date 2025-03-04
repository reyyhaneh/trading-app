const Trade = require('../models/Trade');
const User = require('../models/User');
const UserAssets = require('../models/UserAssets')



const { updateScore } = require('../models/User');

const calculateScore = (type, amount, price) => {
  const baseScore = Math.round(amount * price * 0.01); // 1% of trade value as points
  return type === 'buy' ? baseScore : baseScore * 1.5; // Selling gets 50% extra points
};
// Buy Stock
exports.buyStock = async (req, res, next) => {
  console.log("in buystock")
  try {
    const { userId, stockSymbol, parsedAmount, parsedPrice, cost, balance } = res.locals.tradeData;

    if (!stockSymbol || !parsedAmount || !parsedPrice) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newBalance = (balance - cost).toFixed(8);
    console.log(newBalance)
    await User.updateBalance(userId, newBalance); // Deduct cost from balance
    console.log("balance updated")

    const trade = {
      userId: req.user.id,
      type: 'buy',
      stockSymbol,
      amount:parsedAmount,
      price:parsedPrice,
      date: new Date().toISOString(),
    };

    await UserAssets.addOrUpdateAsset(userId, stockSymbol, parsedAmount);
    console.log("assets updated.")

    res.locals.trade = trade; // Pass trade data to next middleware
    console.log("next")
    next();
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

    const balance = parseFloat(await User.getBalance(req.user.id)); // Ensure Float(8)

    const proceeds = parseFloat((amount * price).toFixed(8));

    const newBalance = (balance + proceeds).toFixed(8);
    console.log(`
      - balance: ${balance}
      - proceeds: ${proceeds}
      - new balance (balance + proceeds): ${newBalance}
      `)
    await User.updateBalance(req.user.id, newBalance);
    console.log("balance updated")

    const trade = {
      userId: req.user.id,
      type: 'sell',
      stockSymbol,
      amount,
      price,
      date: new Date().toISOString(),
    };
    console.log("sell trade: ", trade)

    const savedTrade = await Trade.addTrade(trade);
    console.log("sell trade saved")
    await UserAssets.reduceAsset(req.user.id, stockSymbol, amount);
    console.log("asset reduced.")
    

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
