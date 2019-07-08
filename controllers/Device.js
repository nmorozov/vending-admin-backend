const router = require('koa-router')();
const Sequelize = require('sequelize');
const authenticate = require('../models/Auth').authenticate;
const Device = require('../models/DB').Device;
const User = require('../models/DB').User;
const Coin = require('../models/DB').Coin;
const Envelope  = require('../models/DB').Envelope;
const Op = Sequelize.Op;

const Resource = require('../models/Resource');
const { fsRun } = require('../models/Common');
const { getFilters } = require('../models/Common');

router.get('/', authenticate, async ctx => {
  const { query } = ctx;
  let { order, offset, limit } = getFilters(ctx.query, { user: User, users: User });
  let searchWhere = {};
  let where;

  if (ctx.token.user.role != 'admin') {
    where = { userId: ctx.token.user.id };
  } else {
    where = {};
  }

  if (query.searchString) {
    searchWhere = {
      $or: [
        { id: { like: '%' + query.searchString + '%' } },
        { '$user.shortCompanyName$': {like: '%' + query.searchString + '%' } },
        { '$user.caretakerFullName$': {like: '%' + query.searchString + '%' } },
        { '$user.caretakerPhone$': {like: '%' + query.searchString + '%' } },
        { '$user.caretakerEmail$': {like: '%' + query.searchString + '%' } },
        { country: { like: '%' + query.searchString + '%' } },
        { city: { like: '%' + query.searchString + '%' } },
        { placementAddress: { like: '%' + query.searchString + '%' } },
        { softwareVersion: { like: '%' + query.searchString + '%' } },
        { model: { like: '%' + query.searchString + '%' } },
        { serialNumber: { like: '%' + query.searchString + '%' } },
        { status: { like: '%' + query.searchString + '%' } },
      ]
    };
  }


  let devices = await Device.findAll({
    include: [User, Coin, Envelope],
    where: {...where, ...searchWhere},
    order
  });

  devices = devices.slice(offset, offset + limit);

  ctx.body = { devices };
});

router.get('/count', authenticate, async ctx => {
  let devicesCount = await Device.count();

  ctx.body = devicesCount;
});

router.post('/setCoins/:id', authenticate, async ctx => {
  let device = await Device.findOne({
    include: [Coin],
    where: { id: ctx.params.id },
  });


  const coins = ctx.request.body.coins || [];
  if (Array.isArray(coins)) await device.setCoins(coins);

  ctx.body = device;
});

router.post('/setEnvelopes/:id', authenticate, async ctx => {
  let device = await Device.findOne({
    include: [Envelope],
    where: { id: ctx.params.id },
  });


  const envelopes = ctx.request.body.envelopes || [];
  if (Array.isArray(envelopes)) await device.setEnvelopes(envelopes);

  ctx.body = device;
});

router.get('/:id', authenticate, async ctx => {
  let device = await Device.findOne({
    include: [User, Coin, Envelope],
    where: { id: ctx.params.id },
  });

  ctx.body = device;
});

router.post('/set_status', authenticate, async ctx => {
  await Device.update(
    { status: ctx.request.body.status },
    {
      where: {
        id: ctx.request.body.deviceId,
      },
    }
  );

  ctx.body = { status: 'success' };
});

router.put('/', authenticate, async ctx => {
  let deviceExists = await Device.findOne({ where: { externalId: ctx.request.body.externalId } });
  if (deviceExists) {
    ctx.status = 400;
    ctx.body = 'Device already created';
    return;
  }

  let device = await Device.create({
    externalId: ctx.request.body.externalId,
    country: ctx.request.body.country,
    city: ctx.request.body.city,
    placementAddress: ctx.request.body.placementAddress,
    softwareVersion: ctx.request.body.softwareVersion,
    model: ctx.request.body.model,
    serialNumber: ctx.request.body.serialNumber,
    status: ctx.request.body.status,
  });

  let user = await User.findOne({ where: { id: ctx.request.body.userId } });
  device.setUser(user);

  const reqCoins = ctx.request.body.spiritCoins && ctx.request.body.spiritCoins.split(' ');
  let coins = [];
  if (Array.isArray(reqCoins) && reqCoins.length) {
    coins = await Coin.findAll({
      where: {
        id: {
          [Op.in]: reqCoins,
        },
      },
    });

    await device.setCoins(coins);
  }

  const reqEnvelopes = ctx.request.body.envelopes && ctx.request.body.envelopes.split(' ');
  let envelopes = [];
  if (Array.isArray(reqEnvelopes) && reqEnvelopes.length) {
    envelopes = await Envelope.findAll({
      where: {
        id: {
          [Op.in]: reqEnvelopes,
        },
      },
    });

    await device.setEnvelopes(envelopes);
  }

  let resource = new Resource(device, coins, envelopes);
  let updateResources = await resource.pack();
  device.update({ updateResources });

  ctx.body = device;
});

router.delete('/:id', authenticate, async ctx => {
  const device = await Device.findById(ctx.params.id);
  device.destroy();

  ctx.body = device;
});

router.post('/:id', authenticate, async ctx => {
  let device = await Device.findById(ctx.params.id, { include: [User, Coin] });
  let user = await User.findOne({ where: { id: ctx.request.body.userId } });
  device.setUser(user);
  await device.update({
    externalId: parseInt(ctx.request.body.externalId, 10),
    country: ctx.request.body.country,
    city: ctx.request.body.city,
    placementAddress: ctx.request.body.placementAddress,
    softwareVersion: ctx.request.body.softwareVersion,
    model: ctx.request.body.model,
    serialNumber: ctx.request.body.serialNumber,
  });

  const reqCoins = ctx.request.body.spiritCoins && ctx.request.body.spiritCoins.split(' ');
  let coins = [];
  if (Array.isArray(reqCoins) && reqCoins.length) {
    coins = await Coin.findAll({
      where: {
        id: {
          [Op.in]: reqCoins,
        },
      },
    });

    await device.setCoins(coins);
  }

  let reqEnvelopes = [];
  if (ctx.request.body.envelopes) {
    if (Array.isArray(ctx.request.body.envelopes)) {
      reqEnvelopes = ctx.request.body.envelopes.map(e => e.id);
    } else {
      reqEnvelopes = ctx.request.body.envelopes.split(' ');

    }
  }
  let envelopes = [];
  if (Array.isArray(reqEnvelopes) && reqEnvelopes.length) {
    envelopes = await Envelope.findAll({
      where: {
        id: {
          [Op.in]: reqEnvelopes,
        },
      },
    });

    await device.setEnvelopes(envelopes);
  }

  let resource = new Resource(device, coins, envelopes);
  let updateResources = await resource.pack();
  device.update({ updateResources });

  ctx.body = device;
});

const getCurrentLogFileName = () => {
  const today = new Date();
  const yyyy = today.getFullYear();

  let dd = today.getDate();
  let mm = today.getMonth() + 1;

  if (dd < 10) {
    dd = `0${dd}`;
  }

  if (mm < 10) {
    mm = `0${mm}`;
  }

  return `${mm}${dd}${yyyy}.txt`;
};

router.get('/:id/getLog', async ctx => {
  let id = ctx.params.id;
  await fsRun(
    `scp -P 1002${id} vendinglinux${id}@vending.rugt.pro:.config/Vending/log/${getCurrentLogFileName()} ${__dirname}/../public/uploads/${getCurrentLogFileName()}`
  );

  ctx.redirect(
    `http://vending.rugt.pro:8888/public/uploads/${getCurrentLogFileName()}`
  );
});

module.exports = router;
