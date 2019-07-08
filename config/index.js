const fs = require('fs');

const DATABASE_CONFIG_FILE = __dirname + '/database.json';
const config = {};

config.getDatabaseConfig = (env = 'dev') => {
  const fullDatabaseConfig = JSON.parse(
    fs.readFileSync(DATABASE_CONFIG_FILE, 'utf8')
  );

  if (env in fullDatabaseConfig) {
    return fullDatabaseConfig[env];
  } else {
    throw 'Конфигурация базы данных с именем "' + env + '" не найдена';
  }
};

module.exports = config;
