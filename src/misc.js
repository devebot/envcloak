'use strict';

function Misc () {
  this.isFunction = function (f) {
    return (typeof f === 'function');
  }
}

module.exports = new Misc();
