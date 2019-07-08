const send = require('koa-send');
const router = require('koa-router')();
const authenticate = require('../models/Auth').authenticate;
const { Device, Coin, Envelope, Statistics } = require('../models/DB');
const { getFilters, fsWrite } = require('../models/Common');

const Iconv  = require('iconv').Iconv;

router.get('/coins', authenticate, async ctx => {
  let { offset, limit } = getFilters(ctx.query);
  limit = ctx.query.limit ? limit : undefined;

  let { from, to } = ctx.query;
  from = from && from != 'undefined' && new Date(+from);
  to = to && to != 'undefined' && new Date(+to + 1000*60*60*24);

  if (from) {
    from.setHours(0);
    from.setMinutes(0);
  }

  if (to) {
    to.setHours(0);
    to.setMinutes(0);
  }

  let where = { type: 'print_image' };
  if (from && to) where.date = { $between: [from, to] };
  else if (from || to) {
    where.date = {};
    if (from) where.date.$gte = from;
    if (to) where.date.$lte = to;
  }

  let deviceWhere = {};
  if (ctx.token.user.role != 'admin') {
    deviceWhere.userId = ctx.token.user.id;
  }

  let stats = await Statistics.findAll({ where, include: [ { model: Device, where: deviceWhere }, Coin ], offset });

  let cities = {};
  let cityData = {};
  let dateData = {};
  let data = {};
  let citiesFilter = ctx.query.cities && ctx.query.cities.split(',') || [];
  let coinsFilter = ctx.query.coins && ctx.query.coins.split(',') || [];

  stats.map(s => {
    if (!s.coin || !s.device) return;
    cities[s.device.city] = true;
    data[s.coin.id] = data[s.coin.id] || {};
    data[s.coin.id].id = s.coin.id;
    data[s.coin.id].name = s.coin.name;

    if ((!coinsFilter.length || ~coinsFilter.indexOf(`${s.coin.id}`)) && (!citiesFilter.length || ~citiesFilter.indexOf(`${s.device.city}`))) {
      data[s.coin.id][`city_${s.device.city}`] = (data[s.coin.id][`city_${s.device.city}`] || 0) + 1;
      data[s.coin.id].all = (data[s.coin.id].all || 0) + 1;
      cityData[`city_${s.device.city}`] = (cityData[`city_${s.device.city}`] || 0) + 1;
      cityData.all = (cityData.all || 0) + 1;

      dateData[s.coin.id] = dateData[s.coin.id] || [];
      dateData[s.coin.id].push(s.date.getTime());
    }
  });

  data = Object.keys(data).map(k => data[k]);

  let revert = false;
  let sort = 'id';
  if (ctx.query.sort) {
    revert = ctx.query.sort[0] == '-';
    sort = ctx.query.sort.slice(revert ? 1 : 0);
  }

  data.sort((a, b) => {
    return revert ? (a[sort] < b[sort]) : (a[sort] > b[sort]);
  })

  ctx.body = {
    data: {
      cities: Object.keys(cities),
      data, cityData, dateData
    }
  };
});

router.get('/envelopes', authenticate, async ctx => {
  let { offset, limit } = getFilters(ctx.query);

  let { from, to } = ctx.query;
  from = from && from != 'undefined' && new Date(+from);
  to = to && to != 'undefined' && new Date(+to + 1000*60*60*24);

  let where = { type: 'print_envelope' };
  if (from && to) where.date = { $between: [from, to] };
  else if (from || to) {
    where.date = {};
    if (from) where.date.$gte = from;
    if (to) where.date.$lte = to;
  }

  let deviceWhere = {};
  if (ctx.token.user.role != 'admin') {
    deviceWhere.userId = ctx.token.user.id;
  }

  let stats = await Statistics.findAll({ where, include: [ { model: Device, where: deviceWhere }, Envelope ], offset });

  let cities = {};
  let cityData = {};
  let dateData = {};
  let data = {};
  let citiesFilter = ctx.query.cities && ctx.query.cities.split(',') || [];
  let envelopesFilter = ctx.query.envelopes && ctx.query.envelopes.split(',') || [];

  stats.map(s => {
    if (!s.envelope || !s.device) return;
    cities[s.device.city] = true;
    data[s.envelope.id] = data[s.envelope.id] || {};
    data[s.envelope.id].id = s.envelope.id;
    data[s.envelope.id].name = s.envelope.name;

    if ((!envelopesFilter.length || ~envelopesFilter.indexOf(`${s.envelope.id}`)) && (!citiesFilter.length || ~citiesFilter.indexOf(`${s.device.city}`))) {
      data[s.envelope.id][`city_${s.device.city}`] = (data[s.envelope.id][`city_${s.device.city}`] || 0) + 1;
      data[s.envelope.id].all = (data[s.envelope.id].all || 0) + 1;
      cityData[`city_${s.device.city}`] = (cityData[`city_${s.device.city}`] || 0) + 1;
      cityData.all = (cityData.all || 0) + 1;

      dateData[s.envelope.id] = dateData[s.envelope.id] || [];
      dateData[s.envelope.id].push(s.date.getTime());
    }
  });

  data = Object.keys(data).map(k => data[k]);

  let revert = false;
  let sort = 'id';
  if (ctx.query.sort) {
    revert = ctx.query.sort[0] == '-'; 
    sort = ctx.query.sort.slice(revert ? 1 : 0);
  } 

  data.sort((a, b) => {
    return revert ? (a[sort] < b[sort]) : (a[sort] > b[sort]);
  })
  
  ctx.body = {
    data: {
      cities: Object.keys(cities),
      data, cityData, dateData
    }
  };
});

