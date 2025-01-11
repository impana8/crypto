require('dotenv').config();
const mongoose = require('mongoose');
const cron = require('node-cron');
const fetchCryptoData = require('./jobs/fetchCryptoData');
const express = require('express');
const app = express();

// Import the Crypto model to query data from MongoDB
const Crypto = require('./models/Crypto');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// MongoDB Connection
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected.'))
    .catch(err => console.error('MongoDB connection error:', err));

// Schedule the job to run every 2 hours
cron.schedule('0 */2 * * *', () => {
    console.log('Fetching cryptocurrency data...');
    fetchCryptoData();
});

// /stats route to fetch latest cryptocurrency data
app.get('/stats', async (req, res) => {
    try {
        const { coin } = req.query;
        if (!coin) {
            return res.status(400).json({ error: "Coin parameter is required" });
        }

        const latestData = await Crypto.findOne({ name: coin })
            .sort({ timestamp: -1 })
            .exec();

        if (!latestData) {
            return res.status(404).json({ error: `${coin} data not found` });
        }

        return res.json({
            price: latestData.priceUSD,
            marketCap: latestData.marketCapUSD,
            "24hChange": latestData.change24h
        });

    } catch (error) {
        console.error("Error fetching stats:", error);
        return res.status(500).json({ error: 'Server error' });
    }
});

// /deviation route to calculate the standard deviation of prices
app.get('/deviation', async (req, res) => {
    try {
        const { coin } = req.query;
        if (!coin) {
            return res.status(400).json({ error: "Coin parameter is required" });
        }

        // Fetch the last 100 records for the specified coin
        const records = await Crypto.find({ name: coin })
            .sort({ timestamp: -1 })  // Sort to get the most recent records
            .limit(100)  // Limit to 100 records
            .exec();

        if (records.length === 0) {
            return res.status(404).json({ error: `${coin} data not found` });
        }

        // Extract the prices from the records
        const prices = records.map(record => record.priceUSD);

        // Calculate the mean (average) price
        const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;

        // Calculate the variance
        const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;

        // Calculate the standard deviation (square root of variance)
        const deviation = Math.sqrt(variance);

        return res.json({
            deviation: deviation.toFixed(2)  // Return the deviation rounded to 2 decimal places
        });

    } catch (error) {
        console.error("Error calculating deviation:", error);
        return res.status(500).json({ error: 'Server error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
