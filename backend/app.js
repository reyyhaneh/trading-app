const express = require('express');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');

const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();

const authRoutes = require('./routes/auth');
const tradeRoutes = require('./routes/trade');

const priceRoutes = require('./routes/price');
const profileRoutes = require('./routes/profile');

const pool = require('./config/db'); 

var cors = require('cors')
app.use(cors())

app.use(express.json());
app.use(cookieParser());

// Connect to the database
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
  } else {
    console.log('Database connected:', res.rows[0]);
  }
});


// Middleware
app.use(bodyParser.json());

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/trades', tradeRoutes);
const btcRoutes = require('./routes/btc');
const leaderboardRoutes = require('./routes/leaderboard');
const AutoTradingRulesRoutes = require('./routes/autoTradingRules');
app.use('/api/btc', btcRoutes);
app.use('/api/price', priceRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/auto-trading-rules', AutoTradingRulesRoutes)


module.exports = app;
