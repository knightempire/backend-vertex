// Load environment variables from .env file
require('dotenv').config(); 

const express = require('express');
const cors = require('cors');  
const { connectToDb, getDb } = require('./config/db'); 

const userRouter = require('./routers/user');


const app = express();

app.use(cors()); 

app.use(express.json());

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
 
  const db = getDb();
  if (db) {
    res.send('Hi Dev! Database is connected.');
  } else {
    res.send('Hi Dev! Database is not connected.');
  }
});

app.use('/users', userRouter);

connectToDb().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
});