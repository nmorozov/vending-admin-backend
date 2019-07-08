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
    'oauth_tokens',
    {
      id: { type: 'int', primaryKey: true, autoIncrement: true },
      access_token: { type: 'string', notNull: true },
      access_token_expires_on: {
        type: 'timestamp',
        notNull: true,
        defaultValue: 'CURRENT_TIMESTAMP',
      },
      client_id: { type: 'string', notNull: true },
      refresh_token: { type: 'string', notNull: true },
      refresh_token_expires_on: {
        type: 'timestamp',
        notNull: true,
        defaultValue: 'CURRENT_TIMESTAMP',
      },
      user_id: { type: 'int', notNull: true },
    },
    callback
  );
};

exports.down = function(db, callback) {
  db.dropTable('oauth_tokens', callback);
};

exports._meta = {
  version: 1,
};
