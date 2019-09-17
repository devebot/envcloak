'use strict';

var assert = require('chai').assert;
var Setter = require('../../lib/setter');

describe('envcloak:tdd:setter', function() {
  let setter = new Setter();

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

  it('main setter should apply and revert environment variable properly', function() {
    assert.isUndefined(process.env.ENVMASK_EV1);
    assert.isUndefined(process.env.ENVMASK_EV2);
    assert.isUndefined(process.env.ENVMASK_EV3);
    assert.isUndefined(process.env.ENVMASK_EV4);

    process.env.ENVMASK_EV4 = 3.14159;

    setter.setup({
      ENVMASK_EV2: 'hello',
      ENVMASK_EV3: true,
      ENVMASK_EV4: 1024
    });

    assert.isUndefined(process.env.ENVMASK_EV1);
    assert.equal(process.env.ENVMASK_EV2, 'hello');
    assert.equal(process.env.ENVMASK_EV3, 'true');
    assert.equal(process.env.ENVMASK_EV4, '1024');

    setter.reset();

    assert.isUndefined(process.env.ENVMASK_EV1);
    assert.isUndefined(process.env.ENVMASK_EV2);
    assert.isUndefined(process.env.ENVMASK_EV3);
    assert.equal(process.env.ENVMASK_EV4, '3.14159');
  });

  it('sub setters should apply and revert environment variable properly', function() {
    process.env.ENVMASK_EV3 = 'root-scope';
    process.env.ENVMASK_EV4 = 3.14159;

    assert.isUndefined(process.env.ENVMASK_EV1);
    assert.isUndefined(process.env.ENVMASK_EV2);
    assert.equal(process.env.ENVMASK_EV3, 'root-scope');
    assert.equal(process.env.ENVMASK_EV4, '3.14159');
    assert.isUndefined(process.env.ENVMASK_EV5);

    setter.setup({
      ENVMASK_EV2: 'hello',
      ENVMASK_EV4: 1024
    });

    assert.isUndefined(process.env.ENVMASK_EV1);
    assert.equal(process.env.ENVMASK_EV2, 'hello');
    assert.equal(process.env.ENVMASK_EV3, 'root-scope');
    assert.equal(process.env.ENVMASK_EV4, '1024');
    assert.isUndefined(process.env.ENVMASK_EV5);

    var sub = new Setter({
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

    setter.reset();

    assert.isUndefined(process.env.ENVMASK_EV1);
    assert.isUndefined(process.env.ENVMASK_EV2);
    assert.equal(process.env.ENVMASK_EV3, 'root-scope');
    assert.equal(process.env.ENVMASK_EV4, '3.14159');
    assert.isUndefined(process.env.ENVMASK_EV5);
  });

  it('setter.toJSON() should return the state of object properly', function() {
    assert.isUndefined(process.env.ENVMASK_EV1);
    assert.isUndefined(process.env.ENVMASK_EV2);
    assert.isUndefined(process.env.ENVMASK_EV3);
    assert.isUndefined(process.env.ENVMASK_EV4);

    process.env.ENVMASK_EV4 = 3.14159;

    setter.setup({
      ENVMASK_EV2: 'hello',
      ENVMASK_EV3: true,
      ENVMASK_EV4: 1024
    });

    false && console.log('Before reset: ', JSON.stringify(setter.toJSON(), null, 2));

    assert.deepEqual(setter.toJSON(), {
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

    setter.reset();

    false && console.log('After reset: ', JSON.stringify(setter.toJSON(), null, 2));

    assert.deepEqual(setter.toJSON(), {
      "variables": []
    });
  });

  it('setter.toString() should return the information of environment variables properly', function() {
    assert.isUndefined(process.env.ENVMASK_EV1);
    assert.isUndefined(process.env.ENVMASK_EV2);
    assert.isUndefined(process.env.ENVMASK_EV3);
    assert.isUndefined(process.env.ENVMASK_EV4);

    process.env.ENVMASK_EV4 = 3.14159;

    setter.setup({
      ENVMASK_EV2: 'hello',
      ENVMASK_EV3: true,
      ENVMASK_EV4: 1024
    });

    false && console.log('Before reset: ', '' + setter.toString());

    assert.equal('' + setter, JSON.stringify(setter.toJSON()));
  });

  afterEach(function() {
    setter.reset();
  });
});
