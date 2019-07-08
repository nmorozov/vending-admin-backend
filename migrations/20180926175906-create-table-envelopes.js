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
    'envelopes',
    {
      id: { type: 'int', primaryKey: true, autoIncrement: true },
      name: { type: 'string', notNull: true },
      picture: { type: 'string', notNull: true },
      note: { type: 'text' },
    },
    callback
  );
};

exports.down = function(db, callback) {
  db.dropTable('envelopes', callback);
};

exports._meta = {
  "version": 1
};
