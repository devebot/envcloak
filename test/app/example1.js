'use strict';

var Envcloak = require('../../index');

var envcloak = new Envcloak({
  namespace: 'APP',
  definition: [
    {
      name: 'TIER',
      type: 'string',
      description: 'The tier of the application',
      defaultValue: 'beta'
    },
    {
      name: 'BUILT_VERSION',
      type: 'string',
      description: 'The version of application',
      defaultValue: '0.1.0'
    }
  ]
});

console.log('---------------------------------------------');

console.log('Version: %s', process.env['APP_BUILT_VERSION']);

envcloak.setup({
  'APP_BUILT_VERSION': 'latest'
});

console.log('Version: %s', process.env['APP_BUILT_VERSION']);

envcloak.reset();

console.log('Version: %s', process.env['APP_BUILT_VERSION']);

console.log('---------------------------------------------');

console.log(envcloak.printEnvList());
