const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { getAdvisories, getInfo } = require('../scraper');
const argentina = fs.readFileSync(path.resolve(__dirname, 'mocks/argentina.html'), 'utf8');

jest.mock('axios');

describe('getInfo', () => {
    it('Successfully fetches country data from an HTML page', async () => {
        const info = {
            country: 'Argentina',
            link: "https://travel.gc.ca/destinations/argentina",
            other: 'Upon entry into and exit from Argentina, all passengers, regardless of their citizenship, are submitted to biometrics checks, such as digital fingerprints and a digital photograph, at the immigration counter.',
            passport: 'Your passport must be valid for the expected duration of your stay in Argentina.',
            risk: 'Take normal security precautions in Argentina.',
            updated: 'July 15, 2020 14:45',
            valid: 'July 30, 2020 23:18',
            visa: 'Tourist visa: Not required, Business visa: Not required , Student visa: Required',
        };

        axios.get.mockResolvedValue({ data : argentina });

        const result = await getInfo('argentina');

        // Check that the result matches the expected output
        expect(result).toEqual(info);

        // Check that getInfo() was called once
        expect(axios.get).toHaveBeenCalledTimes(1);

        // Check that getInfo() was called with the correct URL
        expect(axios.get).toHaveBeenCalledWith(
            `https://travel.gc.ca/destinations/argentina`,
          );
    });

    it('Fails to fetch country data from an HTML page', async () => {
        const err = 'Network Error';

        axios.get.mockRejectedValue(new Error(err));

        await expect(getInfo('argentina')).rejects.toThrow(err);
    });
});;