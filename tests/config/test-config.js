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

export const TEST_INPUTS = {
    STANDARD: 'table.chair.s',
    FRENCH: 'ukulélé.huitaine.g',
    DEFAULT: 'filled.count.s'
};

export const TEST_COORDINATES = {
    HO_CHI_MINH: "10.780549, 106.705245",
    DEFAULT: "51.750984, -1.247145"
};

export const TEST_EXPECTED_WORDS = {
    HO_CHI_MINH: "become.outlooks.rising"
};

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

