const { findUserByEmail, saveUser,findVerificationToken,verifyUser } = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const nodemailer = require('nodemailer');




exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = findUserByEmail(email);
    if (existingUser) {
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

    await saveUser(user);

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
  const token = await req.query.token;

  try {
    // Find the user by the token
    const user = await findVerificationToken(token);

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Mark the email as verified
    /*
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined; // Clear the token
*/

    verifyUser(user.email)
    console.log("user verified")

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};
