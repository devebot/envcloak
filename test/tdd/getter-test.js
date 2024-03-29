'use strict';

var lodash = require('lodash');
var assert = require('chai').assert;
var setter = require('../../lib/setter').instance;
var Getter = require('../../lib/getter');
var misc = require('../../lib/misc');

describe('envcloak:tdd:getter', function() {
  this.timeout(60 * 1000 * 10);

  var ENV_DESCRIPTOR = {
    namespace: 'ENV',
    definition: [
      {
        name: "UNDEFINED_STRING",
        type: "string",
        description: "undefined string example"
      },
      {
        name: "DEFAULT_STRING",
        type: "string",
        description: "default string example",
        defaultValue: "default"
      },
      {
        name: "PRESETS_STRING",
        type: "string",
        description: "string example",
        defaultValue: "empty"
      },
      {
        name: "EMPTY_ARRAY1",
        type: "array",
        description: "empty array example 1"
      },
      {
        name: "EMPTY_ARRAY2",
        type: "array",
        description: "empty array example 2"
      },
      {
        name: "NORMAL_ARRAY",
        type: "array",
        description: "normal array example"
      }
    ]
  };

  describe('getEnvNames()', function() {
    it("get the names of an empty environment list properly", function() {
      var envbox = new Getter();
      assert.sameMembers(envbox.getEnvNames(), []);
    });

    it("get a list of defined environment names properly", function() {
      var envbox = new Getter(ENV_DESCRIPTOR);
      var expected = ENV_DESCRIPTOR.definition.map(function (item) {
        return item.name;
      });
      assert.sameMembers(envbox.getEnvNames(), expected);
    });
  });

  describe('getEnv()', function() {
    before(function() {
      setter.setup({
        ENV_PRESETS_STRING: "hello world",
        ENVCLOAK_PRESETS_STRING: "hello devebot",
        ENV_EMPTY_ARRAY1: "",
        ENV_EMPTY_ARRAY2: ", ,",
        ENVCLOAK_NORMAL_ARRAY: "value 1, value 2, value 3",
        ENV_TRUE: "true",
        ENV_FALSE: "false"
      });
    });

    it("get environment variable's value correctly", function() {
      // defining the getter object
      var privateEnvbox = new Getter(ENV_DESCRIPTOR);
      // asserting the results
      assert.isUndefined(privateEnvbox.getEnv("UNDEFINED_STRING"));
      assert.equal(privateEnvbox.getEnv("DEFAULT_STRING"), "default");
      assert.equal(privateEnvbox.getEnv("PRESETS_STRING"), "hello world");
      assert.sameMembers(privateEnvbox.getEnv("EMPTY_ARRAY1"), []);
      assert.sameMembers(privateEnvbox.getEnv("EMPTY_ARRAY2"), []);
      assert.sameMembers(privateEnvbox.getEnv("NORMAL_ARRAY"), ["value 1", "value 2", "value 3"]);
    });

    after(function() {
      setter.reset();
    });
  });

  describe('setNamespace() & occupySystemVariables', function() {
    beforeEach(function() {
      setter.setup({
        ENV_PRESETS_STRING: "hello world",
        ENVCLOAK_PRESETS_STRING: "hello devebot",
        ENV_EMPTY_ARRAY1: "",
        ENV_EMPTY_ARRAY2: ", ,",
        ENVCLOAK_NORMAL_ARRAY: "value 1, value 2, value 3",
        ENV_TRUE: "true",
        ENV_FALSE: "false"
      });
    });

    it("set namespace and occupy system variables with specified ownershipLabel", function() {
      var myOwnershipLabel = '<ownership-here>';
      var privateEnvbox = new Getter(lodash.pick(ENV_DESCRIPTOR, ['definition']));
      privateEnvbox.setNamespace('ENV', {
        occupyValues: true,
        ownershipLabel: myOwnershipLabel
      });
      assert.isUndefined(privateEnvbox.getEnv("UNDEFINED_STRING"));
      assert.equal(privateEnvbox.getEnv("DEFAULT_STRING"), "default");
      assert.equal(privateEnvbox.getEnv("PRESETS_STRING"), "hello world");
      assert.sameMembers(privateEnvbox.getEnv("EMPTY_ARRAY1"), []);
      assert.sameMembers(privateEnvbox.getEnv("EMPTY_ARRAY2"), []);
      assert.sameMembers(privateEnvbox.getEnv("NORMAL_ARRAY"), ["value 1", "value 2", "value 3"]);
      assert.equal(process.env.ENV_PRESETS_STRING, myOwnershipLabel);
      assert.equal(process.env.ENVCLOAK_PRESETS_STRING, "hello devebot");
      assert.equal(process.env.ENV_EMPTY_ARRAY1, myOwnershipLabel);
      assert.equal(process.env.ENV_EMPTY_ARRAY2, myOwnershipLabel);
      assert.equal(process.env.ENVCLOAK_NORMAL_ARRAY, "value 1, value 2, value 3");
      assert.equal(process.env.ENV_TRUE, "true");
      assert.equal(process.env.ENV_FALSE, "false");
    });

    it("set namespace and occupy system variables without ownershipLabel", function() {
      var privateEnvbox = new Getter(lodash.pick(ENV_DESCRIPTOR, ['definition']));
      privateEnvbox.setNamespace('ENV', {
        occupyValues: true
      });
      assert.isUndefined(privateEnvbox.getEnv("UNDEFINED_STRING"));
      assert.equal(privateEnvbox.getEnv("DEFAULT_STRING"), "default");
      assert.equal(privateEnvbox.getEnv("PRESETS_STRING"), "hello world");
      assert.sameMembers(privateEnvbox.getEnv("EMPTY_ARRAY1"), []);
      assert.sameMembers(privateEnvbox.getEnv("EMPTY_ARRAY2"), []);
      assert.sameMembers(privateEnvbox.getEnv("NORMAL_ARRAY"), ["value 1", "value 2", "value 3"]);
      assert.isUndefined(process.env.ENV_PRESETS_STRING);
      assert.equal(process.env.ENVCLOAK_PRESETS_STRING, "hello devebot");
      assert.isUndefined(process.env.ENV_EMPTY_ARRAY1);
      assert.isUndefined(process.env.ENV_EMPTY_ARRAY2);
      assert.equal(process.env.ENVCLOAK_NORMAL_ARRAY, "value 1, value 2, value 3");
      assert.equal(process.env.ENV_TRUE, "true");
      assert.equal(process.env.ENV_FALSE, "false");
    });

    afterEach(function() {
      setter.reset();
    });
  });

  describe('clearCache()', function() {
    var privateEnvbox = new Getter(ENV_DESCRIPTOR);
    var presetsVars = {
      ENV_PRESETS_STRING: "hello world",
      ENVCLOAK_PRESETS_STRING: "hello devebot",
      ENV_EMPTY_ARRAY1: "",
      ENV_EMPTY_ARRAY2: ", ,",
      ENV_NORMAL_ARRAY: "a, b, c",
      ENVCLOAK_NORMAL_ARRAY: "value 1, value 2, value 3",
      ENV_TRUE: "true",
      ENV_FALSE: "false"
    }

    it('clear the values of the cached variables properly', function () {
      setter.setup(presetsVars);

      assert.equal(privateEnvbox.getEnv('PRESETS_STRING'), 'hello world');
      assert.sameMembers(privateEnvbox.getEnv('NORMAL_ARRAY'), ['a', 'b', 'c']);
      assert.sameMembers(privateEnvbox.getEnv('EMPTY_ARRAY1'), []);
      assert.sameMembers(privateEnvbox.getEnv('EMPTY_ARRAY2'), []);

      setter.reset();

      assert.equal(privateEnvbox.getEnv('PRESETS_STRING'), 'hello world');
      assert.sameMembers(privateEnvbox.getEnv('NORMAL_ARRAY'), ['a', 'b', 'c']);
      assert.sameMembers(privateEnvbox.getEnv('EMPTY_ARRAY1'), []);
      assert.sameMembers(privateEnvbox.getEnv('EMPTY_ARRAY2'), []);

      privateEnvbox.clearCache(['PRESETS_STRING', 'ENV_NORMAL_ARRAY']);

      assert.equal(privateEnvbox.getEnv('PRESETS_STRING'), 'empty');
      assert.sameMembers(privateEnvbox.getEnv('NORMAL_ARRAY'), []);
      assert.sameMembers(privateEnvbox.getEnv('EMPTY_ARRAY1'), []);
      assert.sameMembers(privateEnvbox.getEnv('EMPTY_ARRAY2'), []);
    });
  });

  describe('printEnvList()', function() {
    it("print the empty environment variables list properly", function () {
      var privateEnvbox = new Getter();
      var output = privateEnvbox.printEnvList({ muted: true });
      false && console.log(JSON.stringify(output, null, 2));
      var expected = [
        '[+] Environment variables:',
        '[*] End'
      ];
      assert.sameMembers(output, expected);
    });

    it("print environment variables correctly", function() {
      // presets the environment variables
      setter.setup({
        ENV_PRESETS_STRING: "hello devebot",
        ENV_EMPTY_ARRAY1: "",
        ENV_EMPTY_ARRAY2: ", ,",
        ENV_NORMAL_ARRAY: "value 1, value 2, value 3",
        ENV_TRUE: "true",
        ENV_FALSE: "false"
      });
      // defining the getter object
      var privateEnvbox = new Getter(ENV_DESCRIPTOR);
      // display
      var expected = [
        '[+] Environment variables:',
        ' |> ENV_UNDEFINED_STRING: undefined string example',
        '    - current value: undefined',
        ' |> ENV_DEFAULT_STRING: default string example (default: "default")',
        '    - current value: "default"',
        ' |> ENV_PRESETS_STRING: string example (default: "empty")',
        '    - current value: "hello devebot"',
        ' |> ENV_EMPTY_ARRAY1: empty array example 1',
        '    - format: (comma-separated-string)',
        '    - current value: []',
        ' |> ENV_EMPTY_ARRAY2: empty array example 2',
        '    - format: (comma-separated-string)',
        '    - current value: []',
        ' |> ENV_NORMAL_ARRAY: normal array example',
        '    - format: (comma-separated-string)',
        '    - current value: ["value 1","value 2","value 3"]',
        '[*] End'
      ]
      var output = privateEnvbox.printEnvList({ muted: true });
      false && console.log(JSON.stringify(output, null, 2));
      assert.sameMembers(output, expected);
    });

    after(function() {
      setter.reset();
    });
  });
});
