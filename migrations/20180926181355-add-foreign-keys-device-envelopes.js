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
  db.addForeignKey(
    'device_envelopes',
    'envelopes',
    'device_envelopes_envelopes_id_foreign',
    {
      coinId: 'id',
    },
    {
      onDelete: 'CASCADE',
    },
    () => {
      db.addForeignKey(
        'device_envelopes',
        'devices',
        'device_envelopes_devices_id_foreign',
        {
          deviceId: 'id',
        },
        {
          onDelete: 'CASCADE',
        },
        callback
      );
    }
  );
};

exports.down = function(db, callback) {
  db.removeForeignKey('device_envelopes', 'device_envelopes_envelopes_id_foreign', () => {
    db.removeForeignKey('device_envelopes', 'device_envelopes_devices_id_foreign', callback)
  });
};

exports._meta = {
  "version": 1
};
