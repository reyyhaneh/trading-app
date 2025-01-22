const express = require('express');
const router = express.Router();
const {getProfitLoss, getProfitLossChart, getUserScore, getBalance} = require('../controllers/profileController')
const {getUserAssets} = require('../controllers/assetController')
const auth = require('../middleware/auth');

router.get('/pl', auth, getProfitLoss);
router.get('/pl-chart', auth, getProfitLossChart);
router.get('/score', auth, getUserScore);
router.get('/balance', auth, getBalance);
router.get('/assets', auth, getUserAssets);


module.exports = router;

