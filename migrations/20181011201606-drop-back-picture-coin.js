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
    db.removeColumn('coins', 'backPicture'),
    db.removeColumn('coins', 'backPictureMime'),
  ]);
};

exports.down = function(db) {
    return Promise.all([
      db.addColumn('coins', 'backPicture', { type: 'string', notNull: true }),
      db.addColumn('coins', 'backPictureMime', { type: 'string', notNull: true }),
    ]);
};

exports._meta = {
  "version": 1
};
