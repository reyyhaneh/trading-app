const Trade = require('../models/Trade');
const User = require('../models/User');
const UserAssets = require('../models/UserAssets')
const UserTask = require('../models/UserTask')

const executeInTransaction = require('../utils/transactionHandler');



const { updateScore } = require('../models/User');

const calculateScore = (type, amount, price) => {
  const baseScore = Math.round(amount * price * 0.01); // 1% of trade value as points
  return type === 'buy' ? baseScore : baseScore * 1.5; // Selling gets 50% extra points
};
// Buy Stock
// exports.buyStock = async (req, res, next) => {
//   try {
//     const { userId, stockSymbol, parsedAmount, parsedPrice, cost } = res.locals.tradeData;
//     const balance = await User.getBalance(userId)
//     console.log(balance)

//     // Ensure required fields exist
//     if (!stockSymbol || !parsedAmount || !parsedPrice || balance === undefined) {
//       return res.status(400).json({ error: 'Missing required fields or balance issue.' });
//     }

//     // 🔹 Calculate and update user balance
//     const newBalance = parseFloat((balance - cost).toFixed(8));
//     console.log(`💰 New Balance: ${newBalance}`);
//     await User.updateBalance(userId, newBalance);
//     console.log("✅ Balance updated");

//     // 🔹 Create the trade object
//     const trade = {
//       userId,
//       type: 'buy',
//       stockSymbol,
//       amount: parsedAmount,
//       price: parsedPrice,
//       date: new Date().toISOString(),
//     };

//     // 🔹 Update User Assets
//     await UserAssets.addOrUpdateAsset(userId, stockSymbol, parsedAmount);
//     console.log("✅ User assets updated");

//     console.log(calculateScore('sell', amount, price))
//     const scoreChange = Math.round(calculateScore('sell', amount, price));
//     console.log("score change: ", scoreChange, "type: ", typeof(scoreChange));
//     await User.updateScore(req.user.id, scoreChange, 'Executed a sell trade');


//     // 🔹 Pass trade data to the next middleware
//     res.locals.trade = trade;
//     console.log("🔄 Passing trade to next middleware");

//     next();
//   } catch (err) {
//     console.error('❌ Error in buyStock middleware:', err.message || err);
//     res.status(500).json({ error: 'Failed to process buy trade. Please try again later.' });
//   }
// };

exports.buyStock = async (req, res) => {
  try {
    const { userId, stockSymbol, parsedAmount, parsedPrice } = res.locals.tradeData;

    const newBalance = await User.getBalance(userId) - (parsedAmount * parsedPrice);
    console.log("new balance: ", newBalance)
    const scoreChange = Math.round(parsedAmount * parsedPrice * 0.01); // Score logic
    console.log("score change: ", scoreChange)

    await Trade.execute(userId, newBalance, stockSymbol, parsedAmount, scoreChange, "buy", parsedAmount, parsedPrice, stockSymbol);

    res.status(201).json({ msg: 'Trade executed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Trade execution failed', details: error.message });
  }
};


exports.sellStock = async (req, res) => {
  try {
    const { userId, stockSymbol, parsedAmount, parsedPrice } = res.locals.tradeData;
    const newBalance = await User.getBalance(userId) + (parsedAmount * parsedPrice);
    console.log("new balance: ", newBalance)
    const scoreChange = Math.round(parsedAmount * parsedPrice * 0.01); // Score logic
    console.log("score change: ", scoreChange)

    await Trade.execute(userId, newBalance, stockSymbol, parsedAmount, scoreChange, "sell", parsedAmount, parsedPrice, stockSymbol);

    res.status(201).json({ msg: 'Trade executed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Trade execution failed', details: error.message });
  }
};


// // Sell Stock
// exports.sellStock = async (req, res) => {
//   const { stockSymbol, amount, price } = req.body;
//   try {
//     if (!stockSymbol || !amount || !price) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     const balance = parseFloat(await User.getBalance(req.user.id)); // Ensure Float(8)

//     const proceeds = parseFloat((amount * price).toFixed(8));

//     const newBalance = (balance + proceeds).toFixed(8);
//     console.log(`
//       - balance: ${balance}
//       - proceeds: ${proceeds}
//       - new balance (balance + proceeds): ${newBalance}
//       `)
//     await User.updateBalance(req.user.id, newBalance);
//     console.log("balance updated")

//     const trade = {
//       userId: req.user.id,
//       type: 'sell',
//       stockSymbol,
//       amount,
//       price,
//       date: new Date().toISOString(),
//     };
//     console.log("sell trade: ", trade)

//     const savedTrade = await Trade.addTrade(trade);
//     console.log("sell trade saved")
//     await UserAssets.reduceAsset(req.user.id, stockSymbol, amount);
//     console.log("asset reduced.")
    
//     console.log(calculateScore('sell', amount, price))
//     const scoreChange = Math.round(calculateScore('sell', amount, price));
//     console.log("score change: ", scoreChange, "type: ", typeof(scoreChange));
//     await User.updateScore(req.user.id, scoreChange, 'Executed a sell trade');

//     res.status(201).json({
//       msg: 'Sell trade recorded successfully',
//       trade: savedTrade,
//       newBalance,
//     });
//   } catch (err) {
//     console.error('Error recording sell trade:', err.message || err);
//     res.status(500).json({
//       error: 'Failed to record sell trade. Please try again later.',
//     });
//   }
// };


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
