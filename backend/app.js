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

const pool = require('./config/db'); // PostgreSQL connection (./db.js)


var cors = require('cors')
app.use(cors())

app.use(express.json());
app.use(cookieParser());

// Configure session middleware
/*
app.use(session({
  secret: 'your_secret_key', // Replace with a strong secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set secure: true if using HTTPS
}));
*/


// Connect to the database
// Test Database Connection
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
app.use('/api/btc', btcRoutes);
app.use('/api/price', priceRoutes);
app.use('/api/profile', profileRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
