const ch = require('child_process');
const fs = require('fs');

module.exports.getFilters = (params, models) => {
  let res = {};

  res.offset = parseInt(params.offset) || 0;
  res.limit = parseInt(params.limit) || 10;
  res.order = [];
  if (params.sort) {
    res.order = params.sort.split(',').map(sort => {
      let dir = 'ASC';
      if (sort[0] == '-') {
        dir = 'DESC';
        sort = sort.slice(1);
      }

      let order = [sort, dir];
      if (models && ~sort.indexOf('.')) {
        sort = sort.split('.');
        if (models[sort[0]])
          order = [models[sort[0]], sort[1], dir];
      }
      return order;
    });
  }

  return res;
}

module.exports.fsRun = async cmd => {
  return new Promise((resolve, reject) => {
    ch.exec(cmd, (err, data) => err ? reject(err) : resolve(data))
  });
}

module.exports.fsRead = async path => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => err ? reject(err) : resolve(data))
  });
}

module.exports.fsWrite = async (path, buffer) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, buffer, (err, data) => err ? reject(err) : resolve(data))
  });
}

module.exports.fsCopyFile = async (from, to) => {
  return new Promise((resolve, reject) => {
    fs.copyFile(from, to, (err, data) => err ? reject(err) : resolve(data))
  });
}

module.exports.fsMkDirTemp = async path => {
  return new Promise((resolve, reject) => {
    fs.mkdtemp(path, (err, data) => err ? reject(err) : resolve(data))
  });
}

module.exports.fsMkDir = async path => {
  return new Promise((resolve, reject) => {
    ch.exec(`mkdir -p ${path}`, (err, data) => err ? reject(err) : resolve(path))
  });
}

module.exports.fsAccess = async path => {
  return new Promise((resolve, reject) => {
    fs.access(path, (err, data) => err ? reject(err) : resolve(path))
  });
}
