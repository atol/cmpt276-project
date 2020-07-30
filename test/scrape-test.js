const axios = require('axios');
const { getAdvisories, getInfo } = require('../scraper');

jest.mock('axios');

describe('getInfo', () => {
    it('Successfully fetches country data from travel.gc.ca', async () => {
        const info = {
            country: 'Argentina',
            updated: 'July 15, 2020 14:45',
            valid: 'July 30, 2020 02:59',
            risk: 'Take normal security precautions in Argentina.',
            passport: 'Your passport must be valid for the expected duration of your stay in Argentina.',
            visa: 'Tourist visa: Not required, Business visa: Not required , Student visa: Required',
            other: 'Upon entry into and exit from Argentina, all passengers, regardless of their citizenship, are submitted to biometrics checks, such as digital fingerprints and a digital photograph, at the immigration counter.',
        };

        axios.get.mockImplementationOnce(() => Promise.resolve(info));

        await expect(getInfo('argentina')).resolves.toEqual(info);
    });

    it('Fails to fetch country data from travel.gc.ca', async () => {
        const errorMessage = 'Network Error';

        axios.get.mockImplementationOnce(() =>
            Promise.reject(new Error(errorMessage)),
        );

        await expect(getInfo('argentina')).rejects.toThrow(errorMessage);
    });
});;