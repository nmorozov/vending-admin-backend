const Sequelize = require('sequelize');
const databaseConfig = require('../config').getDatabaseConfig('dev');

const database = new Sequelize(
  databaseConfig.database,
  databaseConfig.user,
  databaseConfig.password,
  {
    dialect: 'mysql',
    timezone: 'Europe/Moscow',
    logging: false,
  }
);

const User = database.define(
  'users',
  {
    username: { type: Sequelize.STRING },
    password: { type: Sequelize.STRING },
    role: { type: Sequelize.STRING },
    fullCompanyName: { type: Sequelize.STRING },
    shortCompanyName: { type: Sequelize.STRING },
    country: { type: Sequelize.STRING },
    city: { type: Sequelize.STRING },
    ownerFullName: { type: Sequelize.STRING },
    ownerPhone: { type: Sequelize.STRING },
    ownerEmail: { type: Sequelize.STRING },
    caretakerFullName: { type: Sequelize.STRING },
    caretakerPhone: { type: Sequelize.STRING },
    caretakerEmail: { type: Sequelize.STRING },
    created: { type: Sequelize.DATE },
    status: { type: Sequelize.BOOLEAN },
  },
  { timestamps: false }
);

const Device = database.define(
  'devices',
  {
    externalId: { type: Sequelize.INTEGER },
    userId: { type: Sequelize.INTEGER },
    country: { type: Sequelize.STRING },
    city: { type: Sequelize.STRING },
    placementAddress: { type: Sequelize.STRING },
    softwareVersion: { type: Sequelize.STRING },
    model: { type: Sequelize.STRING },
    serialNumber: { type: Sequelize.STRING },
    status: { type: Sequelize.INTEGER },
    updateResources: { type: Sequelize.INTEGER },
    envelopeRestart: { type: Sequelize.INTEGER },
    payment: { type: Sequelize.INTEGER },
    printerRestart: { type: Sequelize.INTEGER },
    vendingRestart: { type: Sequelize.INTEGER },
  },
  { timestamps: false }
);

const oauthToken = database.define(
  'oauth_tokens',
  {
    access_token: { type: Sequelize.STRING },
    access_token_expires_on: { type: Sequelize.DATE },
    client_id: { type: Sequelize.STRING },
    refresh_token: { type: Sequelize.STRING },
    refresh_token_expires_on: { type: Sequelize.DATE },
    user_id: { type: Sequelize.INTEGER },
    role: { type: Sequelize.STRING },
  },
  { timestamps: false }
);

const oauthClient = database.define(
  'oauth_clients',
  {
    client_id: { type: Sequelize.STRING },
    client_secret: { type: Sequelize.STRING },
  },
  { timestamps: false }
);

const Coin = database.define(
  'coins',
  {
    name: { type: Sequelize.STRING },
    country: { type: Sequelize.STRING },
    city: { type: Sequelize.STRING },
    category: { type: Sequelize.STRING },
    categoryCode: { type: Sequelize.STRING },
    frontPicture: { type: Sequelize.STRING },
    frontPictureMime: { type: Sequelize.STRING },
  },
  { timestamps: false }
);

const deviceCoins = database.define(
  'device_coins',
  {
    deviceId: { type: Sequelize.INTEGER },
    coinId: { type: Sequelize.INTEGER },
  },
  { timestamps: false }
);

const Envelope = database.define(
  'envelopes',
  {
    name: { type: Sequelize.STRING },
    picture: { type: Sequelize.STRING },
    note: { type: Sequelize.TEXT },
  },
  { timestamps: false }
);

const deviceEnvelopes = database.define(
  'device_envelopes',
  {
    deviceId: { type: Sequelize.INTEGER },
    envelopeId: { type: Sequelize.INTEGER },
  },
  { timestamps: false }
);

const Order = database.define(
  'orders',
  {
    company: { type: Sequelize.STRING },
    note: { type: Sequelize.TEXT },
    order1cNumber: { type: Sequelize.STRING },
    coinsCount: { type: Sequelize.INTEGER },
    envelopesCount: { type: Sequelize.INTEGER },
    date: { type: Sequelize.DATE },
    country: { type: Sequelize.STRING },
    city: { type: Sequelize.STRING },
    total: { type: Sequelize.FLOAT },
  },
  { timestamps: false }
);

const Statistics = database.define(
  'statistics',
  {
    deviceId: { type: Sequelize.INTEGER },
    type: { type: Sequelize.STRING },
    dataId: { type: Sequelize.STRING },
    date: { type: Sequelize.DATE },
  },
  { timestamps: false }
);

const Language = database.define(
  'languages',
  {
    name: { type: Sequelize.STRING },
    code: { type: Sequelize.STRING },
  },
  { timestamps: false }
);

const Geo = database.define(
  'geo',
  {
    country: { type: Sequelize.STRING },
    city: { type: Sequelize.STRING },
  },
  { timestamps: false, freezeTableName: true }
);

const UserTypeInput = database.define(
  'user_types',
  {
    name: { type: Sequelize.STRING },
    code: { type: Sequelize.STRING },
  },
  { timestamps: false }
);

const Monitoring = database.define(
  'monitoring',
  {
    deviceId: { type: Sequelize.INTEGER },
    version: { type: Sequelize.STRING },
    currentPage: { type: Sequelize.STRING },
    payment: { type: Sequelize.INTEGER },
    coinStatus: { type: Sequelize.INTEGER },
    envelopeModuleStatuses: { type: Sequelize.STRING },
    printerStatus: { type: Sequelize.INTEGER },
    lastPrinting: { type: Sequelize.INTEGER },
    failedCommands: { type: Sequelize.STRING },
  },
  { timestamps: false }
);

const deviceEmails = database.define(
  'device_emails',
  {
    deviceId: { type: Sequelize.INTEGER },
    email: { type: Sequelize.STRING },
  },
  { timestamps: false }
);

const deviceEvents = database.define(
  'device_events',
  {
    deviceId: { type: Sequelize.INTEGER },
    eventId: { type: Sequelize.STRING },
  },
  { timestamps: false }
);

oauthToken.belongsTo(User, { foreignKey: 'user_id' });
oauthToken.belongsTo(oauthClient, {
  foreignKey: 'client_id',
  targetKey: 'client_id',
});

User.hasMany(Device);
Device.belongsTo(User);

Device.belongsToMany(Coin, { through: deviceCoins });
Device.belongsToMany(Envelope, { through: deviceEnvelopes });
Device.hasMany(deviceEmails);
deviceEmails.belongsTo(Device);

Statistics.belongsTo(Device, { foreignKey: 'deviceId' });
Monitoring.belongsTo(Device, { foreignKey: 'deviceId' });
Monitoring.hasMany(deviceEmails, {
  foreignKey: 'deviceId',
  sourceKey: 'deviceId',
});

Statistics.belongsTo(Language, { foreignKey: 'dataId' });
Statistics.belongsTo(UserTypeInput, { foreignKey: 'dataId' });
Statistics.belongsTo(Envelope, { foreignKey: 'dataId' });
Statistics.belongsTo(Coin, { foreignKey: 'dataId' });

module.exports = {
  User,
  Device,
  oauthToken,
  oauthClient,
  Coin,
  Envelope,
  Order,
  Statistics,
  Language,
  UserTypeInput,
  Geo,
  Monitoring,
  deviceEmails,
  deviceEvents,
};
