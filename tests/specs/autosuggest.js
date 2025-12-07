import { expect } from 'chai';
import 'regenerator-runtime/runtime.js';
import { autosuggest } from '../../apiDefinitions/public-api.js';
import { getApiKey } from '../config/test-config.js';
import { DELIMITERS, TEST_WORDS, TEST_INPUTS } from '../config/test-config.js';
import { defaultApiClientInstance } from '../../apiDefinitions/api-client.js';
import {
    buildAddressWithDelimiter,
    validateAutosuggestResponse,
    createDelimiterTestData,
    validateAutosuggestContainsWords
} from '../utils/test-helpers.js';

describe("Autosuggest API", function () {
    this.timeout(30000);
    let apiKey;

    before(function () {
        apiKey = getApiKey();
    });

    function testDelimiterAcceptance(delimiter, input, expectedWords) {
        it(`should accept delimiter "${delimiter}" in input "${input}"`, async function () {
            const response = await autosuggest(apiKey, input, {});

            expect(response.status).to.equal(200);
            expect(response.data).to.not.have.property('error');
            validateAutosuggestResponse(response);
            expect(response.data.suggestions.length, `Empty suggestions for "${input}" with delimiter "${delimiter}"`).to.be.greaterThan(0);
            validateAutosuggestContainsWords(response, expectedWords);
        });
    }

    describe("Accepted Delimiters", function () {
        const testData = createDelimiterTestData(DELIMITERS, TEST_WORDS);
        testData.forEach(({ delimiter, input, words }) => {
            testDelimiterAcceptance(delimiter, input, words);
        });
    });

    describe("Invalid Delimiters", function () {
        it("should reject invalid delimiters in input", async function () {
            const invalidDelimiters = [',', ';', '-', '_', '/', '|', ' ', '@', '#'];
            
            for (const invalidDelimiter of invalidDelimiters) {
                const input = buildAddressWithDelimiter(TEST_WORDS, invalidDelimiter);
                const response = await autosuggest(apiKey, input, {});

                expect(response.status).to.equal(200);
                expect(response.data).to.have.property('suggestions');
                validateAutosuggestResponse(response);
                expect(response.data.suggestions.length, `Invalid delimiter "${invalidDelimiter}" should return empty suggestions`).to.equal(0);
            }
        });
    });

    describe("Mixed Delimiters", function () {
        it("should accept input with mixed delimiters", async function () {
            const mixedDelimiterInputs = [
                `${TEST_WORDS[0]}.${TEST_WORDS[1]}。${TEST_WORDS[2]}`,
                `${TEST_WORDS[0]}。${TEST_WORDS[1]}.${TEST_WORDS[2]}`,
                `${TEST_WORDS[0]}.${TEST_WORDS[1]}︒${TEST_WORDS[2]}`,
            ];

            for (const input of mixedDelimiterInputs) {
                const response = await autosuggest(apiKey, input, {});

                expect(response.status).to.equal(200);
                expect(response.data).to.not.have.property('error');
                validateAutosuggestResponse(response);
                expect(response.data.suggestions.length, `Empty suggestions for mixed delimiter input "${input}"`).to.be.greaterThan(0);

                const expectedPattern = TEST_WORDS.join('.');
                const hasMatch = response.data.suggestions.some(suggestion => {
                    return suggestion.words &&
                        suggestion.words.toLowerCase().startsWith(expectedPattern.toLowerCase());
                });
                expect(hasMatch, `Mixed delimiter input "${input}" should return suggestions with expected words`).to.be.true;
            }
        });
    });

    describe("Input Validation", function () {
        it("should return error when input is empty", async function () {
            const params = new URLSearchParams();
            params.append('key', apiKey);

            const response = await defaultApiClientInstance.get(`/v3/autosuggest?${params.toString()}`);

            expect(response.status).to.equal(400);
            expect(response.data).to.not.have.property('suggestions');
            expect(response.data).to.have.property('error');
            expect(response.data.error).to.be.an('object');
            expect(response.data.error.code).to.equal('MissingInput');
            expect(response.data.error.message).to.equal('input must be specified');
        });
    });

    describe("Language Parameter", function () {
        it("should return suggestions by searching across all available languages when no language parameter is provided", async function () {
            const input = TEST_INPUTS.STANDARD;
            const response = await autosuggest(apiKey, input, {});

            expect(response.status).to.equal(200);
            expect(response.data).to.not.have.property('error');
            validateAutosuggestResponse(response);
            expect(response.data.suggestions.length).to.be.greaterThan(0);

            response.data.suggestions.forEach((suggestion) => {
                expect(suggestion).to.have.property('language');
                expect(suggestion.language).to.be.a('string');
                expect(suggestion.language.length).to.be.greaterThan(0);
            });
        });

        it("should accept a valid supported language code in the language parameter", async function () {
            const input = TEST_INPUTS.FRENCH;
            const languageCode = "fr";
            const response = await autosuggest(apiKey, input, {
                language: languageCode
            });

            expect(response.status).to.equal(200);
            expect(response.data).to.not.have.property('error');
            validateAutosuggestResponse(response);
            expect(response.data.suggestions.length).to.be.greaterThan(0);

            response.data.suggestions.forEach((suggestion) => {
                expect(suggestion).to.have.property('language');
                expect(suggestion.language).to.be.a('string');
                expect(suggestion.language.length).to.be.greaterThan(0);
            });
        });

        it("should accept multiple valid supported language codes from different regions", async function () {
            const validLanguages = ['en', 'fr', 'de', 'es', 'ja', 'pt', 'it', 'zh', 'ar', 'ru'];
            const input = TEST_INPUTS.STANDARD;
            
            for (const langCode of validLanguages) {
                const response = await autosuggest(apiKey, input, {
                    language: langCode
                });
                
                expect(response.status).to.equal(200);
                expect(response.data).to.not.have.property('error');
                validateAutosuggestResponse(response);
                expect(response.data.suggestions.length, `Language "${langCode}" should return suggestions`).to.be.greaterThan(0);
            }
        });

        it("should return an appropriate error response when the language parameter is set to an invalid language code", async function () {
            const input = buildAddressWithDelimiter(TEST_WORDS, '.');
            const invalidLanguageCode = "xx";

            const response = await autosuggest(apiKey, input, {
                language: invalidLanguageCode
            });

            expect(response.status).to.equal(400);
            expect(response.data).to.not.have.property('suggestions');
            expect(response.data).to.have.property('error');
            expect(response.data.error).to.be.an('object');
            expect(response.data.error.code).to.equal('BadLanguage');
            expect(response.data.error.message).to.equal('language must be an ISO 639-1 2 letter code, such as \'en\' or \'fr\'');
        });

        it("should accept both uppercase and lowercase language codes", async function () {
            const input = TEST_INPUTS.STANDARD;
            const languageVariants = [
                { code: 'en', description: 'lowercase' },
                { code: 'EN', description: 'uppercase' },
                { code: 'fr', description: 'lowercase' },
                { code: 'FR', description: 'uppercase' }
            ];

            for (const variant of languageVariants) {
                const response = await autosuggest(apiKey, input, {
                    language: variant.code
                });

                expect(response.status).to.equal(200);
                expect(response.data).to.not.have.property('error');
                validateAutosuggestResponse(response);
                expect(response.data.suggestions.length, `Language "${variant.code}" (${variant.description}) should return suggestions`).to.be.greaterThan(0);
            }
        });

        it("should handle empty string language parameter by searching across all languages", async function () {
            const input = TEST_INPUTS.FRENCH;
            
            const response = await autosuggest(apiKey, input, {
                language: ''
            });

            expect(response.status).to.equal(200);
            expect(response.data).to.not.have.property('error');
            validateAutosuggestResponse(response);
            expect(response.data.suggestions.length, 'Empty string language should return suggestions').to.be.greaterThan(0);
            
            response.data.suggestions.forEach((suggestion) => {
                expect(suggestion).to.have.property('language');
                expect(suggestion.language).to.be.a('string');
                expect(suggestion.language.length).to.be.greaterThan(0);
            });
        });
    });
});

