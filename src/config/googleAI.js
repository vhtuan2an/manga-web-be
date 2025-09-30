const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Google AI with API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// Get the Gemini model
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

module.exports = {
    genAI,
    model
};