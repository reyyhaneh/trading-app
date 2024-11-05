const express = require('express');
const router = express.Router();
const btcService = require('../services/priceService');

// Route to get historical Bitcoin prices
router.get('/history', async (req, res) => {
  const { days } = req.query;  // Default to 30 days if not provided
  try {
    const prices = await btcService.getBtcHistoricalPrices(days || 30);
    res.json({ prices });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch Bitcoin historical prices' });
  }
});

module.exports = router;
