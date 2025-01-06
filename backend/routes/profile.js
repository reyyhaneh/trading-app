const express = require('express');
const router = express.Router();
const {getProfitLoss, getProfitLossChart} = require('../controllers/profileController')
const auth = require('../middleware/auth');

router.get('/pl', auth, getProfitLoss);
router.get('/pl-chart', auth, getProfitLossChart);

module.exports = router;

