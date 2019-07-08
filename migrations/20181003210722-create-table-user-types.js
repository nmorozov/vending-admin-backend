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

exports.up = function(db) {
  return db.createTable(
    'user_types',
    {
      id: { type: 'int', primaryKey: true, autoIncrement: true },
      name: { type: 'string', notNull: true },
      code: { type: 'string', notNull: true },
    }
  ).then(() => Promise.all([
    new Promise(res => db.insert('user_types', [ 'name', 'code' ], [ 'Signature', 'signature' ], () => res())),
    new Promise(res => db.insert('user_types', [ 'name', 'code' ], [ 'Fingerprint', 'fingerprint' ], () => res())),
    new Promise(res => db.insert('user_types', [ 'name', 'code' ], [ 'Text', 'text' ], () => res())),
  ]));
};

exports.down = function(db) {
  return db.dropTable('user_types');
};

exports._meta = {
  "version": 1
};
