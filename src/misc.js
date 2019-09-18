'use strict';

function Misc () {
  this.keys = function (o) {
    return Object.keys(o);
  }

  this.isFunction = function (f) {
    return (typeof f === 'function');
  }

  this.isObject = function(o) {
    return o && (typeof o) === 'object' && !this.isArray(o);
  }

  this.isString = function(s) {
    return (typeof s) === 'string';
  }

  this.isUndefined = function (u) {
    return u === undefined;
  }

  this.isArray = function(a) {
    return a instanceof Array;
  }

  this.arrayify = function (val) {
    if (val === null || val === undefined) return [];
    return Array.isArray(val) ? val : [val];
  }

  this.stringToArray = function (labels) {
    labels = labels || '';
    if (this.isString(labels)) {
      return labels.split(',').map(function(item) {
        return item.trim();
      }).filter(function(item) {
        return item.length > 0;
      });
    }
    return labels;
  }

  this.removeNamespace = function (names, namespace) {
    if (!this.isArray(names)) {
      return names;
    }
    const ns_underscore = namespace + '_';
    return names.map(function (name) {
      const hasPrefix = name.indexOf(ns_underscore) === 0;
      return hasPrefix ? name.substr(ns_underscore.length) : name;
    });
  }
}

module.exports = new Misc();
