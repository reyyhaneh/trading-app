// // const fs = require('fs');
// // const path = require('path');
// // const bcrypt = require('bcryptjs');
// // const { stringify } = require('querystring');


// // // File path for storing user data in JSON format
// // const filePath = path.join(__dirname, '../data/users.json');

// // const readUsersFromFile = () => {
// //   // if the file doesn't exist, create a new file in the same place and write an empty string to it.
// //   if(!fs.existsSync(filePath)) {
// //     fs.writeFileSync(filePath, JSON.stringify([]));
// //   }
// //   const data = fs.readFileSync(filePath);
// //   return JSON.parse(data);
// // }

// // const writeUsersToFile = (users) => {
// //   fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
// // }

// // const findUserByEmail = (email) => {
// //   const users = readUsersFromFile();
// //   return users.find(user => user.email === email);
// // };

// // const findVerificationToken = (token) => {
// //   const users = readUsersFromFile();
// //   return users.find(user => user.verificationToken === token);

// // }

// // const saveUser = async (user) => {
// //   const users = readUsersFromFile();
// //   const salt = await bcrypt.genSalt(10);
// //   user.password = await bcrypt.hash(user.password, salt);
// //   users.push(user);
// //   writeUsersToFile(users);
// // };

// // const verifyUser = async (email) => {
// //   const user = findUserByEmail(email)

// //   const updateFields = {
// //     isEmailVerified: true,
// //     verificationToken: null

// //   };

// //   updateUser(user.email, updateFields)

// // }

// // const updateUser = (email, updatedFields) => {
// //   try {
// //     // Step 1: Read the JSON file
// //     const data = fs.readFileSync(filePath, 'utf-8');
// //     const users = JSON.parse(data);

// //     // Step 2: Find the user by email
// //     const userIndex = users.findIndex(user => user.email === email);
// //     if (userIndex === -1) {
// //       console.error('User not found');
// //       return null;
// //     }

// //     // Step 3: Update the necessary fields
// //     const user = users[userIndex];
// //     Object.keys(updatedFields).forEach(key => {
// //       user[key] = updatedFields[key]; // Update field values
// //     });

// //     // Step 4: Save the updated data back to the JSON file
// //     users[userIndex] = user;
// //     fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf-8');

// //     console.log('User updated successfully');
// //     return user;
// //   } catch (error) {
// //     console.error('Error updating user:', error);
// //     return null;
// //   }
// // }

// // module.exports = {
// //   findUserByEmail,
// //   saveUser,
// //   findVerificationToken,
// //   verifyUser,
// // };



// const pool = require('../db');

// // Create a new user
// const createUser = async (email, password, verificationCode) => {
//   const query = `
//     INSERT INTO users (email, password, verification_code)
//     VALUES ($1, $2, $3)
//     RETURNING *;
//   `;
//   const values = [email, password, verificationCode];
//   const result = await pool.query(query, values);
//   return result.rows[0];
// };

// // Find a user by email
// const findUserByEmail = async (email) => {
//   const query = `SELECT * FROM users WHERE email = $1;`;
//   const values = [email];
//   const result = await pool.query(query, values);
//   return result.rows[0];
// };

// // Update user email verification status
// const verifyEmail = async (email) => {
//   const query = `
//     UPDATE users
//     SET is_email_verified = true, verification_code = NULL
//     WHERE email = $1
//     RETURNING *;
//   `;
//   const values = [email];
//   const result = await pool.query(query, values);
//   return result.rows[0];
// };

// module.exports = {
//   createUser,
//   findUserByEmail,
//   verifyEmail,
// };




const pool = require('../config/db');

// Create a new user
const createUser = async (email, password, verificationCode) => {
  const query = `
    INSERT INTO users (email, password, verification_code)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const values = [email, password, verificationCode];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Find a user by email
const findUserByEmail = async (email) => {
  const query = `SELECT * FROM users WHERE email = $1;`;
  const values = [email];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Update user email verification status
const verifyEmail = async (email) => {
  const query = `
    UPDATE users
    SET is_email_verified = true, verification_code = NULL
    WHERE email = $1
    RETURNING *;
  `;
  const values = [email];
  const result = await pool.query(query, values);
  return result.rows[0];
};

module.exports = {
  createUser,
  findUserByEmail,
  verifyEmail,
};
