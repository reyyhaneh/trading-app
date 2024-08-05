const User = require('./models/User');
const fs = require('fs');


var data = fs.readFileSync('users.json');
var myObject= JSON.parse(data);
console.log(myObject)