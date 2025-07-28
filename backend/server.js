const app = require('./app');
const autoTradingService = require('./services/autoTradingService'); 

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);

  setInterval(() => {
    console.log('⏱️ Running auto-trading rule check...');
    autoTradingService.processAutoTradingRules();
  }, 60000);
});
