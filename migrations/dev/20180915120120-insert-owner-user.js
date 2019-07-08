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
  db.insert(
    'users',
    [
      'username',
      'password',
      'fullCompanyName',
      'shortCompanyName',
      'country',
      'city',
      'ownerFullName',
      'ownerPhone',
      'ownerEmail',
      'caretakerFullName',
      'caretakerPhone',
      'caretakerEmail',
      'status',
    ],
    [
      'owner@owner.ru',
      '0DD3E512642C97CA3F747F9A76E374FBDA73F9292823C0313BE9D78ADD7CDD8F72235AF0C553DD26797E78E1854EDEE0AE002F8ABA074B066DFCE1AF114E32F8',
      'ООО "ЧЕК ИН КОИН"',
      'ООО "ЧЕК ИН КОИН"',
      'Россия',
      'Москва',
      'Дементьев Иван Иванович',
      '88002223535',
      'demon@msk.ru',
      'Петров Петр Петрович',
      '777-777-777',
      'petrov@msk.ru',
      1,
    ],
    callback
  );
};

exports.down = function(db, callback) {
  db.runSql("DELETE FROM users WHERE email = 'owner@owner.ru'", [], function(err) {
    console.log(err);
    callback();
  });
};

exports._meta = {
  version: 1,
};
