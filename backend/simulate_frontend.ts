import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development_only';

async function simulateRequest() {
    const token = jwt.sign(
        { userId: 2, email: 'pietrogiacomelli8@gmail.com' },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    console.log('Simulating request for user 2...');
    try {
        const res = await axios.get('http://localhost:3001/api/portfolio', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Response status:', res.status);
        console.log('Total Assets:', Object.values(res.data.ativos).flat().length);
        console.log('Total Investido:', res.data.totalInvestido);
    } catch (err: any) {
        console.error('Request failed:', err.response?.status, err.response?.data || err.message);
    }
}

simulateRequest();
