const sha512 = require('js-sha512');
const Sequelize = require('sequelize');

const Request = require('oauth2-server').Request;
const Response = require('oauth2-server').Response;
const app = require('../index');

const oauthToken = require('./DB').oauthToken;
const oauthClient = require('./DB').oauthClient;
const User = require('./DB').User;

const Op = Sequelize.Op;

module.exports.formatResponse = ctxResponse => {
  return { ...ctxResponse };
};

module.exports.authenticate = async (ctx, next) => {
  let request = new Request(ctx.request);
  let response = new Response(module.exports.formatResponse(ctx.response.headers));
  ctx.token = await app.oauth.authenticate(request, response);
  await next();
};

module.exports.getAccessToken = async function(bearerToken) {
  const result = await oauthToken.findAll({
    where: {
      access_token: bearerToken,
    },
  });

  const token = result[0];

  if (!token) {
    return false;
  }

  return {
    accessToken: token.access_token,
    accessTokenExpiresAt: token.access_token_expires_on,
    clientId: token.client_id,
    expires: token.expires,
    user: await token.getUser(),
  };
};

module.exports.getClient = function*(clientId, clientSecret) {
  return { id: clientId, clientSecret, grants: ['password', 'refresh_token'] };
};

module.exports.getRefreshToken = function(bearerToken) {
  const result = oauthToken.findAll({
    where: {
      refresh_token: bearerToken,
    },
  });

  return result.length > 0 ? result.rows[0] : false;
};

module.exports.getUser = async function(username, password) {
  const hashedPassword = sha512(password).toUpperCase();

  const result = await User.findAll({
    where: {
      [Op.and]: [{ username: username }, { password: hashedPassword }],
    },
  });

  return result.length > 0 ? result[0] : false;
};

module.exports.saveToken = async function(token, client, user) {
  const result = await oauthToken.create({
    access_token: token.accessToken,
    access_token_expires_on: token.accessTokenExpiresAt,
    client_id: client.id,
    refresh_token: token.refreshToken,
    refresh_token_expires_on: token.refreshTokenExpiresAt,
    user_id: user.id,
    role: user.role,
  });

  await oauthClient.findOrCreate({
    where: {
      client_id: client.id,
      client_secret: client.clientSecret,
    },
  });

  let response;

  if (result.dataValues.hasOwnProperty('refresh_token')) {
    response = {
      ...token,
      client: client,
      user: user,
    };
  } else {
    response = false;
  }

  return response;
};

module.exports.getRefreshToken = async function name(refreshToken) {
  const result = await oauthToken.findAll({
    where: {
      refresh_token: refreshToken,
    },
  });

  const token = result[0];

  if (!token) {
    return false;
  }

  return {
    refresh_token: token.refresh_token,
    refreshTokenExpiresAt: token.refresh_token_expires_on,
    client: { id: token.client_id },
    user: await token.getUser(),
  };
};

module.exports.revokeToken = async function(refreshToken) {
  await oauthToken.destroy({
    where: {
      refresh_token: refreshToken.refresh_token,
    },
  });

  return true;
};
