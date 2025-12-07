import { expect } from 'chai';
import 'regenerator-runtime/runtime.js';
import { convertToThreeWordAddress } from '../../apiDefinitions/public-api.js';
import { getApiKey } from '../config/test-config.js';

describe("Convert to three word address", function () {
  it("Get three word address from coordinates", async function () {
    const apiKey = getApiKey();

    const response = await convertToThreeWordAddress(
      apiKey,
      "10.780549, 106.705245"
    );
    expect(response.data.words).to.equal("become.outlooks.rising");
  });
});