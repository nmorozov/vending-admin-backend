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
  return Promise.all([
    db.addColumn('coins', 'country', { type: 'string', notNull: true }),
    db.addColumn('coins', 'city', { type: 'string', notNull: true }),
  ]);
};

exports.down = function(db) {
  return Promise.all([
    db.removeColumn('coins', 'country'),
    db.removeColumn('coins', 'city'),
  ]);
};

exports._meta = {
  "version": 1
};
