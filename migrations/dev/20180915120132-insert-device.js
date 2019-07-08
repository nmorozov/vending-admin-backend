'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db, callback) {
  db.insert(
    'devices',
    [
      'externalId',
      'userId',
      'country',
      'city',
      'placementAddress',
      'softwareVersion',
      'model',
      'serialNumber',
      'status',
    ],
    [
      0,
      2,
      'Россия',
      'Москва',
      'пр-т Мира, 211, ТЦ «Золотой Вавилон»',
      '1.1',
      '1g',
      'ABC123',
      1,
    ],
    callback
  );
};

exports.down = function(db, callback) {
  db.runSql("DELETE FROM devices WHERE ownerId = 2", [], function(err) {
    console.log(err);
    callback();
  });
};

exports._meta = {
  version: 1,
};
