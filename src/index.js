const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const routes = require('./routes');
const dotenv = require('dotenv');
const { specs, swaggerUi, swaggerOptions } = require('./config/swagger');


dotenv.config();

const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(cors());
app.use(express.json()); // Parsing JSON bodies
app.use(express.urlencoded({ extended: true })); // Parsing form data
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions)); // Swagger

    
const PORT = process.env.PORT || 3001;

routes(app);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
  console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});