const router = require('koa-router')();
const fs = require('fs');
var path = require('path');

router.post('/registration', async ctx => {
  const send = require('gmail-send')({});

  await new Promise((resolve, reject) => {
    objectData = {
      user: 'adm.checkincoin@gmail.com',
      pass: 'qwerty-123',
      to: ctx.request.body.username,
      subject: 'Успешная регистрация',
      text: ctx.request.body.message,
    };

    send(objectData, function(err, res) {
      if (err) {
        console.log(err);
        reject('ERROR');
      } else {
        resolve('OK');
      }
    });
  })
    .then(() => {
      ctx.body = { status: 'OK' };
    })
    .catch(() => {
      ctx.body = { status: 'ERROR' };
    });

  ctx.body = 'OK';
});

router.post('/send', async ctx => {
  const send = require('gmail-send')({});
  let pathToFile = '';
  let file = [];
  if (ctx.request.files && ctx.request.files.attachment) {
    const appDir = path.dirname(require.main.filename);
    pathToFile = `${appDir}/public/uploads/`;
    file = ctx.request.files.attachment;
    const reader = fs.createReadStream(file.path);
    const stream = fs.createWriteStream(`${pathToFile}${file.name}`);
    reader.pipe(stream);
  }

  await new Promise((resolve, reject) => {
    let files = [];
    if (ctx.request.files.hasOwnProperty('attachment')) {
      files = `${pathToFile}${file.name}`;
    }
    objectData = {
      user: 'adm.checkincoin@gmail.com',
      pass: 'qwerty-123',
      files: files,
      to: ctx.request.body.username,
      subject: ctx.request.body.theme,
      text: ctx.request.body.message,
    };

    if (!ctx.request.files.hasOwnProperty('attachment')) {
      delete objectData.files;
    }

    send(objectData, function(err, res) {
      if (err) {
        console.log(err);
        reject('ERROR');
      } else {
        resolve('OK');
      }
    });
  })
    .then(() => {
      ctx.body = { status: 'OK' };
    })
    .catch(() => {
      ctx.body = { status: 'ERROR' };
    });

  ctx.body = 'OK';
});

module.exports = router;
