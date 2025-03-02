const express = require('express');
const router = express.Router();
const { buyStock, sellStock, getTrades } = require('../controllers/tradeController');
const auth = require('../middleware/auth');
const { trackTrade } = require('../middleware/trackTrade');

// Buy a stock (protected route)
router.post('/buy', auth, trackTrade, buyStock);

// Sell a stock (protected route)
router.post('/sell', auth, trackTrade, sellStock);

// Get user trades (protected route)
router.get('/', auth, getTrades);

module.exports = router;
