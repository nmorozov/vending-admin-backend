const router = require('koa-router')();
const User = require('../models/DB').User;
const Sequelize = require('sequelize');
const authenticate = require('../models/Auth').authenticate;
const { getFilters } = require('../models/Common');
const sha512 = require('js-sha512');

const Op = Sequelize.Op;

router.get('/', authenticate, async ctx => {
  const { query } = ctx;
  let { order, offset, limit } = getFilters(ctx.query);
  searchWhere = {};

  if (query.searchString) {
    searchWhere = {
      $or: [
        { 'id': { like: '%' + query.searchString + '%' } },
        { 'shortCompanyName': { like: '%' + query.searchString + '%' } },
        { 'country': { like: '%' + query.searchString + '%' } },
        { 'city': { like: '%' + query.searchString + '%' } },
        { 'caretakerFullName': { like: '%' + query.searchString + '%' } },
        { 'caretakerPhone': { like: '%' + query.searchString + '%' } },
        { 'ownerEmail': { like: '%' + query.searchString + '%' } },
      ]
    };
  }

  const owners = await User.findAll({ where: { role: 'owner', ...searchWhere }, order, offset, limit });
  ctx.body = { owners };
});

router.delete('/:id', authenticate, async ctx => {
  const owner = await User.findById(ctx.params.id);
  
  owner.destroy();

  ctx.body = owner;
});

router.put('/', async ctx => {
  let owner = await User.create({
    role: 'owner',
    fullCompanyName: ctx.request.body.fullCompanyName,
    shortCompanyName: ctx.request.body.shortCompanyName,
    country: ctx.request.body.country,
    city: ctx.request.body.city,
    ownerFullName: ctx.request.body.ownerFullName,
    ownerPhone: ctx.request.body.ownerPhone,
    ownerEmail: ctx.request.body.ownerEmail,
    caretakerFullName: ctx.request.body.caretakerFullName,
    caretakerPhone: ctx.request.body.caretakerPhone,
    caretakerEmail: ctx.request.body.caretakerEmail,
    status: ctx.request.body.status,
    username: ctx.request.body.username,
    password: ctx.request.body.password,
  });

  const send = require('gmail-send')({});

  if (ctx.request.body.status === "true") {
    objectData = {
      user: 'adm.checkincoin@gmail.com',
      pass: 'qwerty-123',
      to: ctx.request.body.ownerEmail,
      subject: 'Активация учетной записи',
      text: 'Ваша учетная запись была активирована',
    };
    send(objectData,function(err, res) {
      if (err) {
        console.log(err);
        reject('ERROR');
      } else {
        resolve('OK');
      }
    });
  }

  const admin = await User.findById(1);

  objectDataAdmin = {
    user: 'adm.checkincoin@gmail.com',
    pass: 'qwerty-123',
    to: admin.ownerEmail,
    subject: 'Регистрация нового пользователя',
    text: 'Зарегистрировался новый пользователь ' + ctx.request.body.ownerEmail,
  };
  send(objectDataAdmin,function(err, res) {
    if (err) {
      console.log(err);
      reject('ERROR');
    } else {
      resolve('OK');
    }
  });

  ctx.body = owner;
});

router.post('/changePassword/:id', authenticate, async ctx => {
  const owner = await User.findById(ctx.params.id);

  if (owner.password === sha512(ctx.request.body.oldPassword).toUpperCase()) {
    await owner.update({password: sha512(ctx.request.body.newPassword).toUpperCase()});
    ctx.body = owner;
  } else {
    ctx.body = {error: { message: 'Неверный пароль' }};
    ctx.status = 403;
  }
});

router.post('/:id', authenticate, async ctx => {
  const owner = await User.findById(ctx.params.id);

  if (!owner.status && ctx.request.body.status === "true") {
    const send = require('gmail-send')({});
    objectData = {
      user: 'adm.checkincoin@gmail.com',
      pass: 'qwerty-123',
      to: ctx.request.body.ownerEmail,
      subject: 'Активация учетной записи',
      text: 'Ваша учетная запись была активирована',
    };
    send(objectData,function(err, res) {
      if (err) {
        console.log(err);
        reject('ERROR');
      } else {
        resolve('OK');
      }
    });
  }

  await owner.update({
    role: 'owner',
    fullCompanyName: ctx.request.body.fullCompanyName,
    shortCompanyName: ctx.request.body.shortCompanyName,
    country: ctx.request.body.country,
    city: ctx.request.body.city,
    ownerFullName: ctx.request.body.ownerFullName,
    ownerPhone: ctx.request.body.ownerPhone,
    ownerEmail: ctx.request.body.ownerEmail,
    caretakerFullName: ctx.request.body.caretakerFullName,
    caretakerPhone: ctx.request.body.caretakerPhone,
    caretakerEmail: ctx.request.body.caretakerEmail,
    status: ctx.request.body.status,
  });

  ctx.body = owner;
});

router.get('/:id', authenticate, async ctx => {
  const owner = await User.findOne({
    where: { [Op.and]: [{ id: ctx.params.id }, { role: 'owner' }] },
  });

  ctx.body = owner;
});

module.exports = router;
