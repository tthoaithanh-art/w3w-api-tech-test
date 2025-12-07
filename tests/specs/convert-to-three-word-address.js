import { expect } from 'chai';
import 'regenerator-runtime/runtime.js';
import { convertToThreeWordAddress } from '../../apiDefinitions/public-api.js';
import { getApiKey, TEST_COORDINATES, TEST_EXPECTED_WORDS } from '../config/test-config.js';

describe("Convert to three word address", function () {
  let apiKey;

  before(function () {
    apiKey = getApiKey();
  });

  it("should return three word address from coordinates", async function () {
    const response = await convertToThreeWordAddress(
      apiKey,
      TEST_COORDINATES.HO_CHI_MINH
    );

    expect(response.status).to.equal(200);
    expect(response.data).to.not.have.property('error');
    expect(response.data.words).to.equal(TEST_EXPECTED_WORDS.HO_CHI_MINH);
  });
});