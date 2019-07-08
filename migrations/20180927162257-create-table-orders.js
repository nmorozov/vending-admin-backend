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
    'orders',
    {
      id: { type: 'int', primaryKey: true, autoIncrement: true },
      orderNumber: { type: 'int' },
      company: { type: 'string', notNull: true },
      order1cNumber: { type: 'string', notNull: true },
      coinsCount: { type: 'int', notNull: true },
      envelopesCount: { type: 'int', notNull: true },
      date: { type: 'timestamp', notNull: true },
      country: { type: 'string', notNull: true },
      city: { type: 'string', notNull: true },
      total: { type: 'float', notNull: true },
      note: { type: 'text' },
    },
    callback
  );
};

exports.down = function(db, callback) {
  db.dropTable('orders', callback);
};

exports._meta = {
  "version": 1
};
