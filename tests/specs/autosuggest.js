import { expect } from 'chai';
import 'regenerator-runtime/runtime.js';
import { autosuggest } from '../../apiDefinitions/public-api.js';
import { getApiKey } from '../config/test-config.js';
import { DELIMITERS, TEST_WORDS } from '../config/test-config.js';
import { defaultApiClientInstance } from '../../apiDefinitions/api-client.js';
import {
    buildAddressWithDelimiter,
    validateAutosuggestResponse,
    createDelimiterTestData,
    validateAutosuggestContainsWords
} from '../utils/test-helpers.js';

describe("Autosuggest API", function () {
    let apiKey;

    before(function () {
        apiKey = getApiKey();
    });

    function testDelimiterAcceptance(delimiter, input, expectedWords) {
        it(`should accept delimiter "${delimiter}" in input "${input}"`, async function () {
            const response = await autosuggest(apiKey, input, {
                language: 'en'
            });

            expect(response.status).to.equal(200);
            expect(response.data).to.not.have.property('error');
            validateAutosuggestResponse(response);

            if (response.data.suggestions.length === 0) {
                throw new Error(`Empty suggestions for "${input}" with delimiter "${delimiter}"`);
            }

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
            this.timeout(30000);
            const invalidDelimiters = [',', ';', '-', '_', '/', '|', ' ', '@', '#'];
            
            for (const invalidDelimiter of invalidDelimiters) {
                const input = buildAddressWithDelimiter(TEST_WORDS, invalidDelimiter);
                const response = await autosuggest(apiKey, input, {
                    language: 'en'
                });

                expect(response.status).to.equal(200);
                expect(response.data).to.have.property('suggestions');
                expect(response.data.suggestions).to.be.an('array');
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
                const response = await autosuggest(apiKey, input, {
                    language: 'en'
                });

                expect(response.status).to.equal(200);
                expect(response.data).to.not.have.property('error');
                validateAutosuggestResponse(response);
                expect(response.data.suggestions).to.be.an('array');
                expect(response.data.suggestions.length).to.be.greaterThan(0);

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
            params.append('input', '');
            params.append('key', apiKey);
            params.append('language', 'en');

            const response = await defaultApiClientInstance.get(`/v3/autosuggest?${params.toString()}`);

            // Check if API returns error or empty suggestions
            if (response.status === 400) {
                expect(response.data).to.not.have.property('suggestions');
                expect(response.data).to.have.property('error');
                expect(response.data.error).to.be.an('object');
                expect(response.data.error.code).to.equal('MissingInput');
                expect(response.data.error.message).to.equal('input must be specified');
            } else {
                // If API returns 200, it should return empty suggestions
                expect(response.status).to.equal(200);
                expect(response.data).to.have.property('suggestions');
                expect(response.data.suggestions).to.be.an('array');
                expect(response.data.suggestions.length).to.equal(0);
            }
        });
    });

    describe("Language Parameter", function () {
        it("should return suggestions by searching across all available languages when no language parameter is provided", async function () {
            const input = "table.chair.s";
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
            const input = "ukulélé.huitaine.g";
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

        it("should return an appropriate error response when the language parameter is set to an invalid language code", async function () {
            const input = "filled.count.s";
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
    });
});