router.get('/export', authenticate, async ctx => {
  let { offset, limit } = getFilters(ctx.query);
  let entity = ctx.query.entity;
  
  let { from, to } = ctx.query;
  from = from && from != 'undefined' && new Date(+from);
  to = to && to != 'undefined' && new Date(+to + 1000*60*60*24);

  let where = { type: (entity == 'coins' ? 'print_image' : 'print_envelope') };
  if (from && to) where.date = { $between: [from, to] };
  else if (from || to) {
    where.date = {};
    if (from) where.date.$gte = from;
    if (to) where.date.$lte = to;
  }

  let deviceWhere = {};
  if (ctx.token.user.role != 'admin') {
    deviceWhere.userId = ctx.token.user.id;
  }

  let stats = await Statistics.findAll({
    where,
    include: [ { model: Device, where: deviceWhere }, (entity == 'coins' ? Coin : Envelope) ],
    offset
  });

  let cities = {};
  let cityData = {};
  let dateData = {};
  let data = {};
  let fieldEntity = entity == 'coins' ? 'coin' : 'envelope';
  let citiesFilter = ctx.query.cities && ctx.query.cities.split(',') || [];
  let filter = ctx.query[entity] && ctx.query[entity].split(',') || [];

  stats.map(s => {
    if (!s[fieldEntity] || !s.device) return;
    if (filter.length && !~filter.indexOf(`${s[fieldEntity].id}`)) return false;
    if (citiesFilter.length && !~citiesFilter.indexOf(`${s.device.city}`)) return false;

    cities[s.device.city] = true;
    data[s[fieldEntity].id] = data[s[fieldEntity].id] || {};
    data[s[fieldEntity].id].id = s[fieldEntity].id;
    data[s[fieldEntity].id].name = s[fieldEntity].name;
    data[s[fieldEntity].id][`city_${s.device.city}`] = (data[s[fieldEntity].id][`city_${s.device.city}`] || 0) + 1;
    data[s[fieldEntity].id].all = (data[s[fieldEntity].id].all || 0) + 1;
    cityData[`city_${s.device.city}`] = (cityData[`city_${s.device.city}`] || 0) + 1;
    cityData.all = (cityData.all || 0) + 1;

    dateData[s[fieldEntity].id] = dateData[s[fieldEntity].id] || [];
    dateData[s[fieldEntity].id].push(s.date.getTime());
  });

  data = Object.keys(data).map(k => data[k]);

  let revert = false;
  let sort = 'id';
  if (ctx.query.sort) {
    revert = ctx.query.sort[0] == '-'; 
    sort = ctx.query.sort.slice(revert ? 1 : 0);
  } 

  data.sort((a, b) => {
    return revert ? (a[sort] < b[sort]) : (a[sort] > b[sort]);
  })
  
  let csv = '';

  csv += '"' + ['ID', ((entity == 'coins') ? 'Монеты' : 'Конверты')]
    .concat(Object.keys(cities))
    .concat(['Всего'])
    .join('";"') + '"\n';

  data.map(d => {
    let c = [d.id, d.name];
    Object.keys(cities).map(city => {
      c.push(d[`city_${city}`]);
    });
    c.push(d.all);

    csv += '"' + c.join('";"') + '"\n';
  });

  let c = ['', 'Всего'];
  Object.keys(cities).map(city => {
    c.push(cityData[`city_${city}`]);
  });
  c.push(cityData.all);
  csv += '"' + c.join('";"') + '"\n';

  let iconv = Iconv('UTF-8', 'CP1251');
  csv = iconv.convert(csv);

  await fsWrite('tmp/exportStat.csv', csv);

  await send(ctx, 'tmp/exportStat.csv');
});

module.exports = router;
