const fs = require('fs');
const koa = require('koa');
const bodyParser = require('koa-body');
const morgan = require('koa-morgan');
const cors = require('@koa/cors');
const Router = require('koa-router');
const oauthServer = require('oauth2-server');
const serve = require('koa-static');
const mount = require('koa-mount');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const { Device, deviceEmails, deviceEvents } = require('./models/DB');
const Events = require('./logick/Event/Events');
const EventSender = require('./logick/Event/EventSender');

const app = (module.exports = new koa());
const accessLogStream = fs.createWriteStream(__dirname + '/logs/access.log', {
  flags: 'a',
});

app.oauth = new oauthServer({
  debug: true,
  model: require('./models/Auth'),
  requireClientAuthentication: { password: false },
  accessTokenLifetime: 8 * 60 * 60,
});

app.use(
  bodyParser({
    formidable: { uploadDir: './public/uploads' },
    multipart: true,
    urlencoded: true,
    jsonLimit: '100mb',
    formLimit: '100mb',
    textLimit: '100mb',
  })
);

app
  .use(morgan('combined', { stream: accessLogStream }))
  .use(mount('/public', serve('./public')))
  .use(cors())
  .use(require('./controllers').routes())
  .use(Router);

setInterval(async () => {
  const dateNow = parseInt(Date.now() / 1000);
  const dateMinusTimeout = dateNow - 300;
  const devices = await Device.findAll({
    where: { status: { [Op.lt]: dateMinusTimeout } },
  });
  const devicesOnline = await Device.findAll({
    where: { status: { [Op.gte]: dateMinusTimeout } },
  });

  if (devices.length > 0) {
    const events = [Events[9]];

    devices.map(async device => {
      const DeviceEvents = await deviceEvents.find({
        where: { deviceId: device.id, eventId: 10 },
      });
      const recipients = await deviceEmails.findAll({
        where: { deviceId: device.id },
      });
      if (recipients.length > 0 && !DeviceEvents) {
        const DeviceEvents = new deviceEvents({
          deviceId: device.id,
          eventId: 10,
        });
        DeviceEvents.save();
        const eventSender = new EventSender(events, recipients, device);
        await eventSender.send();
      }
    });
  }

  if (devicesOnline.length > 0) {
    devicesOnline.map(async deviceOnline => {
      const DeviceWasOffline = await deviceEvents.find({
        where: { deviceId: deviceOnline.id, eventId: 10 },
      });

      if (DeviceWasOffline) {
        const events = [Events[10]];
        const recipients = await deviceEmails.findAll({
          where: { deviceId: deviceOnline.id },
        });
        if (recipients.length > 0) {
          const eventSender = new EventSender(events, recipients, deviceOnline);
          await eventSender.send();
        }
        await DeviceWasOffline.destroy();
      }
    });
  }
}, 10000);

app.listen(8888);
