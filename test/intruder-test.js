'use strict';

var assert = require('chai').assert;
var Intruder = require('../lib/intruder');

describe('Intruder', function() {
  let intruder = new Intruder();

  beforeEach(function() {
    delete process.env.ENVMASK_EV1;
    delete process.env.ENVMASK_EV2;
    delete process.env.ENVMASK_EV3;
    delete process.env.ENVMASK_EV4;
    delete process.env.ENVMASK_EV5;
  });

  it('assure node convert all of values which assigned to process.env to string', function() {
    process.env.ENVMASK_STRING = 'cleanbug';
    process.env.ENVMASK_INT = 1000;
    process.env.ENVMASK_BOOLEAN = false;

    assert.equal(process.env.ENVMASK_STRING, 'cleanbug');
    assert.equal(process.env.ENVMASK_INT, '1000');
    assert.equal(process.env.ENVMASK_BOOLEAN, 'false');
  });

  it('main intruder should apply and revert environment variable properly', function() {
    assert.isUndefined(process.env.ENVMASK_EV1);
    assert.isUndefined(process.env.ENVMASK_EV2);
    assert.isUndefined(process.env.ENVMASK_EV3);
    assert.isUndefined(process.env.ENVMASK_EV4);

    process.env.ENVMASK_EV4 = 3.14159;

    intruder.setup({
      ENVMASK_EV2: 'hello',
      ENVMASK_EV3: true,
      ENVMASK_EV4: 1024
    });

    assert.isUndefined(process.env.ENVMASK_EV1);
    assert.equal(process.env.ENVMASK_EV2, 'hello');
    assert.equal(process.env.ENVMASK_EV3, 'true');
    assert.equal(process.env.ENVMASK_EV4, '1024');

    intruder.reset();

    assert.isUndefined(process.env.ENVMASK_EV1);
    assert.isUndefined(process.env.ENVMASK_EV2);
    assert.isUndefined(process.env.ENVMASK_EV3);
    assert.equal(process.env.ENVMASK_EV4, '3.14159');
  });

  it('sub intruders should apply and revert environment variable properly', function() {
    process.env.ENVMASK_EV3 = 'root-scope';
    process.env.ENVMASK_EV4 = 3.14159;

    assert.isUndefined(process.env.ENVMASK_EV1);
    assert.isUndefined(process.env.ENVMASK_EV2);
    assert.equal(process.env.ENVMASK_EV3, 'root-scope');
    assert.equal(process.env.ENVMASK_EV4, '3.14159');
    assert.isUndefined(process.env.ENVMASK_EV5);

    intruder.setup({
      ENVMASK_EV2: 'hello',
      ENVMASK_EV4: 1024
    });

    assert.isUndefined(process.env.ENVMASK_EV1);
    assert.equal(process.env.ENVMASK_EV2, 'hello');
    assert.equal(process.env.ENVMASK_EV3, 'root-scope');
    assert.equal(process.env.ENVMASK_EV4, '1024');
    assert.isUndefined(process.env.ENVMASK_EV5);

    var sub = new Intruder({
      ENVMASK_EV3: 'sub-scope',
      ENVMASK_EV5: true
    }).setup({
      ENVMASK_EV4: 4096
    });

    assert.isUndefined(process.env.ENVMASK_EV1);
    assert.equal(process.env.ENVMASK_EV2, 'hello');
    assert.equal(process.env.ENVMASK_EV3, 'sub-scope');
    assert.equal(process.env.ENVMASK_EV4, '4096');
    assert.equal(process.env.ENVMASK_EV5, 'true');

    sub.reset();

    assert.isUndefined(process.env.ENVMASK_EV1);
    assert.equal(process.env.ENVMASK_EV2, 'hello');
    assert.equal(process.env.ENVMASK_EV3, 'root-scope');
    assert.equal(process.env.ENVMASK_EV4, '1024');
    assert.isUndefined(process.env.ENVMASK_EV5);

    intruder.reset();

    assert.isUndefined(process.env.ENVMASK_EV1);
    assert.isUndefined(process.env.ENVMASK_EV2);
    assert.equal(process.env.ENVMASK_EV3, 'root-scope');
    assert.equal(process.env.ENVMASK_EV4, '3.14159');
    assert.isUndefined(process.env.ENVMASK_EV5);
  });

  it('intruder.toJSON() should return the state of object properly', function() {
    assert.isUndefined(process.env.ENVMASK_EV1);
    assert.isUndefined(process.env.ENVMASK_EV2);
    assert.isUndefined(process.env.ENVMASK_EV3);
    assert.isUndefined(process.env.ENVMASK_EV4);

    process.env.ENVMASK_EV4 = 3.14159;

    intruder.setup({
      ENVMASK_EV2: 'hello',
      ENVMASK_EV3: true,
      ENVMASK_EV4: 1024
    });

    false && console.log('Before reset: ', JSON.stringify(intruder.toJSON(), null, 2));

    assert.deepEqual(intruder.toJSON(), {
      "variables": [
        {
          "name": "ENVMASK_EV2",
          "backup": undefined,
          "value": "hello"
        },
        {
          "name": "ENVMASK_EV3",
          "backup": undefined,
          "value": "true"
        },
        {
          "name": "ENVMASK_EV4",
          "backup": "3.14159",
          "value": "1024"
        }
      ]
    });

    intruder.reset();

    false && console.log('After reset: ', JSON.stringify(intruder.toJSON(), null, 2));

    assert.deepEqual(intruder.toJSON(), {
      "variables": []
    });
  });

  it('intruder.toString() should return the information of environment variables properly', function() {
    assert.isUndefined(process.env.ENVMASK_EV1);
    assert.isUndefined(process.env.ENVMASK_EV2);
    assert.isUndefined(process.env.ENVMASK_EV3);
    assert.isUndefined(process.env.ENVMASK_EV4);

    process.env.ENVMASK_EV4 = 3.14159;

    intruder.setup({
      ENVMASK_EV2: 'hello',
      ENVMASK_EV3: true,
      ENVMASK_EV4: 1024
    });

    false && console.log('Before reset: ', '' + intruder.toString());

    assert.equal('' + intruder, JSON.stringify(intruder.toJSON()));
  });

  afterEach(function() {
    intruder.reset();
  });
});
