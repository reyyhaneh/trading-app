// backend/routes/price.js

const express = require('express');
const router = express.Router();
const priceService = require('../services/priceService');
const auth = require('../middleware/auth'); // Middleware to authenticate requests

/**
 * @route   GET /api/price/current
 * @desc    Get current prices for specified symbols
 * @access  Private
 * @query   symbols - comma-separated list of symbols, e.g., 'BTCUSDT,ETHUSDT,DOGEUSDT'
 */
router.get('/current', auth, async (req, res) => {
  const symbolsQuery = req.query.symbols;
  if (!symbolsQuery) {
    return res.status(400).json({ error: 'No symbols provided. Please provide symbols as a comma-separated list in the "symbols" query parameter.' });
  }

  const symbols = symbolsQuery.split(',').map(sym => sym.trim().toUpperCase());

  try {
    const prices = await priceService.getCurrentPrices(symbols);
    res.status(200).json({ prices });
  } catch (error) {
    console.error('Error in GET /api/price/current:', error.message || error);
    res.status(500).json({ error: error.message || 'Failed to fetch current prices.' });
  }
});

/**
 * @route   GET /api/price/current/:symbol
 * @desc    Get current price for a single symbol
 * @access  Private
 */
router.get('/current/:symbol', auth, async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();

  try {
    const price = await priceService.getCurrentPrice(symbol);
    res.status(200).json({ symbol, price });
  } catch (error) {
    console.error(`Error in GET /api/price/current/${symbol}:`, error.message || error);
    res.status(500).json({ error: error.message || `Failed to fetch price for ${symbol}.` });
  }
});

module.exports = router;
