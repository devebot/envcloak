'use strict';

const nodash = require('./misc');

function Constructor (kwargs = {}) {
  let _namespace = kwargs.namespace;
  let _store = {};

  this.setup = function(vars) {
    vars = vars || {};
    Object.keys(vars).forEach(function(key) {
      let newKey = key;
      if (nodash.isString(_namespace) && !key.startsWith(_namespace)) {
        newKey = _namespace + '_' + key;
      }
      _store[newKey] = process.env[newKey];
      if (vars[key] == null) {
        delete process.env[newKey];
      } else {
        process.env[newKey] = vars[key];
      }
    });
    return this;
  }

  this.reset = function() {
    Object.keys(_store).forEach(function(key) {
      delete process.env[key];
      if (typeof(_store[key]) === 'string') {
        process.env[key] = _store[key];
      }
      delete _store[key];
    });
    return this;
  }

  this.toJSON = function() {
    let info = { variables: [] };
    for (let key in _store) {
      info.variables.push({
        name: key,
        backup: _store[key],
        value: process.env[key]
      });
    }
    return info;
  }

  this.toString = function() {
    return JSON.stringify(this.toJSON());
  }

  return this.setup(kwargs.presets);
}

module.exports = Constructor;

let _instance = null;

Object.defineProperty(Constructor, 'instance', {
  get: function() {
    return (_instance = _instance || new Constructor());
  },
  set: function(val) {}
});
