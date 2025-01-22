const express = require('express');
const router = express.Router();
const priceService = require('../services/priceService');

router.get('/usd', async (req, res) => {
  try {
    console.log(4)
    const usdPrice = await priceService.getBitcoinPrice();
    console.log(usdPrice)
    res.json({ price: usdPrice });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch price' });
  }
});

module.exports = router;
