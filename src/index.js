const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(cors());
app.use(express.json()); // Parsing JSON bodies
app.use(express.urlencoded({ extended: true })); // Parsing form data
    
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});