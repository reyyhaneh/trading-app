const express = require('express');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');

const app = express();


// Connect to the database
connectDB();

// Middleware
app.use(bodyParser.json());

// Define routes
app.use('/api/auth', require('./routes/auth'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
