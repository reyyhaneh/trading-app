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
const filePath = path.join(__dirname, 'users.json');

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

const saveUser = async (user) => {
  const users = readUsersFromFile();
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  users.push(user);
  writeUsersToFile(users);
};

module.exports = {
  findUserByEmail,
  saveUser,
};



