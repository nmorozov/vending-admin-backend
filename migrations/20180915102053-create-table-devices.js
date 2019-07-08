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
  db.createTable(
    'devices',
    {
      id: { type: 'int', primaryKey: true, autoIncrement: true },
      externalId: { type: 'int' },
      userId: { type: 'int' },
      country: { type: 'string' },
      city: { type: 'string' },
      placementAddress: { type: 'string' },
      softwareVersion: { type: 'string' },
      model: { type: 'string' },
      serialNumber: { type: 'string' },
      status: { type: 'int', defaultValue: 0 },
    },
    addForeignKey
  );

  function addForeignKey() {
    db.addForeignKey(
      'devices',
      'users',
      'devices_users_id_foreign',
      {
        userId: 'id',
      },
      {
        onDelete: 'CASCADE',
      },
      callback
    );
  }
};

exports.down = function(db, callback) {
  db.removeForeignKey('devices', 'devices_users_id_foreign', dropForeignKey);

  function dropForeignKey() {
    db.dropTable('devices', callback);
  }
};

exports._meta = {
  version: 1,
};
