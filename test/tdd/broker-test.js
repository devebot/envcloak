'use strict';

var assert = require('chai').assert;
var Broker = require('../../lib/broker');
var Getter = require('../../lib/getter');
var Setter = require('../../lib/setter');

describe('envcloak:tdd:broker', function() {
  it('return its own properties if these property names are not belong to Getter and Setter', function () {
    var broker = new Broker({
      namespace: 'ORIGIN',
      definition: [
        {
          name: 'MY_TIER',
          type: 'string',
          description: 'The tier of the application',
          defaultValue: 'beta'
        },
        {
          name: 'MY_VERSION',
          type: 'string',
          description: 'The version of the application',
          defaultValue: '0.1.1'
        }
      ]
    });

    Object.defineProperty(broker, 'new', {
      get: function() {
        return function(kwargs) {
          return new Broker(kwargs);
        };
      },
      set: function(value) {}
    });

    var otherEC = broker.new({
      namespace: 'CHILD',
      definition: [
        {
          name: 'MY_VERSION',
          type: 'string',
          description: 'The version of the example',
          defaultValue: '0.1.2'
        }
      ]
    });

    assert.equal(broker.getEnv('MY_VERSION'), '0.1.1');
    assert.equal(otherEC.getEnv('MY_VERSION'), '0.1.2');
  });

  it('Broker must contains all of methods of both Getter and Setter', function () {
    var broker = new Broker({
      namespace: 'TEST',
      definition: [
        {
          name: 'MY_VERSION',
          type: 'string',
          description: 'The version of the application',
          defaultValue: '0.1.1'
        }
      ]
    });

    var getter = Getter.instance;
    var setter = Setter.instance;

    Object.keys(broker).forEach(function(fieldName) {
      if (typeof broker[fieldName] === 'function') {
        assert.isTrue(isFunction(getter[fieldName]) || isFunction(setter[fieldName]));
      }
    })
  });
});

function isFunction (f) {
  return typeof f === 'function';
}