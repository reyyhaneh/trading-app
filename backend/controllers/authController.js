const { findByEmail, create, verifyEmail} = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const nodemailer = require('nodemailer');

const { createTask } = require('../models/UserTask');  


exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user object
    const user = {
      username,
      email,
      password: hashedPassword,
      isEmailVerified: false,
    };

    // Generate a verification token (JWT)
    const verificationToken = jwt.sign(
      { email: user.email }, // Include the email in the token payload
      'meow', // Secret key
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Add the verification token to the user object
    user.verificationToken = verificationToken;

    // Save the user to the database
    const newUser = await create(user);  // Store the newly created user object

    // After user is created, create the "Make 5 Trades" challenge
    const taskName = 'Make 5 Trades';  // Default task
    await createTask(newUser.id, taskName);  // Assign task using newUser.id

    // Generate an authentication JWT
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

        // Send email verification link
        const verificationUrl = `http://localhost:3000/verify-email?token=${verificationToken}`;
        const transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: 'glenda.osinski@ethereal.email',
            pass: 'fTg2T7YVpe4j2cnvyA',
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

          res.status(200).json({
            token,
            message: 'Registration successful. Please verify your email.',
          });
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  
  const { email, password } = req.body;

  try {
    const user = await findByEmail(email);


    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    } else if (! user.is_email_verified){
      return res.status(401).json({msg:"Email not verifieds."})
    }


    // Compare the provided password with the hashed password
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

  try {
    // Decode the token
    const decoded = jwt.verify(verificationCode, 'meow'); // Ensure 'meow' is the correct secret
    const email = decoded.email;

    // Find user by email
    const user = await findByEmail(email);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Ensure the verification code matches the one stored in the database
    if (user.verification_token !== verificationCode) {
      return res.status(400).json({ msg: 'Invalid verification code' });
    }

    // Update the user's email verification status
    const updatedUser = await verifyEmail(email); // Update the user in the database

    res.status(200).json({ msg: 'Email verified successfully. Please login.', user: updatedUser });
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
