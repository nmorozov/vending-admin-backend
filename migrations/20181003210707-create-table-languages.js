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
    'languages',
    {
      id: { type: 'int', primaryKey: true, autoIncrement: true },
      name: { type: 'string', notNull: true },
      code: { type: 'string', notNull: true },
    }
  ).then(() => Promise.all([
    new Promise(res => db.insert('languages', [ 'name', 'code' ], [ 'Russian', 'ru' ], () => res())),
    new Promise(res => db.insert('languages', [ 'name', 'code' ], [ 'English', 'en' ], () => res())),
    new Promise(res => db.insert('languages', [ 'name', 'code' ], [ 'Chinese', 'zh' ], () => res())),
    new Promise(res => db.insert('languages', [ 'name', 'code' ], [ 'French', 'fr' ], () => res())),
    new Promise(res => db.insert('languages', [ 'name', 'code' ], [ 'Hebrew', 'he' ], () => res())),
    new Promise(res => db.insert('languages', [ 'name', 'code' ], [ 'Italian', 'it' ], () => res())),
    new Promise(res => db.insert('languages', [ 'name', 'code' ], [ 'German', 'de' ], () => res())),
    new Promise(res => db.insert('languages', [ 'name', 'code' ], [ 'Spanish', 'es' ], () => res())),
  ]));
};

exports.down = function(db) {
  return db.dropTable('languages');
};

exports._meta = {
  "version": 1
};
