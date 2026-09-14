import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function testTwelveData() {
    const apiKey = process.env.TWELVE_DATA_API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here') {
        console.error('❌ TWELVE_DATA_API_KEY NOT FOUND OR INVALID');
        return;
    }

    const symbols = 'AAPL,TSLA,MSFT';
    console.log(`🌍 Testing Twelve Data with symbols: ${symbols}`);

    try {
        const response = await axios.get(`https://api.twelvedata.com/quote`, {
            params: {
                symbol: symbols,
                apikey: apiKey
            }
        });

        console.log('✅ Twelve Data Response:', JSON.stringify(response.data, null, 2));
    } catch (error: any) {
        console.error('❌ Twelve Data Error:', error.message);
    }
}

testTwelveData();
