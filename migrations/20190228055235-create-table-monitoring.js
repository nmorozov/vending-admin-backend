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
    'monitorings',
    {
      id: { type: 'int', primaryKey: true, autoIncrement: true },
      deviceId: { type: 'int' },
      version: { type: 'string'},
      currentPage: { type: 'string'},
      payment: { type: 'int' },
      coinStatus: { type: 'int' },
      envelopeModuleStatuses: { type: 'string' },
      printerStatus: { type: 'int' } ,
      lastPrinting: { type: 'int' },
      failedCommands: { type: 'string'},
    }
  );
};

exports.down = function(db) {
  return db.dropTable('monitorings');
};

exports._meta = {
  "version": 1
};
