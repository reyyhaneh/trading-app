const express = require('express');
const router = express.Router();
const { buyStock, sellStock, getTrades } = require('../controllers/tradeController');
const auth = require('../middleware/auth');
const { preTradeCheck, postTradeUpdate } = require('../middleware/trackTrade');

// Buy a stock (protected route)
router.post('/buy', auth, preTradeCheck, buyStock, postTradeUpdate);

// Sell a stock (protected route)
router.post('/sell', auth, preTradeCheck, sellStock, postTradeUpdate);

// Get user trades (protected route)
router.get('/', auth, getTrades);

module.exports = router;
