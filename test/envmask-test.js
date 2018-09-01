'use strict';

var assert = require('chai').assert;
var EnvMask = require('../lib/envmask');

describe('EnvMask', function() {
  let envmask = new EnvMask();

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

  it('main envmask should apply and revert environment variable properly', function() {
    assert.isUndefined(process.env.ENVMASK_EV1);
    assert.isUndefined(process.env.ENVMASK_EV2);
    assert.isUndefined(process.env.ENVMASK_EV3);
    assert.isUndefined(process.env.ENVMASK_EV4);

    process.env.ENVMASK_EV4 = 3.14159;

    envmask.setup({
      ENVMASK_EV2: 'hello',
      ENVMASK_EV3: true,
      ENVMASK_EV4: 1024
    });

    assert.isUndefined(process.env.ENVMASK_EV1);
    assert.equal(process.env.ENVMASK_EV2, 'hello');
    assert.equal(process.env.ENVMASK_EV3, 'true');
    assert.equal(process.env.ENVMASK_EV4, '1024');

    envmask.reset();

    assert.isUndefined(process.env.ENVMASK_EV1);
    assert.isUndefined(process.env.ENVMASK_EV2);
    assert.isUndefined(process.env.ENVMASK_EV3);
    assert.equal(process.env.ENVMASK_EV4, '3.14159');
  });

  it('sub envmasks should apply and revert environment variable properly', function() {
    process.env.ENVMASK_EV3 = 'root-scope';
    process.env.ENVMASK_EV4 = 3.14159;

    assert.isUndefined(process.env.ENVMASK_EV1);
    assert.isUndefined(process.env.ENVMASK_EV2);
    assert.equal(process.env.ENVMASK_EV3, 'root-scope');
    assert.equal(process.env.ENVMASK_EV4, '3.14159');
    assert.isUndefined(process.env.ENVMASK_EV5);

    envmask.setup({
      ENVMASK_EV2: 'hello',
      ENVMASK_EV4: 1024
    });

    assert.isUndefined(process.env.ENVMASK_EV1);
    assert.equal(process.env.ENVMASK_EV2, 'hello');
    assert.equal(process.env.ENVMASK_EV3, 'root-scope');
    assert.equal(process.env.ENVMASK_EV4, '1024');
    assert.isUndefined(process.env.ENVMASK_EV5);

    var sub = new EnvMask({
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

    envmask.reset();

    assert.isUndefined(process.env.ENVMASK_EV1);
    assert.isUndefined(process.env.ENVMASK_EV2);
    assert.equal(process.env.ENVMASK_EV3, 'root-scope');
    assert.equal(process.env.ENVMASK_EV4, '3.14159');
    assert.isUndefined(process.env.ENVMASK_EV5);
  });

  it('envmask.toJSON() should return the state of object properly', function() {
    assert.isUndefined(process.env.ENVMASK_EV1);
    assert.isUndefined(process.env.ENVMASK_EV2);
    assert.isUndefined(process.env.ENVMASK_EV3);
    assert.isUndefined(process.env.ENVMASK_EV4);

    process.env.ENVMASK_EV4 = 3.14159;

    envmask.setup({
      ENVMASK_EV2: 'hello',
      ENVMASK_EV3: true,
      ENVMASK_EV4: 1024
    });

    false && console.log('Before reset: ', JSON.stringify(envmask.toJSON(), null, 2));

    assert.deepEqual(envmask.toJSON(), {
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

    envmask.reset();

    false && console.log('After reset: ', JSON.stringify(envmask.toJSON(), null, 2));

    assert.deepEqual(envmask.toJSON(), {
      "variables": []
    });
  });

  it('envmask.toString() should return the information of environment variables properly', function() {
    assert.isUndefined(process.env.ENVMASK_EV1);
    assert.isUndefined(process.env.ENVMASK_EV2);
    assert.isUndefined(process.env.ENVMASK_EV3);
    assert.isUndefined(process.env.ENVMASK_EV4);

    process.env.ENVMASK_EV4 = 3.14159;

    envmask.setup({
      ENVMASK_EV2: 'hello',
      ENVMASK_EV3: true,
      ENVMASK_EV4: 1024
    });

    false && console.log('Before reset: ', '' + envmask.toString());

    assert.equal('' + envmask, JSON.stringify(envmask.toJSON()));
  });

  afterEach(function() {
    envmask.reset();
  });
});
