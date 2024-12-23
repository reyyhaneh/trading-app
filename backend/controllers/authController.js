const { findByEmail, create,saveUser,findVerificationToken,verifyUser } = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const nodemailer = require('nodemailer');



exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Await the result of the database query
    const existingUser = await findByEmail(email);
    
    if (existingUser) {
      console.log(existingUser); // Log the actual user
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Email verification

    const verificationToken = crypto.randomBytes(32).toString('hex');


    const user = {
      username,
      email,
      password,
      verificationToken,
      isEmailVerified : false,
      
    };

    await create(user);

    // Generate JWT
    const payload = {
      user: {
        email: user.email,
      },
    };

    jwt.sign(
      payload,
      'meow',
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );

    // send email
    const verificationUrl = `http://localhost:3000/verify-email/${verificationToken}`;


    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for port 465, false for other ports
      auth: {
        user: "glenda.osinski@ethereal.email",
        pass: "fTg2T7YVpe4j2cnvyA",
      },
    });
    

    const mailOptions = {
      to: user.email,
      from: 'noreply@example.com',
      subject: 'Email Verification',
      text: `Click the link to verify your email: ${verificationUrl}`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
        return res.status(500).json({ message: 'Error sending verification email' });
      }
      res.status(200).json({ message: 'Registration successful. Please verify your email.' });
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};



exports.login = async (req, res) => {
  
  const { email, password } = req.body;

  try {
    const user = findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    } else if (! user.isEmailVerified){
      return res.status(401).json({msg:"Email not verified."})

    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate JWT
    const payload = {
      user: {
        email: user.email,
      },
    };

    jwt.sign(
      payload,
      'meow',
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            email: user.email,
          } 
        });
      }
    );
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.verifyEmail = async (req, res) => {
  const { verificationCode } = req.body;
  console.log('Received verificationCode: ', verificationCode);

  try {
    // Decode the token
    const decoded = jwt.verify(verificationCode, 'meow'); // Ensure 'meow' is the correct secret
    const email = decoded.email;
    console.log('Decoded email from token: ', email);

    // Find user by email
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Ensure the verification code matches the one stored in the database
    if (user.verification_token !== verificationCode) {
      return res.status(400).json({ msg: 'Invalid verification code' });
    }

    // Update the user's email verification status
    const updatedUser = await verifyEmail(email); // Update the user in the database
    console.log('User email verified successfully');

    res.status(200).json({ msg: 'Email verified successfully', user: updatedUser });
  } catch (error) {
    console.error('Error verifying email:', error);

    // Handle specific JWT errors for better feedback
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ msg: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ msg: 'Token expired' });
    }

    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};
