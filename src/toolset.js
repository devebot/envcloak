'use strict';

const invoke = function(block) {
  return block();
};

function Toolset() {
  const box = invoke(function () {
    try {
      return {
        colors: require('colors')
      }
    } catch (error) {
      return {};
    }
  });

  this.has = function (packageName) {
    return box[packageName] !== null && box[packageName] !== undefined;
  };

  this.get = function (packageName) {
    return box[packageName];
  };
}

module.exports = new Toolset();
