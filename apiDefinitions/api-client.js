import 'regenerator-runtime/runtime.js';
import axios from 'axios';

export function createApiClient(baseURL = 'https://api.what3words.com', options = {}) {
    const {
        timeout = 30000,
        validateStatus = (status) => status >= 200 && status <= 503
    } = options;

    return axios.create({
        baseURL,
        timeout,
        validateStatus,
        headers: {
            'Content-Type': 'application/json',
        }
    });
}

export class ApiClient {
    constructor(baseURL = 'https://api.what3words.com', options = {}) {
        this.client = createApiClient(baseURL, options);
        this.baseURL = baseURL;
    }

    async get(url, config = {}) {
        try {
            return await this.client.get(url, config);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async post(url, data, config = {}) {
        try {
            return await this.client.post(url, data, config);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    handleError(error) {
        if (error.response) {
            const { status, statusText, data } = error.response;
            const errorMessage = data?.error?.message || statusText || 'API request failed';
            const enhancedError = new Error(`API Error ${status}: ${errorMessage}`);
            enhancedError.status = status;
            enhancedError.response = error.response;
            return enhancedError;
        } else if (error.request) {
            const enhancedError = new Error('No response from API');
            enhancedError.request = error.request;
            return enhancedError;
        } else {
            return new Error(`Request error: ${error.message}`);
        }
    }
}

export const defaultApiClientInstance = new ApiClient();

