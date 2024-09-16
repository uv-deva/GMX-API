const express = require('express');
const { getTokenDetails, executeTransaction } = require('./controller/contract');  // Import contract functions
const logger = require('./logger');  // Import logger
require('dotenv').config();
const app = express();
app.use(express.json());
const { PORT } = process.env;

app.get('/token-price', async (req, res) => {
    const { tokenAddress } = req.query;
    if (!tokenAddress) {
        logger.error('Missing tokenAddress query parameter');
        return res.status(400).json({ error: 'Missing tokenAddress query parameter' });
    }
    try {
        logger.info(`Fetching token details for address: ${tokenAddress}`);
        const details = await getTokenDetails(tokenAddress);
        res.json(details);
    } catch (error) {
        logger.error(`Error fetching token details: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});