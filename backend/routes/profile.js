const express = require('express');
const router = express.Router();
const {getProfitLoss, getProfitLossChart, getUserScore, getBalance} = require('../controllers/profileController')
const {getUserAssets} = require('../controllers/assetController')
const auth = require('../middleware/auth');
const {getUserProgress, addTask, updateTaskProgress} = require('../controllers/progressController')


router.get('/pl', auth, getProfitLoss);
router.get('/pl-chart', auth, getProfitLossChart);
router.get('/score', auth, getUserScore);
router.get('/balance', auth, getBalance);
router.get('/assets', auth, getUserAssets);
router.get('/progress', auth, getUserProgress);
router.post('/task', auth, addTask);
router.put('/task/progress', auth, updateTaskProgress);

module.exports = router;

