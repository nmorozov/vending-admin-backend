const router = require('koa-router')();
const Geo = require('../models/DB').Geo;

router.get('/country', async ctx => {
    const countries = await Geo.findAll({attributes: ['country'], group: ['country']});
    if (countries) {
        let formattedCountries = []
        countries.map((country) => {
            formattedCountry = {value: country.country, label: country.country};
            formattedCountries.push(formattedCountry);
        });
        ctx.body = { countries: formattedCountries };
    } else {
        ctx.body = {countries: []};
    }
});

router.get('/city', async ctx => {
    const { query } = ctx
    const cities = await Geo.findAll({attributes: ['city'], where: {country: query.country}});
    if (cities) {
        let formattedCities = []
        cities.map((city) => {
            formattedCity = {value: city.city, label: city.city};
            formattedCities.push(formattedCity);
        });
        ctx.body = { cities: formattedCities };
    } else {
        ctx.body = {cities: []};
    }
});

module.exports = router;