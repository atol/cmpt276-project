const axios = require('axios');
const cheerio = require('cheerio');

const fetchData = async (url) => {
    try {
        const result = await axios.get(url);
        return cheerio.load(result.data);
    } catch (err) {
        console.error(err)
    }
};

const getAdvisories = async () => {
    var advisories = [];
    const url = 'https://travel.gc.ca/travelling/advisories';
    const $ = await fetchData(url);

    $('.gradeX').each(function (i, elem) {
        advisories[i] = {
            country: $(this).find('td:nth-child(2)').text().trim(),
            advisory: $(this).find('td:nth-child(3)').text().trim(),
            updated: $(this).find('td:nth-child(4)').text().trim(),
            slug: $(this).find('td:nth-child(2) > a').attr('href')
        }
    });

    return advisories;
};

const getInfo = async (target) => {
    var info = [];
    const base = 'https://travel.gc.ca/destinations/';
    const url = base + target;
    const $ = await fetchData(url);

    var visas = $('div > .tabpanels').find('#entryexit').find('h3:contains("Visas")').next().html();
    visas = visas.replace(/<br ?\/?>/g, ", ");

    info = {
        country: $('h1').find('#Label1').text().trim(),
        updated: $('time > #Label9').text().trim(),
        valid: $('time > #Label12').text().trim(),
        risk: $('div > .tabpanels').find('#risk').find('.AdvisoryContainer').find('p').text().trim(),
        passport: $('div > .tabpanels').find('#entryexit').find('h4:contains("Regular Canadian passport")').next().text().trim(),
        visa: visas,
        other: $('div > .tabpanels').find('#entryexit').find('h3:contains("Other")').next().text().trim(),
        link: url
    }

    return info;
};

module.exports = {
    getAdvisories,
    getInfo
};