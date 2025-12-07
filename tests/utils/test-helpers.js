import 'regenerator-runtime/runtime.js';

export function buildAddressWithDelimiter(words, delimiter) {
    if (!Array.isArray(words) || words.length === 0) {
        throw new Error('Invalid words');
    }
    
    if (typeof delimiter !== 'string') {
        throw new Error('Invalid delimiter');
    }
    
    return words.join(delimiter);
}

export function validateAutosuggestResponse(response) {
    if (!response || typeof response !== 'object') {
        throw new Error('Invalid response');
    }
    
    if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response data');
    }
    
    if (Array.isArray(response.data.suggestions)) {
        response.data.suggestions.forEach((suggestion) => {
            if (!suggestion || typeof suggestion !== 'object') {
                throw new Error('Invalid suggestion');
            }
            
            if (!suggestion.words || typeof suggestion.words !== 'string') {
                throw new Error('Invalid suggestion words');
            }
        });
        
        return true;
    }
    
    if (response.data.error) {
        return true;
    }
    
    throw new Error('Invalid response structure');
}

export function createDelimiterTestData(delimiters, words) {
    if (!Array.isArray(delimiters) || delimiters.length === 0) {
        throw new Error('Invalid delimiters');
    }
    
    if (!Array.isArray(words) || words.length === 0) {
        throw new Error('Invalid words');
    }
    
    return delimiters.map(delimiter => ({
        delimiter,
        input: buildAddressWithDelimiter(words, delimiter),
        words: [...words]
    }));
}

export function validateAutosuggestContainsWords(response, expectedWords) {
    if (!response || !response.data || !Array.isArray(response.data.suggestions)) {
        throw new Error('Invalid response structure');
    }
    
    if (!Array.isArray(expectedWords) || expectedWords.length === 0) {
        throw new Error('Invalid expected words');
    }
    
    const expectedAddress = expectedWords.join('.');
    const hasMatch = response.data.suggestions.some(suggestion => {
        return suggestion.words && suggestion.words.toLowerCase() === expectedAddress.toLowerCase();
    });
    
    if (!hasMatch) {
        throw new Error(`Expected words not found: ${expectedAddress}`);
    }
    
    return true;
}

