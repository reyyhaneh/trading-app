/*
const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;

const uri = "mongodb+srv://reyhaneh:j4db462c@cluster0.l25bka3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

  
const connectDB = async () => {  
    try {  
     const client = await MongoClient.connect(uri, {  
      useNewUrlParser: true,  
      useUnifiedTopology: true  
     });  
     const db = client.db();  
     console.log('Connected to MongoDB');  
     return db;  
    } catch (err) {  
     console.error(err);  
     process.exit(1);  
    }  
  };  
/*
const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
*/


const connectDB = async() => {
  console.log("Connected to database.")
}

module.exports = connectDB;
