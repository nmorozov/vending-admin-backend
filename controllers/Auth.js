const router = require('koa-router')();
const Request = require('oauth2-server').Request;
const Response = require('oauth2-server').Response;
const sha512 = require('js-sha512');

const formatResponse = require('../models/Auth').formatResponse;
const oauthToken = require('../models/DB').oauthToken;
const app = require('../index');
const User = require('../models/DB').User;

router.post('/login', async ctx => {
  ctx.request.body.grant_type = 'password';
  const request = new Request(ctx.request);
  const response = new Response(formatResponse(ctx.response.headers));
  try {
    const token = await app.oauth.token(request, response);
    ctx.body = {
      accessToken: token.accessToken,
      accessTokenExpiresAt: token.accessTokenExpiresAt,
      refreshToken: token.refreshToken,
      refreshTokenExpiresAt: token.refreshTokenExpiresAt,
      user_id: token.user.id,
      role: token.user.role,
    };
  } catch (e) {
    ctx.status = 401;
    ctx.body = {
      error: { message: 'Неверный логин или пароль' },
    };
  }
});

router.post('/refresh', async ctx => {
  ctx.request.body.grant_type = 'refresh_token';
  const request = new Request(ctx.request);
  const response = new Response(formatResponse(ctx.response.headers));
  const token = await app.oauth.token(request, response);

  ctx.body = {
    accessToken: token.accessToken,
    accessTokenExpiresAt: token.accessTokenExpiresAt,
    refreshToken: token.refreshToken,
    refreshTokenExpiresAt: token.refreshTokenExpiresAt,
    user_id: token.user.id,
    role: token.user.role,
  };
});

router.post('/logout', async ctx => {
  var matches = ctx.request.header.authorization.match(/Bearer\s(\S+)/);
  console.log(matches);
  if (!matches) {
    ctx.code = 401;
  } else {
    await oauthToken.destroy({
      where: {
        access_token: matches[1],
      },
    });

    ctx.body = { success: true };
    ctx.code = 200;
  }
});

router.post('/password-reset', async ctx => {
  const user = await User.findOne({where: {$or: [{username: ctx.request.body.loginOrPhone}, {caretakerPhone: ctx.request.body.loginOrPhone}]}});
  if (!user) {
    ctx.status = 404;
    ctx.body = {
      error: { message: 'Такой пользователь не был найден' },
    };
  } else {
    const send = require('gmail-send')({});
    const password = generatePassword();
    objectData = {
      user: 'adm.checkincoin@gmail.com',
      pass: 'qwerty-123',
      to: user.username,
      subject: 'Новый пароль',
      text: `Ваш новый пароль: ${password}`,
    };

    send(objectData, function(err, res) {
      if (err) {
        console.log(err);
      }
    });

    user.update({password: sha512(password).toUpperCase()});
    ctx.body = { message: 'Пароль отправлен на Вашу почту.' };
    ctx.code = 200;
  }
});

function generatePassword() {
  const length = 8;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let retVal = '';
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

module.exports = router;
