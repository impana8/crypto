const axios = require('axios');
const Crypto = require('../models/Crypto');

const fetchCryptoData = async () => {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
            params: {
                ids: 'bitcoin,ethereum,matic-network',
                vs_currencies: 'usd',
                include_market_cap: 'true',
                include_24hr_change: 'true'
            }
        });

        const data = response.data;

        const cryptos = [
            { name: 'Bitcoin', data: data.bitcoin },
            { name: 'Ethereum', data: data.ethereum },
            { name: 'Matic', data: data['matic-network'] }
        ];

        for (const crypto of cryptos) {
            const newEntry = new Crypto({
                name: crypto.name,
                priceUSD: crypto.data.usd,
                marketCapUSD: crypto.data.usd_market_cap,
                change24h: crypto.data.usd_24h_change
            });

            await newEntry.save();
            console.log(`${crypto.name} data saved successfully.`);
        }
    } catch (error) {
        console.error('Error fetching cryptocurrency data:', error.message);
    }
};

module.exports = fetchCryptoData;