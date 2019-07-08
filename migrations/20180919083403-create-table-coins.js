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
    'coins',
    {
      id: { type: 'int', primaryKey: true, autoIncrement: true },
      name: { type: 'string', notNull: true },
      category: { type: 'string', notNull: true },
      picture: { type: 'string', notNull: true },
      categoryCode: { type: 'string', notNull: true },
    },
    callback
  );
};

exports.down = function(db, callback) {
  db.dropTable('coins', callback);
};

exports._meta = {
  version: 1,
};
