const { fsRun, fsRead } = require('../models/Common');

const router = require('koa-router')();
const authenticate = require('../models/Auth').authenticate;
const Coin = require('../models/DB').Coin;
const { getFilters } = require('../models/Common');

router.get('/', authenticate, async ctx => {
  const { query } = ctx;
  let { order, offset, limit } = getFilters(ctx.query);
  let searchWhere = {};

  if (query.forDevicePopup) {
    limit = 500000;
  }

  if (query.category || query.country || query.city) {
    searchWhere.$and = [];
  }

  if (query.category) {
    if (query.category !== 'all') {
      searchWhere.$and.push({ categoryCode: query.category });
    }
  }

  if (query.country) {
    if (query.country !== 'Все') {
      searchWhere.$and.push({ country: query.country });
    }
  }

  if (query.city) {
    if (query.city !== 'Все') {
      searchWhere.$and.push({ city: query.city });
    }
  }

  if (query.searchString) {
    searchWhere.$or = [
      { id: { like: '%' + query.searchString + '%' } },
      { name: { like: '%' + query.searchString + '%' } },
      { country: { like: '%' + query.searchString + '%' } },
      { city: { like: '%' + query.searchString + '%' } },
      { category: { like: '%' + query.searchString + '%' } },
      { categoryCode: { like: '%' + query.searchString + '%' } },
    ];
  }

  let coins = await Coin.findAll({
    where: [searchWhere],
    order,
    offset,
    limit,
  });

  ctx.body = { coins };
});

router.get('/coinCountries', async ctx => {
  const coinCountries = await Coin.findAll({
    attributes: ['country'],
    group: ['country'],
  });
  if (coinCountries) {
    let formattedCountries = [];
    formattedCountries.push({ value: 'Все', label: 'Все' });
    coinCountries.map(country => {
      formattedCountry = { value: country.country, label: country.country };
      formattedCountries.push(formattedCountry);
    });
    ctx.body = { countries: formattedCountries };
  } else {
    ctx.body = { countries: [] };
  }
});

router.get('/coinCities', async ctx => {
  const coinCities = await Coin.findAll({
    attributes: ['city'],
    group: ['city'],
  });
  if (coinCities) {
    let formattedCities = [];
    formattedCities.push({ value: 'Все', label: 'Все' });
    coinCities.map(city => {
      formattedCity = { value: city.city, label: city.city };
      formattedCities.push(formattedCity);
    });
    ctx.body = { cities: formattedCities };
  } else {
    ctx.body = { cities: [] };
  }
});

router.get('/:id', authenticate, async ctx => {
  const coin = await Coin.findById(ctx.params.id);

  ctx.body = coin;
});

router.delete('/:id', authenticate, async ctx => {
  const coin = await Coin.findById(ctx.params.id);
  coin.destroy();

  ctx.body = coin;
});

router.put('/pictureBase64', authenticate, async ctx => {
  if (ctx.request.files && ctx.request.files.picture) {
    await fsRun(
      `convert ${ctx.request.files.picture.path} ${
        ctx.request.files.picture.path
      }.png`
    );
    await fsRun(`rm ${ctx.request.files.picture.path}`);
    let data = await fsRead(ctx.request.files.picture.path + '.png');

    ctx.body = {
      base64: `data:image/png;base64,${data.toString('base64')}`,
    };
  }
});

router.put('/', authenticate, async ctx => {
  let data = {
    name: ctx.request.body.name,
    country: ctx.request.body.country,
    city: ctx.request.body.city,
    category: ctx.request.body.category,
    categoryCode: ctx.request.body.categoryCode,
  };

  if (ctx.request.files) {
    if (ctx.request.files.frontPicture) {
      await fsRun(
        `convert ${ctx.request.files.frontPicture.path} ${
          ctx.request.files.frontPicture.path
        }.png`
      );
      data.frontPicture = ctx.request.files.frontPicture.path + '.png';
      data.frontPictureMime = ctx.request.files.frontPicture.type;
    }
  }

  let coin = await Coin.create(data);

  ctx.body = coin;
});

router.post('/:id', authenticate, async ctx => {
  const coin = await Coin.findById(ctx.params.id);
  let data = {
    name: ctx.request.body.name,
    country: ctx.request.body.country,
    city: ctx.request.body.city,
    category: ctx.request.body.category,
    categoryCode: ctx.request.body.categoryCode,
  };

  if (ctx.request.files) {
    if (ctx.request.files.frontPicture) {
      await fsRun(
        `convert ${ctx.request.files.frontPicture.path} ${
          ctx.request.files.frontPicture.path
        }.png`
      );
      data.frontPicture = ctx.request.files.frontPicture.path + '.png';
      data.frontPictureMime = ctx.request.files.frontPicture.type;
    }
  }

  await coin.update(data);

  ctx.body = coin;
});

module.exports = router;
