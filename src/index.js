const express = require('express');
const cors = require('cors'); 
const { getTickers, get24hData, getCandles, getIncentives } = require('../controller/contract');  // Import contract functions
const logger = require('../logger');  // Import logger
require('dotenv').config();
const app = express();
app.use(express.json());
app.use(cors());

const { PORT } = process.env;

// app.get('/token-price', async (req, res) => {
//     try {
//         const details = await getTokenDetails();
//         res.json(details.price);
//     } catch (error) {
//         logger.error(`Error fetching token details: ${error.message}`);
//         res.status(500).json({ error: error.message });
//     }
// });

app.get('/prices/tickers', async (req, res) => {
    try {
        const details = await getTickers();
        res.json(details.price);
    } catch (error) {
        logger.error(`Error fetching token details: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

app.get('/prices/24h', async (req, res) => {
    try {
        const details = await get24hData(req.query.limit);
        res.json(details);
    } catch (error) {
        logger.error(`Error fetching token prices 24h details: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

app.get('/prices/candles', async (req, res) => {
    try {
        const details = await getCandles(req.query.limit, req.query.period);
        res.json(details);
    } catch (error) {
        logger.error(`Error fetching token details: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

app.get('/prices/incentives', async (req, res) => {
    try {
        const details = await getIncentives();
        res.json(details.price);
    } catch (error) {
        logger.error(`Error fetching token details: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});