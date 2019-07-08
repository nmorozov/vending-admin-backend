'use strict';

var dbm;
var type;
var seed;

exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db, callback) {
  db.createTable(
    'users',
    {
      id: { type: 'int', primaryKey: true, autoIncrement: true },
      username: { type: 'string', notNull: true },
      password: { type: 'string', notNull: true },
      role: { type: 'string', defaultValue: 'owner'},
      fullCompanyName: { type: 'string'},
      shortCompanyName: { type: 'string'},
      country: { type: 'string'},
      city: { type: 'string'},
      ownerFullName: { type: 'string'},
      ownerPhone: { type: 'string'},
      ownerEmail: { type: 'string'},
      caretakerFullName: { type: 'string'},
      caretakerPhone: { type: 'string'},
      caretakerEmail: { type: 'string'},
      status: { type: 'int', defaultValue: 0 },
      created: { type: 'timestamp', defaultValue: 'CURRENT_TIMESTAMP' },
    },
    callback
  );
};

exports.down = function(db, callback) {
  db.dropTable('users', callback);
};

exports._meta = {
  version: 1,
};
