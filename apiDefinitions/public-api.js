import 'regenerator-runtime/runtime.js';
import { ApiClient, defaultApiClientInstance } from './api-client.js';

function getApiClient(options = {}) {
    const { apiClient, baseURL } = options;
    return apiClient || (baseURL ? new ApiClient(baseURL) : defaultApiClientInstance);
}

function validateApiKey(key) {
    if (!key || typeof key !== 'string' || key.trim().length === 0) {
        throw new Error('Invalid API key');
    }
    
    if (key.length < 8) {
        throw new Error('Invalid API key');
    }
}

function validateCoordinates(coordinates) {
    if (!coordinates || typeof coordinates !== 'string') {
        throw new Error('Invalid coordinates');
    }
    
    const coordPattern = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/;
    if (!coordPattern.test(coordinates.trim())) {
        throw new Error('Invalid coordinates format');
    }
}

function validateInput(input) {
    if (!input || typeof input !== 'string' || input.trim().length === 0) {
        throw new Error('Invalid input');
    }
}

export async function convertToThreeWordAddress(
    key,
    coordinates = '51.750984, -1.247145',
    options = {}
) {
    validateApiKey(key);
    validateCoordinates(coordinates);
    
    const { language = 'en' } = options;
    const client = getApiClient(options);
    
    const params = new URLSearchParams({
        coordinates: coordinates.trim(),
        key: key.trim(),
        language
    });
    
    const url = `/v3/convert-to-3wa?${params.toString()}`;
    
    try {
        return await client.get(url);
    } catch (error) {
        throw new Error(`Convert failed: ${error.message}`);
    }
}

export async function autosuggest(
    key,
    input,
    options = {}
) {
    validateApiKey(key);
    validateInput(input);
    
    const {
        language,
        clipToCountry,
        focus
    } = options;
    
    const client = getApiClient(options);
    
    const params = new URLSearchParams({
        input: input.trim(),
        key: key.trim()
    });
    
    if (language !== undefined && language !== null) {
        params.append('language', language);
    }
    
    if (clipToCountry) {
        params.append('clip-to-country', clipToCountry);
    }
    
    if (focus) {
        params.append('focus', focus);
    }
    
    const url = `/v3/autosuggest?${params.toString()}`;
    
    try {
        return await client.get(url);
    } catch (error) {
        throw new Error(`Autosuggest failed: ${error.message}`);
    }
}
