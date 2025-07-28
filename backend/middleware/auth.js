const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  console.log("request header", req.headers)

  if (req.header('x-internal-call') === 'true') {
    console.log("internal request")
    const userId = req.header('x-user-id');
    console.log("request is internal, user id:", userId)

    if (!userId) {
      return res.status(400).json({ msg: 'Missing x-user-id for internal call.' });
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ msg: 'User not found for internal call.' });
      }

      req.user = { id: user.id, email: user.email };
      return next();
    } catch (err) {
      console.error('❌ Internal auth error:', err);
      return res.status(500).json({ msg: 'Internal authentication failed.' });
    }
  }
  const token = req.header('x-auth-token');
  
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'meow');

    const email = decoded.user?.email; // ✅ Access email correctly

    if (!email) {
      console.error('❌ No email found in token payload');
      return res.status(401).json({ msg: 'Invalid token payload.' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      console.error(`❌ No user found with email: ${email}`);
      return res.status(404).json({ msg: `No user found with email: ${email}` });
    }

    req.user = { id: user.id, email: user.email }; // ✅ Attach user info

    next();
  } catch (err) {
    console.error('❌ Error verifying token:', err.message);
    res.status(401).json({ msg: 'Token is not valid.' });
  }
};
