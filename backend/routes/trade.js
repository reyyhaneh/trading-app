const express = require('express');
const router = express.Router();
const { buyStock, sellStock, getTrades } = require('../controllers/tradeController');
const auth = require('../middleware/auth');
const { trackTradeProgress } = require('../middleware/progress');

// Buy a stock (protected route)
router.post('/buy', auth, trackTradeProgress, buyStock);

// Sell a stock (protected route)
router.post('/sell', auth, trackTradeProgress, sellStock);

// Get user trades (protected route)
router.get('/', auth, getTrades);

module.exports = router;
