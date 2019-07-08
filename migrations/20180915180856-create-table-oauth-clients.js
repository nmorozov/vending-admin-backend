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
    'oauth_clients',
    {
      id: { type: 'int', primaryKey: true, autoIncrement: true },
      client_id: { type: 'string', notNull: true },
      client_secret: { type: 'string', notNull: true },
    },
    addPrimaryKey
  );

  function addPrimaryKey() {
    db.addIndex('oauth_clients', 'oauth_clients_pkey', ['client_id', 'client_secret'], true, callback);
  }
};

exports.down = function(db, callback) {
  db.dropTable('oauth_clients', callback);
};

exports._meta = {
  version: 1,
};
