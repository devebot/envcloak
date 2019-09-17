'use strict';

function Toolset() {
  const box = {
    colors: safeRequire('colors/safe')
  };

  this.has = function (packageName) {
    return box[packageName] !== null && box[packageName] !== undefined;
  };

  this.get = function (packageName) {
    return box[packageName];
  };
}

module.exports = new Toolset();

function safeRequire (moduleName) {
  try {
    return require(moduleName);
  } catch (error) {
    return null;
  }
}
