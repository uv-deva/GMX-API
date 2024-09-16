const express = require('express');
const cors = require('cors'); 
const { getTokenDetails } = require('../controller/contract');  // Import contract functions
const logger = require('../logger');  // Import logger
require('dotenv').config();
const app = express();
app.use(express.json());
app.use(cors());

const { PORT } = process.env;

app.get('/token-price', async (req, res) => {
    try {
        const details = await getTokenDetails();
        res.json(details);
    } catch (error) {
        logger.error(`Error fetching token details: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});