// Switch to the 'crypto-tracker' database
use crypto-tracker;

// Insert sample data into the 'cryptos' collection
db.cryptos.insertMany([
  {
    name: "Bitcoin",
    priceUSD: 40000,
    marketCapUSD: 800000000,
    change24h: 3.4,
    timestamp: new Date()
  },
  {
    name: "Ethereum",
    priceUSD: 2500,
    marketCapUSD: 300000000,
    change24h: 2.1,
    timestamp: new Date()
  },
  {
    name: "Matic",
    priceUSD: 1.2,
    marketCapUSD: 12000000,
    change24h: -0.5,
    timestamp: new Date()
  }
]);

// Show all documents in the 'cryptos' collection
print("All Crypto Data:");
printjson(db.cryptos.find().toArray());

// Count the total documents
print("Total Records: " + db.cryptos.countDocuments());
