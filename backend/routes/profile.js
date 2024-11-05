const express = require('express');
const router = express.Router();
const {getProfitLoss, getProfitLossByTrades} = require('../controllers/profileController')
const auth = require('../middleware/auth');

router.get('/pl', auth, getProfitLoss);
router.get('/pl-chart', auth, getProfitLossByTrades);

module.exports = router;

