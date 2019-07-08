const router = require('koa-router')();
const User = require('../models/DB').User;
const authenticate = require('../models/Auth').authenticate;

router.get('/', authenticate, async ctx => {
  const users = await User.findAll();

  ctx.body = users;
});

router.get('/:id', authenticate, async ctx => {
  const user = await User.findOne({
    where: { id: ctx.params.id },
  });

  ctx.body = user;
});

router.post('/:id', authenticate, async ctx => {
  const user = await User.findById(ctx.params.id);
  await user.update({
    ownerEmail: ctx.request.body.ownerEmail,
    ownerFullName: ctx.request.body.ownerFullName,
    ownerPhone: ctx.request.body.ownerPhone,
  });

  ctx.body = user;
});

module.exports = router;
