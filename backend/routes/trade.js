const express = require('express');
const router = express.Router();
const { buyStock, sellStock, getTrades } = require('../controllers/tradeController');
const auth = require('../middleware/auth');
const { preTradeCheck } = require('../middleware/trackTrade');

// Buy a stock (protected route)
router.post('/buy', auth, preTradeCheck, buyStock);

// Sell a stock (protected route)
router.post('/sell', auth, preTradeCheck, sellStock);

// Get user trades (protected route)
router.get('/', auth, getTrades);

module.exports = router;
