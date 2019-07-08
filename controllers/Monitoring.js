const router = require('koa-router')();
const authenticate = require('../models/Auth').authenticate;
const Monitoring = require('../models/DB').Monitoring;
const Device = require('../models/DB').Device;
const DeviceEmails = require('../models/DB').deviceEmails;

router.get('/:id', authenticate, async ctx => {
  const monitoring = await Monitoring.findOne({
    where: { deviceId: ctx.params.id },
    include: [Device, DeviceEmails],
  });

  ctx.body = monitoring;
});

router.put('/:id/emails', authenticate, async ctx => {
  await DeviceEmails.destroy({ where: { deviceId: ctx.params.id } });

  if (ctx.request.body && ctx.request.body.emails) {
    ctx.request.body.emails.map(async email => {
      await DeviceEmails.create({ email: email, deviceId: ctx.params.id });
    });
  }

  ctx.body = 'ok';
});

router.post('/:id/:commandName/:commandValue', authenticate, async ctx => {
  const device = await Device.findOne({
    where: { externalId: ctx.params.id },
  });

  device[ctx.params.commandName] = ctx.params.commandValue;
  await device.save();

  ctx.body = 'ok';
});

module.exports = router;
