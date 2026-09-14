import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY NOT FOUND IN .ENV');
        return;
    }

    console.log(`🔍 Testing Gemini with key: ${apiKey.substring(0, 8)}...`);

    // Based on ListModels results, standard names are missing but gemini-2.0-flash-exp is available
    const models = ["gemini-2.0-flash-exp", "gemini-1.5-flash", "gemini-1.5-pro"];

    for (const modelName of models) {
        console.log(`\n🤖 Testing model: ${modelName}...`);
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: modelName });

            const result = await model.generateContent("Respond with 'OK' if you are working.");
            const response = await result.response;
            const text = response.text();

            console.log(`✅ Model ${modelName} Response: ${text}`);
            return; // Exit on success
        } catch (error: any) {
            console.error(`❌ Model ${modelName} Error:`, error.message);
        }
    }
}

testGemini();
