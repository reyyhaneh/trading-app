/* const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('User', UserSchema);
*/




const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { stringify } = require('querystring');


// File path for storing user data in JSON format
const filePath = path.join(__dirname, '../data/users.json');

const readUsersFromFile = () => {
  // if the file doesn't exist, create a new file in the same place and write an empty string to it.
  if(!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
  const data = fs.readFileSync(filePath);
  return JSON.parse(data);
}

const writeUsersToFile = (users) => {
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
}

const findUserByEmail = (email) => {
  const users = readUsersFromFile();
  return users.find(user => user.email === email);
};

const findVerificationToken = (token) => {
  const users = readUsersFromFile();
  return users.find(user => user.verificationToken === token);

}

const saveUser = async (user) => {
  const users = readUsersFromFile();
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  users.push(user);
  writeUsersToFile(users);
};

const verifyUser = async (email) => {
  const user = findUserByEmail(email)

  const updateFields = {
    isEmailVerified: true,
    verificationToken: null

  };

  updateUser(user.email, updateFields)

}

const updateUser = (email, updatedFields) => {
  try {
    // Step 1: Read the JSON file
    const data = fs.readFileSync(filePath, 'utf-8');
    const users = JSON.parse(data);

    // Step 2: Find the user by email
    const userIndex = users.findIndex(user => user.email === email);
    if (userIndex === -1) {
      console.error('User not found');
      return null;
    }

    // Step 3: Update the necessary fields
    const user = users[userIndex];
    Object.keys(updatedFields).forEach(key => {
      user[key] = updatedFields[key]; // Update field values
    });

    // Step 4: Save the updated data back to the JSON file
    users[userIndex] = user;
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf-8');

    console.log('User updated successfully');
    return user;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}

module.exports = {
  findUserByEmail,
  saveUser,
  findVerificationToken,
  verifyUser,
};



