require("dotenv").config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require("cors");



const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
  })); 

app.use(express.json());
connectDB();


app.use('/products', require('./routes/products'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
