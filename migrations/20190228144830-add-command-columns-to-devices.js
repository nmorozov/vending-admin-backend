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
  db.addColumn('devices', 'envelopeRestart', {type: 'int', defaultValue: 0}, callback);
  db.addColumn('devices', 'payment', {type: 'int', defaultValue: 0}, callback);
  db.addColumn('devices', 'printerRestart', {type: 'int', defaultValue: 0}, callback);
  db.addColumn('devices', 'vendingRestart', {type: 'int', defaultValue: 0}, callback);
};

exports.down = function(db, callback) {
  db.removeColumn('oauth_tokens', 'role', callback);
  db.removeColumn('oauth_tokens', 'role', callback);
  db.removeColumn('oauth_tokens', 'role', callback);
  db.removeColumn('oauth_tokens', 'role', callback);
};

exports._meta = {
  "version": 1
};
