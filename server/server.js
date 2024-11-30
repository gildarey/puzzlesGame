require('dotenv').config();

const express = require('express');
const cors = require('cors');
const configRoutes = require('./routes/configRoutes'); // routes

const app = express();

const PORT = process.env.PORT || 5001;
const HOSTNAME = 'localhost';

app.use(cors());
app.use(express.json());

// configRoutes
app.use('/api', configRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://${HOSTNAME}:${PORT}`);
});
