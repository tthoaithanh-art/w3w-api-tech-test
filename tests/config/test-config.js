import 'regenerator-runtime/runtime.js';
import dotenv from 'dotenv';

dotenv.config();

export function getApiKey() {
    const apiKey = process.env.API_KEY;
    
    if (!apiKey || apiKey === 'your-api-key-here' || apiKey === '{your-api-key}') {
        throw new Error(
            'API_KEY is not set. Please create a .env file with your API key.\n' +
            'See .env.example for reference.'
        );
    }
    
    return apiKey;
}

export function getApiGateway() {
    return process.env.API_GATEWAY || 'https://api.what3words.com';
}

export const DELIMITERS = ['.', '。', '︒', '។', '։', '။', '۔', '።', '।'];

export const TEST_WORDS = ['filled', 'count', 'soap'];

// Note: apiKey is lazy-loaded to avoid errors when importing config without API_KEY set
export const testConfig = {
    get apiKey() {
        return getApiKey();
    },
    get apiGateway() {
        return getApiGateway();
    },
    delimiters: DELIMITERS,
    testWords: TEST_WORDS
};

