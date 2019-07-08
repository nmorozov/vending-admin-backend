const router = require('koa-router')();
const authenticate = require('../models/Auth').authenticate;
const Order = require('../models/DB').Order;
const { getFilters } = require('../models/Common');

router.get('/', authenticate, async ctx => {
  const { query } = ctx;
  let { order, offset, limit } = getFilters(ctx.query);
  let searchWhere = {};

  if (query.searchString) {
    searchWhere = {
      $or: [
        { 'id': { like: '%' + query.searchString + '%' } },
        { 'company': { like: '%' + query.searchString + '%' } },
        { 'note': { like: '%' + query.searchString + '%' } },
        { 'order1cNumber': { like: '%' + query.searchString + '%' } },
        { 'coinsCount': { like: '%' + query.searchString + '%' } },
        { 'envelopesCount': { like: '%' + query.searchString + '%' } },
        { 'country': { like: '%' + query.searchString + '%' } },
        { 'city': { like: '%' + query.searchString + '%' } },
        { 'total': { like: '%' + query.searchString + '%' } },
      ]
    };
  }

  let orders = await Order.findAll({ where: searchWhere, order, offset, limit });

  ctx.body = { orders };
});

router.put('/', authenticate, async ctx => {
  let order = await Order.create({
    company: ctx.request.body.company,
    note: ctx.request.body.note,
    order1cNumber: ctx.request.body.order1cNumber,
    coinsCount: ctx.request.body.coinsCount,
    envelopesCount: ctx.request.body.envelopesCount,
    date: ctx.request.body.date,
    country: ctx.request.body.country,
    city: ctx.request.body.city,
    total: ctx.request.body.total,
  });

  ctx.body = order;
});

router.get('/:id', authenticate, async ctx => {
  const order = await Order.findById(ctx.params.id);

  ctx.body = order;
});

router.delete('/:id', authenticate, async ctx => {
  const order = await Order.findById(ctx.params.id);
  order.destroy();

  ctx.body = order;
});

router.post('/:id', authenticate, async ctx => {
  const order = await Order.findById(ctx.params.id);
  await order.update({
    company: ctx.request.body.company,
    order1cNumber: ctx.request.body.order1cNumber,
    coinsCount: ctx.request.body.coinsCount,
    envelopesCount: ctx.request.body.envelopesCount,
    date: ctx.request.body.date,
    country: ctx.request.body.country,
    city: ctx.request.body.city,
    total: ctx.request.body.total,
    note: ctx.request.body.note,
  });

  ctx.body = order;
});

module.exports = router;
