'use strict';

const Chalk = require('./chalk');
const misc = require('./misc');
const util = require('util');

function Constructor(params = {}) {
  const definition = {};
  const store = { env: {}, namespace: params.namespace || Constructor.NAMESPACE };

  function getLabel(name, scope) {
    if (scope === 'framework') {
      return Constructor.NAMESPACE + '_' + name;
    }
    return (store.namespace || Constructor.NAMESPACE) + '_' + name;
  }

  function getValue(name, scope) {
    if (scope !== 'framework' && store.namespace) {
      const longname = store.namespace + '_' + name;
      if (longname in process.env) {
        return process.env[longname];
      }
    }
    return process.env[Constructor.NAMESPACE + '_' + name];
  }

  this.define = function(descriptors) {
    if (misc.isArray(descriptors)) {
      for (const descriptor of descriptors) {
        const name = descriptor && descriptor.name;
        if (misc.isString(name)) {
          definition[name] = descriptor;
        }
      }
    }
    return this;
  }

  this.getNamespace = function () {
    return store.namespace || Constructor.NAMESPACE;
  }

  this.setNamespace = function (ns, opts = {}) {
    store.namespace = ns;
    if (opts.occupyValues) {
      for (const envKey in definition) {
        this.getEnv(envKey);
        const envName = getLabel(envKey);
        if (envName in process.env) {
          if (opts.ownershipLabel) {
            process.env[envName] = opts.ownershipLabel;
          } else {
            delete process.env[envName];
          }
        }
      }
    }
    return this;
  }

  this.getEnvNames = function() {
    return misc.keys(definition);
  }

  this.getEnv = function(label, defaultValue) {
    if (label in store.env) return store.env[label];
    if (!misc.isString(label)) return undefined;
    if (!(label in definition)) return process.env[label] || defaultValue;
    const def = definition[label] || {};
    store.env[label] = getValue(label, def.scope);
    if (!store.env[label]) {
      if (misc.isUndefined(defaultValue)) {
        defaultValue = def.defaultValue;
      }
      if (misc.isArray(def.aliases)) {
        for (const alias of def.aliases) {
          store.env[label] = store.env[label] || getValue(alias, def.scope);
        };
      }
      store.env[label] = store.env[label] || defaultValue;
    }
    if (def.type === 'array') {
      store.env[label] = misc.stringToArray(store.env[label]);
    }
    return store.env[label];
  }

  this.setEnv = function(envName, value) {
    if (misc.isString(envName)) {
      store.env[envName] = value;
    }
    return this;
  }

  this.getAcceptedValues = function(envName) {
    const def = definition[envName];
    if (misc.isObject(def)) {
      return def.enum || null;
    }
    return undefined;
  }

  this.setAcceptedValues = function(envName, acceptedValues) {
    const def = definition[envName];
    if (misc.isObject(def)) {
      def.enum = acceptedValues;
    }
    return this;
  }

  this.clearCache = function(keys) {
    keys = misc.removeNamespace(misc.arrayify(keys), this.getNamespace());
    for (const key in store.env) {
      if (keys.length === 0 || keys.indexOf(key) >= 0) {
        delete store.env[key];
      }
    }
    return this;
  }

  this.printEnvList = function(opts = {}) {
    const self = this;
    // get the excluded scopes
    const excl = misc.arrayify(opts.excludes || [ 'framework', 'test' ]);
    // print to console or muted?
    const lines = [];
    const muted = (opts.muted === true);
    const chalk = muted ? new Chalk({ blanked: true, themes: DEFAULT_THEMES }) : DEFAULT_CHALK;
    function printInfo() {
      if (muted) {
        lines.push(util.format.apply(util, arguments));
      } else {
        console.info.apply(console, arguments);
      }
    }
    // printing
    printInfo(chalk.heading1('[+] Environment variables:'));
    for (const label in definition) {
      const info = definition[label];
      if (info && info.scope && excl.indexOf(info.scope) >= 0) return;
      const envMsg = util.format(' |> %s: %s', chalk.envName(getLabel(label, info.scope)), info.description || '');
      if (info && info.defaultValue != null) {
        printInfo(envMsg + util.format(' (default: %s)', chalk.defaultValue(JSON.stringify(info.defaultValue))));
      } else {
        printInfo(envMsg);
      }
      if (info && info.scope) {
        printInfo('    - %s: %s', chalk.envAttrName('scope'), chalk.envAttrValue(info.scope));
      }
      if (info && info.type === 'array') {
        printInfo('    - %s: (%s)', chalk.envAttrName('format'), chalk.envAttrValue('comma-separated-string'));
      }
      if (info && info.type === 'boolean') {
        printInfo('    - %s: (%s)', chalk.envAttrName('format'), chalk.envAttrValue('true/false'));
      }
      if (info && info.enum) {
        printInfo('    - %s: %s', chalk.envAttrName('accepted values'), chalk.envAttrValue(JSON.stringify(info.enum)));
      }
      printInfo('    - %s: %s', chalk.envAttrName('current value'), chalk.currentValue(JSON.stringify(self.getEnv(label))));
    };
    printInfo(chalk.heading1('[*] End'));
    return lines;
  }

  this.define(params.definition);
}

Constructor.NAMESPACE = 'ENVCLOAK';

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ color chalks

const DEFAULT_THEMES = {
  heading1: ['cyan', 'bold'],
  heading2: 'cyan',
  envName: ['green', 'bold'],
  envAttrName: ['grey', 'bold'],
  envAttrValue: [ 'grey' ],
  currentValue: ['blue'],
  defaultValue: ['magenta']
};

const DEFAULT_CHALK = new Chalk({
  themes: DEFAULT_THEMES
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ default constructor & instance property

let _instance = null;

Object.defineProperty(Constructor, 'instance', {
  get: function() {
    return (_instance = _instance || new Constructor());
  },
  set: function(val) {}
});

module.exports = Constructor;
