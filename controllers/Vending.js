const router = require('koa-router')();
const {
  Device,
  Monitoring,
  Coin,
  Envelope,
  Statistics,
  UserTypeInput,
  Language,
  deviceEvents,
} = require('../models/DB');
const DeviceEmails = require('../models/DB').deviceEmails;
const EventSender = require('../logick/Event/EventSender');
const EventDetector = require('../logick/Event/EventDetector');


router.get('/:id/ping', async ctx => {
  let device = await Device.findOne({
    where: { externalId: ctx.params.id },
  });

  if (!device) {
    return ctx.throw(404, 'Device not found');
  }
  
  device.status = parseInt(Date.now() / 1000);
  const deviceForResponse = JSON.stringify(device.get({ plain: true }));

  device.envelopeRestart = 0;
  device.payment = 0;
  device.printerRestart = 0;
  device.vendingRestart = 0;
  await device.save();

  ctx.body = JSON.parse(deviceForResponse);
});

router.post('/:id/statistics', async ctx => {
  let device = await Device.findOne({
    where: { externalId: ctx.params.id },
    include: [Envelope, Coin],
  });

  if (!device) {
    return ctx.throw(404, 'Device not found');
  }

  let dataId;
  switch (ctx.request.body.type) {
    case 'select_image':
    case 'print_image':
      if (device.coins[parseInt(ctx.request.body.data) - 1]) {
        dataId = device.coins[parseInt(ctx.request.body.data) - 1].id;
      } else {
        dataId = parseInt(ctx.request.body.data);
        console.log(ctx.request.body.type, ctx.request.body.data);
      }
      break;

    case 'select_envelope':
    case 'print_envelope':
      if (device.envelopes[parseInt(ctx.request.body.data) - 1]) {
        dataId = device.envelopes[parseInt(ctx.request.body.data) - 1].id;
      } else {
        dataId = parseInt(ctx.request.body.data);
        console.log(ctx.request.body.type, ctx.request.body.data);
      }
      break;

    case 'select_language':
      let lang = await Language.findOne({
        where: { code: ctx.request.body.data },
      }).catch(e => {});
      if (lang) {
        dataId = lang.id;
      } else {
        dataId = parseInt(ctx.request.body.data);
        console.log(ctx.request.body.type, ctx.request.body.data);
      }
      break;

    case 'select_client_type':
    case 'print_client_type':
      let userType = await UserTypeInput.findOne({
        where: { code: ctx.request.body.data },
      }).catch(e => {});
      if (userType) {
        dataId = userType.id;
      } else {
        dataId = parseInt(ctx.request.body.data);
        console.log(ctx.request.body.type, ctx.request.body.data);
      }
      break;

    default:
      dataId = parseInt(ctx.request.body.data);
      console.log('default', ctx.request.body.type, ctx.request.body.data);
  }

  let stat = await Statistics.create({
    deviceId: device.id,
    type: ctx.request.body.type,
    dataId,
    date: Date.now(),
  });

  ctx.body = 'ok';
});

router.post('/:id/monitoring', async ctx => {
  const device = await Device.findOne({
    where: { externalId: ctx.params.id },
  });

  if (!device) {
    return ctx.throw(404, 'Device not found');
  }

  const monitoring = await Monitoring.findOne({
    where: { deviceId: device.id },
  });

  if (monitoring) {
    monitoring.destroy();
  }

  const requestBody = ctx.request.body;

  try {
    await Monitoring.create({
      deviceId: device.id,
      version: requestBody.version,
      currentPage: requestBody.currentPage,
      payment: requestBody.payment,
      coinStatus: requestBody.coinStatus,
      envelopeModuleStatuses: JSON.stringify(requestBody.envelopeModuleStatus),
      printerStatus: requestBody.printerStatus,
      lastPrinting: requestBody.lastPrinting,
      failedCommands: `${requestBody.command.envelopeRestart}${
        requestBody.command.payment
      }${requestBody.command.printerRestart}${
        requestBody.command.vendingRestart
      }`,
    });
  } catch (e) {
    ctx.body = e.message;
  }
  
  const recipients = await DeviceEmails.findAll({where: { deviceId: device.id }});

  if (recipients) {
    const eventDetector = new EventDetector(ctx.request.body, device, deviceEvents);
    await eventDetector.detect();
    const events = eventDetector.getEvents();
    const eventSender = new EventSender(events, recipients, device);
    await eventSender.send();
  }

  ctx.body = 'ok';
});

module.exports = router;
