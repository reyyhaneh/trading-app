// routes/autoTradingRules.js
const express = require('express');
const router = express.Router();
const AutoTradingRuleController = require('../controllers/AutoTradingRuleController');
const auth = require('../middleware/auth');

// Create a new auto-trading rule
router.post('/create', auth, AutoTradingRuleController.createRule);

// Get active auto-trading rules for the logged-in user
router.get('/', auth, AutoTradingRuleController.getActiveRules);

// Update a specific auto-trading rule by ID
router.patch('/:id', auth, AutoTradingRuleController.updateRule);

// Deactivate a specific auto-trading rule by ID
router.delete('/:id', auth, AutoTradingRuleController.deactivateRule);

// Get all active auto-trading rules (system-wide, admin purpose)
router.get('/all', auth, AutoTradingRuleController.getAllActiveRules);

module.exports = router;
