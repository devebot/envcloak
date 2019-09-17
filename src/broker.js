'use strict';

const Getter = require('./getter');
const Setter = require('./setter');
const misc = require('./misc');

function Constructor(kwargs) {
  const getter = new Getter(kwargs);
  const setter = new Setter(kwargs);

  const wrapper = new Proxy(this, {
    get: function(target, prop, receiver) {
      if (prop in getter && misc.isFunction(getter[prop])) {
        return getter[prop].bind(getter);
      }
      if (prop in setter && misc.isFunction(setter[prop])) {
        return setter[prop].bind(setter);
      }
      return target[prop];
    }
  });

  return wrapper;
}

let _instance = null;

Object.defineProperty(Constructor, 'instance', {
  get: function() {
    return (_instance = _instance || new Constructor());
  },
  set: function(val) {}
});

module.exports = Constructor;
