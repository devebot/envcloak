'use strict';

const Getter = require('./getter');
const Setter = require('./setter');
const misc = require('./misc');

function Constructor(kwargs) {
  const getter = new Getter(kwargs);
  const setter = new Setter(kwargs);

  const wrapper = new Proxy(this, {
    get: function(target, prop, receiver) {
      if (isMethodOf(prop, getter)) {
        return getter[prop].bind(getter);
      }
      if (isMethodOf(prop, setter)) {
        return setter[prop].bind(setter);
      }
      return target[prop];
    },
    set: function(object, prop, value) {
      if (isMethodOf(prop, getter) || isMethodOf(prop, setter)) {
        throw new Error('Property [%s] must not be changed');
      }
      object[prop] = value;
    }
  });

  return wrapper;
}

function isMethodOf (prop, obj) {
  return prop in obj && misc.isFunction(obj[prop]);
}

let _instance = null;

Object.defineProperty(Constructor, 'instance', {
  get: function() {
    return (_instance = _instance || new Constructor());
  },
  set: function(val) {}
});

Object.defineProperty(Constructor, 'DEFAULT_NAMESPACE', {
  get: function() {
    return Getter.DEFAULT_NAMESPACE;
  },
  set: function(val) {
    Getter.DEFAULT_NAMESPACE = val;
  }
});

module.exports = Constructor;
