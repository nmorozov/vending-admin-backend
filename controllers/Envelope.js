const { fsRun } = require('../models/Common');

const router = require('koa-router')();
const authenticate = require('../models/Auth').authenticate;
const Envelope = require('../models/DB').Envelope;
const { getFilters } = require('../models/Common');

router.get('/', authenticate, async ctx => {
  const { query } = ctx;
  let { order, offset, limit } = getFilters(ctx.query);
  let searchWhere = {};

  if (query.forDevicePopup) {
    limit = 500000;
  }

  if (query.searchString) {
    searchWhere = {
      $or: [
        { 'id': { like: '%' + query.searchString + '%' } },
        { 'name': { like: '%' + query.searchString + '%' } },
        { 'note': { like: '%' + query.searchString + '%' } },
      ]
    };
  }

  let envelopes = await Envelope.findAll({ where: searchWhere, order, offset, limit });

  ctx.body = { envelopes };
});

router.get('/:id', authenticate, async ctx => {
  const envelope = await Envelope.findById(ctx.params.id);

  ctx.body = envelope;
});

router.delete('/:id', authenticate, async ctx => {
  const envelope = await Envelope.findById(ctx.params.id);
  envelope.destroy();

  ctx.body = envelope;
});

router.put('/', authenticate, async ctx => {
  let data = {
    name: ctx.request.body.name,
    note: ctx.request.body.note,
  };

  if (ctx.request.files) {
    if (ctx.request.files.picture) {
      await fsRun(`convert ${ctx.request.files.picture.path} ${ctx.request.files.picture.path}.png`);
      data.picture = ctx.request.files.picture.path + '.png';
      data.pictureMime = ctx.request.files.picture.type;
    }
  }
  
  let envelope = await Envelope.create(data);

  ctx.body = envelope;
});

router.post('/:id', authenticate, async ctx => {
  const envelope = await Envelope.findById(ctx.params.id);
  let data = {
    name: ctx.request.body.name,
    note: ctx.request.body.note,
  };

  if (ctx.request.files && ctx.request.files.picture) {
    await fsRun(`convert ${ctx.request.files.picture.path} ${ctx.request.files.picture.path}.png`);
    data.picture = ctx.request.files.picture + '.png';
  }

  await envelope.update(data);

  ctx.body = envelope;
});

module.exports = router;
