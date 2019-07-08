const os = require('os');
const path = require('path');
const tar = require('tar');

const { fsWrite, fsMkDirTemp, fsMkDir, fsCopyFile } = require('./Common');

class Resource {
  constructor(device, coins, envelopes) {
    this.device = device;
    this.content = {
      coins,
      envelopes
    };
  }

  generateHash() {
    return parseInt(Date.now() / 1000);
  }

  getExtByMime(mime) {
    switch (mime) {
      case 'image/tiff': return 'tif';
      case 'image/png': return 'png';
      case 'image/bmp': return 'bmp';
      case 'image/jpg': return 'jpg';

      default: return 'tif';
    }
  }

  async pack() {
    let hash = this.generateHash();
    let folder = await fsMkDirTemp(path.join(os.tmpdir(), 'vending-admin-'));
    let coinF = await fsMkDir(path.join(folder, 'Coin'));
    let envelopeF = await fsMkDir(path.join(folder, 'Envelope'));

    let coins = await Promise.all(this.content.coins.map(async coin => {
      coin = coin.toJSON();
      coin.filename = `${coin.id}.${this.getExtByMime(coin.frontPictureMime)}`;
      await fsCopyFile(coin.frontPicture.replace('.png', ''), path.join(coinF, coin.filename));
      return coin;
    }));

    let num = 1;
    let envelopes = await Promise.all(this.content.envelopes.map(async envelope => {
      envelope = envelope.toJSON();
      envelope.num = num++;
      envelope.filename = `${envelope.id}.png`;
      await fsCopyFile(envelope.picture.replace('.png', ''), path.join(envelopeF, envelope.filename));
      return envelope;
    }));

    await fsWrite(path.join(coinF, 'index.json'), JSON.stringify(coins, null, '  '));
    await fsWrite(path.join(envelopeF, 'index.json'), JSON.stringify(envelopes, null, '  '));

    await fsMkDir(`public/uploads/resources/${this.device.externalId}`);

    await tar.c({
      gzip: true,
      file: `public/uploads/resources/${this.device.externalId}/${hash.toString()}.tgz`,
      cwd: folder
    }, [ 'Coin', 'Envelope' ]);

    return hash;
  }
}

module.exports = Resource;