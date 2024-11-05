const express = require('express');
const router = express.Router();
const priceService = require('../services/priceService');

router.get('/usd', async (req, res) => {
  try {
    const usdPrice = await priceService.getBitcoinPrice();
    res.json({ price: usdPrice });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch price' });
  }
});

module.exports = router;
